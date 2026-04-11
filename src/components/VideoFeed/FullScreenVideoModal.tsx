import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    FlatList,
    Dimensions,

    ViewToken,
    StatusBar,
    useWindowDimensions,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { VideoControls } from '../VideoPlayer/VideoControls';
import { CommentsModal } from './CommentsModal';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    FadeIn
} from 'react-native-reanimated';
import { useTheme } from '../Theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FullScreenVideoModalProps {
    visible: boolean;
    videos: any[];
    initialVideoId: string | null;
    onClose: () => void;
    onLike: (id: string) => void;
    onComment: (id: string) => void;
    onSave: (id: string) => void;
    onMore: (id: string) => void;
    onFollow: (id: string) => void;
}

function FullScreenVideoItem({
    item,
    isActive,
    height,
    onLike,
    onComment,
    onSave,
    onMore,
    onFollow,
}: {
    item: any;
    isActive: boolean;
    height: number;
    onLike: () => void;
    onComment: () => void;
    onSave: () => void;
    onMore: () => void;
    onFollow: () => void;
}) {
    const [isPaused, setIsPaused] = useState(false);
    const player = useVideoPlayer(item.videoUrl || item.url || '', player => {
        player.loop = true;
    });

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEventListener(player, 'timeUpdate', ({ currentTime: ct }) => {
        setCurrentTime(ct * 1000);
        setDuration((player.duration || 0) * 1000);
    });

    React.useEffect(() => {
        if (isActive && !isPaused) {
            player.play();
        } else {
            player.pause();
            if (!isActive) player.currentTime = 0;
        }
    }, [isActive, isPaused, player]);

    const togglePlayback = () => {
        setIsPaused(!isPaused);
    };


    const handleSeek = (value: number) => {
        player.currentTime = value / 1000;
    };

    // Double tap to like gesture
    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onEnd(() => { onLike(); });

    return (
        <GestureDetector gesture={doubleTap}>
            <View style={{ width: SCREEN_WIDTH, height, backgroundColor: '#000' }}>
                <Pressable style={StyleSheet.absoluteFill} onPress={togglePlayback}>
                    <VideoView
                        player={player}
                        style={StyleSheet.absoluteFill}
                        contentFit="contain"
                        nativeControls={false}
                        pointerEvents="none"
                    />

                    {isPaused && (
                        <View style={styles.pauseOverlay}>
                            <Ionicons name="pause" size={64} color="white" />
                        </View>
                    )}
                </Pressable>

                <VideoControls
                    isPlaying={isActive && !isPaused}

                    title={item.title || ''}
                    author={item.author || item.authorName || ''}
                    authorId={item.authorId || ''}
                    avatarUrl={item.avatarUrl}
                    hashtag={item.hashtag}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                    likes={item.likes || 0}
                    comments={item.comments || 0}
                    saved={item.saved || 0}
                    isLiked={item.isLiked || false}
                    isSaved={item.isSaved || false}
                    isFollowing={item.isFollowing || false}
                    isLive={item.isLive}
                    onLike={onLike}
                    onComment={onComment}
                    onSave={onSave}
                    onMore={onMore}
                    onFollow={onFollow}
                />
            </View>
        </GestureDetector>
    );
}

export function FullScreenVideoModal({
    visible,
    videos,
    initialVideoId,
    onClose,
    onLike,
    onComment,
    onSave,
    onMore,
    onFollow,
}: FullScreenVideoModalProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const router = useRouter();
    const { height: screenHeight } = useWindowDimensions();
    const [activeIndex, setActiveIndex] = useState(0);

    // AI Pulsing Animation
    const pulseAnim = useSharedValue(1);
    React.useEffect(() => {
        pulseAnim.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedPulseStyle = useAnimatedStyle(() => ({
        opacity: pulseAnim.value,
    }));
    const flatListRef = useRef<FlatList>(null);
    const [commentsVideoId, setCommentsVideoId] = useState<string | null>(null);

    const handleOpenComments = useCallback((id: string) => {
        setCommentsVideoId(id);
        onComment(id);
    }, [onComment]);

    const handleCloseComments = useCallback(() => {
        setCommentsVideoId(null);
    }, []);

    // Jump to correct video when opened
    React.useEffect(() => {
        if (visible && initialVideoId) {
            const index = videos.findIndex(v => v.id === initialVideoId);
            if (index !== -1) {
                setActiveIndex(index);
                // Scroll after render
                requestAnimationFrame(() => {
                    flatListRef.current?.scrollToIndex({ index, animated: false });
                });
            }
        }
    }, [visible, initialVideoId, videos]);

    const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 60 }), []);

    const isFocused = useIsFocused();

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setActiveIndex(viewableItems[0].index!);
        }
    }, []);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <View style={styles.container}>
                {/* Dark shadow for status bar visibility */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                    style={[styles.statusShadow, { height: insets.top + 30 }]}
                    pointerEvents="none"
                />
                {/* Header Elements */}
                <View style={[styles.headerWrapper, { top: Math.max(insets.top, 20) }]}>
                    {/* Close Button kept on left */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={28} color="#FFF" />
                    </TouchableOpacity>

                    {/* Right Side Logo - Small & Static */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            onClose();
                            router.push('/ai');
                        }}
                        style={styles.aiLogoContainer}
                    >
                        <View style={styles.aiLogoWrapper}>
                            <Image
                                source={require('../../../assets/logo.jpg')}
                                style={styles.aiLogo}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={videos}
                    keyExtractor={item => item.id}
                    pagingEnabled
                    showsVerticalScrollIndicator={false}
                    getItemLayout={(_, index) => ({
                        length: screenHeight,
                        offset: screenHeight * index,
                        index,
                    })}
                    viewabilityConfig={viewabilityConfig}
                    onViewableItemsChanged={onViewableItemsChanged}
                    renderItem={({ item, index }) => (
                        <FullScreenVideoItem
                            item={item}
                            isActive={index === activeIndex && isFocused}
                            height={screenHeight}
                            onLike={() => onLike(item.id)}
                            onComment={() => handleOpenComments(item.id)}
                            onSave={() => onSave(item.id)}
                            onMore={() => onMore(item.id)}
                            onFollow={() => onFollow(item.authorId)}
                        />
                    )}
                />
            </View>
            <CommentsModal
                visible={!!commentsVideoId}
                videoId={commentsVideoId}
                onClose={handleCloseComments}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 200,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    closeButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    brandingText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 4,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        textShadowColor: 'rgba(0, 140, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    brandingLine: {
        width: 20,
        height: 2,
        backgroundColor: '#0EA5E9',
        marginTop: 2,
        borderRadius: 1,
    },
    pauseOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },

    aiLogoContainer: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiLogoWrapper: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiLogo: {
        width: 32,
        height: 32,
    },
    rightPlaceholder: {
        width: 36,
    },
    statusShadow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 160,
    },
});
