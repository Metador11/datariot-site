import React from 'react';
import { ScrollView, Text, StyleSheet, Pressable, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../Theme/ThemeProvider';
import { theme } from '@design-system/theme';

interface CategoryPillsProps {
    categories: string[];
    activeCategory: string | null;
    onCategoryPress: (category: string) => void;
}

// Unique colors per category
const CATEGORY_COLORS: Record<string, string> = {
    'Viral': '#D9E4FF',
    'Comedy': '#D9E4FF',
    'Tech': '#D9E4FF',
    'Music': '#D9E4FF',
    'Dance': '#D9E4FF',
    'Education': '#D9E4FF',
    'Lifestyle': '#D9E4FF',
    'Gaming': '#D9E4FF',
    'Sport': '#D9E4FF',
    'E-sports': '#D9E4FF',
    'All': '#D9E4FF',
};


export const CategoryPills = ({ categories, activeCategory, onCategoryPress }: CategoryPillsProps) => {
    const { mode } = useTheme();
    const isDark = mode === 'dark';

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollStyle}
            contentContainerStyle={styles.container}
        >
            {categories.map((category) => {
                const isActive = activeCategory === category;
                const color = CATEGORY_COLORS[category] || '#D9E4FF';

                return (
                    <Pressable
                        key={category}
                        style={[
                            styles.pill,
                            {
                                borderColor: isActive
                                    ? color
                                    : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                                borderWidth: 1,
                            }
                        ]}
                        onPress={() => onCategoryPress(category)}
                    >
                        {isActive && (
                            <View style={[
                                styles.activeIndicator,
                                { backgroundColor: color }
                            ]} />
                        )}
                        {!isActive && (
                            <BlurView
                                intensity={isDark ? 30 : 50}
                                tint={isDark ? "dark" : "light"}
                                style={[StyleSheet.absoluteFill, { borderRadius: 100 }]}
                            />
                        )}
                        <Text
                            allowFontScaling={false}
                            style={[
                                styles.text,
                                {
                                    color: isActive
                                        ? '#000000'
                                        : isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                                    fontWeight: isActive ? '800' : '700',
                                }
                            ]}
                        >
                            #{category.toUpperCase()}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollStyle: {
        flex: 1,
        width: '100%',
    },
    container: {
        paddingHorizontal: theme.spacing.md,
        gap: 10,
        paddingTop: 8,
        paddingBottom: 8,
        flexDirection: 'row',
    },
    pill: {
        height: 32,
        paddingHorizontal: 16,
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIndicator: {
        position: 'absolute',
        top: 2,
        bottom: 2,
        left: 2,
        right: 2,
        borderRadius: 100,
    },
    text: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },

});
