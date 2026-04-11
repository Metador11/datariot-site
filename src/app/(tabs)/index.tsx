import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Pressable, StatusBar, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CoubClassicFeed } from '@components/VideoFeed/CoubClassicFeed';
import { useAuth } from '@lib/supabase/hooks/useAuth';
import { useVideos, FeedType } from '@lib/supabase/hooks/useVideos';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SideMenu } from '../../components/Navigation/SideMenu';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../../components/Theme/ThemeProvider';
import { CommentsModal } from '../../components/VideoFeed/CommentsModal';
import { BlurView } from 'expo-blur';
import { CategoryPills } from '../../components/Discovery/CategoryPills';
import { VIDEO_CATEGORIES } from '../../lib/constants/categories';
import { PulseFeed } from '../../components/VideoFeed/PulseFeed/PulseFeed';
import { MosaicFeed } from '../../components/VideoFeed/MosaicFeed/MosaicFeed';
import { FullScreenVideoModal } from '../../components/VideoFeed/FullScreenVideoModal';

type ViewMode = 'classic' | 'mosaic' | 'pulse';

const HomeScreen = () => {
    const { } = useAuth(); // or remove if not used at all
    const router = useRouter();
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<FeedType>('trending');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>(Platform.OS === 'web' ? 'classic' : 'mosaic');
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    const { width, height } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width > 768; // Web Desktop Mode

    // web container height handled elsewhere

    const {
        videos,
        loading,
        loadMore,
        toggleLike,
        toggleFollow
    } = useVideos({
        type: activeTab,
        category: activeCategory || undefined
    });

    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [commentsVideoId, setCommentsVideoId] = useState<string | null>(null);

    const handleSelectVideo = (videoId: string) => {
        setSelectedVideoId(videoId);
    };

    const handleComment = (videoId: string) => {
        setCommentsVideoId(videoId);
    };

    const handleSave = (videoId: string) => {
        console.log('Save:', videoId);
    };

    const handleMore = (videoId: string) => {
        console.log('More options:', videoId);
    };

    if (loading && videos.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
                <ActivityIndicator size="large" color={theme.colors.primary.DEFAULT} />
            </View>
        );
    }

    const isFeedActive = isFocused && selectedVideoId === null && commentsVideoId === null;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Top Navigation Tabs */}
            <View style={[styles.topNav, { paddingTop: isWeb ? 20 : insets.top + 10 }]} pointerEvents="box-none">
                <View style={[styles.topNavContent, isWeb && { justifyContent: 'center' }]} pointerEvents="box-none">
                    {/* Profile/Menu Button - Top Left */}
                    {!isWeb && (
                        <Pressable
                            style={[
                                styles.profileButton,
                                {
                                    backgroundColor: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                                    shadowColor: '#000',
                                    shadowOpacity: 0.1,
                                    shadowRadius: 10,
                                    elevation: 5
                                }
                            ]}
                            onPress={() => setIsMenuOpen(true)}
                        >
                            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                            <Feather name="menu" size={22} color={theme.colors.text.primary} />
                        </Pressable>
                    )}

                    <View style={styles.pillContainer}>
                        <BlurView intensity={70} tint={isDark ? 'dark' : 'light'} style={styles.pillBlur}>
                            {isDark && (
                                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
                            )}

                            <Pressable
                                onPress={() => setActiveTab('ai')}
                                style={[styles.tabButton, activeTab === 'ai' && styles.tabButtonActive]}
                            >
                                {activeTab === 'ai' && (
                                    <View style={StyleSheet.absoluteFill}>
                                        <LinearGradient
                                            colors={['#0EA5E9', '#38BDF8']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.tabIndicatorBackground}
                                        />

                                    </View>
                                )}
                                <View style={styles.tabButtonInner}>
                                    <Ionicons
                                        name="sparkles"
                                        size={14}
                                        color={activeTab === 'ai' ? '#FFF' : theme.colors.text.secondary}
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text style={[
                                        styles.tabText,
                                        { color: theme.colors.text.secondary },
                                        activeTab === 'ai' && [styles.tabTextActive, { color: '#FFF' }]
                                    ]}>
                                        AI
                                    </Text>
                                </View>
                            </Pressable>


                            <Pressable
                                onPress={() => setActiveTab('trending')}
                                style={[styles.tabButton, activeTab === 'trending' && styles.tabButtonActive]}
                            >
                                {activeTab === 'trending' && (
                                    <View style={[StyleSheet.absoluteFill, styles.tabIndicatorBackground, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)' }]} />
                                )}
                                <View style={styles.tabButtonInner}>
                                    <Ionicons
                                        name="flame"
                                        size={14}
                                        color={activeTab === 'trending' ? theme.colors.text.primary : theme.colors.text.secondary}
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text style={[
                                        styles.tabText,
                                        { color: theme.colors.text.secondary },
                                        activeTab === 'trending' && [styles.tabTextActive, { color: theme.colors.text.primary }]
                                    ]}>
                                        Trends
                                    </Text>
                                </View>
                            </Pressable>

                            <Pressable
                                onPress={() => setActiveTab('following')}
                                style={[styles.tabButton, activeTab === 'following' && styles.tabButtonActive]}
                            >
                                {activeTab === 'following' && (
                                    <View style={[StyleSheet.absoluteFill, styles.tabIndicatorBackground, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)' }]} />
                                )}
                                <View style={styles.tabButtonInner}>
                                    <Feather
                                        name="users"
                                        size={14}
                                        color={activeTab === 'following' ? theme.colors.text.primary : theme.colors.text.secondary}
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text style={[
                                        styles.tabText,
                                        { color: theme.colors.text.secondary },
                                        activeTab === 'following' && [styles.tabTextActive, { color: theme.colors.text.primary }]
                                    ]}>
                                        Follow
                                    </Text>
                                </View>
                            </Pressable>
                        </BlurView>
                    </View>

                    {/* Category Filters */}
                    {activeTab === 'trending' && (
                        <View style={[styles.categoryFiltersContainer, { width, left: -16 }]}>
                            <CategoryPills
                                categories={['All', ...VIDEO_CATEGORIES]}
                                activeCategory={activeCategory || 'All'}
                                onCategoryPress={(cat) => setActiveCategory(cat === 'All' ? null : cat)}
                            />
                        </View>
                    )}

                    {/* Profile Button - Top Right */}
                    {/* View Mode Toggle (Cycles through Mosaic and Classic) */}
                    {!isWeb && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Pressable
                                style={[
                                    styles.pulseToggle,
                                    {
                                        backgroundColor: viewMode === 'mosaic' ? theme.colors.primary.DEFAULT : (isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)'),
                                    }
                                ]}
                                onPress={() => setViewMode(viewMode === 'mosaic' ? 'classic' : 'mosaic')}
                            >
                                <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                                <Ionicons
                                    name={viewMode === 'mosaic' ? "grid" : "apps"}
                                    size={22}
                                    color={viewMode === 'mosaic' ? "#FFF" : theme.colors.text.primary}
                                />
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.profileButton,
                                    {
                                        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                                        shadowColor: '#000',
                                        shadowOpacity: 0.1,
                                        shadowRadius: 10,
                                        elevation: 5
                                    }
                                ]}
                                onPress={() => router.push('/profile')}
                            >
                                <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                                <Feather name="user" size={22} color={theme.colors.text.primary} />
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>

            {/* Video Feed */}
            {videos.length > 0 ? (
                viewMode === 'mosaic' ? (
                    <MosaicFeed
                        videos={videos}
                        isFocused={isFeedActive}
                        onEndReached={loadMore}
                        onSelect={(id) => {
                            // Find the video and open modal
                            // For now, it opens the existing FullScreenVideoModal pattern
                            // We can use a router push or a modal state
                            console.log('Selected video:', id);
                            // We need a way to open the modal from here. 
                            // CoubClassicFeed uses local state selectedVideoId.
                            // I'll add handleSelectVideo to HomeScreen.
                            handleSelectVideo(id);
                        }}
                        paddingTop={isWeb ? 130 : insets.top + 120}
                    />
                ) : viewMode === 'pulse' ? (
                    <PulseFeed
                        videos={videos}
                        isFocused={isFeedActive}
                        onLike={toggleLike}
                        onComment={handleComment}
                        onSave={handleSave}
                        onMore={handleMore}
                        onFollow={toggleFollow}
                    />
                ) : (
                    <CoubClassicFeed
                        videos={videos}
                        isScreenFocused={isFeedActive}
                        onEndReached={loadMore}
                        onLike={toggleLike}
                        onComment={handleComment}
                        onSave={handleSave}
                        onMore={handleMore}
                        onFollow={toggleFollow}
                        onSelect={handleSelectVideo}
                        paddingTop={isWeb ? 130 : insets.top + 120}
                    />
                )
            ) : !loading && (
                <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background.primary }]}>
                    <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "dark" : "light"} style={[styles.emptyCard, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        {isDark && (
                            <LinearGradient
                                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                                style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                            />
                        )}
                        <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                            <Feather name="video-off" size={36} color={isDark ? '#fff' : '#000'} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>No Videos Found</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
                            There doesn&apos;t seem to be anything here right now. Check back later or clear your filters.
                        </Text>
                        <Pressable style={[styles.retryButtonModern, { backgroundColor: theme.colors.primary.DEFAULT }]} onPress={loadMore}>
                            <Text style={styles.retryTextModern}>Refresh Feed</Text>
                        </Pressable>
                    </BlurView>
                </View>
            )
            }

            {/* Side Menu Overlay */}
            {
                !isWeb && (
                    <SideMenu
                        isOpen={isMenuOpen}
                        onClose={() => setIsMenuOpen(false)}
                    />
                )
            }

            {/* Comments Modal */}
            <CommentsModal
                visible={!!commentsVideoId}
                videoId={commentsVideoId}
                onClose={() => setCommentsVideoId(null)}
            />

            {/* Shared Full Screen Video Modal (for Mosaic/Pulse) */}
            <FullScreenVideoModal
                visible={selectedVideoId !== null}
                videos={videos}
                initialVideoId={selectedVideoId}
                onClose={() => setSelectedVideoId(null)}
                onLike={toggleLike}
                onComment={handleComment}
                onSave={handleSave}
                onMore={handleMore}
                onFollow={toggleFollow}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topNav: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    topNavContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    pulseToggle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginRight: 8,
    },
    pillContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 8, // Increased range for buttons
    },
    categoryFiltersContainer: {
        position: 'absolute',
        top: 54,
        height: 58,
    },
    pillBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderRadius: 30,
        padding: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabButton: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
    },
    tabButtonActive: {
        // Active styles handled by children
    },
    tabIndicatorBackground: {
        position: 'absolute',
        top: 2,
        bottom: 2,
        left: 2,
        right: 2,
        borderRadius: 18,
    },
    tabButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    tabTextActive: {
        fontWeight: '800',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyCard: {
        width: '100%',
        maxWidth: 340,
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        overflow: 'hidden',
    },
    emptyIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    retryButtonModern: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    retryTextModern: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeScreen;
