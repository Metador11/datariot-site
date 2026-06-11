import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@lib/supabase/client';
import { useTheme } from '../Theme/ThemeProvider';

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';

interface HotDebate {
    postId: string;
    topic: string;
    votes: number;
    forVotes: number;
}

// "Debate of the day": the most-voted open debate of the last 24h.
// Renders nothing when there's no debate activity yet.
export function DebateOfTheDay() {
    const router = useRouter();
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const [debate, setDebate] = useState<HotDebate | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!supabase) return;
            try {
                const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
                const { data: votes, error } = await supabase
                    .from('debate_votes')
                    .select('post_id, side')
                    .gte('created_at', since)
                    .limit(2000);
                if (error || !votes || votes.length === 0) return;

                const tally: Record<string, { total: number; forV: number }> = {};
                votes.forEach((v: any) => {
                    tally[v.post_id] = tally[v.post_id] || { total: 0, forV: 0 };
                    tally[v.post_id].total++;
                    if (v.side === 'FOR') tally[v.post_id].forV++;
                });
                const top = Object.entries(tally).sort((a, b) => b[1].total - a[1].total)[0];
                if (!top) return;

                const { data: post } = await supabase
                    .from('posts')
                    .select('id, content')
                    .eq('id', top[0])
                    .maybeSingle();
                if (cancelled || !post) return;

                setDebate({
                    postId: post.id,
                    topic: post.content,
                    votes: top[1].total,
                    forVotes: top[1].forV,
                });
            } catch {
                // Feature table may not exist yet — stay hidden
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (!debate) return null;

    const forPct = debate.votes > 0 ? Math.round((debate.forVotes / debate.votes) * 100) : 50;

    return (
        <Pressable
            onPress={() => router.push(`/debate/${debate.postId}`)}
            style={({ hovered }: any) => [
                styles.container,
                {
                    borderColor: isDark ? 'rgba(255,215,0,0.25)' : 'rgba(180,140,0,0.3)',
                    backgroundColor: isDark ? 'rgba(255,215,0,0.04)' : 'rgba(255,215,0,0.06)',
                },
                Platform.OS === 'web' && hovered && styles.hovered,
            ]}
        >
            <LinearGradient
                colors={isDark
                    ? ['rgba(255,215,0,0.08)', 'transparent']
                    : ['rgba(255,215,0,0.12)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.headerRow}>
                <View style={styles.titleWrap}>
                    <Ionicons name="flame" size={14} color="#FFD700" />
                    <Text style={styles.kicker}>DEBATE OF THE DAY</Text>
                </View>
                <Text style={[styles.votesText, { color: theme.colors.text.secondary }]}>{debate.votes} VOTES · 24H</Text>
            </View>

            <Text style={[styles.topic, { color: theme.colors.text.primary }]} numberOfLines={2}>
                “{debate.topic}”
            </Text>

            <View style={styles.bottomRow}>
                <View style={[styles.splitTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                    <View style={[styles.splitFill, { width: `${forPct}%` }]} />
                </View>
                <Text style={[styles.splitText, { color: theme.colors.text.secondary }]}>{forPct}% FOR</Text>
                <View style={styles.cta}>
                    <Text style={styles.ctaText}>JOIN</Text>
                    <Ionicons name="arrow-forward" size={12} color="#FFD700" />
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 18,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        overflow: 'hidden',
        // @ts-ignore — web only
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    },
    hovered: {
        transform: [{ translateY: -2 }],
        // @ts-ignore — web only
        boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 24px rgba(255,215,0,0.12)',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    titleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    kicker: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        color: '#FFD700',
        fontFamily: MONO,
    },
    votesText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.8,
        fontFamily: MONO,
    },
    topic: {
        fontSize: 16,
        fontWeight: '800',
        lineHeight: 22,
        marginBottom: 12,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    splitTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    splitFill: {
        height: '100%',
        backgroundColor: '#38BDF8',
        borderRadius: 3,
    },
    splitText: {
        fontSize: 10,
        fontWeight: '800',
        fontFamily: MONO,
    },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: 'rgba(255,215,0,0.12)',
    },
    ctaText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#FFD700',
        fontFamily: MONO,
    },
});
