import React from 'react';
import { View, Text, StyleSheet, Image as RNImage, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../Theme/ThemeProvider';

interface BrandLogoProps {
    size?: number;          // icon tile size
    showWordmark?: boolean; // render the DATARIOT text next to the icon
    wordmarkSize?: number;
}

// Single source of truth for the Datariot mark: a solid rounded-square
// tile (its own surface, so it never reads as a floating outline) with the
// transparent cube glyph centered, plus the wordmark.
export const BrandLogo = ({ size = 36, showWordmark = true, wordmarkSize = 17 }: BrandLogoProps) => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    return (
        <View style={styles.row}>
            <View
                style={[
                    styles.tile,
                    {
                        width: size,
                        height: size,
                        borderRadius: size * 0.3,
                        borderColor: isDark ? 'rgba(217,228,255,0.18)' : 'rgba(107,127,204,0.22)',
                    },
                    isDark
                        ? { shadowColor: '#A5C6FF', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 3 } }
                        : { shadowColor: '#6B7FCC', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
                ]}
            >
                <LinearGradient
                    colors={isDark ? ['#222741', '#0E1018'] : ['#EDF1FF', '#C9D6FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />
                <RNImage
                    source={require('../../../assets/logo.png')}
                    style={{ width: size * 0.74, height: size * 0.74 }}
                    resizeMode="contain"
                />
            </View>

            {showWordmark && (
                <Text
                    style={[
                        styles.wordmark,
                        {
                            color: theme.colors.text.primary,
                            fontFamily: theme.typography.fontFamilies.brand,
                            fontSize: wordmarkSize,
                        },
                    ]}
                >
                    DATARIOT
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tile: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        marginRight: 12,
    },
    wordmark: {
        letterSpacing: 3,
        fontWeight: '800',
    },
});
