import React from 'react';
import { View, Text, StyleSheet, Pressable, Image as RNImage } from 'react-native';
import { theme } from '@design-system/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';


export const WebTopNav = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Left: Logo */}
                <View style={styles.left}>
                    <Pressable onPress={() => router.push('/')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.logoIconPlaceholder}>
                            <RNImage
                                source={require('../../../assets/logo.jpg')}
                                style={styles.logoImage}
                            />
                        </View>
                        <Text style={styles.logo}>ORVELIS</Text>
                    </Pressable>
                </View>

                {/* Center: Navigation Links */}
                <View style={styles.center}>
                    <NavButton title="Discover" onPress={() => router.push('/')} />
                    <NavButton title="Manifesto" />
                    <NavButton title="Program" />
                    <NavButton title="Support" />
                </View>

                {/* Right: Actions */}
                <View style={styles.right}>
                    <Pressable style={styles.searchButton}>
                        <Feather name="search" size={18} color="rgba(255, 255, 255, 0.4)" />
                        <Text style={styles.searchText}>Search creators...</Text>
                    </Pressable>

                    <Pressable
                        style={styles.loginButton}
                        onPress={() => router.push('/auth/login')}
                    >
                        <LinearGradient
                            colors={['#0EA5E9', '#0284C7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />

                        <Text style={styles.loginText}>Launch App</Text>
                    </Pressable>
                </View>
            </View>
        </View>

    );
};

const NavButton = ({ title, onPress }: { title: string, onPress?: () => void }) => (
    <Pressable style={styles.navButton} onPress={onPress}>
        <Text style={styles.navButtonText}>{title}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    container: {
        height: 72,
        width: '100%',
        backgroundColor: 'rgba(2, 4, 8, 0.75)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
        zIndex: 100,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        // @ts-ignore
        backdropFilter: 'blur(20px)',
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
        backgroundColor: '#1E293B',
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    logo: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
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
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        width: 200,
    },
    searchText: {
        color: 'rgba(255, 255, 255, 0.3)',
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
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
    },

    loginText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});

