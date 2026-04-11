import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, useWindowDimensions, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@design-system/theme';
import { encodeVideoUrl } from '@lib/utils/url';
import { useVideoPlayer, VideoView } from 'expo-video';

interface FeaturedVideo {
    id: string;
    title: string;
    author: string;
    avatarUrl: string;
    videoUrl: string;
    thumbnailUrl?: string; // Added thumbnail support
    views: number;
    likes: number;
}

interface FeaturedHeroProps {
    featuredVideos: FeaturedVideo[];
    onVideoPress: (videoId: string) => void;
}

const FeaturedVideoPlayer = ({ videoUrl, isCurrent }: { videoUrl: string, isCurrent: boolean }) => {
    const player = useVideoPlayer(encodeVideoUrl(videoUrl), player => {
        player.loop = true;
    });

    React.useEffect(() => {
        if (isCurrent) {
            player.play();
        } else {
            player.pause();
        }
    }, [isCurrent, player]);

    return (
        <VideoView
            player={player}
            style={[styles.video, StyleSheet.absoluteFill, { opacity: isCurrent ? 1 : 0 }]}
            contentFit="cover"
            nativeControls={false}
        />
    );
};

export const FeaturedHero = ({ featuredVideos, onVideoPress }: FeaturedHeroProps) => {
    const { width: screenWidth } = useWindowDimensions();
    const itemWidth = screenWidth;

    const [currentIndex, setCurrentIndex] = useState(0);

    const renderFeaturedItem = (item: FeaturedVideo, index: number) => {
        const isCurrent = index === currentIndex;

        return (
            <Pressable
                onPress={() => onVideoPress(item.id)}
                style={[styles.heroContainer, { width: itemWidth }]}
            >
                <View style={styles.videoContainer}>
                    <Image
                        source={{ uri: item.thumbnailUrl || item.avatarUrl }} // Fallback to avatar if no thumbnail
                        style={styles.video}
                        resizeMode="cover"
                    />


                    <FeaturedVideoPlayer videoUrl={item.videoUrl} isCurrent={isCurrent} />

                    {/* Simple Overlay */}
                    <View style={styles.overlay}>
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
                            locations={[0, 0.6, 1]}
                            style={StyleSheet.absoluteFill}
                        />

                        {/* Info Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.infoContent}>
                                <Text style={styles.authorName}>@{item.author || 'USER'}</Text>
                                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>VIEWS</Text>
                                        <Text style={styles.statText}>{formatNumber(item.views)}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>LIKES</Text>
                                        <Text style={styles.statText}>{formatNumber(item.likes)}</Text>
                                    </View>
                                </View>
                            </View>

                        </View>

                        {/* Popular Badge */}
                        <View style={styles.trendingBadge}>
                            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
                            <Text style={styles.badgeText}>SYSTEM_TRENDING</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    const handleScrollEnd = React.useCallback((e: any) => {
        const xOffset = e.nativeEvent.contentOffset.x;
        const index = Math.round(xOffset / itemWidth);
        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    }, [itemWidth, currentIndex]);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                snapToInterval={itemWidth}
                snapToAlignment="start"
                decelerationRate="fast"
            >
                {featuredVideos.map((item, index) => (
                    <React.Fragment key={`${item.id}-${index}`}>
                        {renderFeaturedItem(item, index)}
                    </React.Fragment>
                ))}
            </ScrollView>

            {/* Pagination Dots - Square */}
            {featuredVideos.length > 1 && (
                <View style={styles.pagination}>
                    {featuredVideos.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.xl,
    },
    heroContainer: {
        height: 400, // Slightly shorter
    },
    videoContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
        opacity: 0.8, // Slightly dim video for better text contrast
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    infoCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing.xl,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    infoContent: {
        flex: 1,
        gap: 8,
        marginRight: 16,
    },

    authorName: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.primary.light,
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        lineHeight: 30,
        letterSpacing: -0.5,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statText: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '700',
    },
    trendingBadge: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: -16,
        marginBottom: theme.spacing.md,
    },
    dot: {
        width: 6,
        height: 6,
        backgroundColor: '#333',
    },
    activeDot: {
        backgroundColor: theme.colors.primary.light,
    },
});
