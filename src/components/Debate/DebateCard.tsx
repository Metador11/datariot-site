import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { useTheme } from '../Theme/ThemeProvider';
import { Post } from '@lib/supabase/hooks/usePosts';

const isWeb = Platform.OS === 'web';

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
                    backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(217,228,255,0.10)' : 'rgba(0,0,0,0.06)',
                },
                isWeb && {
                    // @ts-ignore — web hover-ready soft glow
                    boxShadow: isDark
                        ? '0 10px 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(217,228,255,0.03)'
                        : '0 10px 28px rgba(76,110,245,0.10), 0 1px 2px rgba(0,0,0,0.04)',
                },
                pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] }
            ]}
        >
            {/* Accent edge */}
            <LinearGradient
                colors={isDark ? ['#A5C6FF', '#D9E4FF'] : ['#4C6EF5', '#7AA2FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.accentEdge}
            />

            <View style={styles.header}>
                <View style={styles.authorRow}>
                    <View style={[styles.avatar, {
                        borderColor: isDark ? 'rgba(217,228,255,0.25)' : 'rgba(76,110,245,0.25)',
                        backgroundColor: isDark ? 'rgba(217,228,255,0.06)' : 'rgba(76,110,245,0.06)',
                    }]}>
                        {item.authorAvatar ? (
                            <Image source={{ uri: item.authorAvatar }} style={styles.avatarImage} />
                        ) : (
                            <Text style={[styles.avatarText, { color: theme.colors.primary.DEFAULT }]}>
                                {item.authorName ? item.authorName[0].toUpperCase() : '?'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.authorInfo}>
                        <Text style={[styles.authorName, { color: theme.colors.text.primary }]} numberOfLines={1}>{item.authorName}</Text>
                        <Text style={[styles.date, { color: theme.colors.text.muted }]}>
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                </View>

                {item.isAiAssisted && (
                    <View style={[styles.aiBadge, {
                        backgroundColor: isDark ? 'rgba(217,228,255,0.12)' : 'rgba(76,110,245,0.10)',
                        borderColor: isDark ? 'rgba(217,228,255,0.30)' : 'rgba(76,110,245,0.28)',
                    }]}>
                        <Ionicons name="sparkles" size={11} color={theme.colors.primary.DEFAULT} />
                        <Text style={[styles.aiBadgeText, { color: theme.colors.primary.DEFAULT }]}>LOGIC ORACLE</Text>
                    </View>
                )}

                {isOwnPost && onDelete && (
                    <Pressable
                        onPress={handleDeletePress}
                        style={({ pressed }) => ([
                            styles.deleteButton,
                            { backgroundColor: 'rgba(239,68,68,0.10)' },
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
                <View style={styles.bodyContentRow}>
                    <View style={styles.textContent}>
                        <View style={[styles.thesisBadge, {
                            backgroundColor: isDark ? 'rgba(217,228,255,0.10)' : 'rgba(76,110,245,0.08)',
                            borderColor: isDark ? 'rgba(217,228,255,0.22)' : 'rgba(76,110,245,0.20)',
                        }]}>
                            <Ionicons name="git-compare" size={11} color={theme.colors.primary.DEFAULT} />
                            <Text style={[styles.thesisBadgeText, { color: theme.colors.primary.DEFAULT }]}>THESIS</Text>
                        </View>
                        <Text style={[styles.content, { color: theme.colors.text.primary }]} numberOfLines={3}>
                            {item.content}
                        </Text>
                    </View>

                    {(item.videoUrl || item.imageUrl) && (
                        <View style={[styles.mediaPreview, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                            <Image
                                source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80' }}
                                style={styles.thumbnail}
                            />
                            {item.videoUrl && (
                                <View style={styles.videoIconOverlay}>
                                    <Ionicons name="play" size={14} color="#FFFFFF" />
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Logic Balance Bar */}
                {item.logicStats && (
                    <View style={styles.logicBalanceContainer}>
                        <View style={styles.logicLabels}>
                            <Text style={[styles.logicLabelFor]}>● FOR</Text>
                            <Text style={[styles.logicLabelAgainst]}>AGAINST ●</Text>
                        </View>
                        <View style={[styles.balanceTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                            <View style={[styles.balanceFill, { width: `${item.logicStats.forPercentage}%`, backgroundColor: '#34D399' }]} />
                            <View style={[styles.balanceFill, { width: `${100 - item.logicStats.forPercentage}%`, backgroundColor: '#F87171' }]} />
                        </View>
                        <View style={styles.logicScores}>
                            <Text style={[styles.logicScoreText, { color: '#34D399' }]}>{item.logicStats.forScore}</Text>
                            <Text style={[styles.logicScoreText, { color: '#F87171' }]}>{item.logicStats.againstScore}</Text>
                        </View>
                    </View>
                )}
            </View>

            <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                <View style={styles.statGroup}>
                    <Ionicons name="bulb-outline" size={17} color={theme.colors.primary.DEFAULT} />
                    <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                        <Text style={{ fontWeight: 'bold', color: theme.colors.text.primary }}>{threadWeight}</Text> Reputation
                    </Text>
                </View>

                <View style={styles.statGroup}>
                    <Ionicons name="chatbubbles-outline" size={17} color={theme.colors.text.secondary} />
                    <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                        <Text style={{ fontWeight: 'bold', color: theme.colors.text.primary }}>{argumentsCount}</Text> Arguments
                    </Text>
                </View>

                <View style={styles.flexSpacer} />

                <View style={[styles.enterChip, { backgroundColor: isDark ? 'rgba(217,228,255,0.08)' : 'rgba(76,110,245,0.08)' }]}>
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.primary.DEFAULT} />
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 22,
        marginHorizontal: 16,
        paddingLeft: 4,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
    },
    accentEdge: {
        position: 'absolute',
        left: 0,
        top: 14,
        bottom: 14,
        width: 3,
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingTop: 14,
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
        marginBottom: 10,
    },
    thesisBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.2,
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
        gap: 16,
    },
    enterChip: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
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
    },
    // New Styles
    bodyContentRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    textContent: {
        flex: 1,
    },
    mediaPreview: {
        width: 92,
        height: 112,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.1)',
        position: 'relative',
        borderWidth: 1,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    videoIconOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 30,
        height: 30,
        marginLeft: -15,
        marginTop: -15,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    logicBalanceContainer: {
        marginVertical: 4,
    },
    logicLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    logicLabelFor: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.8,
        color: '#34D399',
    },
    logicLabelAgainst: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.8,
        textAlign: 'right',
        color: '#F87171',
    },
    balanceTrack: {
        height: 6,
        borderRadius: 999,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    balanceFill: {
        height: '100%',
    },
    logicScores: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    logicScoreText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#D9E4FF',
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D9E4FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    aiBadgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 0.5,
    },
});
