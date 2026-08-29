-- Debate Challenges: one user challenges another to a debate on a topic.
-- Run this in the Supabase SQL editor (Dashboard -> SQL) once.

create table if not exists public.debate_challenges (
    id uuid primary key default gen_random_uuid(),
    challenger_id uuid not null references public.profiles (id) on delete cascade,
    opponent_id uuid not null references public.profiles (id) on delete cascade,
    topic text not null check (char_length(topic) between 10 and 280),
    challenger_side text not null default 'FOR' check (challenger_side in ('FOR', 'AGAINST')),
    status text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'DECLINED')),
    post_id uuid references public.posts (id) on delete set null,
    created_at timestamptz not null default now(),
    responded_at timestamptz,
    constraint no_self_challenge check (challenger_id <> opponent_id)
);

create index if not exists debate_challenges_opponent_idx on public.debate_challenges (opponent_id, status);
create index if not exists debate_challenges_challenger_idx on public.debate_challenges (challenger_id, status);

alter table public.debate_challenges enable row level security;

-- Participants can see their own challenges
drop policy if exists "debate_challenges_select" on public.debate_challenges;
create policy "debate_challenges_select" on public.debate_challenges
    for select using (auth.uid() = challenger_id or auth.uid() = opponent_id);

-- Only the challenger can create, and only as themselves
drop policy if exists "debate_challenges_insert" on public.debate_challenges;
create policy "debate_challenges_insert" on public.debate_challenges
    for insert with check (auth.uid() = challenger_id);

-- Only the opponent can respond (accept/decline) while pending
drop policy if exists "debate_challenges_update" on public.debate_challenges;
create policy "debate_challenges_update" on public.debate_challenges
    for update using (auth.uid() = opponent_id and status = 'PENDING');

-- The challenger can withdraw a pending challenge
drop policy if exists "debate_challenges_delete" on public.debate_challenges;
create policy "debate_challenges_delete" on public.debate_challenges
    for delete using (auth.uid() = challenger_id and status = 'PENDING');
