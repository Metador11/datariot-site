import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../Theme/ThemeProvider';
import { useDebateChallenges, DebateChallenge } from '@lib/supabase/hooks/useDebateChallenges';

// Incoming + outgoing debate challenges, shown at the top of the Inbox tab.
// Renders nothing when there are no pending challenges (or the feature
// isn't enabled on the backend yet).
export function ChallengeInbox() {
    const router = useRouter();
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const { incoming, outgoing, loading, unavailable, respondToChallenge } = useDebateChallenges();

    const [respondingId, setRespondingId] = React.useState<string | null>(null);

    if (unavailable || (incoming.length === 0 && outgoing.length === 0 && !loading)) {
        return null;
    }

    const handleRespond = async (challenge: DebateChallenge, accept: boolean) => {
        setRespondingId(challenge.id);
        const result = await respondToChallenge(challenge, accept);
        setRespondingId(null);
        if (result.ok && accept && result.postId) {
            router.push(`/debate/${result.postId}`);
        }
    };

    const textPrimary = theme.colors.text.primary;
    const textSecondary = theme.colors.text.secondary;
    const cardBg = isDark ? 'rgba(217,228,255,0.04)' : '#FFF';
    const cardBorder = isDark ? 'rgba(217,228,255,0.1)' : 'rgba(0,0,0,0.06)';

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Ionicons name="flash" size={16} color="#D9E4FF" />
                <Text style={[styles.title, { color: textPrimary }]}>Debate Challenges</Text>
                {incoming.length > 0 && (
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{incoming.length}</Text>
                    </View>
                )}
            </View>

            {loading && incoming.length === 0 && outgoing.length === 0 && (
                <ActivityIndicator color="#D9E4FF" style={{ marginVertical: 12 }} />
            )}

            {incoming.map(challenge => (
                <View key={challenge.id} style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={styles.cardHeader}>
                        {challenge.challengerAvatar ? (
                            <Image source={{ uri: challenge.challengerAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarFallback]}>
                                <Text style={styles.avatarLetter}>{challenge.challengerName[0]?.toUpperCase()}</Text>
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.challengerName, { color: textPrimary }]} numberOfLines={1}>
                                {challenge.challengerName}
                            </Text>
                            <Text style={[styles.metaText, { color: textSecondary }]}>
                                challenges you · they argue {challenge.challengerSide}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.topicText, { color: textPrimary }]} numberOfLines={3}>
                        “{challenge.topic}”
                    </Text>

                    <View style={styles.actionsRow}>
                        <Pressable
                            style={[styles.actionBtn, styles.acceptBtn, respondingId === challenge.id && { opacity: 0.5 }]}
                            disabled={respondingId === challenge.id}
                            onPress={() => handleRespond(challenge, true)}
                        >
                            {respondingId === challenge.id
                                ? <ActivityIndicator size="small" color="#000" />
                                : (
                                    <>
                                        <Ionicons name="checkmark" size={15} color="#000" />
                                        <Text style={styles.acceptBtnText}>Accept & Enter Arena</Text>
                                    </>
                                )}
                        </Pressable>
                        <Pressable
                            style={[styles.actionBtn, styles.declineBtn, respondingId === challenge.id && { opacity: 0.5 }]}
                            disabled={respondingId === challenge.id}
                            onPress={() => handleRespond(challenge, false)}
                        >
                            <Text style={[styles.declineBtnText, { color: textSecondary }]}>Decline</Text>
                        </Pressable>
                    </View>
                </View>
            ))}

            {outgoing.map(challenge => (
                <View key={challenge.id} style={[styles.card, styles.outgoingCard, { borderColor: cardBorder }]}>
                    <Ionicons name="hourglass-outline" size={14} color={textSecondary} />
                    <Text style={[styles.outgoingText, { color: textSecondary }]} numberOfLines={2}>
                        Waiting for <Text style={{ fontWeight: '700', color: textPrimary }}>{challenge.opponentName}</Text> — “{challenge.topic}”
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    countBadge: {
        backgroundColor: '#D9E4FF',
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    countBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#000',
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
    },
    avatarFallback: {
        backgroundColor: 'rgba(217,228,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLetter: {
        fontSize: 14,
        fontWeight: '800',
        color: '#D9E4FF',
    },
    challengerName: {
        fontSize: 14,
        fontWeight: '700',
    },
    metaText: {
        fontSize: 12,
        marginTop: 1,
    },
    topicText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
    },
    acceptBtn: {
        flex: 1,
        backgroundColor: '#D9E4FF',
    },
    acceptBtnText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#000',
    },
    declineBtn: {
        paddingHorizontal: 16,
        backgroundColor: 'rgba(128,128,128,0.12)',
    },
    declineBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    outgoingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'transparent',
        paddingVertical: 10,
    },
    outgoingText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});
