import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { WebSidebar } from '../Web/WebSidebar';
import { WebRightPanel } from '../Web/WebRightPanel';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname } from 'expo-router';
import { useTheme } from '../Theme/ThemeProvider';

interface ResponsiveLayoutProps {
    children: React.ReactNode;
}

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width > 768;
    const pathname = usePathname();
    const { theme } = useTheme();

    if (!isWeb) {
        return <View style={{ flex: 1 }}>{children}</View>;
    }

    const platformGlow = Platform.OS === 'web' ? (
        <LinearGradient
            colors={['rgba(14, 165, 233, 0.1)', 'rgba(14, 165, 233, 0.03)', 'transparent']}
            style={styles.ambientGlow}
        />

    ) : null;


    // Check if we are on the home feed
    const isHomeFeed = pathname === '/' || pathname === '/index';

    // If not home feed, use full screen layout (no sidebars)
    if (!isHomeFeed) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
                {platformGlow}
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
            {platformGlow}

            <View style={styles.content}>
                {/* Left Sidebar */}
                <View style={styles.leftColumn}>
                    <WebSidebar />
                </View>

                {/* Main Content (Feed) */}
                <View style={[styles.centerColumn, { backgroundColor: theme.colors.background.primary }]}>
                    <View style={styles.centerScrollInner}>
                        {children}
                    </View>
                </View>

                {/* Right Panel */}
                <View style={styles.rightColumn}>
                    <WebRightPanel />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        overflow: 'hidden',
    },
    ambientGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 500,
        opacity: 0.6,
        zIndex: 0,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 0,
        maxWidth: 1600,
        alignSelf: 'center',
        width: '100%',
        zIndex: 1,
    },
    fullWidthColumn: {
        flex: 1,
        width: '100%',
        maxWidth: 1200,
        alignSelf: 'center',
    },
    leftColumn: {
        width: 260,
        display: 'flex',
        paddingTop: 0,
    },
    centerColumn: {
        flex: 1,
        maxWidth: 720,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        backgroundColor: '#020408',

        // @ts-ignore — web-only
        overflowY: 'auto',
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
    }
});

