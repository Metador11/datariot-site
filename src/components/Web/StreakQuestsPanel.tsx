import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../Theme/ThemeProvider';
import { useAuth } from '@lib/supabase/hooks/useAuth';
import { useStreak } from '@lib/supabase/hooks/useStreak';
import { leagueForRating, nextLeague } from '@lib/arena/elo';

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';

// Right-panel widget: daily streak, quest checklist, league & achievements.
// Hidden when signed out or when the backend tables don't exist yet.
export function StreakQuestsPanel() {
    const { user } = useAuth();
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const { streak, quests, rating, xp, unavailable } = useStreak();

    if (!user || unavailable) return null;

    const league = leagueForRating(rating ?? 1000);
    const next = nextLeague(rating ?? 1000);

    return (
        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                [ PILOT.STATUS ]
            </Text>

            <View style={[
                styles.card,
                {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
                },
            ]}>
                {/* Streak + league row */}
                <View style={styles.topRow}>
                    <View style={styles.streakWrap}>
                        <Ionicons name="flame" size={18} color={streak > 0 ? '#F59E0B' : theme.colors.text.muted} />
                        <Text style={[styles.streakNum, { color: theme.colors.text.primary }]}>{streak}</Text>
                        <Text style={[styles.streakLabel, { color: theme.colors.text.muted }]}>DAY STREAK</Text>
                    </View>
                    <View style={[styles.leagueChip, { borderColor: league.color + '55', backgroundColor: league.color + '14' }]}>
                        <Ionicons name={league.icon as any} size={12} color={league.color} />
                        <Text style={[styles.leagueText, { color: league.color }]}>{league.label} · {rating ?? 1000}</Text>
                    </View>
                </View>

                {next && (
                    <Text style={[styles.nextLeague, { color: theme.colors.text.muted }]}>
                        {next.min - (rating ?? 1000)} ELO TO {next.label}
                    </Text>
                )}

                {/* Quests */}
                <View style={styles.questList}>
                    {quests.map(q => (
                        <View key={q.key} style={styles.questRow}>
                            <Ionicons
                                name={q.done ? 'checkbox' : 'square-outline'}
                                size={14}
                                color={q.done ? '#34D399' : theme.colors.text.muted}
                            />
                            <Text style={[
                                styles.questLabel,
                                { color: q.done ? theme.colors.text.muted : theme.colors.text.primary },
                                q.done && styles.questDone,
                            ]}>
                                {q.label.toUpperCase()}
                            </Text>
                            <Text style={[styles.questProgress, { color: theme.colors.text.muted }]}>
                                {q.progress}/{q.target}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={[styles.xpRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }]}>
                    <MaterialCommunityIcons name="lightning-bolt" size={13} color="#D9E4FF" />
                    <Text style={[styles.xpText, { color: theme.colors.text.secondary }]}>{xp ?? 0} ACHIEVEMENTS AVAILABLE</Text>\
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 36,
    },
    sectionTitle: {
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        fontFamily: MONO,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    streakWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    streakNum: {
        fontSize: 18,
        fontWeight: '900',
        fontFamily: MONO,
    },
    streakLabel: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
        fontFamily: MONO,
    },
    leagueChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    leagueText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.8,
        fontFamily: MONO,
    },
    nextLeague: {
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 0.8,
        fontFamily: MONO,
        marginTop: 6,
    },
    questList: {
        marginTop: 12,
        gap: 8,
    },
    questRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    questLabel: {
        flex: 1,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        fontFamily: MONO,
    },
    questDone: {
        textDecorationLine: 'line-through',
    },
    questProgress: {
        fontSize: 10,
        fontWeight: '700',
        fontFamily: MONO,
    },
    xpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
    },
    xpText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.8,
        fontFamily: MONO,
    },
});
