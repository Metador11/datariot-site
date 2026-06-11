import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, ViewToken } from 'react-native';
import { CoubClassicItem } from './CoubClassicItem';
import { FullScreenVideoModal } from './FullScreenVideoModal';
import { useTheme } from '../Theme/ThemeProvider';
import { SectionHeader } from '../Discovery/SectionHeader';
import { DiscoveryCarousel } from '../Discovery/DiscoveryCarousel';
import { FeaturedHero } from '../Discovery/FeaturedHero';
import { SystemTicker } from '../Discovery/SystemTicker';
import { DebateOfTheDay } from '../Discovery/DebateOfTheDay';
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
        // Define which videos go to the main vertical scroll
        // This ensures no single video dominates all UI sections too much.
        // Unlike the carousels, the main feed is NOT padded with duplicates —
        // repeated cards broke keys and showed the same video twice.
        if (allSynergy.length <= 3) {
            return videos;
        }
        return videos.filter(v => !v.isHighSynergy || videos.indexOf(v) > 8);
    }, [videos, allSynergy]);

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

    // Element (not inline function) so FlatList doesn't remount the header each render
    const listHeader = useMemo(() => (
        <View style={{ marginBottom: 24, marginTop: paddingTop + 10 }}>
            <SystemTicker />
            <DebateOfTheDay />

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
    ), [featuredVideos, synergyVideos, onSelect, paddingTop]);

    const renderItem = useCallback(({ item, index }: { item: Video; index: number }) => (
        <CoubClassicItem
            item={item}
            isActive={index === activeVideoIndex && isScreenFocused}
            onLike={() => onLike(item.id)}
            onComment={() => onComment(item.id)}
            onSave={() => onSave(item.id)}
            onMore={() => onMore(item.id)}
            onSelect={() => onSelect(item.id)}
        />
    ), [activeVideoIndex, isScreenFocused, onLike, onComment, onSave, onMore, onSelect]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <FlatList
                ref={flatListRef}
                data={scrollVideos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={listHeader}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={false}
                maxToRenderPerBatch={3}
                windowSize={5}
                initialNumToRender={2}
                initialScrollIndex={initialScrollIndex}
                onScrollToIndexFailed={(info) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                }}
                contentContainerStyle={{
                    paddingBottom: paddingBottom + 80,
                    alignSelf: 'center',
                    width: '100%',
                    maxWidth: 960,
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
