import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image as RNImage } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../lib/supabase/hooks/useAuth';
import { supabase } from '../../lib/supabase/client';
import { LinearGradient } from 'expo-linear-gradient';

const MenuItem = ({ icon, label, isActive, onPress, isSpecial = false }: { icon: React.ReactNode, label: string, isActive: boolean, onPress?: () => void, isSpecial?: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Pressable
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            style={[
                styles.menuItem,
                isActive && styles.menuItemActive,
                isHovered && styles.menuItemHovered,
                isSpecial && styles.specialItem,
                isSpecial && isHovered && styles.specialItemHovered
            ]}
            onPress={onPress}
        >
            <View style={[
                styles.iconContainer,
                isHovered && styles.iconHovered,
                isActive && styles.iconActive,
                isSpecial && styles.iconSpecial
            ]}>
                {icon}
            </View>
            <Text style={[
                styles.label,
                isActive && styles.labelActive,
                isHovered && styles.labelHovered,
                isSpecial && styles.labelSpecial
            ]}>
                {label}
            </Text>
            {isActive && !isSpecial && <View style={styles.activeIndicator} />}
        </Pressable>
    );
};

export const WebSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [likedVideos, setLikedVideos] = useState<any[]>([]);

    const handleSignOut = async () => {
        await signOut();
        router.replace('/auth/login');
    };

    const fetchLikedVideos = useCallback(async () => {
        if (!user) return;
        try {
            const { data: likes, error } = await supabase
                .from('likes')
                .select(`
                    video_id,
                    videos (
                        id,
                        title,
                        user_id,
                        s3_url,
                        url
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(4);

            if (error) throw error;

            const videos = (likes || []).map((item: any) => ({
                id: item.videos?.id,
                title: item.videos?.title || 'Untitled',
                url: item.videos?.url || item.videos?.s3_url,
            })).filter((v: { id: string }) => v.id);

            setLikedVideos(videos);

        } catch (err) {
            console.error('Error fetching liked videos for menu:', err);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchLikedVideos();
        }
    }, [user, fetchLikedVideos]);

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/' || pathname === '/index';
        return pathname.startsWith(path);
    };

    return (
        <View style={styles.container}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RNImage
                        source={require('../../../assets/logo.jpg')}
                        style={{ width: 28, height: 28, marginRight: 10, borderRadius: 14 }}
                    />
                    <Text style={styles.logo}>Orvelis</Text>
                </View>
            </View>

            <View style={styles.menuList}>
                <MenuItem
                    icon={<Feather name="trending-up" size={20} color={isActive('/') ? '#0EA5E9' : 'rgba(255, 255, 255, 0.45)'} />}
                    label="Trending"
                    isActive={isActive('/')}
                    onPress={() => router.push('/')}
                />
                <MenuItem
                    icon={<Ionicons name="compass-outline" size={22} color={isActive('/discover') ? '#0EA5E9' : 'rgba(255, 255, 255, 0.45)'} />}
                    label="Discover"
                    isActive={isActive('/discover')}
                    onPress={() => router.push('/discover')}
                />
                <MenuItem
                    icon={<Feather name="heart" size={20} color={isActive('/favorites') ? '#0EA5E9' : 'rgba(255, 255, 255, 0.45)'} />}
                    label="Favorites"
                    isActive={isActive('/favorites')}
                    onPress={() => router.push('/favorites' as any)}
                />
                <MenuItem
                    icon={<Feather name="thumbs-up" size={20} color={isActive('/liked') ? '#0EA5E9' : 'rgba(255, 255, 255, 0.45)'} />}
                    label="Liked"
                    isActive={isActive('/liked')}
                    onPress={() => router.push('/liked' as any)}
                />
                <MenuItem
                    icon={<Feather name="settings" size={20} color={isActive('/settings') ? '#0EA5E9' : 'rgba(255, 255, 255, 0.45)'} />}
                    label="Settings"
                    isActive={isActive('/settings')}
                    onPress={() => router.push('/settings')}
                />



                <View style={styles.spacer} />

                <MenuItem
                    icon={<MaterialCommunityIcons name="robot-excited" size={22} color="#fff" />}
                    label="Orvelis AI"
                    isActive={isActive('/ai')}
                    onPress={() => router.push('/ai')}
                    isSpecial={true}
                />
            </View>

            {/* Liked Videos Section */}
            {likedVideos.length > 0 && (
                <View style={styles.mediaSection}>
                    <Text style={styles.sectionLabel}>RECENTLY LIKED</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaScroll}>
                        {likedVideos.map((video, idx) => (
                            <Pressable key={video.id} style={styles.mediaCard} onPress={() => router.push({ pathname: '/video-player', params: { type: 'video', initialVideoId: video.id } })}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']}
                                    style={styles.mediaGradient}
                                >
                                    <View style={styles.mediaIconPlaceholder}>
                                        <Feather name="play" size={12} color="white" />
                                    </View>
                                    <Text numberOfLines={1} style={styles.mediaTitle}>{video.title}</Text>
                                </LinearGradient>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* User Profile Section at Bottom */}
            <View style={styles.footer}>
                <View style={styles.socialRow}>
                    <Pressable onPress={() => window.open('https://twitter.com/orvelis', '_blank')} style={styles.socialIcon}>
                        <FontAwesome5 name="twitter" size={18} color="rgba(255,255,255,0.4)" />
                    </Pressable>
                    <Pressable onPress={() => window.open('https://discord.gg/orvelis', '_blank')} style={styles.socialIcon}>
                        <FontAwesome5 name="discord" size={18} color="rgba(255,255,255,0.4)" />
                    </Pressable>
                    <Pressable onPress={() => window.open('https://instagram.com/orvelis', '_blank')} style={styles.socialIcon}>
                        <FontAwesome5 name="instagram" size={18} color="rgba(255,255,255,0.4)" />
                    </Pressable>
                </View>

                {user ? (
                    <View>
                        <Pressable style={styles.profileCard} onPress={() => router.push('/profile')}>
                            <LinearGradient
                                colors={['#0EA5E9', '#38BDF8']}
                                style={styles.avatarContainer}
                            >
                                <Text style={styles.avatarText}>{user.email?.[0].toUpperCase()}</Text>
                            </LinearGradient>

                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName} numberOfLines={1}>
                                    {user.user_metadata?.username || 'User'}
                                </Text>
                                <Text style={styles.profileHandle} numberOfLines={1}>
                                    @{user.user_metadata?.username || 'user'}
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="rgba(255, 255, 255, 0.3)" />
                        </Pressable>
                        <Pressable onPress={handleSignOut} style={styles.signOutBtn}>
                            <Text style={styles.signOutText}>Log Out Account</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        style={styles.loginButton}
                        onPress={() => router.push('/auth/login')}
                    >
                        <LinearGradient
                            colors={['#0EA5E9', '#0284C7']}
                            style={StyleSheet.absoluteFill}
                        />

                        <Text style={styles.loginText}>Sign In</Text>
                    </Pressable>
                )}

            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'fixed', // Fixed in web view
        top: 0,
        left: 0,
        bottom: 0,
        width: 260,
        paddingLeft: 24,
        paddingTop: 32,
        paddingBottom: 24,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        borderRightWidth: 1,
        borderRightColor: 'rgba(248, 250, 252, 0.06)',
    },
    logoContainer: {
        marginBottom: 40,
        paddingLeft: 12,
    },
    logo: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
    },

    menuList: {
        gap: 8,
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 99, // Pill shape
        gap: 12,
        // @ts-ignore
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        marginBottom: 2,
    },
    menuItemActive: {
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
    },

    menuItemHovered: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        transform: [{ translateX: 2 }],
    },
    specialItem: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        marginTop: 8,
    },
    specialItemHovered: {
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        transform: [{ translateY: -1 }],
        // @ts-ignore
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconHovered: {
        transform: [{ scale: 1.1 }],
    },
    iconActive: {
        // Icon color handled via props
    },
    iconSpecial: {
        //
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.45)',
        letterSpacing: 0.3,
    },
    labelActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    labelHovered: {
        color: '#FFFFFF',
    },
    labelSpecial: {
        color: '#FFFFFF',
    },

    activeIndicator: {
        position: 'absolute',
        right: 12,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#0EA5E9',
    },

    spacer: {
        height: 24,
    },
    footer: {
        marginTop: 'auto',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 16,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        // @ts-ignore
        transition: 'all 0.2s',
        gap: 12,
        cursor: 'pointer',
    },
    profileCardHovered: {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    profileHandle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    loginButton: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: '#06B6D4',
        borderRadius: 99,
        alignItems: 'center',
        shadowColor: '#06B6D4',
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    loginText: {
        color: '#0F172A',
        fontWeight: '700',
        fontSize: 15,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 20,
    },
    socialIcon: {
        padding: 5,
        opacity: 0.8,
        // @ts-ignore
        transition: 'all 0.2s',
    },
    // New Styles for Recently Liked
    sectionLabel: {
        marginLeft: 16,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 12,
        marginTop: 20,
    },
    mediaSection: {
        marginBottom: 20,
        height: 140, // Fixed height to prevent layout shift issues
    },
    mediaScroll: {
        paddingHorizontal: 16,
        gap: 12,
    },
    mediaCard: {
        width: 120,
        height: 70,
        borderRadius: 12,
        overflow: 'hidden',
    },
    mediaGradient: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    mediaIconPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaTitle: {
        color: 'white',
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    signOutBtn: {
        marginTop: 12,
        alignItems: 'center',
    },
    signOutText: {
        color: 'rgba(255,100,100,0.8)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});


