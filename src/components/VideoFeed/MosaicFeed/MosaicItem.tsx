import React, { memo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Image } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SPACING = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - (GRID_SPACING * 3)) / 2;

interface MosaicItemProps {
    video: any;
    isActive: boolean;
    isScreenFocused: boolean;
    onPress: () => void;
}

const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export const MosaicItem = memo(({ video, isActive, isScreenFocused, onPress }: MosaicItemProps) => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    const player = useVideoPlayer(video.videoUrl, (player) => {
        player.loop = true;
        player.muted = true;
    });

    useEffect(() => {
        if (isActive && isScreenFocused) {
            player.play();
        } else {
            player.pause();
        }
    }, [isActive, isScreenFocused, player]);

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <View style={styles.card}>
                {/* Video Layer */}
                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    nativeControls={false}
                />

                {/* Dark Overlay for better text contrast */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Top Overlay: Trending/AI Badge */}
                {video.category && (
                    <View style={styles.topBadgeContainer}>
                        <BlurView intensity={30} tint="dark" style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{video.category}</Text>
                        </BlurView>
                    </View>
                )}

                {/* Bottom Overlay: Title & Stats */}
                <View style={styles.bottomOverlay}>
                    <Text style={styles.title} numberOfLines={1}>{video.title}</Text>

                    <View style={styles.footerRow}>
                        <View style={styles.authorSection}>
                            <Image
                                source={{ uri: video.avatarUrl || 'https://i.pravatar.cc/100' }}
                                style={styles.avatar}
                            />
                            <Text style={styles.authorName} numberOfLines={1}>{video.author}</Text>
                        </View>

                        <View style={styles.statsContainer}>
                            <Ionicons name="heart" size={10} color={theme.colors.text.secondary} />
                            <Text style={styles.statsText}>{formatNumber(video.likes)}</Text>
                        </View>
                    </View>
                </View>

                {/* Active Indicator Border */}
                {isActive && (
                    <View style={[styles.activeBorder, { borderColor: theme.colors.primary.DEFAULT }]} />
                )}
            </View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    container: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        marginBottom: GRID_SPACING,
        borderRadius: 24,
        overflow: 'hidden',
        // High-end shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    card: {
        flex: 1,
        backgroundColor: '#111',
    },
    topBadgeContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
    },
    title: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 6,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 18,
        height: 18,
        borderRadius: 9,
        marginRight: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    authorName: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '600',
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statsText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 2,
    },
    activeBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderRadius: 24,
    }
});
