-- Engagement features: live spectator voting, ELO ratings & leagues,
-- daily activity (streaks/quests) and XP bets on debate outcomes.
-- Run this in the Supabase SQL editor (Dashboard -> SQL) once,
-- after create_debate_challenges.sql.

-- ============================================================
-- 1. Live spectator votes on a debate (one vote per user, switchable)
-- ============================================================
create table if not exists public.debate_votes (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.posts (id) on delete cascade,
    user_id uuid not null references public.profiles (id) on delete cascade,
    side text not null check (side in ('FOR', 'AGAINST')),
    created_at timestamptz not null default now(),
    unique (post_id, user_id)
);

create index if not exists debate_votes_post_idx on public.debate_votes (post_id);

alter table public.debate_votes enable row level security;

drop policy if exists "debate_votes_select" on public.debate_votes;
create policy "debate_votes_select" on public.debate_votes
    for select using (true);

drop policy if exists "debate_votes_insert" on public.debate_votes;
create policy "debate_votes_insert" on public.debate_votes
    for insert with check (auth.uid() = user_id);

drop policy if exists "debate_votes_update" on public.debate_votes;
create policy "debate_votes_update" on public.debate_votes
    for update using (auth.uid() = user_id);

drop policy if exists "debate_votes_delete" on public.debate_votes;
create policy "debate_votes_delete" on public.debate_votes
    for delete using (auth.uid() = user_id);

-- Realtime tallies for the tug-of-war bar
do $$
begin
    alter publication supabase_realtime add table public.debate_votes;
exception when duplicate_object then null;
end $$;

-- Realtime for incoming challenge notifications
do $$
begin
    alter publication supabase_realtime add table public.debate_challenges;
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 2. ELO ratings, leagues and XP wallet
-- ============================================================
create table if not exists public.user_ratings (
    user_id uuid primary key references public.profiles (id) on delete cascade,
    rating int not null default 1000,
    xp int not null default 500,
    wins int not null default 0,
    losses int not null default 0,
    draws int not null default 0,
    updated_at timestamptz not null default now()
);

alter table public.user_ratings enable row level security;

drop policy if exists "user_ratings_select" on public.user_ratings;
create policy "user_ratings_select" on public.user_ratings
    for select using (true);

-- Rows are written only by the security-definer functions below.

-- ============================================================
-- 3. Finalized debate verdicts
-- ============================================================
create table if not exists public.debate_results (
    post_id uuid primary key references public.posts (id) on delete cascade,
    challenge_id uuid references public.debate_challenges (id) on delete set null,
    winner_side text check (winner_side in ('FOR', 'AGAINST', 'DRAW')),
    for_votes int not null default 0,
    against_votes int not null default 0,
    challenger_id uuid,
    opponent_id uuid,
    rating_delta int not null default 0,
    finalized_by uuid not null,
    finalized_at timestamptz not null default now()
);

alter table public.debate_results enable row level security;

drop policy if exists "debate_results_select" on public.debate_results;
create policy "debate_results_select" on public.debate_results
    for select using (true);

-- ============================================================
-- 4. Daily activity for streaks & quests
-- ============================================================
create table if not exists public.user_daily_activity (
    user_id uuid not null references public.profiles (id) on delete cascade,
    day date not null default current_date,
    votes int not null default 0,
    arguments int not null default 0,
    primary key (user_id, day)
);

alter table public.user_daily_activity enable row level security;

drop policy if exists "user_daily_activity_select" on public.user_daily_activity;
create policy "user_daily_activity_select" on public.user_daily_activity
    for select using (auth.uid() = user_id);

drop policy if exists "user_daily_activity_insert" on public.user_daily_activity;
create policy "user_daily_activity_insert" on public.user_daily_activity
    for insert with check (auth.uid() = user_id);

drop policy if exists "user_daily_activity_update" on public.user_daily_activity;
create policy "user_daily_activity_update" on public.user_daily_activity
    for update using (auth.uid() = user_id);

-- ============================================================
-- 5. XP bets on debate outcomes
-- ============================================================
create table if not exists public.xp_bets (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.posts (id) on delete cascade,
    user_id uuid not null references public.profiles (id) on delete cascade,
    side text not null check (side in ('FOR', 'AGAINST')),
    amount int not null check (amount > 0),
    settled boolean not null default false,
    won boolean,
    created_at timestamptz not null default now(),
    unique (post_id, user_id)
);

alter table public.xp_bets enable row level security;

drop policy if exists "xp_bets_select" on public.xp_bets;
create policy "xp_bets_select" on public.xp_bets
    for select using (true);

-- Bets are placed only through the place_xp_bet function below.

-- ============================================================
-- 6. Functions
-- ============================================================

-- Ensure a rating row exists for a user
create or replace function public.ensure_rating_row(p_user uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
    insert into user_ratings (user_id) values (p_user)
    on conflict (user_id) do nothing;
end $$;

-- Place an XP bet on an open debate
create or replace function public.place_xp_bet(p_post_id uuid, p_side text, p_amount int)
returns json
language plpgsql security definer set search_path = public as $$
declare
    v_user uuid := auth.uid();
    v_xp int;
begin
    if v_user is null then
        return json_build_object('ok', false, 'message', 'Not signed in');
    end if;
    if p_side not in ('FOR', 'AGAINST') or p_amount is null or p_amount <= 0 then
        return json_build_object('ok', false, 'message', 'Invalid bet');
    end if;
    if exists (select 1 from debate_results where post_id = p_post_id) then
        return json_build_object('ok', false, 'message', 'Debate already finalized');
    end if;
    if exists (select 1 from xp_bets where post_id = p_post_id and user_id = v_user) then
        return json_build_object('ok', false, 'message', 'You already placed a bet');
    end if;

    perform ensure_rating_row(v_user);
    select xp into v_xp from user_ratings where user_id = v_user for update;
    if v_xp < p_amount then
        return json_build_object('ok', false, 'message', 'Not enough XP');
    end if;

    update user_ratings set xp = xp - p_amount, updated_at = now() where user_id = v_user;
    insert into xp_bets (post_id, user_id, side, amount) values (p_post_id, v_user, p_side, p_amount);
    return json_build_object('ok', true, 'xp_left', v_xp - p_amount);
end $$;

-- Finalize a challenge debate: tally votes, apply ELO to both
-- participants, settle XP bets. Callable by either participant.
create or replace function public.finalize_debate(p_post_id uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare
    v_user uuid := auth.uid();
    v_challenge record;
    v_for int;
    v_against int;
    v_winner text;
    v_chal_rating int;
    v_opp_rating int;
    v_expected numeric;
    v_score numeric;
    v_delta int;
    v_chal_won boolean;
begin
    if v_user is null then
        return json_build_object('ok', false, 'message', 'Not signed in');
    end if;

    select * into v_challenge
    from debate_challenges
    where post_id = p_post_id and status = 'ACCEPTED'
    limit 1;
    if v_challenge is null then
        return json_build_object('ok', false, 'message', 'No accepted challenge linked to this debate');
    end if;
    if v_user <> v_challenge.challenger_id and v_user <> v_challenge.opponent_id then
        return json_build_object('ok', false, 'message', 'Only participants can finalize');
    end if;
    if exists (select 1 from debate_results where post_id = p_post_id) then
        return json_build_object('ok', false, 'message', 'Already finalized');
    end if;

    select count(*) filter (where side = 'FOR'),
           count(*) filter (where side = 'AGAINST')
    into v_for, v_against
    from debate_votes where post_id = p_post_id;

    v_winner := case
        when v_for > v_against then 'FOR'
        when v_against > v_for then 'AGAINST'
        else 'DRAW'
    end;

    perform ensure_rating_row(v_challenge.challenger_id);
    perform ensure_rating_row(v_challenge.opponent_id);

    select rating into v_chal_rating from user_ratings where user_id = v_challenge.challenger_id;
    select rating into v_opp_rating from user_ratings where user_id = v_challenge.opponent_id;

    -- ELO with K=32 from the challenger's perspective
    v_expected := 1.0 / (1.0 + power(10.0, (v_opp_rating - v_chal_rating) / 400.0));
    v_score := case
        when v_winner = 'DRAW' then 0.5
        when v_winner = v_challenge.challenger_side then 1.0
        else 0.0
    end;
    v_delta := round(32 * (v_score - v_expected));
    v_chal_won := v_score = 1.0;

    update user_ratings set
        rating = rating + v_delta,
        wins = wins + case when v_score = 1.0 then 1 else 0 end,
        losses = losses + case when v_score = 0.0 then 1 else 0 end,
        draws = draws + case when v_score = 0.5 then 1 else 0 end,
        xp = xp + case when v_score = 1.0 then 100 when v_score = 0.5 then 40 else 15 end,
        updated_at = now()
    where user_id = v_challenge.challenger_id;

    update user_ratings set
        rating = rating - v_delta,
        wins = wins + case when v_score = 0.0 then 1 else 0 end,
        losses = losses + case when v_score = 1.0 then 1 else 0 end,
        draws = draws + case when v_score = 0.5 then 1 else 0 end,
        xp = xp + case when v_score = 0.0 then 100 when v_score = 0.5 then 40 else 15 end,
        updated_at = now()
    where user_id = v_challenge.opponent_id;

    -- Settle spectator bets: winners get 2x back, draws are refunded
    if v_winner = 'DRAW' then
        update user_ratings r set xp = r.xp + b.amount, updated_at = now()
        from xp_bets b
        where b.post_id = p_post_id and not b.settled and r.user_id = b.user_id;
        update xp_bets set settled = true, won = null where post_id = p_post_id and not settled;
    else
        update user_ratings r set xp = r.xp + b.amount * 2, updated_at = now()
        from xp_bets b
        where b.post_id = p_post_id and not b.settled and b.side = v_winner and r.user_id = b.user_id;
        update xp_bets set settled = true, won = (side = v_winner) where post_id = p_post_id and not settled;
    end if;

    insert into debate_results (post_id, challenge_id, winner_side, for_votes, against_votes,
                                challenger_id, opponent_id, rating_delta, finalized_by)
    values (p_post_id, v_challenge.id, v_winner, v_for, v_against,
            v_challenge.challenger_id, v_challenge.opponent_id, v_delta, v_user);

    return json_build_object(
        'ok', true, 'winner', v_winner,
        'for_votes', v_for, 'against_votes', v_against,
        'rating_delta', v_delta, 'challenger_won', v_chal_won
    );
end $$;

grant execute on function public.place_xp_bet(uuid, text, int) to authenticated;
grant execute on function public.finalize_debate(uuid) to authenticated;
grant execute on function public.ensure_rating_row(uuid) to authenticated;
