import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image as RNImage } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../lib/supabase/hooks/useAuth';
import { supabase } from '../../lib/supabase/client';
import { LinearGradient } from 'expo-linear-gradient';

import { theme as baseTheme } from '../../design-system/theme';
import { useTheme } from '../Theme/ThemeProvider';

const MenuItem = ({ icon, label, isActive, onPress, isSpecial = false }: { icon: React.ReactNode, label: string, isActive: boolean, onPress?: () => void, isSpecial?: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { theme } = useTheme();

    return (
        <Pressable
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            style={[
                styles.menuItem,
                isActive && { backgroundColor: theme.colors.surface.border },
                isHovered && { backgroundColor: theme.colors.surface.borderHover },
                isSpecial && {
                    backgroundColor: theme.colors.primary.glow,
                    borderColor: theme.colors.primary.DEFAULT,
                    borderWidth: 1,
                    marginTop: 8,
                },
                isSpecial && isHovered && {
                    backgroundColor: theme.colors.primary.glow,
                    borderColor: theme.colors.primary.light,
                }
            ]}
            onPress={onPress}
        >
            <View style={[
                styles.iconContainer,
                isHovered && styles.iconHovered,
            ]}>
                {icon}
            </View>
            <Text style={[
                styles.label,
                { color: theme.colors.text.secondary },
                isActive && { color: theme.colors.text.primary, fontFamily: theme.typography.fontFamilies.bold },
                isHovered && { color: theme.colors.text.primary },
                isSpecial && { color: theme.colors.primary.DEFAULT }
            ]}>
                {label}
            </Text>
            {isActive && !isSpecial && <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary.DEFAULT }]} />}
        </Pressable>
    );
};

export const WebSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const { theme, mode } = useTheme();
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
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ marginRight: 10, position: 'relative', width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                        {/* Blue 'Ice' Tone Overlay */}
                        <View style={{ position: 'absolute', width: 34, height: 34, backgroundColor: 'rgba(56, 189, 248, 0.15)', borderRadius: 17 }} />
                        <RNImage
                            source={require('../../../assets/logo.jpg')}
                            style={{ width: 30, height: 30, borderRadius: 15 }}
                        />
                    </View>
                    <Text style={[styles.logo, { color: theme.colors.primary.DEFAULT, fontFamily: theme.typography.fontFamilies.brand, letterSpacing: 2, fontSize: 18 }]}>Datariot</Text>
                </View>
            </View>

            <View style={styles.menuList}>
                <MenuItem
                    icon={<Feather name="trending-up" size={20} color={isActive('/') ? theme.colors.primary.DEFAULT : theme.colors.text.muted} />}
                    label="Feed"
                    isActive={isActive('/')}
                    onPress={() => router.push('/')}
                />
                <MenuItem
                    icon={<Feather name="book-open" size={20} color={isActive('/rules') ? theme.colors.primary.DEFAULT : theme.colors.text.muted} />}
                    label="Rules"
                    isActive={isActive('/rules')}
                    onPress={() => router.push('/rules' as any)}
                />
                <MenuItem
                    icon={<MaterialCommunityIcons name="trophy-outline" size={22} color={isActive('/leaderboard') ? theme.colors.primary.DEFAULT : theme.colors.text.muted} />}
                    label="Leaderboard"
                    isActive={isActive('/leaderboard')}
                    onPress={() => router.push('/leaderboard' as any)}
                />
                <MenuItem
                    icon={<MaterialCommunityIcons name="forum-outline" size={22} color={isActive('/forum') ? theme.colors.primary.DEFAULT : theme.colors.text.muted} />}
                    label="Forum"
                    isActive={isActive('/forum')}
                    onPress={() => router.push('/forum' as any)}
                />
                <MenuItem
                    icon={<Ionicons name="compass-outline" size={22} color={isActive('/discover') ? theme.colors.primary.DEFAULT : theme.colors.text.muted} />}
                    label="Discover"
                    isActive={isActive('/discover')}
                    onPress={() => router.push('/discover')}
                />
                <MenuItem
                    icon={<Feather name="heart" size={20} color={isActive('/favorites') ? theme.colors.primary.DEFAULT : theme.colors.text.muted} />}
                    label="Favorites"
                    isActive={isActive('/favorites')}
                    onPress={() => router.push('/favorites' as any)}
                />
                <MenuItem
                    icon={<Feather name="settings" size={20} color={isActive('/settings') ? theme.colors.primary.DEFAULT : theme.colors.text.muted} />}
                    label="Settings"
                    isActive={isActive('/settings')}
                    onPress={() => router.push('/settings')}
                />



                <View style={styles.spacer} />

                <MenuItem
                    icon={<MaterialCommunityIcons name="sword-cross" size={22} color={theme.colors.primary.DEFAULT} />}
                    label="Arena (Beta)"
                    isActive={isActive('/ai')}
                    onPress={() => router.push('/ai')}
                    isSpecial={true}
                />
            </View>

            {/* Liked Videos Section */}
            {
                likedVideos.length > 0 && (
                    <View style={styles.mediaSection}>
                        <Text style={[styles.sectionLabel, { color: theme.colors.text.muted, fontFamily: theme.typography.fontFamilies.bold }]}>RECENT VIDEOS</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaScroll}>
                            {likedVideos.map((video, idx) => (
                                <Pressable key={video.id} style={styles.mediaCard} onPress={() => router.push({ pathname: '/video-player', params: { type: 'video', initialVideoId: video.id } })}>
                                    <View
                                        style={[styles.mediaGradient, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.surface.border }]}
                                    >
                                        <View style={[styles.mediaIconPlaceholder, { backgroundColor: theme.colors.surface.borderHover }]}>
                                            <Feather name="play" size={12} color={theme.colors.primary.DEFAULT} />
                                        </View>
                                        <Text numberOfLines={1} style={[styles.mediaTitle, { color: theme.colors.text.primary, fontFamily: theme.typography.fontFamilies.bold }]}>{video.title}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )
            }

            {/* User Profile Section at Bottom */}
            <View style={[styles.footer, { borderTopColor: theme.colors.surface.border }]}>
                <View style={styles.socialRow}>
                    <Pressable onPress={() => window.open('https://twitter.com/datariot_xyz', '_blank')} style={styles.socialIcon}>
                        <FontAwesome5 name="twitter" size={18} color={theme.colors.primary.DEFAULT} />
                    </Pressable>
                    <Pressable onPress={() => window.open('https://discord.gg/KvBpEVrk2', '_blank')} style={styles.socialIcon}>
                        <FontAwesome5 name="discord" size={18} color={theme.colors.primary.DEFAULT} />
                    </Pressable>
                    <Pressable onPress={() => window.open('https://instagram.com/datariot.xyz', '_blank')} style={styles.socialIcon}>
                        <FontAwesome5 name="instagram" size={18} color={theme.colors.primary.DEFAULT} />
                    </Pressable>
                </View>

                {user ? (
                    <View>
                        <Pressable style={[styles.profileCard, { backgroundColor: theme.colors.surface.card }]} onPress={() => router.push('/profile')}>
                            <View
                                style={[styles.avatarContainer, { backgroundColor: theme.colors.primary.DEFAULT }]}
                            >
                                <Text style={[styles.avatarText, { fontFamily: theme.typography.fontFamilies.bold }]}>{user.email?.[0].toUpperCase()}</Text>
                            </View>

                            <View style={styles.profileInfo}>
                                <Text style={[styles.profileName, { color: theme.colors.text.primary, fontFamily: theme.typography.fontFamilies.bold }]} numberOfLines={1}>
                                    {user.user_metadata?.username || 'User'}
                                </Text>
                                <Text style={[styles.profileHandle, { color: theme.colors.text.muted, fontFamily: theme.typography.fontFamilies.regular }]} numberOfLines={1}>
                                    @{user.user_metadata?.username || 'user'}
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={theme.colors.text.muted} />
                        </Pressable>
                        <Pressable onPress={handleSignOut} style={styles.signOutBtn}>
                            <Text style={[styles.signOutText, { color: theme.colors.primary.DEFAULT }]}>Log Out Account</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        style={[styles.loginButton, { backgroundColor: theme.colors.primary.DEFAULT }]}
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text style={[styles.loginText, { fontFamily: theme.typography.fontFamilies.bold }]}>Sign In</Text>
                    </Pressable>
                )}

            </View>

        </View >
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
    },
    logoContainer: {
        marginBottom: 40,
        paddingLeft: 12,
    },
    logo: {
        fontSize: 22,
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
        position: 'relative',
        marginBottom: 2,
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconHovered: {
        transform: [{ scale: 1.1 }],
    },
    label: {
        fontSize: 14,
        letterSpacing: 0.3,
    },
    activeIndicator: {
        position: 'absolute',
        right: 12,
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    spacer: {
        height: 24,
    },
    footer: {
        marginTop: 'auto',
        borderTopWidth: 1,
        paddingTop: 16,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 16,
        gap: 12,
        // @ts-ignore
        cursor: 'pointer',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 14,
    },
    profileHandle: {
        fontSize: 12,
    },
    loginButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 99,
        alignItems: 'center',
    },
    loginText: {
        color: '#FFFFFF',
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
    },
    // New Styles for Recently Liked
    sectionLabel: {
        marginLeft: 16,
        fontSize: 10,
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
    },
    mediaIconPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaTitle: {
        fontSize: 9,
        letterSpacing: 0.5,
    },
    signOutBtn: {
        marginTop: 12,
        alignItems: 'center',
    },
    signOutText: {
        fontSize: 12,
        letterSpacing: 0.5,
    },
});


