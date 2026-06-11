import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../Theme/ThemeProvider';
import { useAuth } from '@lib/supabase/hooks/useAuth';
import { useDebateVotes, VoteSide } from '@lib/supabase/hooks/useDebateVotes';
import { supabase } from '@lib/supabase/client';
import { shareVerdictCard } from './shareVerdict';

interface TugOfWarProps {
    postId: string;
    topic: string;
    // Participants of the linked challenge (enables the finalize button).
    // When omitted, they're looked up from debate_challenges.
    challengerId?: string | null;
    opponentId?: string | null;
}

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';

// Live spectator voting: the audience pulls the rope FOR or AGAINST in
// realtime. Participants can finalize to lock the verdict and apply ELO.
export function TugOfWar({ postId, topic, challengerId, opponentId }: TugOfWarProps) {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const { user } = useAuth();
    const { forVotes, againstVotes, myVote, verdict, unavailable, vote, finalize, placeBet } = useDebateVotes(postId);

    const [finalizing, setFinalizing] = useState(false);
    const [betMsg, setBetMsg] = useState<string | null>(null);
    const [betting, setBetting] = useState<VoteSide | null>(null);
    const [shared, setShared] = useState(false);
    const [participants, setParticipants] = useState<{ challengerId: string | null; opponentId: string | null }>({
        challengerId: challengerId ?? null,
        opponentId: opponentId ?? null,
    });

    useEffect(() => {
        if (challengerId || opponentId || !supabase || !postId) return;
        let cancelled = false;
        supabase
            .from('debate_challenges')
            .select('challenger_id, opponent_id')
            .eq('post_id', postId)
            .eq('status', 'ACCEPTED')
            .maybeSingle()
            .then(({ data }: any) => {
                if (!cancelled && data) {
                    setParticipants({ challengerId: data.challenger_id, opponentId: data.opponent_id });
                }
            });
        return () => { cancelled = true; };
    }, [postId, challengerId, opponentId]);

    const total = forVotes + againstVotes;
    const forPct = total > 0 ? (forVotes / total) * 100 : 50;

    const pctAnim = useSharedValue(50);
    useEffect(() => {
        pctAnim.value = withSpring(forPct, { damping: 16 });
    }, [forPct]);
    const forStyle = useAnimatedStyle(() => ({ width: `${pctAnim.value}%` }));

    if (unavailable) return null;

    const isParticipant = !!user && (user.id === participants.challengerId || user.id === participants.opponentId);
    const finished = !!verdict;

    const handleFinalize = async () => {
        setFinalizing(true);
        const res = await finalize();
        setFinalizing(false);
        if (!res.ok && res.message) setBetMsg(res.message);
    };

    const handleBet = async (side: VoteSide) => {
        setBetting(side);
        setBetMsg(null);
        const res = await placeBet(side, 50);
        setBetting(null);
        setBetMsg(res.ok ? `Bet placed: 50 XP on ${side}` : (res.message || 'Bet failed'));
    };

    const handleShare = async () => {
        const ok = await shareVerdictCard({
            topic,
            forVotes: verdict?.forVotes ?? forVotes,
            againstVotes: verdict?.againstVotes ?? againstVotes,
            winner: verdict?.winnerSide,
            url: Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : undefined,
        });
        if (ok) {
            setShared(true);
            setTimeout(() => setShared(false), 2500);
        }
    };

    const cardBg = isDark ? 'rgba(217,228,255,0.04)' : '#FFF';
    const border = isDark ? 'rgba(217,228,255,0.12)' : 'rgba(0,0,0,0.08)';

    return (
        <View style={[styles.container, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={styles.headerRow}>
                <View style={styles.titleWrap}>
                    <Ionicons name="people" size={14} color="#38BDF8" />
                    <Text style={[styles.title, { color: theme.colors.text.primary }]}>ARENA VERDICT</Text>
                </View>
                {!finished ? (
                    <View style={styles.liveChip}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveChipText}>LIVE · {total} VOTES</Text>
                    </View>
                ) : (
                    <View style={[styles.liveChip, { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)' }]}>
                        <Text style={[styles.liveChipText, { color: '#34D399' }]}>FINAL</Text>
                    </View>
                )}
            </View>

            {/* Tug-of-war rope */}
            <View style={styles.ropeRow}>
                <Text style={[styles.ropeCount, { color: '#7DD3FC' }]}>{forVotes}</Text>
                <View style={[styles.ropeTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }]}>
                    <Animated.View style={[styles.ropeForFill, forStyle]} />
                    <View style={styles.ropeKnot} pointerEvents="none" />
                </View>
                <Text style={[styles.ropeCount, { color: '#F87171', textAlign: 'right' }]}>{againstVotes}</Text>
            </View>
            <View style={styles.ropeLabels}>
                <Text style={[styles.ropeLabel, { color: theme.colors.text.secondary }]}>FOR</Text>
                <Text style={[styles.ropeLabel, { color: theme.colors.text.secondary }]}>AGAINST</Text>
            </View>

            {finished ? (
                <View style={styles.verdictWrap}>
                    <MaterialCommunityIcons
                        name={verdict!.winnerSide === 'DRAW' ? 'scale-balance' : 'trophy'}
                        size={22}
                        color={verdict!.winnerSide === 'DRAW' ? '#D9E4FF' : '#FFD700'}
                    />
                    <Text style={[styles.verdictText, { color: theme.colors.text.primary }]}>
                        {verdict!.winnerSide === 'DRAW'
                            ? 'The arena calls it a DRAW'
                            : `The arena sides ${verdict!.winnerSide}`}
                    </Text>
                    {verdict!.ratingDelta !== 0 && (
                        <Text style={[styles.deltaText, { color: theme.colors.text.secondary }]}>
                            ELO {verdict!.ratingDelta > 0 ? '+' : ''}{verdict!.ratingDelta} to challenger
                        </Text>
                    )}
                </View>
            ) : (
                <>
                    {/* Vote buttons */}
                    <View style={styles.voteRow}>
                        <Pressable
                            style={[styles.voteBtn, styles.voteFor, myVote === 'FOR' && styles.voteForActive]}
                            onPress={() => vote('FOR')}
                            disabled={!user}
                        >
                            <Text style={[styles.voteBtnText, { color: myVote === 'FOR' ? '#000' : '#7DD3FC' }]}>
                                {myVote === 'FOR' ? '✓ VOTED FOR' : 'VOTE FOR'}
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.voteBtn, styles.voteAgainst, myVote === 'AGAINST' && styles.voteAgainstActive]}
                            onPress={() => vote('AGAINST')}
                            disabled={!user}
                        >
                            <Text style={[styles.voteBtnText, { color: myVote === 'AGAINST' ? '#000' : '#F87171' }]}>
                                {myVote === 'AGAINST' ? '✓ VOTED AGAINST' : 'VOTE AGAINST'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* XP bet */}
                    {user && (
                        <View style={styles.betRow}>
                            <Text style={[styles.betLabel, { color: theme.colors.text.muted }]}>STAKE 50 XP:</Text>
                            <Pressable style={styles.betBtn} onPress={() => handleBet('FOR')} disabled={!!betting}>
                                {betting === 'FOR' ? <ActivityIndicator size="small" color="#7DD3FC" /> : <Text style={[styles.betBtnText, { color: '#7DD3FC' }]}>ON FOR</Text>}
                            </Pressable>
                            <Pressable style={styles.betBtn} onPress={() => handleBet('AGAINST')} disabled={!!betting}>
                                {betting === 'AGAINST' ? <ActivityIndicator size="small" color="#F87171" /> : <Text style={[styles.betBtnText, { color: '#F87171' }]}>ON AGAINST</Text>}
                            </Pressable>
                        </View>
                    )}

                    {isParticipant && (
                        <Pressable style={styles.finalizeBtn} onPress={handleFinalize} disabled={finalizing}>
                            {finalizing
                                ? <ActivityIndicator size="small" color="#000" />
                                : (
                                    <>
                                        <Ionicons name="flag" size={14} color="#000" />
                                        <Text style={styles.finalizeBtnText}>FINISH DEBATE & LOCK VERDICT</Text>
                                    </>
                                )}
                        </Pressable>
                    )}
                </>
            )}

            {betMsg && <Text style={[styles.betMsg, { color: theme.colors.text.secondary }]}>{betMsg}</Text>}

            {/* Share verdict card */}
            {Platform.OS === 'web' && (
                <Pressable style={[styles.shareBtn, { borderColor: border }]} onPress={handleShare}>
                    <Ionicons name={shared ? 'checkmark' : 'share-social'} size={14} color="#38BDF8" />
                    <Text style={styles.shareBtnText}>{shared ? 'CARD READY' : 'SHARE VERDICT CARD'}</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        marginTop: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    titleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1.2,
        fontFamily: MONO,
    },
    liveChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: 'rgba(239,68,68,0.08)',
        borderColor: 'rgba(239,68,68,0.2)',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
    },
    liveChipText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
        color: '#EF4444',
        fontFamily: MONO,
    },
    ropeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    ropeCount: {
        width: 36,
        fontSize: 14,
        fontWeight: '900',
        fontFamily: MONO,
    },
    ropeTrack: {
        flex: 1,
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
        flexDirection: 'row',
        position: 'relative',
    },
    ropeForFill: {
        height: '100%',
        backgroundColor: '#38BDF8',
        borderRadius: 5,
    },
    ropeKnot: {
        position: 'absolute',
        top: -2,
        left: '50%',
        width: 2,
        height: 14,
        marginLeft: -1,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    ropeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        paddingHorizontal: 46,
    },
    ropeLabel: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
        fontFamily: MONO,
    },
    voteRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    voteBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    voteFor: {
        backgroundColor: 'rgba(56,189,248,0.08)',
        borderColor: 'rgba(56,189,248,0.35)',
    },
    voteForActive: {
        backgroundColor: '#7DD3FC',
        borderColor: '#7DD3FC',
    },
    voteAgainst: {
        backgroundColor: 'rgba(248,113,113,0.08)',
        borderColor: 'rgba(248,113,113,0.35)',
    },
    voteAgainstActive: {
        backgroundColor: '#F87171',
        borderColor: '#F87171',
    },
    voteBtnText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.8,
        fontFamily: MONO,
    },
    betRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 12,
    },
    betLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.8,
        fontFamily: MONO,
    },
    betBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(128,128,128,0.1)',
    },
    betBtnText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
        fontFamily: MONO,
    },
    betMsg: {
        fontSize: 11,
        marginTop: 10,
        fontFamily: MONO,
    },
    finalizeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 14,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#D9E4FF',
    },
    finalizeBtnText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#000',
        fontFamily: MONO,
    },
    verdictWrap: {
        alignItems: 'center',
        gap: 6,
        marginTop: 14,
        paddingVertical: 10,
    },
    verdictText: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5,
        fontFamily: MONO,
    },
    deltaText: {
        fontSize: 11,
        fontFamily: MONO,
    },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    shareBtnText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#38BDF8',
        fontFamily: MONO,
    },
});
