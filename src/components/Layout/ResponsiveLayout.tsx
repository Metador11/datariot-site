import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, Animated } from 'react-native';
import { WebSidebar } from '../Web/WebSidebar';
import { WebRightPanel } from '../Web/WebRightPanel';
import { usePathname } from 'expo-router';
import { useTheme } from '../Theme/ThemeProvider';

interface ResponsiveLayoutProps {
    children: React.ReactNode;
}

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width > 768;
    const pathname = usePathname();
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    if (!isWeb) {
        return <View style={{ flex: 1 }}>{children}</View>;
    }

    // Check if the current route should display the left sidebar
    const showSidebar = [
        '/',
        '/index',
        '/discover',
        '/ai',
        '/arena',
        '/inbox',
        '/profile',
        '/settings',
        '/create'
    ].includes(pathname);

    // Only show the right panel on the home feed
    const showRightPanel = pathname === '/' || pathname === '/index';

    // If not a sidebar page, use full screen layout (no sidebars)
    if (!showSidebar) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
                <View style={[styles.content, { maxWidth: '100%', paddingHorizontal: 24 }]}>
                    <View style={styles.fullWidthColumn}>
                        {children}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <View style={styles.content}>
                {/* Left Sidebar */}
                <View style={styles.leftColumn}>
                    <WebSidebar />
                </View>

                {/* Main Content (Feed, Discover, AI, etc.) */}
                <View style={[styles.centerColumn, { backgroundColor: 'transparent' }]}>
                    <View style={styles.centerScrollInner}>
                        {children}
                    </View>
                </View>

                {/* Right Panel */}
                {showRightPanel && (
                    <View style={styles.rightColumn}>
                        <WebRightPanel />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'visible',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 0,
        maxWidth: 1700,
        alignSelf: 'center',
        width: '100%',
        zIndex: 1,
    },
    fullWidthColumn: {
        flex: 1,
        width: '100%',
        maxWidth: 1300,
        alignSelf: 'center',
    },
    leftColumn: {
        width: 260,
        display: 'flex',
        paddingTop: 0,
    },
    centerColumn: {
        flex: 1,
        maxWidth: 1020,
        position: 'relative',
        // @ts-ignore — web-only
        overflowY: 'auto',
        overflow: 'visible',
    },
    centerScrollInner: {
        flex: 1,
        minHeight: '100%',
    },
    rightColumn: {
        width: 360,
        display: 'flex',
        paddingTop: 32,
        paddingLeft: 32,
    },
});
