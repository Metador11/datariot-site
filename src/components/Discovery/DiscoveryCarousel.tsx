import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../Theme/ThemeProvider';
import { Video } from '../../lib/supabase/hooks/useVideos';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const CARD_WIDTH = isWeb ? 300 : SCREEN_WIDTH * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface DiscoveryCarouselProps {
    videos: Video[];
    onSelect: (id: string) => void;
}

const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

export const DiscoveryCarousel: React.FC<DiscoveryCarouselProps> = ({
    videos,
    onSelect
}) => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    const renderCard = ({ item }: { item: Video }) => (
        <Pressable
            onPress={() => onSelect(item.id)}
            style={({ hovered }: any) => [
                styles.card,
                isWeb && hovered && styles.cardHovered,
            ]}
        >
            {({ hovered }: any) => (
                <>
                    <Image source={{ uri: item.thumbnailUrl || 'https://picsum.photos/seed/' + item.id + '/400/600' }} style={styles.thumbnail} />

                    {/* Top scrim keeps badges readable on bright thumbnails */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.55)', 'transparent']}
                        style={styles.topGradient}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.85)']}
                        style={styles.gradient}
                    />

                    {/* Synergy Badge */}
                    <View style={styles.synergyBadge}>
                        <Text style={styles.synergyText}>[ {item.dnaMatch || 90}% MATCH ]</Text>
                    </View>

                    {/* AI Rationale Tooltip */}
                    <View style={styles.rationaleBox}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <Text style={styles.rationaleText} numberOfLines={2}>
                            {item.dnaRationale || "Matches your interest in High-Tech Content"}
                        </Text>
                    </View>

                    {/* Hover state: play CTA (web only) */}
                    {isWeb && (
                        <View style={[styles.hoverOverlay, { opacity: hovered ? 1 : 0 }]} pointerEvents="none">
                            <View style={styles.hoverPlayCircle}>
                                <Ionicons name="play" size={20} color="#FFF" style={{ marginLeft: 2 }} />
                            </View>
                        </View>
                    )}

                    <View style={styles.info}>
                        <Text style={styles.author}>
                            {item.author ? `> @${item.author.toUpperCase()}` : ''}
                        </Text>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.title ? item.title.toUpperCase() : ''}
                        </Text>
                        <Text style={styles.statsLine}>
                            {`${formatNumber(item.views || 0)} VIEWS  ·  ${formatNumber(item.likes || 0)} LIKES`}
                        </Text>
                    </View>
                </>
            )}
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={videos}
                renderItem={renderCard}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: CARD_HEIGHT + 20,
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginRight: 16,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        // @ts-ignore — web only
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    },
    cardHovered: {
        borderColor: 'rgba(56, 189, 248, 0.55)',
        transform: [{ translateY: -4 }],
        // @ts-ignore — web only
        boxShadow: '0 16px 36px rgba(0,0,0,0.5), 0 0 28px rgba(56,189,248,0.16)',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '32%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    hoverOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(2, 6, 12, 0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 25,
        // @ts-ignore — web only
        transition: 'opacity 0.2s ease',
    },
    hoverPlayCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(56, 189, 248, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        // @ts-ignore — web only
        backdropFilter: 'blur(6px)',
    },
    synergyBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(8, 9, 13, 0.65)',
        borderWidth: 1,
        borderColor: '#38BDF8',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        zIndex: 20,
    },
    synergyText: {
        color: '#38BDF8',
        fontSize: 10,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 0.5,
    },
    rationaleBox: {
        position: 'absolute',
        top: 50,
        left: 12,
        right: 12,
        padding: 8,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(217, 228, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(217, 228, 255, 0.2)',
    },
    rationaleText: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    info: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
    },
    author: {
        color: '#38BDF8',
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 0.5,
    },
    title: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.2,
    },
    statsLine: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginTop: 6,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});
