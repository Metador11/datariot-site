import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../components/Theme/ThemeProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { Feather, Ionicons, MaterialCommunityIcons, Entypo, SimpleLineIcons, AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        ...Feather.font,
        ...Ionicons.font,
        ...MaterialCommunityIcons.font,
        ...Entypo.font,
        ...SimpleLineIcons.font,
        ...AntDesign.font,
        ...FontAwesome5.font,
        ...MaterialIcons.font,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync().catch(() => { });
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <ThemeProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="auth" options={{ headerShown: false }} />
                        <Stack.Screen name="editor" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                    </Stack>
                </SafeAreaProvider>
            </GestureHandlerRootView>
            <Analytics />
            <SpeedInsights />
        </ThemeProvider>
    );
}
