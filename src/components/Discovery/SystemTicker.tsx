import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../Theme/ThemeProvider';

// Terminal-style marquee strip at the top of the feed. Web only —
// the CSS animation comes from GlobalWebStyles (.dr-ticker-track).
const TICKER_ITEMS = [
    'SYSTEM.ONLINE',
    'ARGUE WITH LOGIC — WIN WITH FACTS',
    'NEW: CHALLENGE ANY USER TO A LIVE DEBATE',
    'WEEKLY.ARENA: SLOW MOTION — 5,000 ACHIEVEMENTS',
    'FACT.CHECK: ENABLED',
    'DNA.MATCHING: ACTIVE',
];

export function SystemTicker() {
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    if (Platform.OS !== 'web') return null;

    const renderRun = (keyPrefix: string) => (
        TICKER_ITEMS.map((item, i) => (
            <View key={`${keyPrefix}-${i}`} style={styles.itemRow}>
                <Text style={[styles.itemText, { color: isDark ? '#38BDF8' : '#4C6EF5' }]}>
                    {`[ ${item} ]`}
                </Text>
                <Text style={[styles.separator, { color: isDark ? 'rgba(56,189,248,0.35)' : 'rgba(76,110,245,0.35)' }]}>
                    {'///'}
                </Text>
            </View>
        ))
    );

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.04)' : 'rgba(76, 110, 245, 0.04)',
                borderColor: isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(76, 110, 245, 0.14)',
            },
        ]}>
            <View style={[styles.liveBadge, { borderRightColor: isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(76, 110, 245, 0.14)' }]}>
                <View style={styles.liveDotWrapper}>
                    <View style={styles.liveDot} />
                    {/* @ts-ignore — raw div for the CSS pulse animation */}
                    <div className="status-pulse-anim" style={{
                        position: 'absolute',
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: 'rgba(52, 211, 153, 0.45)',
                        zIndex: 1,
                    }} />
                </View>
                <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>

            <View style={styles.marqueeClip}>
                {/* @ts-ignore — raw div drives the marquee via CSS keyframes */}
                <div className="dr-ticker-track">
                    <View style={styles.run}>{renderRun('a')}</View>
                    <View style={styles.run}>{renderRun('b')}</View>
                </div>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 18,
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
        height: 36,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        height: '100%',
        borderRightWidth: 1,
    },
    liveDotWrapper: {
        width: 12,
        height: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#34D399',
        zIndex: 2,
    },
    liveBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
        color: '#34D399',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    marqueeClip: {
        flex: 1,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    run: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        paddingHorizontal: 14,
    },
    separator: {
        fontSize: 10,
        fontWeight: '800',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});
