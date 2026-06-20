import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video } from '../../lib/supabase/hooks/useVideos';

const isWeb = Platform.OS === 'web';
const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';

const formatNumber = (num: number = 0): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

interface TrendingGridCardProps {
    item: Video;
    width: number;
    onSelect: () => void;
}

export const TrendingGridCard = memo(({ item, width, onSelect }: TrendingGridCardProps) => {
    const isLive = item.isHighSynergy || (item.category || '').toLowerCase().includes('live');
    const badgeLabel = isLive ? 'LIVE' : `SYS.${(item.category || 'TRENDING').toUpperCase()}`;
    const thumb = item.thumbnailUrl || `https://picsum.photos/seed/${item.id}/400/700`;

    return (
        <Pressable
            onPress={onSelect}
            style={[styles.card, { width, height: width * (16 / 9) }]}
        >
            <Image source={{ uri: thumb }} style={StyleSheet.absoluteFill} resizeMode="cover" />

            {/* Bottom readability gradient */}
            <LinearGradient
                colors={['transparent', 'rgba(6,7,10,0.35)', 'rgba(6,7,10,0.95)']}
                locations={[0, 0.5, 1]}
                style={styles.gradient}
            />

            {/* Category / Live badge */}
            <View style={[styles.badge, isLive && styles.badgeLive]}>
                <View style={[styles.badgeDot, isLive && styles.badgeDotLive]} />
                <Text style={[styles.badgeText, isLive && styles.badgeTextLive]} numberOfLines={1}>
                    {badgeLabel}
                </Text>
            </View>

            {/* Play affordance */}
            <View style={styles.playGlyph}>
                <Ionicons name="play" size={16} color="#08090D" style={{ marginLeft: 2 }} />
            </View>

            {/* Bottom info */}
            <View style={styles.info}>
                <Text style={styles.author} numberOfLines={1}>
                    {`> @${(item.author || 'unknown').toUpperCase()}`}
                </Text>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title ? item.title.toUpperCase() : ''}
                </Text>
                <View style={styles.statsRow}>
                    <Ionicons name="eye-outline" size={12} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.statText}>{formatNumber(item.views)}</Text>
                    <Ionicons name="star-outline" size={12} color="rgba(255,255,255,0.6)" style={{ marginLeft: 10 }} />
                    <Text style={styles.statText}>{formatNumber(item.likes)}</Text>
                </View>
            </View>
        </Pressable>
    );
}, (prev, next) =>
    prev.item.id === next.item.id &&
    prev.item.likes === next.item.likes &&
    prev.width === next.width
);

TrendingGridCard.displayName = 'TrendingGridCard';

const styles = StyleSheet.create({
    card: {
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#0C0D12',
        borderWidth: 1,
        borderColor: 'rgba(217, 228, 255, 0.10)',
        ...(isWeb
            ? {
                // @ts-ignore — web only glow
                boxShadow: '0 10px 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(217,228,255,0.04)',
            }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
            }),
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    badge: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(8, 9, 13, 0.72)',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        maxWidth: '85%',
    },
    badgeLive: {
        borderColor: 'rgba(248, 113, 113, 0.6)',
    },
    badgeDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#38BDF8',
    },
    badgeDotLive: {
        backgroundColor: '#F87171',
    },
    badgeText: {
        color: '#38BDF8',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
        fontFamily: MONO,
    },
    badgeTextLive: {
        color: '#F87171',
    },
    playGlyph: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(217, 228, 255, 0.92)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 12,
    },
    author: {
        color: '#38BDF8',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.4,
        fontFamily: MONO,
        marginBottom: 3,
        textShadowColor: 'rgba(56, 189, 248, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    title: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '800',
        lineHeight: 17,
        letterSpacing: 0.1,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 7,
    },
    statText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 4,
        fontFamily: MONO,
    },
});
