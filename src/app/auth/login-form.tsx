import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Image as RNImage } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from '@components/UI/SafeAreaView';
import { useAuth } from '@lib/supabase/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '../../components/Theme/ThemeProvider';

export default function LoginFormScreen() {
    const { signIn } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await signIn(email, password);

            if (result.error) {
                setError(result.error.message);
            } else {
                router.replace('/(tabs)');
            }
        } catch {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background.primary }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* Back Button */}
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={[styles.backButtonText, { color: theme.colors.text.secondary }]}>← Back</Text>
                </Pressable>

                <View style={[styles.card, { backgroundColor: theme.colors.surface.card, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={styles.header}>
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <View style={[styles.logoOverlay, { backgroundColor: isDark ? 'rgba(217, 228, 255, 0.12)' : 'rgba(76, 110, 245, 0.08)' }]} />
                            <RNImage
                                source={require('../../../assets/logo.jpg')}
                                style={styles.logoImage}
                            />
                        </View>
                        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Login</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Welcome back!</Text>
                    </View>

                    <View style={styles.form}>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                                color: theme.colors.text.primary,
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)',
                            }]}
                            placeholder="Email"
                            placeholderTextColor={theme.colors.text.muted}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                                color: theme.colors.text.primary,
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)',
                            }]}
                            placeholder="Password"
                            placeholderTextColor={theme.colors.text.muted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        {error ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text> : null}

                        <Pressable
                            style={[styles.loginButton, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#D9E4FF', '#D9E4FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.loginButtonGradient}
                            >
                                <Text style={styles.loginButtonText}>
                                    {loading ? 'Loading...' : 'Login'}
                                </Text>
                            </LinearGradient>
                        </Pressable>

                        {/* Google Button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.googleButton,
                                {
                                    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                                },
                                pressed && styles.buttonPressed
                            ]}
                            onPress={() => {/* TODO: Google Auth */ }}
                        >
                            <AntDesign name="google" size={20} color={isDark ? '#FFFFFF' : '#4285F4'} style={styles.googleIcon} />
                            <Text style={[styles.googleButtonText, { color: theme.colors.text.primary }]}>Continue with Google</Text>
                        </Pressable>
                    </View>

                    {/* Don't have an account? Sign up */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.colors.text.secondary }]}>
                            Don't have an account?{' '}
                            <Text
                                style={[styles.footerLink, { color: theme.colors.primary.DEFAULT || '#4C6EF5' }]}
                                onPress={() => router.replace('/auth/signup-form')}
                            >
                                Sign up
                            </Text>
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    backButton: {
        position: 'absolute',
        top: 24,
        left: 24,
        zIndex: 10,
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    card: {
        width: '100%',
        maxWidth: 420,
        borderRadius: 24,
        paddingHorizontal: 32,
        paddingVertical: 40,
        // Shadow for premium depth
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
        borderWidth: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    logoOverlay: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    logoImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        gap: 16,
    },
    input: {
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 18,
        fontSize: 15,
        borderWidth: 1,
    },
    errorText: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 4,
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    loginButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    googleButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexDirection: 'row',
        borderWidth: 1,
    },
    googleButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    googleIcon: {
        marginRight: 10,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
    },
    footerLink: {
        fontWeight: '600',
    },
});

