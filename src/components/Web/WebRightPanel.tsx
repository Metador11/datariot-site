import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme as baseTheme } from '../../design-system/theme';
import { useTheme } from '../Theme/ThemeProvider';

export const WebRightPanel = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
            {/* Premium Search Bar with glow on focus */}
            <View style={[
                styles.searchContainer,
                {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isSearchFocused
                        ? (isDark ? 'rgba(217, 228, 255, 0.25)' : 'rgba(107, 127, 204, 0.35)')
                        : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'),
                },
                isSearchFocused && {
                    shadowColor: isDark ? '#D9E4FF' : '#6B7FCC',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.12 : 0.06,
                    shadowRadius: 16,
                },
            ]}>
                <Feather 
                    name="search" 
                    size={15} 
                    color={isSearchFocused ? theme.colors.primary.DEFAULT : theme.colors.text.muted} 
                    style={styles.searchIcon} 
                />
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.text.primary, fontFamily: theme.typography.fontFamilies.regular }]}
                    placeholder="Search Arena..."
                    placeholderTextColor={theme.colors.text.muted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    returnKeyType="search"
                />
            </View>

            {/* Trending Now */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                        [ TRENDING.NOW ]
                    </Text>
                    <Pressable onPress={() => router.push('/discover')} style={styles.seeAllWrapper}>
                        <Text style={[styles.seeAll, { color: theme.colors.primary.DEFAULT, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                            [ SEE.ALL ]
                        </Text>
                        <Feather name="arrow-up-right" size={12} color={theme.colors.primary.DEFAULT} />
                    </Pressable>
                </View>

                <View style={styles.collectionsList}>
                    <CollectionItem
                        index={1}
                        theme={theme}
                        isDark={isDark}
                        iconName="music"
                        title="Music of the Week"
                        views="2.3M views"
                    />
                    <CollectionItem
                        index={2}
                        theme={theme}
                        isDark={isDark}
                        iconName="smile"
                        title="Best Memes"
                        views="1.8M views"
                    />
                    <CollectionItem
                        index={3}
                        theme={theme}
                        isDark={isDark}
                        iconName="zap"
                        title="Aesthetic Design"
                        views="945K views"
                    />
                </View>
            </View>

            {/* Debate of the Week — Premium Card */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                        [ DEBATE.ARENA ]
                    </Text>
                    <View style={styles.liveIndicatorContainer}>
                        <View style={styles.liveDotWrapper}>
                            <View style={styles.liveDot} />
                            {Platform.OS === 'web' ? (
                                // @ts-ignore
                                <div className="status-pulse-anim" style={{
                                    position: 'absolute',
                                    width: 12,
                                    height: 12,
                                    borderRadius: 6,
                                    backgroundColor: 'rgba(239, 68, 68, 0.45)',
                                    zIndex: 1,
                                }} />
                            ) : null}
                        </View>
                        <Text style={[styles.liveText, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>LIVE</Text>
                    </View>
                </View>
                
                <View style={styles.challengeWrapper}>
                    <LinearGradient
                        colors={['#0F111A', '#07080C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.challengeCard, { borderColor: isDark ? 'rgba(217, 228, 255, 0.12)' : 'rgba(107, 127, 204, 0.18)' }]}
                    >
                        {/* Mesh gradient light flares for deep glossy texture */}
                        <View style={styles.challengeGlow1} />
                        <View style={styles.challengeGlow2} />

                        <View style={styles.challengeContent}>
                            <View style={styles.challengeHeaderRow}>
                                <View style={styles.topBadge}>
                                    <Text style={[styles.topBadgeText, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>[ DEBATE.OF.THE.WEEK ]</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <MaterialCommunityIcons name="account-voice" size={13} color="#D9E4FF" />
                                    <Text style={[styles.prizePool, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>2,481 VOICES</Text>
                                </View>
                            </View>

                            <View style={styles.iconRow}>
                                <View style={styles.challengeIconWrap}>
                                    <LinearGradient
                                        colors={['rgba(217, 228, 255, 0.15)', 'rgba(217, 228, 255, 0.01)']}
                                        style={StyleSheet.absoluteFillObject}
                                    />
                                    <MaterialCommunityIcons name="sword-cross" size={18} color="#D9E4FF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.challengeTitle, { fontFamily: theme.typography.fontFamilies.bold, textTransform: 'uppercase' }]} numberOfLines={2}>
                                        SOCIAL MEDIA KILLED CRITICAL THINKING
                                    </Text>
                                    <Text style={[styles.challengeSub, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]} numberOfLines={1}>
                                        ENDS IN 3 DAYS
                                    </Text>
                                </View>
                            </View>

                            {/* Live FOR / AGAINST split */}
                            <View style={styles.debateSplitLabels}>
                                <Text style={[styles.debateSplitLabelFor, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>FOR · 64%</Text>
                                <Text style={[styles.debateSplitLabelAgainst, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>36% · AGAINST</Text>
                            </View>
                            <View style={styles.debateSplitBar}>
                                <View style={[styles.debateSplitFill, { width: '64%' }]} />
                            </View>

                            <Text style={[styles.challengeDesc, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                                Pick a side and drop your strongest argument. The sharpest take gets featured on the main feed.
                            </Text>

                            <Pressable
                                onPress={() => router.push('/ai')}
                                style={({ pressed, hovered }: any) => [
                                    styles.challengeBtn,
                                    (pressed || hovered) && styles.challengeBtnHovered
                                ]}
                            >
                                <LinearGradient
                                    colors={['#D9E4FF', '#A5C6FF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={StyleSheet.absoluteFillObject}
                                />
                                <Text style={[styles.challengeBtnText, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '800' }]}>
                                    [ TAKE.A.SIDE ]
                                </Text>
                            </Pressable>
                        </View>
                    </LinearGradient>
                </View>
            </View>

            {/* Footer Links */}
            <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={styles.footerRow}>
                    <Text style={[styles.footerLink, { color: theme.colors.text.muted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>ABOUT</Text>
                    <Text style={[styles.footerLink, { color: theme.colors.text.muted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>HELP</Text>
                    <Text style={[styles.footerLink, { color: theme.colors.text.muted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>PRESS</Text>
                    <Text style={[styles.footerLink, { color: theme.colors.text.muted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>API</Text>
                </View>
                <View style={styles.footerRow}>
                    <Text style={[styles.footerLink, { color: theme.colors.text.muted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>PRIVACY</Text>
                    <Text style={[styles.footerLink, { color: theme.colors.text.muted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>TERMS</Text>
                    <Text style={[styles.footerLink, { color: theme.colors.text.muted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>LOCATIONS</Text>
                </View>
                <Text style={[styles.copyright, { color: theme.colors.text.muted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>© 2026 DATARIOT</Text>
            </View>
        </View>
    );
};

const CollectionItem = ({ index, title, views, iconName, theme, isDark }: { index: number, title: string, views: string, iconName: string, theme: any, isDark: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Pressable
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            style={[
                styles.collectionItem,
                {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.65)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)',
                },
                isHovered && {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
                    borderColor: isDark ? 'rgba(217, 228, 255, 0.25)' : 'rgba(107, 127, 204, 0.3)',
                    transform: [{ translateX: 4 }],
                    shadowColor: isDark ? '#D9E4FF' : '#6B7FCC',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.08 : 0.05,
                    shadowRadius: 12,
                },
            ]}
        >
            <View style={styles.collectionRankContainer}>
                <Text style={[styles.collectionRank, { color: isDark ? 'rgba(217, 228, 255, 0.25)' : 'rgba(107, 127, 204, 0.35)', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                    {`0${index}`}
                </Text>
            </View>

            <View style={[
                styles.collectionIcon,
                {
                    backgroundColor: isDark ? 'rgba(217, 228, 255, 0.05)' : 'rgba(107, 127, 204, 0.05)',
                    borderColor: isDark ? 'rgba(217, 228, 255, 0.08)' : 'rgba(107, 127, 204, 0.08)',
                },
                isHovered && {
                    borderColor: isDark ? 'rgba(217, 228, 255, 0.25)' : 'rgba(107, 127, 204, 0.3)',
                }
            ]}>
                <Feather 
                    name={iconName as any} 
                    size={14} 
                    color={isDark ? theme.colors.primary.DEFAULT : '#52526A'} 
                />
            </View>

            <View style={styles.collectionInfo}>
                <Text style={[styles.collectionTitle, { color: theme.colors.text.primary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '800' }]} numberOfLines={1}>
                    {title.toUpperCase()}
                </Text>
                <Text style={[styles.collectionViews, { color: theme.colors.text.muted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                    {views.toUpperCase()}
                </Text>
            </View>
            
            <View style={[styles.arrowContainer, isHovered && styles.arrowContainerHovered, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                <Feather name="chevron-right" size={13} color={isDark ? theme.colors.primary.DEFAULT : '#52526A'} />
            </View>
        </Pressable>
    );
};

const styles: any = StyleSheet.create({
    container: {
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: 360,
        paddingTop: 36,
        paddingRight: 32,
        paddingBottom: 32,
        paddingLeft: 12,
        // @ts-ignore
        maxHeight: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    // Premium Search Bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 46,
        marginBottom: 36,
        borderWidth: 1,
        // @ts-ignore
        transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.2,
        // @ts-ignore
        outlineStyle: 'none',
    },

    // Sections
    sectionContainer: {
        marginBottom: 36,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    seeAllWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        // @ts-ignore
        cursor: 'pointer',
    },
    seeAll: {
        fontSize: 11,
        letterSpacing: 0.5,
    },

    collectionsList: {
        gap: 10,
    },

    // Collection Items
    collectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        // @ts-ignore
        transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
    },
    collectionRankContainer: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    collectionRank: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    collectionIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        // @ts-ignore
        transition: 'all 0.2s ease',
    },
    collectionInfo: {
        flex: 1,
        marginRight: 8,
    },
    collectionTitle: {
        fontSize: 13,
        marginBottom: 2,
    },
    collectionViews: {
        fontSize: 11,
        fontWeight: '500',
    },
    arrowContainer: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        // @ts-ignore
        transition: 'all 0.2s ease',
    },
    arrowContainerHovered: {
        opacity: 1,
    },

    // Live Indicator
    liveIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.18)',
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
        backgroundColor: '#EF4444',
        zIndex: 2,
    },
    liveText: {
        fontSize: 10,
        color: '#EF4444',
        fontWeight: '800',
        letterSpacing: 1,
    },

    // Challenge Card — Premium Glassmorphic Billboard
    challengeWrapper: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    challengeCard: {
        padding: 22,
        borderRadius: 24,
        borderWidth: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    challengeGlow1: {
        position: 'absolute',
        top: -65,
        right: -65,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(217, 228, 255, 0.18)',
        // @ts-ignore
        filter: 'blur(28px)',
    },
    challengeGlow2: {
        position: 'absolute',
        bottom: -65,
        left: -65,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(107, 127, 204, 0.14)',
        // @ts-ignore
        filter: 'blur(28px)',
    },
    challengeContent: {
        position: 'relative',
        zIndex: 1,
    },
    challengeHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    topBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        alignSelf: 'flex-start',
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    topBadgeText: {
        color: 'rgba(217, 228, 255, 0.85)',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    prizePool: {
        color: '#D9E4FF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },
    challengeIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(217, 228, 255, 0.15)',
    },
    challengeTitle: {
        fontSize: 17,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    challengeSub: {
        fontSize: 11,
        color: 'rgba(217, 228, 255, 0.5)',
        fontWeight: '600',
    },
    challengeDesc: {
        fontSize: 13,
        lineHeight: 19,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 20,
    },
    debateSplitLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    debateSplitLabelFor: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.8,
        color: '#D9E4FF',
    },
    debateSplitLabelAgainst: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.8,
        color: 'rgba(255, 255, 255, 0.45)',
    },
    debateSplitBar: {
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        marginBottom: 16,
    },
    debateSplitFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: '#D9E4FF',
    },
    challengeBtn: {
        width: '100%',
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        // @ts-ignore
        transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
    },
    challengeBtnHovered: {
        transform: [{ scale: 1.02 }],
        shadowColor: '#D9E4FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    challengeBtnText: {
        fontWeight: '800',
        fontSize: 13,
        letterSpacing: 0.8,
        color: '#07080C',
        zIndex: 1,
    },

    // Footer
    footer: {
        marginTop: 'auto',
        opacity: 0.5,
        paddingTop: 20,
        borderTopWidth: 1,
    },
    footerRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 12,
    },
    footerLink: {
        fontSize: 11,
        fontWeight: '500',
        // @ts-ignore
        cursor: 'pointer',
    },
    copyright: {
        fontSize: 11,
        marginTop: 4,
    }
});
