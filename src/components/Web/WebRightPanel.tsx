import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme as baseTheme } from '../../design-system/theme';
import { useTheme } from '../Theme/ThemeProvider';

export const WebRightPanel = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface.light, borderColor: theme.colors.surface.border }]}>
                <Feather name="search" size={18} color={theme.colors.primary.DEFAULT} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.text.primary }]}
                    placeholder="Search creators..."
                    placeholderTextColor={theme.colors.text.muted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
            </View>

            {/* Hot Collections */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: theme.typography.fontFamilies.bold }]}>Trending Now</Text>
                    <Pressable onPress={() => router.push('/discover')}>
                        <Text style={[styles.seeAll, { color: theme.colors.primary.DEFAULT }]}>See All</Text>
                    </Pressable>
                </View>


                <View style={styles.collectionsList}>
                    <CollectionItem
                        theme={theme}
                        iconName="music"
                        title="Music of the Week"
                        views="2.3M views"
                        colors={[theme.colors.primary.DEFAULT, theme.colors.primary.light]}
                        shadowColor={theme.colors.primary.glow}
                    />
                    <CollectionItem
                        theme={theme}
                        iconName="smile"
                        title="Best Memes"
                        views="1.8M views"
                        colors={[theme.colors.primary.DEFAULT, theme.colors.primary.light]}
                        shadowColor={theme.colors.primary.glow}
                    />
                    <CollectionItem
                        theme={theme}
                        iconName="zap"
                        title="Aesthetic"
                        views="945K views"
                        colors={[theme.colors.primary.DEFAULT, theme.colors.primary.light]}
                        shadowColor={theme.colors.primary.glow}
                    />
                </View>

            </View>

            {/* Weekly Challenge */}
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitleWithoutAction, { color: theme.colors.text.primary, fontFamily: theme.typography.fontFamilies.bold }]}>Challenge</Text>
                <View style={[styles.challengeWrapper, { borderColor: theme.colors.surface.border }]}>
                    <LinearGradient
                        colors={[theme.colors.primary.DEFAULT, theme.colors.primary.light]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.challengeCard}
                    >
                        <View style={styles.challengeContent}>
                            <View style={styles.topBadge}>
                                <Text style={styles.topBadgeText}>WEEKLY</Text>
                            </View>

                            <View style={styles.iconRow}>
                                <View style={styles.challengeIconWrap}>
                                    <View style={styles.challengeCircle} />
                                </View>
                                <View>
                                    <Text style={[styles.challengeTitle, { fontFamily: theme.typography.fontFamilies.bold }]}>Slow Motion</Text>
                                    <Text style={styles.challengeSub}>1.2K joined</Text>
                                </View>
                            </View>


                            <Text style={styles.challengeDesc}>Create a slow-motion video and get featured on the main page!</Text>

                            <Pressable
                                style={({ pressed, hovered }: any) => [
                                    styles.challengeBtn,
                                    (pressed || hovered) && styles.challengeBtnHovered
                                ]}
                            >
                                <Text style={[styles.challengeBtnText, { color: theme.colors.primary.DEFAULT }]}>Join Challenge</Text>
                            </Pressable>
                        </View>
                    </LinearGradient>
                </View>
            </View>


            {/* Footer Links */}
            <View style={[styles.footer, { borderTopColor: theme.colors.surface.border }]}>
                <View style={styles.footerRow}>
                    <Text style={[styles.footerLink, { color: theme.colors.text.secondary }]}>About</Text>
                    <Text style={[styles.footerLink, { color: theme.colors.text.secondary }]}>Help</Text>
                    <Text style={[styles.footerLink, { color: theme.colors.text.secondary }]}>Press</Text>
                    <Text style={[styles.footerLink, { color: theme.colors.text.secondary }]}>API</Text>
                </View>
                <View style={styles.footerRow}>
                    <Text style={[styles.footerLink, { color: theme.colors.text.secondary }]}>Privacy</Text>
                    <Text style={[styles.footerLink, { color: theme.colors.text.secondary }]}>Terms</Text>
                    <Text style={[styles.footerLink, { color: theme.colors.text.secondary }]}>Locations</Text>
                </View>
                <Text style={[styles.copyright, { color: theme.colors.text.muted }]}>© 2026 Datariot</Text>
            </View>
        </View>
    );
};

const CollectionItem = ({ iconName, title, views, colors, shadowColor, theme }: { iconName: string, title: string, views: string, colors: string[], shadowColor: string, theme: any }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Pressable
            style={[
                styles.collectionItem,
                { backgroundColor: theme.colors.surface.light },
                isHovered && { backgroundColor: theme.colors.surface.borderHover }
            ]}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
        >
            <LinearGradient
                colors={colors as any}
                style={[styles.collectionIcon, { shadowColor: shadowColor as any }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Feather name={iconName as any} size={18} color="white" />
            </LinearGradient>

            <View style={styles.collectionInfo}>
                <Text style={[styles.collectionTitle, { color: theme.colors.text.primary, fontFamily: theme.typography.fontFamilies.bold }]}>{title}</Text>
                <Text style={[styles.collectionViews, { color: theme.colors.text.muted }]}>{views}</Text>
            </View>
            <View style={[styles.arrowContainer, isHovered && styles.arrowContainerHovered]}>
                <Feather name="chevron-right" size={14} color={theme.colors.text.muted} />
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
        paddingTop: 32,
        paddingRight: 32,
        paddingBottom: 32,
        paddingLeft: 12,
        // @ts-ignore
        maxHeight: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    // Modern Search Bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 40,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        fontWeight: '500',
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
        fontSize: 14,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    sectionTitleWithoutAction: {
        fontSize: 14,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    seeAll: {
        fontSize: 12,
        fontWeight: '700',
    },


    collectionsList: {
        gap: 12,
    },

    // Collection Items
    collectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    collectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    collectionInfo: {
        flex: 1,
    },
    collectionTitle: {
        fontSize: 14,
        marginBottom: 2,
    },
    collectionViews: {
        fontSize: 11,
        fontWeight: '500',
    },
    arrowContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
    },
    arrowContainerHovered: {
        opacity: 1,
    },

    // Challenge Card
    challengeWrapper: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    challengeCard: {
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    challengeContent: {
        position: 'relative',
        zIndex: 1,
    },
    topBadge: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 16,
    },
    topBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    challengeIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    challengeCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    challengeTitle: {
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    challengeSub: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },

    challengeDesc: {
        fontSize: 13,
        lineHeight: 20,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 20,
    },
    challengeBtn: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    challengeBtnHovered: {
        transform: [{ scale: 1.02 }],
        shadowOpacity: 0.4,
    },
    challengeBtnText: {
        fontWeight: '800',
        fontSize: 13,
        letterSpacing: 0.5,
    },

    // Footer
    footer: {
        marginTop: 'auto',
        opacity: 0.7,
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

