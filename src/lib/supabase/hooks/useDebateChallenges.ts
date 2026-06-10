import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../client';
import { useAuth } from './useAuth';

// Requires the debate_challenges table — see scripts/create_debate_challenges.sql

export type ChallengeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type ChallengeSide = 'FOR' | 'AGAINST';

export interface DebateChallenge {
    id: string;
    challengerId: string;
    opponentId: string;
    topic: string;
    challengerSide: ChallengeSide;
    status: ChallengeStatus;
    postId: string | null;
    createdAt: string;
    challengerName: string;
    challengerAvatar?: string;
    opponentName: string;
    opponentAvatar?: string;
    direction: 'incoming' | 'outgoing';
}

const TABLE_MISSING_CODES = ['42P01', 'PGRST205'];

export function useDebateChallenges() {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState<DebateChallenge[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    // True when the debate_challenges table hasn't been created yet
    const [unavailable, setUnavailable] = useState(false);

    const fetchChallenges = useCallback(async () => {
        if (!supabase || !user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('debate_challenges')
                .select('*')
                .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                if (TABLE_MISSING_CODES.includes((error as any).code)) {
                    setUnavailable(true);
                    return;
                }
                throw error;
            }
            if (!data) return;

            const profileIds = [...new Set(data.flatMap((c: any) => [c.challenger_id, c.opponent_id]))];
            let profilesMap: Record<string, any> = {};
            if (profileIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, username, display_name, avatar_url')
                    .in('id', profileIds);
                if (profiles) {
                    profilesMap = profiles.reduce((acc: any, p: any) => {
                        acc[p.id] = p;
                        return acc;
                    }, {});
                }
            }

            const nameOf = (id: string) => {
                const p = profilesMap[id] || {};
                return p.display_name || p.username || 'User';
            };

            setChallenges(data.map((c: any): DebateChallenge => ({
                id: c.id,
                challengerId: c.challenger_id,
                opponentId: c.opponent_id,
                topic: c.topic,
                challengerSide: c.challenger_side,
                status: c.status,
                postId: c.post_id,
                createdAt: c.created_at,
                challengerName: nameOf(c.challenger_id),
                challengerAvatar: profilesMap[c.challenger_id]?.avatar_url,
                opponentName: nameOf(c.opponent_id),
                opponentAvatar: profilesMap[c.opponent_id]?.avatar_url,
                direction: c.opponent_id === user.id ? 'incoming' : 'outgoing',
            })));
        } catch (err) {
            console.error('Error fetching debate challenges:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchChallenges();
    }, [user, fetchChallenges]);

    const sendChallenge = useCallback(async (
        opponentId: string,
        topic: string,
        side: ChallengeSide,
    ): Promise<{ ok: boolean; message?: string }> => {
        if (!supabase || !user) return { ok: false, message: 'Sign in to challenge users.' };
        if (opponentId === user.id) return { ok: false, message: 'You cannot challenge yourself.' };
        const trimmed = topic.trim();
        if (trimmed.length < 10) return { ok: false, message: 'Topic is too short (min 10 characters).' };

        setSending(true);
        try {
            const { error } = await supabase.from('debate_challenges').insert({
                challenger_id: user.id,
                opponent_id: opponentId,
                topic: trimmed,
                challenger_side: side,
            });
            if (error) {
                if (TABLE_MISSING_CODES.includes((error as any).code)) {
                    setUnavailable(true);
                    return { ok: false, message: 'Challenges are not enabled on this server yet.' };
                }
                throw error;
            }
            await fetchChallenges();
            return { ok: true };
        } catch (err: any) {
            console.error('Error sending challenge:', err);
            return { ok: false, message: err?.message || 'Failed to send the challenge.' };
        } finally {
            setSending(false);
        }
    }, [user, fetchChallenges]);

    // Accept: creates the debate thread (a post) and links it to the challenge.
    // Returns the new post id so the UI can navigate straight into the arena.
    const respondToChallenge = useCallback(async (
        challenge: DebateChallenge,
        accept: boolean,
    ): Promise<{ ok: boolean; postId?: string; message?: string }> => {
        if (!supabase || !user) return { ok: false };
        try {
            let postId: string | undefined;

            if (accept) {
                const { data: post, error: postError } = await supabase
                    .from('posts')
                    .insert({
                        user_id: user.id,
                        content: challenge.topic,
                        is_published: true,
                    })
                    .select('id')
                    .single();
                if (postError) throw postError;
                postId = post?.id;
            }

            const { error } = await supabase
                .from('debate_challenges')
                .update({
                    status: accept ? 'ACCEPTED' : 'DECLINED',
                    post_id: postId ?? null,
                    responded_at: new Date().toISOString(),
                })
                .eq('id', challenge.id)
                .eq('opponent_id', user.id);
            if (error) throw error;

            setChallenges(prev => prev.map(c =>
                c.id === challenge.id
                    ? { ...c, status: accept ? 'ACCEPTED' : 'DECLINED', postId: postId ?? null }
                    : c
            ));
            return { ok: true, postId };
        } catch (err: any) {
            console.error('Error responding to challenge:', err);
            return { ok: false, message: err?.message || 'Failed to respond.' };
        }
    }, [user]);

    const incoming = challenges.filter(c => c.direction === 'incoming' && c.status === 'PENDING');
    const outgoing = challenges.filter(c => c.direction === 'outgoing' && c.status === 'PENDING');

    return {
        challenges,
        incoming,
        outgoing,
        loading,
        sending,
        unavailable,
        fetchChallenges,
        sendChallenge,
        respondToChallenge,
    };
}
