import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ScrollView, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from '@components/UI/SafeAreaView';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../components/Theme/ThemeProvider';
import { usePosts } from '@lib/supabase/hooks/usePosts';
import { DebateCard } from '@components/Debate/DebateCard';
import { AmbientGlow } from '../../components/UI/AmbientGlow';

const isWeb = Platform.OS === 'web';
const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';

type FilterKey = 'all' | 'trending' | 'new' | 'oracle';
const FILTERS: { key: FilterKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'trending', label: 'Trending', icon: 'flame' },
    { key: 'new', label: 'New', icon: 'time' },
    { key: 'oracle', label: 'AI Oracle', icon: 'sparkles' },
];

const formatNum = (n: number = 0) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);

export default function ArenaScreen() {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const router = useRouter();
    const { posts, refresh } = usePosts();
    const [filter, setFilter] = useState<FilterKey>('all');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refresh();
        setTimeout(() => setRefreshing(false), 900);
    }, [refresh]);

    const data = useMemo(() => {
        let list = [...(posts || [])];
        if (filter === 'trending') list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        else if (filter === 'new') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        else if (filter === 'oracle') list = list.filter((p) => p.isAiAssisted);
        return list;
    }, [posts, filter]);

    const totalArguments = useMemo(() => (posts || []).reduce((s, p) => s + (p.comments || 0), 0), [posts]);

    const primary = theme.colors.primary.DEFAULT;

    const Stat = ({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) => (
        <View style={styles.stat}>
            <Text style={[styles.statValue, { color: accent ? '#34D399' : theme.colors.text.primary, fontFamily: MONO }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.muted, fontFamily: MONO }]}>{label}</Text>
        </View>
    );

    const Header = (
        <View style={styles.headerWrap}>
            {/* Hero */}
            <LinearGradient
                colors={isDark ? ['rgba(217,228,255,0.12)', 'rgba(217,228,255,0.02)'] : ['rgba(76,110,245,0.10)', 'rgba(76,110,245,0.01)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.hero, { borderColor: isDark ? 'rgba(217,228,255,0.12)' : 'rgba(76,110,245,0.15)' }]}
            >
                <View style={[styles.heroBadge, { borderColor: isDark ? 'rgba(217,228,255,0.30)' : 'rgba(76,110,245,0.28)' }]}>
                    <MaterialCommunityIcons name="sword-cross" size={12} color={primary} />
                    <Text style={[styles.heroBadgeText, { color: primary, fontFamily: MONO }]}>ARENA · BETA</Text>
                </View>

                <Text style={[styles.heroTitle, { color: theme.colors.text.primary }]}>[ ARENA ]</Text>
                <Text style={[styles.heroSub, { color: theme.colors.text.secondary }]}>
                    Where logic wins. Step in, challenge any thesis and defend your reasoning.
                </Text>

                <View style={[styles.heroStats, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                    <Stat value={data.length} label="DEBATES" />
                    <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }]} />
                    <Stat value={formatNum(totalArguments)} label="ARGUMENTS" />
                    <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }]} />
                    <Stat value="LIVE" label="STATUS" accent />
                </View>

                <Pressable style={styles.proposeBtn} onPress={() => router.push('/publish')}>
                    <LinearGradient
                        colors={isDark ? ['#D9E4FF', '#A5C6FF'] : ['#4C6EF5', '#7AA2FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.proposeBtnInner}
                    >
                        <Ionicons name="add" size={18} color={isDark ? '#08090D' : '#FFFFFF'} />
                        <Text style={[styles.proposeBtnText, { color: isDark ? '#08090D' : '#FFFFFF' }]}>Propose Thesis</Text>
                    </LinearGradient>
                </Pressable>
            </LinearGradient>

            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
                {FILTERS.map((f) => {
                    const active = filter === f.key;
                    return (
                        <Pressable
                            key={f.key}
                            onPress={() => setFilter(f.key)}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: active
                                        ? (isDark ? 'rgba(217,228,255,0.12)' : 'rgba(76,110,245,0.10)')
                                        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)'),
                                    borderColor: active
                                        ? (isDark ? 'rgba(217,228,255,0.30)' : 'rgba(76,110,245,0.28)')
                                        : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
                                },
                            ]}
                        >
                            <Ionicons name={f.icon} size={13} color={active ? primary : theme.colors.text.muted} />
                            <Text style={[styles.chipText, { color: active ? primary : theme.colors.text.secondary }]}>{f.label}</Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <Text style={[styles.sectionLabel, { color: theme.colors.text.muted, fontFamily: MONO }]}>[ ACTIVE DEBATES ]</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <AmbientGlow color={isDark ? 'rgba(217, 228, 255, 0.08)' : 'rgba(217, 228, 255, 0.04)'} size={400} opacity={0.6} duration={25000} delay={0} />
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <DebateCard
                            item={{ ...item, createdAt: item.createdAt || new Date().toISOString() }}
                            onPress={() => router.push({ pathname: '/(tabs)', params: { postId: item.id } })}
                        />
                    )}
                    ListHeaderComponent={Header}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.light} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="chatbubbles-outline" size={42} color={theme.colors.text.muted} />
                            <Text style={[styles.emptyText, { color: theme.colors.text.muted }]}>
                                No debates here yet. Propose the first thesis and open the arena.
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: {
        paddingBottom: 100,
        ...(isWeb ? { width: '100%', maxWidth: 760, alignSelf: 'center' } : {}),
    },
    headerWrap: {
        paddingTop: 12,
    },

    // Hero
    hero: {
        marginHorizontal: 16,
        borderRadius: 24,
        borderWidth: 1,
        padding: 20,
        marginBottom: 16,
        overflow: 'hidden',
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
        marginBottom: 14,
    },
    heroBadgeText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1.4,
    },
    heroTitle: {
        fontSize: isWeb ? 34 : 30,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 8,
    },
    heroSub: {
        fontSize: 14,
        lineHeight: 20,
        maxWidth: 460,
        marginBottom: 18,
    },
    heroStats: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    statLabel: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 3,
    },
    statDivider: {
        width: 1,
        height: 28,
    },
    proposeBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        alignSelf: 'flex-start',
    },
    proposeBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingVertical: 11,
        paddingHorizontal: 18,
    },
    proposeBtnText: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    // Filters
    filters: {
        paddingHorizontal: 16,
        gap: 8,
        paddingBottom: 14,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '700',
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
        marginLeft: 18,
        marginBottom: 12,
    },

    empty: {
        padding: 48,
        alignItems: 'center',
        gap: 14,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 320,
    },
});
