import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export const WebRightPanel = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Feather name="search" size={18} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Orvelis..."
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
            </View>

            {/* Hot Collections */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Trending Now</Text>
                    <Pressable onPress={() => router.push('/discover')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </Pressable>
                </View>


                <View style={styles.collectionsList}>
                    <CollectionItem
                        iconName="music"
                        title="Music of the Week"
                        views="2.3M views"
                        colors={['#0EA5E9', '#0369A1']}
                        shadowColor="rgba(14, 165, 233, 0.4)"
                    />
                    <CollectionItem
                        iconName="smile"
                        title="Best Memes"
                        views="1.8M views"
                        colors={['#0EA5E9', '#0284C7']}
                        shadowColor="rgba(14, 165, 233, 0.4)"
                    />
                    <CollectionItem
                        iconName="zap"
                        title="Aesthetic"
                        views="945K views"
                        colors={['#38BDF8', '#0EA5E9']}
                        shadowColor="rgba(56, 189, 248, 0.4)"
                    />
                </View>

            </View>

            {/* Weekly Challenge */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitleWithoutAction}>Challenge</Text>
                <View style={styles.challengeWrapper}>
                    <LinearGradient
                        colors={['#0EA5E9', '#0284C7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.challengeCard}
                    >

                        <View style={styles.challengeGlow1} />
                        <View style={styles.challengeGlow2} />

                        <View style={styles.challengeContent}>
                            <View style={styles.topBadge}>
                                <Text style={styles.topBadgeText}>WEEKLY</Text>
                            </View>

                            <View style={styles.iconRow}>
                                <View style={styles.challengeIconWrap}>
                                    <View style={styles.challengeCircle} />
                                </View>
                                <View>
                                    <Text style={styles.challengeTitle}>Slow Motion</Text>
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
                                <Text style={styles.challengeBtnText}>Join Challenge</Text>
                            </Pressable>
                        </View>
                    </LinearGradient>
                </View>
            </View>


            {/* Footer Links */}
            <View style={styles.footer}>
                <View style={styles.footerRow}>
                    <Text style={styles.footerLink}>About</Text>
                    <Text style={styles.footerLink}>Help</Text>
                    <Text style={styles.footerLink}>Press</Text>
                    <Text style={styles.footerLink}>API</Text>
                </View>
                <View style={styles.footerRow}>
                    <Text style={styles.footerLink}>Privacy</Text>
                    <Text style={styles.footerLink}>Terms</Text>
                    <Text style={styles.footerLink}>Locations</Text>
                </View>
                <Text style={styles.copyright}>© 2026 Orvelis</Text>
            </View>
        </View>
    );
};

const CollectionItem = ({ iconName, title, views, colors, shadowColor }: { iconName: string, title: string, views: string, colors: string[], shadowColor: string }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Pressable
            style={[styles.collectionItem, isHovered && styles.collectionItemHovered]}
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
                <Text style={styles.collectionTitle}>{title}</Text>
                <Text style={styles.collectionViews}>{views}</Text>
            </View>
            <View style={[styles.arrowContainer, isHovered && styles.arrowContainerHovered]}>
                <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.7)" />
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
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glass effect
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        // @ts-ignore
        transition: 'all 0.2s ease',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        color: '#FFFFFF',
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
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    sectionTitleWithoutAction: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    seeAll: {
        fontSize: 12,
        color: '#0EA5E9',
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
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderWidth: 1,
        borderColor: 'transparent',
        // @ts-ignore
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        // @ts-ignore
        cursor: 'pointer',
    },
    collectionItemHovered: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        transform: [{ translateX: 4 }],
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
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    collectionViews: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '500',
    },
    arrowContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        // @ts-ignore
        transition: 'all 0.2s',
    },
    arrowContainerHovered: {
        opacity: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    // Challenge Card
    challengeWrapper: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    challengeCard: {
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    challengeGlow1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
        filter: 'blur(40px)',
    },
    challengeGlow2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(14, 165, 233, 0.4)',
        filter: 'blur(30px)',
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
        color: 'rgba(255,255,255,0.9)',
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
        fontWeight: '800',
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
        color: 'rgba(255, 255, 255, 0.8)',
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
        // @ts-ignore
        transition: 'all 0.2s',
        // @ts-ignore
        cursor: 'pointer',
    },
    challengeBtnHovered: {
        transform: [{ scale: 1.02 }],
        shadowOpacity: 0.4,
    },
    challengeBtnText: {
        color: '#0EA5E9',
        fontWeight: '800',
        fontSize: 13,
        letterSpacing: 0.5,
    },



    // Footer
    footer: {
        marginTop: 'auto',
        opacity: 0.4,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    footerRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 12,
    },
    footerLink: {
        fontSize: 11,
        color: '#F8FAFC',
        fontWeight: '500',
        // @ts-ignore
        cursor: 'pointer',
    },
    copyright: {
        fontSize: 11,
        color: 'rgba(248, 250, 252, 0.7)',
        marginTop: 4,
    }
});

