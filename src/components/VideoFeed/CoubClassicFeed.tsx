import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, ViewToken, Platform, useWindowDimensions } from 'react-native';
import { TrendingGridCard } from './TrendingGridCard';
import { useTheme } from '../Theme/ThemeProvider';
import { SectionHeader } from '../Discovery/SectionHeader';
import { DiscoveryCarousel } from '../Discovery/DiscoveryCarousel';
import { FeaturedHero } from '../Discovery/FeaturedHero';
import { Video } from '../../lib/supabase/hooks/useVideos';

interface CoubClassicFeedProps {
    videos: Video[];
    onEndReached: () => void;
    onLike: (videoId: string) => void;
    onComment: (videoId: string) => void;
    onSave: (videoId: string) => void;
    onMore: (videoId: string) => void;
    onFollow: (authorId: string) => void;
    onSelect: (videoId: string) => void;
    isScreenFocused?: boolean;
    initialScrollIndex?: number;
    paddingTop?: number;
    paddingBottom?: number;
}

export function CoubClassicFeed({
    videos,
    onEndReached,
    onLike,
    onComment,
    onSave,
    onMore,
    onFollow,
    onSelect,
    isScreenFocused = true,
    initialScrollIndex = 0,
    paddingTop = 0,
    paddingBottom = 40,
}: CoubClassicFeedProps) {
    const [activeVideoIndex, setActiveVideoIndex] = useState(initialScrollIndex);
    const flatListRef = useRef<FlatList>(null);
    const { theme } = useTheme();
    const { width: winWidth } = useWindowDimensions();

    // 2-column trending grid sizing
    const GRID_MAX_WIDTH = 720;
    const GRID_PAD = 16;
    const GRID_GAP = 12;
    const gridContentWidth = Platform.OS === 'web' ? Math.min(GRID_MAX_WIDTH, winWidth) : winWidth;
    const gridCardWidth = (gridContentWidth - GRID_PAD * 2 - GRID_GAP) / 2;

    const ensureMinCount = useCallback(<T,>(list: T[], min: number): T[] => {
        if (list.length === 0) return [];
        if (list.length >= min) return list;

        const padded = [...list];
        while (padded.length < min) {
            padded.push(...list);
        }
        return padded.slice(0, min);
    }, []);

    const allSynergy = useMemo(() => videos.filter(v => v.isHighSynergy), [videos]);

    const featuredVideos = useMemo(() => {
        const base = allSynergy.slice(0, 3).map(v => ({
            id: v.id,
            title: v.title,
            author: v.author,
            avatarUrl: v.avatarUrl || 'https://picsum.photos/seed/' + v.id + '/100',
            videoUrl: v.videoUrl,
            thumbnailUrl: v.thumbnailUrl,
            views: v.views,
            likes: v.likes
        }));
        return ensureMinCount(base, 5);
    }, [allSynergy, ensureMinCount]);

    const synergyVideos = useMemo(() => {
        let base;
        // If we have few total synergy videos (e.g. 5 or less), show all of them in the carousel
        // to avoid an empty section, even if they are already featured.
        if (allSynergy.length <= 5) {
            base = allSynergy;
        } else {
            // Otherwise, show the next set for discovery
            base = allSynergy.slice(3, 11);
        }
        return ensureMinCount(base, 5);
    }, [allSynergy, ensureMinCount]);

    const scrollVideos = useMemo(() => {
        let base;
        // Define which videos go to the main vertical scroll 
        // This ensures no single video dominates all UI sections too much
        if (allSynergy.length <= 3) {
            base = videos;
        } else {
            base = videos.filter(v => !v.isHighSynergy || videos.indexOf(v) > 8);
        }
        return ensureMinCount(base, 5);
    }, [videos, allSynergy, ensureMinCount]);

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0) {
                const index = viewableItems[0].index;
                if (index !== null) {
                    setActiveVideoIndex(index);
                }
            }
        },
        []
    );

    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 60,
    }), []);

    const renderHeader = () => (
        <View style={{ marginBottom: 24, marginTop: paddingTop + 10 }}>
            {featuredVideos.length > 0 && (
                <FeaturedHero
                    featuredVideos={featuredVideos}
                    onVideoPress={onSelect}
                />
            )}

            <SectionHeader
                title="Datariot Originals"
                subtitle="Curated high-quality video content"
            />
            <DiscoveryCarousel
                videos={synergyVideos}
                onSelect={onSelect}
            />

            <SectionHeader
                title="Trending Now"
                subtitle="High engagement across the platform"
            />
        </View>
    );

    const renderItem = ({ item }: { item: Video; index: number }) => (
        <View style={{ marginBottom: GRID_GAP }}>
            <TrendingGridCard
                item={item}
                width={gridCardWidth}
                onSelect={() => onSelect(item.id)}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <FlatList
                ref={flatListRef}
                data={scrollVideos}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={2}
                columnWrapperStyle={{ gap: GRID_GAP, paddingHorizontal: GRID_PAD }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={false}
                maxToRenderPerBatch={6}
                windowSize={5}
                initialNumToRender={6}
                contentContainerStyle={{
                    paddingBottom: paddingBottom + 80,
                    alignSelf: 'center',
                    width: '100%',
                    maxWidth: 720,
                    paddingHorizontal: 0,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
