import React from 'react';
import { View, Text, StyleSheet, Pressable, Image as RNImage } from 'react-native';
import { theme as baseTheme } from '../../design-system/theme';
import { useTheme } from '../Theme/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const WebTopNav = () => {
    const router = useRouter();
    const { theme, mode, toggleTheme } = useTheme();
    const isDark = mode === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
            <View style={styles.content}>
                {/* Left: Logo */}
                <View style={styles.left}>
                    <Pressable onPress={() => router.push('/')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.logoIconPlaceholder, { borderColor: theme.colors.surface.border, backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                            <RNImage
                                source={require('../../../assets/logo.jpg')}
                                style={styles.logoImage}
                            />
                        </View>
                        <Text style={[styles.logo, { color: theme.colors.text.primary, fontFamily: theme.typography.fontFamilies.bold }]}>DATARIOT</Text>
                    </Pressable>
                </View>

                {/* Center: Navigation Links */}
                <View style={styles.center}>
                    <NavButton theme={theme} title="Arena (Beta)" onPress={() => router.push('/')} />
                    <NavButton theme={theme} title="Rules" />
                    <NavButton theme={theme} title="Leaderboard" />
                    <NavButton theme={theme} title="Forum" />
                </View>

                {/* Right: Actions */}
                <View style={styles.right}>
                    <Pressable style={[styles.searchButton, { backgroundColor: theme.colors.surface.light, borderColor: theme.colors.surface.border }]}>
                        <Feather name="search" size={18} color={theme.colors.primary.DEFAULT} />
                        <Text style={[styles.searchText, { color: theme.colors.text.muted }]}>Search creators...</Text>
                    </Pressable>

                    <Pressable
                        onPress={toggleTheme}
                        style={[styles.themeIconButton, { backgroundColor: theme.colors.surface.light, borderColor: theme.colors.surface.border }]}
                    >
                        <Feather
                            name={isDark ? 'sun' : 'moon'}
                            size={20}
                            color={theme.colors.text.primary}
                        />
                    </Pressable>

                    <Pressable
                        style={[styles.loginButton, { backgroundColor: theme.colors.primary.DEFAULT }]}
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text style={[styles.loginText, { fontFamily: theme.typography.fontFamilies.bold }]}>Launch App</Text>
                    </Pressable>
                </View>
            </View>
        </View>

    );
};

const NavButton = ({ title, onPress, theme }: { title: string, onPress?: () => void, theme: any }) => (
    <Pressable style={styles.navButton} onPress={onPress}>
        <Text style={[styles.navButtonText, { color: theme.colors.text.secondary, fontFamily: theme.typography.fontFamilies.medium }]}>{title}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    container: {
        height: 72,
        width: '100%',
        zIndex: 100,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        maxWidth: 1400,
        alignSelf: 'center',
        width: '100%',
    },
    left: {
        flex: 1,
    },
    logoIconPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 8,
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    logo: {
        fontSize: 18,
        letterSpacing: 2,
    },
    center: {
        flexDirection: 'row',
        gap: 4,
        flex: 2,
        justifyContent: 'center',
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
        justifyContent: 'flex-end',
    },
    navButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    navButtonText: {
        fontSize: 14,
        letterSpacing: 0.3,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 12,
        width: 200,
    },
    searchText: {
        fontSize: 13,
        fontWeight: '500',
    },
    loginButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#FFFFFF',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    themeIconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
});

