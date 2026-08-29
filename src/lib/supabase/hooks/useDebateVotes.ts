import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../client';
import { useAuth } from './useAuth';
import { recordDailyActivity } from './useStreak';

// Live spectator voting on a debate + finalized verdict.
// Requires scripts/create_engagement_features.sql.

export type VoteSide = 'FOR' | 'AGAINST';

export interface DebateVerdict {
    winnerSide: 'FOR' | 'AGAINST' | 'DRAW';
    forVotes: number;
    againstVotes: number;
    ratingDelta: number;
    challengerId: string | null;
    opponentId: string | null;
}

const TABLE_MISSING_CODES = ['42P01', 'PGRST205', 'PGRST202'];

export function useDebateVotes(postId: string | undefined) {
    const { user } = useAuth();
    const [forVotes, setForVotes] = useState(0);
    const [againstVotes, setAgainstVotes] = useState(0);
    const [myVote, setMyVote] = useState<VoteSide | null>(null);
    const [verdict, setVerdict] = useState<DebateVerdict | null>(null);
    const [unavailable, setUnavailable] = useState(false);
    const [voting, setVoting] = useState(false);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    const fetchTallies = useCallback(async () => {
        if (!supabase || !postId) return;
        try {
            const [votesRes, resultRes] = await Promise.all([
                supabase.from('debate_votes').select('side, user_id').eq('post_id', postId),
                supabase.from('debate_results').select('*').eq('post_id', postId).maybeSingle(),
            ]);

            if (votesRes.error) {
                if (TABLE_MISSING_CODES.includes((votesRes.error as any).code)) {
                    setUnavailable(true);
                    return;
                }
                throw votesRes.error;
            }
            if (!mounted.current) return;

            const votes = votesRes.data || [];
            setForVotes(votes.filter((v: any) => v.side === 'FOR').length);
            setAgainstVotes(votes.filter((v: any) => v.side === 'AGAINST').length);
            if (user) {
                const mine = votes.find((v: any) => v.user_id === user.id);
                setMyVote(mine ? mine.side : null);
            }

            const r = resultRes.data as any;
            if (r) {
                setVerdict({
                    winnerSide: r.winner_side,
                    forVotes: r.for_votes,
                    againstVotes: r.against_votes,
                    ratingDelta: r.rating_delta,
                    challengerId: r.challenger_id,
                    opponentId: r.opponent_id,
                });
            }
        } catch (err) {
            console.error('Error fetching debate votes:', err);
        }
    }, [postId, user]);

    // Initial fetch + realtime tally updates
    useEffect(() => {
        if (!supabase || !postId) return;
        fetchTallies();

        const channel = supabase
            .channel(`debate-votes-${postId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'debate_votes', filter: `post_id=eq.${postId}` },
                () => fetchTallies()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [postId, fetchTallies]);

    const vote = useCallback(async (side: VoteSide) => {
        if (!supabase || !user || !postId || verdict) return;
        setVoting(true);
        const prev = myVote;
        // Optimistic update
        setMyVote(side);
        setForVotes(v => v + (side === 'FOR' ? 1 : 0) - (prev === 'FOR' ? 1 : 0));
        setAgainstVotes(v => v + (side === 'AGAINST' ? 1 : 0) - (prev === 'AGAINST' ? 1 : 0));
        try {
            const { error } = await supabase
                .from('debate_votes')
                .upsert({ post_id: postId, user_id: user.id, side }, { onConflict: 'post_id,user_id' });
            if (error) {
                if (TABLE_MISSING_CODES.includes((error as any).code)) setUnavailable(true);
                throw error;
            }
            if (!prev) recordDailyActivity('vote');
        } catch (err) {
            console.error('Error voting:', err);
            fetchTallies(); // resync
        } finally {
            setVoting(false);
        }
    }, [user, postId, myVote, verdict, fetchTallies]);

    const finalize = useCallback(async (): Promise<{ ok: boolean; message?: string }> => {
        if (!supabase || !postId) return { ok: false };
        try {
            const { data, error } = await supabase.rpc('finalize_debate', { p_post_id: postId });
            if (error) {
                if (TABLE_MISSING_CODES.includes((error as any).code)) {
                    setUnavailable(true);
                    return { ok: false, message: 'Arena features are not enabled on this server yet.' };
                }
                throw error;
            }
            if (data && data.ok) {
                await fetchTallies();
                return { ok: true };
            }
            return { ok: false, message: data?.message || 'Could not finalize.' };
        } catch (err: any) {
            console.error('Error finalizing debate:', err);
            return { ok: false, message: err?.message };
        }
    }, [postId, fetchTallies]);

    const placeBet = useCallback(async (side: VoteSide, amount: number): Promise<{ ok: boolean; message?: string }> => {
        if (!supabase || !postId) return { ok: false };
        try {
            const { data, error } = await supabase.rpc('place_xp_bet', {
                p_post_id: postId, p_side: side, p_amount: amount,
            });
            if (error) throw error;
            return data?.ok ? { ok: true } : { ok: false, message: data?.message };
        } catch (err: any) {
            console.error('Error placing bet:', err);
            return { ok: false, message: err?.message };
        }
    }, [postId]);

    return { forVotes, againstVotes, myVote, verdict, unavailable, voting, vote, finalize, placeBet, refresh: fetchTallies };
}
