import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { useTheme } from '../Theme/ThemeProvider';
import { Post } from '@lib/supabase/hooks/usePosts';

interface DebateCardProps {
    item: Post;
    onPress?: () => void;
    onDelete?: (id: string) => void;
    isOwnPost?: boolean;
}

export function DebateCard({ item, onPress, onDelete, isOwnPost }: DebateCardProps) {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const deleteScale = useSharedValue(1);

    const handleDeletePress = () => {
        deleteScale.value = withSequence(
            withTiming(1.2, { duration: 100 }),
            withSpring(1)
        );
        if (onDelete) onDelete(item.id);
    };

    const animatedDeleteStyle = useAnimatedStyle(() => ({
        transform: [{ scale: deleteScale.value }]
    }));

    // The Logic Score is currently stored in "likes"
    const threadWeight = item.likes;
    const argumentsCount = item.comments;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                },
                pressed && { opacity: 0.8 }
            ]}
        >
            <View style={styles.header}>
                <View style={styles.authorRow}>
                    <View style={[styles.avatar, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}>
                        {item.authorAvatar ? (
                            <Image source={{ uri: item.authorAvatar }} style={styles.avatarImage} />
                        ) : (
                            <Text style={[styles.avatarText, { color: theme.colors.text.primary }]}>
                                {item.authorName ? item.authorName[0].toUpperCase() : '?'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.authorInfo}>
                        <Text style={[styles.authorName, { color: theme.colors.text.primary }]}>{item.authorName}</Text>
                        <Text style={[styles.date, { color: theme.colors.text.muted }]}>
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                </View>

                {isOwnPost && onDelete && (
                    <Pressable
                        onPress={handleDeletePress}
                        style={({ pressed }) => ([
                            styles.deleteButton,
                            { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.1)' },
                            pressed && { opacity: 0.7 }
                        ])}
                    >
                        <Animated.View style={animatedDeleteStyle}>
                            <Ionicons name="trash-bin-outline" size={18} color="#EF4444" />
                        </Animated.View>
                    </Pressable>
                )}
            </View>

            <View style={styles.body}>
                <View style={[styles.thesisBadge, { backgroundColor: isDark ? 'rgba(0,85,255,0.15)' : 'rgba(0,85,255,0.1)' }]}>
                    <Text style={[styles.thesisBadgeText, { color: '#0055FF' }]}>THESIS</Text>
                </View>
                <Text style={[styles.content, { color: theme.colors.text.primary }]} numberOfLines={4}>
                    {item.content}
                </Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.statGroup}>
                    <Ionicons name="bulb-outline" size={18} color="#0055FF" />
                    <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                        <Text style={{ fontWeight: 'bold', color: theme.colors.text.primary }}>{threadWeight}</Text> Logic Score
                    </Text>
                </View>

                <View style={styles.statGroup}>
                    <Ionicons name="chatbubbles-outline" size={18} color={theme.colors.text.secondary} />
                    <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                        <Text style={{ fontWeight: 'bold', color: theme.colors.text.primary }}>{argumentsCount}</Text> Arguments
                    </Text>
                </View>

                <View style={styles.flexSpacer} />

                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 24,
        marginHorizontal: 16,
        padding: 4,
        borderWidth: 1,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        paddingBottom: 8,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    authorInfo: {
        marginLeft: 12,
        justifyContent: 'center'
    },
    authorName: {
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        fontWeight: '500',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 20,
    },
    body: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    thesisBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    thesisBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.1)',
        gap: 16,
    },
    statGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
    },
    flexSpacer: {
        flex: 1,
    }
});
