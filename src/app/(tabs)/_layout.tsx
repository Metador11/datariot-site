import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { setAudioModeAsync } from 'expo-audio';
import { Feather, SimpleLineIcons, Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { View, Dimensions, Platform } from 'react-native';
import { ResponsiveLayout } from '../../components/Layout/ResponsiveLayout';
import { useTheme } from '../../components/Theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TabLayout = () => {
    useEffect(() => {
        const initAudio = async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    shouldRouteThroughEarpiece: false,
                });
            } catch (e) {
                console.error('Failed to set audio mode:', e);
            }
        };
        initAudio();
    }, []);

    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const isWeb = Platform.OS === 'web';

    return (
        <ResponsiveLayout>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: theme.colors.text.primary,
                    tabBarInactiveTintColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0,0,0,0.5)',
                    tabBarStyle: {
                        backgroundColor: isWeb ? 'transparent' : 'transparent',
                        display: isWeb ? 'none' : 'flex',
                        position: 'absolute',
                        bottom: Platform.OS === 'ios' ? 4 : 12,
                        left: 0,
                        right: 0,
                        width: '100%',
                        elevation: 0,
                        borderTopWidth: 0,
                        height: 65,
                        paddingBottom: 0,
                        paddingHorizontal: 0,
                        marginHorizontal: 0,
                    },
                    tabBarLabelStyle: {
                        display: 'none',
                    },
                    tabBarItemStyle: {
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                    tabBarHideOnKeyboard: true,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: '',
                        tabBarIcon: ({ focused, color }) => (
                            <MaterialCommunityIcons
                                name={focused ? "home-variant" : "home-variant-outline"}
                                size={24}
                                color={color}
                                style={{ opacity: focused ? 1 : 0.8 }}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="discover"
                    options={{
                        title: '',
                        tabBarIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? "navigate-circle" : "navigate-circle-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="create"
                    options={{
                        title: '',
                        tabBarIcon: ({ focused }) => (
                            <View style={{
                                width: 44,
                                height: 30,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: theme.colors.text.primary,
                                borderRadius: 8,
                            }}>
                                <Feather
                                    name="plus"
                                    size={20}
                                    color={theme.colors.background.primary}
                                />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="ai"
                    options={{
                        title: '',
                        tabBarIcon: ({ focused, color }) => (
                            <MaterialCommunityIcons
                                name={focused ? "robot-excited" : "robot-excited-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="inbox"
                    options={{
                        title: '',
                        tabBarIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                                size={24}
                                color={color}
                                style={{ opacity: focused ? 1 : 0.8 }}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        href: null, // This is the correct way in Expo Router to completely remove the tab
                    }}
                />
            </Tabs>
        </ResponsiveLayout>
    );
};

export default TabLayout;
