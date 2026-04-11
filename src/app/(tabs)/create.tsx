import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Dimensions, Alert, Platform, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@lib/supabase/hooks/useAuth';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../components/Theme/ThemeProvider';

const { width } = Dimensions.get('window');

// STRICT COLORS:
// White: #FFFFFF
// Black: #000000
// Blue: #0055FF (Primary, electric/vivid blue)

const BLUE = '#0055FF';

function ActionCard({
    onPress,
    icon,
    title,
    subtitle,
    isPrimary,
    delay,
}: {
    onPress: () => void;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    isPrimary: boolean;
    delay: number;
}) {
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    // Strict palete based on theme
    const bg = isDark ? '#000000' : '#FFFFFF';
    const fg = isDark ? '#FFFFFF' : '#000000';

    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    return (
        <Animated.View entering={FadeInDown.delay(delay).springify()} style={[styles.cardWrapper, animStyle]}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={[
                    styles.card,
                    isPrimary
                        ? { backgroundColor: BLUE }
                        : { backgroundColor: bg, borderColor: isDark ? '#333' : '#E5E5E5', borderWidth: 2 }
                ]}
            >
                <View style={styles.cardHeader}>
                    <View style={[
                        styles.iconCirle,
                        isPrimary
                            ? { backgroundColor: '#FFFFFF' }
                            : { backgroundColor: isDark ? '#111' : '#F5F5F5' }
                    ]}>
                        <Ionicons
                            name={icon}
                            size={28}
                            color={isPrimary ? '#000000' : fg}
                        />
                    </View>
                    <View style={[
                        styles.arrowCircle,
                        isPrimary
                            ? { backgroundColor: 'rgba(0,0,0,0.1)' }
                            : { backgroundColor: isDark ? '#111' : '#F5F5F5' }
                    ]}>
                        <Feather
                            name="arrow-up-right"
                            size={20}
                            color={isPrimary ? '#FFFFFF' : fg}
                        />
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={[styles.cardTitle, isPrimary ? { color: '#FFFFFF' } : { color: fg }]}>
                        {title}
                    </Text>
                    <Text style={[styles.cardSubtitle, isPrimary ? { color: 'rgba(255,255,255,0.8)' } : { color: isDark ? '#888' : '#666' }]}>
                        {subtitle}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

export default function CreateScreen() {
    const { user } = useAuth();
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    const bg = isDark ? '#000000' : '#FFFFFF';
    const fg = isDark ? '#FFFFFF' : '#000000';

    const pickVideo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Allow access to media library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled && result.assets[0]) {
            router.push({ pathname: '/editor', params: { videoUri: result.assets[0].uri } });
        }
    };

    const handleWritePost = () => router.push('/publish');

    if (!user) {
        return (
            <View style={[styles.root, { backgroundColor: bg }]}>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <View style={[styles.root, styles.center]}>
                    <Ionicons name="lock-closed" size={48} color={fg} style={{ marginBottom: 20 }} />
                    <Text style={[styles.lockTitle, { color: fg }]}>Sign in</Text>
                    <Text style={[styles.lockSub, { color: fg }]}>Required to create content</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.root, { backgroundColor: bg }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* HERO */}
                    <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.heroBox}>
                        <View style={styles.heroLine} />
                        <Text style={[styles.heroText, { color: fg }]}>CREATE</Text>
                        <Text style={[styles.heroText, { color: fg }]}>SOMETHING</Text>
                        <Text style={[styles.heroText, { color: BLUE }]}>NEW</Text>
                    </Animated.View>

                    {/* CARDS */}
                    <View style={styles.cardsContainer}>
                        <ActionCard
                            onPress={pickVideo}
                            icon="videocam"
                            title="Upload Video"
                            subtitle="Vertical 9:16 format"
                            isPrimary={true}
                            delay={150}
                        />

                        <ActionCard
                            onPress={handleWritePost}
                            icon="chatbubbles-outline"
                            title="Propose Thesis"
                            subtitle="Start a logical debate"
                            isPrimary={false}
                            delay={200}
                        />
                    </View>

                    {/* FOOTER TEXT */}
                    <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footerWrap}>
                        <Text style={[styles.footerText, { color: isDark ? '#555' : '#AAA' }]}>
                            {`DESIGN SYSTEM\nB/W/BLU`}
                        </Text>
                    </Animated.View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    safeArea: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 60, flexGrow: 1 },

    // Lock screen
    lockTitle: { fontSize: 28, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -1, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    lockSub: { fontSize: 16, marginTop: 8, opacity: 0.6, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

    // Hero
    heroBox: { marginBottom: 40, marginTop: 10 },
    heroLine: { width: 40, height: 4, backgroundColor: BLUE, marginBottom: 24 },
    heroText: {
        fontSize: Platform.OS === 'ios' ? 48 : 42,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: -2,
        lineHeight: Platform.OS === 'ios' ? 52 : 46,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },

    // Cards
    cardsContainer: { gap: 16 },
    cardWrapper: { width: '100%' },
    card: {
        width: '100%',
        borderRadius: 32,
        padding: 24,
        minHeight: 220,
        justifyContent: 'space-between',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    iconCirle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardFooter: { gap: 6 },
    cardTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -1, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    cardSubtitle: { fontSize: 16, fontWeight: '500', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

    // Footer
    footerWrap: { marginTop: 40, alignItems: 'flex-start' },
    footerText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        lineHeight: 18,
        opacity: 0.5,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});
