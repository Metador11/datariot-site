import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ImageSourcePropType } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../Theme/ThemeProvider';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    onPressShowAll?: () => void;
    rightImage?: ImageSourcePropType;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    onPressShowAll,
    rightImage
}) => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title.toUpperCase()}</Text>
                {subtitle && (
                    <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>{subtitle}</Text>
                )}
            </View>

            {rightImage && !onPressShowAll && (
                <Image
                    source={rightImage}
                    style={styles.farRightImage}
                    resizeMode="contain"
                />
            )}

            {onPressShowAll && (
                <Pressable onPress={onPressShowAll} style={styles.showAllButton}>
                    <Text style={[styles.showAllText, { color: theme.colors.primary.DEFAULT }]}>Show All</Text>
                    <Feather name="chevron-right" size={16} color={theme.colors.primary.DEFAULT} />
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 32,
        paddingBottom: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    farRightImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginLeft: 12,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
    showAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    showAllText: {
        fontSize: 13,
        fontWeight: '700',
        marginRight: 2,
    },
});
