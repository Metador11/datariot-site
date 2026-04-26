import React, { useRef, useState, memo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated, Image, Platform, useWindowDimensions } from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../Theme/ThemeProvider';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { encodeVideoUrl } from '../../lib/utils/url';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
// Constants moved inside component for responsiveness


interface FeedItemProps {
    item: any;
    isActive: boolean;
    onLike: () => void;
    onComment: () => void;
    onSave: () => void;
    onMore: () => void;
    onSelect: () => void;
}

const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

interface VideoPlayerLayerProps {
    videoUrl: string;
    isActive: boolean;
    isFocused: boolean;
    isPaused: boolean;
    isMuted: boolean;
    onTimeUpdate: (currentTime: number, duration: number) => void;
}

const VideoPlayerLayer = ({ videoUrl, isActive, isFocused, isPaused, isMuted, onTimeUpdate }: VideoPlayerLayerProps) => {
    const videoRef = useRef<Video>(null);

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <Video
                ref={videoRef}
                source={{ uri: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4' }}
                style={StyleSheet.absoluteFillObject}
                resizeMode={ResizeMode.COVER}
                shouldPlay={isActive && isFocused && !isPaused}
                isLooping
                isMuted={isMuted}
                onPlaybackStatusUpdate={(status: any) => {
                    if (status.isLoaded && status.durationMillis) {
                        onTimeUpdate(status.positionMillis, status.durationMillis);
                    }
                }}
            />
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />

            {/* Foreground Sharp Layer (shows full content) */}
            <Video
                source={{ uri: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4' }}
                style={StyleSheet.absoluteFillObject}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={isActive && isFocused && !isPaused}
                isLooping
                isMuted={isMuted}
            />
        </View>
    );
};

export const CoubClassicItem = memo(({
    item,
    isActive,
    onLike,
    onComment,
    onSave,
    onMore,
    onSelect,
}: FeedItemProps) => {
    const [isMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const { width: windowWidth } = useWindowDimensions();
    const { theme, mode } = useTheme();

    const isWeb = Platform.OS === 'web';
    const isMobileWeb = isWeb && windowWidth <= 768;

    const cardMargin = isWeb ? (isMobileWeb ? 0 : 0) : 16; // Maintain 0 for web to fill column
    const cardWidth = isWeb ? '100%' as any : windowWidth - (cardMargin * 2);
    const videoHeight = isWeb ? (isMobileWeb ? (windowWidth * 9 / 16) : 380) : (windowWidth - 32) * (9 / 16);

    const router = useRouter();
    const isDark = mode === 'dark';
    const isFocused = useIsFocused();

    // Animation for like button
    const likeScale = useRef(new Animated.Value(1)).current;

    const togglePlayback = () => {
        setIsPaused(!isPaused);
    };


    const handleNavigateProfile = () => {
        if (item.authorId) {
            router.push(`/user/${item.authorId}`);
        }
    };

    const handleLike = () => {
        Animated.sequence([
            Animated.spring(likeScale, {
                toValue: 1.5,
                useNativeDriver: true,
                speed: 50,
                bounciness: 10,
            }),
            Animated.spring(likeScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
                bounciness: 10,
            }),
        ]).start();
        onLike();
    };

    return (
        <View style={[styles.card, { width: isWeb ? '100%' : windowWidth, paddingHorizontal: isWeb ? 16 : cardMargin }]}>
            {/* Main Video Container (16:9) */}
            <Pressable style={[styles.videoContainer, { width: cardWidth, height: videoHeight }]} onPress={togglePlayback}>

                {/* Floating Avatar Badge overlapping the video */}
                <Pressable onPress={handleNavigateProfile} style={styles.floatingAuthorBadge}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                    <Image
                        source={{ uri: item.avatarUrl || 'https://i.pravatar.cc/100' }}
                        style={styles.avatar}
                        // @ts-ignore
                        crossOrigin="anonymous"
                    />
                    <Text style={[styles.authorNameBadge, { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>{item.author}</Text>
                </Pressable>

                {/* Background Blurred Layer (fills everything) */}
                {item.videoUrl ? (
                    <VideoPlayerLayer
                        videoUrl={item.videoUrl}
                        isActive={isActive}
                        isFocused={isFocused}
                        isPaused={isPaused}
                        isMuted={isMuted}
                        onTimeUpdate={(current, duration) => setProgress(current / duration)}
                    />
                ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#020408', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="videocam-off" size={48} color="rgba(255,255,255,0.1)" />
                    </View>
                )}

                {/* Dark Gradient Overlay for better text visibility */}
                <View style={styles.overlayGradient} pointerEvents="none" />

                {/* Unmute Icon */}
                {isMuted && (
                    <View style={styles.mutedOverlay}>
                        <Ionicons name="volume-mute" size={20} color="#FFF" />
                    </View>
                )}

                {/* Center Pause Icon */}
                {isPaused && (
                    <View style={styles.pauseOverlay}>
                        <Ionicons name="pause" size={48} color="white" />
                    </View>
                )}

                {/* Glowing Progress Bar integrated into bottom edge of video */}
                <View style={styles.progressBarContainer} pointerEvents="none">
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: '#D9E4FF' }]} />
                </View>


            </Pressable>

            {/* Overlapping Glass Panel for Info & Actions */}
            <View style={[styles.infoPanelWrapper, { width: isWeb ? '92%' : cardWidth - 32 }]}>
                <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={styles.infoPanel}>
                    {isDark && (
                        <LinearGradient
                            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.02)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={[StyleSheet.absoluteFillObject, { opacity: 0.6 }]}
                        />
                    )}
                    <View style={[styles.infoPanelContent, isExpanded && styles.infoPanelContentExpanded]}>
                        {/* Left Side: Info */}
                        <Pressable
                            style={[styles.infoSection, isExpanded && styles.infoSectionExpanded]}
                            onPress={() => setIsExpanded(!isExpanded)}
                        >
                            {/* Title & Tags */}
                            <Text
                                style={[styles.title, { color: theme.colors.text.secondary }]}
                                numberOfLines={isExpanded ? undefined : 2}
                            >
                                {item.title}
                            </Text>
                            {item.hashtag && (
                                <Text style={[styles.hashtag, { color: theme.colors.primary.DEFAULT }]}>#{item.hashtag}</Text>
                            )}
                            {!isExpanded && item.title && item.title.length > 50 && (
                                <Text style={styles.readMoreText}>more</Text>
                            )}

                            {/* Logic Balance Bar (Who's Winning) */}
                            {item.logicStats && (
                                <View style={styles.logicBalanceWrapper}>
                                    <View style={styles.logicBalanceTrack}>
                                        <View
                                            style={[
                                                styles.logicBalanceFill,
                                                { width: `${item.logicStats.forPercentage}%`, backgroundColor: '#00C853' }
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.logicBalanceFill,
                                                { width: `${100 - item.logicStats.forPercentage}%`, backgroundColor: '#D50000' }
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.logicScoreRow}>
                                        <Text style={styles.logicScoreText}>{item.logicStats.forScore} FOR</Text>
                                        <Text style={styles.logicScoreText}>{item.logicStats.againstScore} AGAINST</Text>
                                    </View>
                                </View>
                            )}
                        </Pressable>

                        {/* Right Side: Action Row */}
                        <View style={styles.actionRow}>
                            {/* Like */}
                            <Pressable style={styles.actionIconBtn} onPress={handleLike}>
                                <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                                    <Text style={[styles.customIcon, { color: item.isLiked ? '#D9E4FF' : theme.colors.text.primary }]}>✦</Text>
                                </Animated.View>
                                <Text style={[styles.actionIconText, { color: theme.colors.text.secondary }]}>{formatNumber(item.likes)}</Text>
                            </Pressable>


                            {/* Comment */}
                            <Pressable style={styles.actionIconBtn} onPress={onComment}>
                                <Ionicons name="chatbubble" size={24} color={theme.colors.text.primary} style={styles.plainIcon} />
                                <Text style={[styles.actionIconText, { color: theme.colors.text.secondary }]}>{formatNumber(item.comments)}</Text>
                            </Pressable>

                            {/* Recoub / Share */}
                            <Pressable style={styles.actionIconBtn} onPress={onSave}>
                                <Ionicons
                                    name="bookmark"
                                    size={24}
                                    color={item.isSaved ? '#D9E4FF' : theme.colors.text.primary}
                                    style={styles.plainIcon}
                                />
                                <Text style={[styles.actionIconText, { color: theme.colors.text.secondary }]}>{formatNumber(item.shares)}</Text>
                            </Pressable>



                            {/* More */}
                            <Pressable style={styles.actionIconBtn} onPress={onMore}>
                                <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text.primary} style={styles.plainIcon} />
                            </Pressable>
                        </View>
                    </View>
                </BlurView>
            </View>

        </View>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.isActive === nextProps.isActive &&
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.likes === nextProps.item.likes &&
        prevProps.item.isLiked === nextProps.item.isLiked &&
        prevProps.item.saved === nextProps.item.saved &&
        prevProps.item.isSaved === nextProps.item.isSaved
    );
});

CoubClassicItem.displayName = 'CoubClassicItem';

const styles = StyleSheet.create({
    card: {
        marginBottom: isWeb ? 24 : 32,
        alignItems: 'center',
    },
    videoContainer: {
        backgroundColor: '#020408',
        borderRadius: 32,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },

    overlayGradient: {
        ...StyleSheet.absoluteFillObject,
        // Removed heavy dark gradient overlay since text is no longer on the video
    },

    infoPanelWrapper: {
        marginTop: -12, // Overlap just a little bit
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 10,
    },
    infoPanel: {
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    infoPanelContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoPanelContentExpanded: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    infoSection: {
        flex: 1,
        marginRight: 16,
        justifyContent: 'center',
    },
    infoSectionExpanded: {
        marginRight: 0,
        marginBottom: 16,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 22, // Tightly packed icons
    },
    floatingAuthorBadge: {
        position: 'absolute',
        top: 12, // Floating slightly inside the top-left of the video
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20,20,20,0.6)',
        overflow: 'hidden',
        paddingRight: 10,
        paddingLeft: 4,
        paddingVertical: 4,
        borderRadius: 20,
        zIndex: 20, // Ensure it sits above the video
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 6,
    },
    authorNameBadge: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFF',
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        marginBottom: 4,
    },
    hashtag: {
        fontSize: 13,
        fontWeight: '600',
    },
    readMoreText: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    actionIconBtn: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    customIcon: {
        fontSize: 26,
        lineHeight: 28,
        textAlign: 'center',
    },
    plainIcon: {
        marginBottom: 2, // Tiny adjustment to align with the text star
    },
    actionIconText: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
    mutedOverlay: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pauseOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },

    progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    progressBarFill: {
        height: '100%',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
    },
    // Logic Balance Styles for Feed
    logicBalanceWrapper: {
        marginTop: 10,
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    logicBalanceTrack: {
        height: 4,
        borderRadius: 2,
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    logicBalanceFill: {
        height: '100%',
    },
    logicScoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    logicScoreText: {
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.5,
    },
});
