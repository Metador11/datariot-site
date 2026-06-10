import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Theme/ThemeProvider';
import { useDebateChallenges, ChallengeSide } from '@lib/supabase/hooks/useDebateChallenges';

interface ChallengeModalProps {
    visible: boolean;
    opponentId: string;
    opponentName: string;
    onClose: () => void;
}

const TOPIC_SUGGESTIONS = [
    'AI will replace most creative jobs within a decade.',
    'Social media does more harm than good to society.',
    'Remote work makes teams more productive, not less.',
];

export function ChallengeModal({ visible, opponentId, opponentName, onClose }: ChallengeModalProps) {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const { sendChallenge, sending } = useDebateChallenges();

    const [topic, setTopic] = useState('');
    const [side, setSide] = useState<ChallengeSide>('FOR');
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        setError(null);
        const result = await sendChallenge(opponentId, topic, side);
        if (result.ok) {
            setSent(true);
        } else {
            setError(result.message || 'Something went wrong.');
        }
    };

    const handleClose = () => {
        setTopic('');
        setSide('FOR');
        setError(null);
        setSent(false);
        onClose();
    };

    const textPrimary = theme.colors.text.primary;
    const textSecondary = theme.colors.text.secondary;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
            <KeyboardAvoidingView
                style={styles.backdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

                <View style={[styles.sheet, { backgroundColor: isDark ? '#121418' : '#F7F8FA' }]}>
                    <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                        <View style={styles.headerTitleRow}>
                            <Ionicons name="flash" size={20} color="#D9E4FF" />
                            <Text style={[styles.headerTitle, { color: textPrimary }]}>Challenge to a Debate</Text>
                        </View>
                        <Pressable onPress={handleClose} hitSlop={8}>
                            <Ionicons name="close" size={22} color={textSecondary} />
                        </Pressable>
                    </View>

                    {sent ? (
                        <View style={styles.sentState}>
                            <Ionicons name="paper-plane" size={36} color="#34D399" />
                            <Text style={[styles.sentTitle, { color: textPrimary }]}>Challenge sent!</Text>
                            <Text style={[styles.sentSubtitle, { color: textSecondary }]}>
                                {opponentName} will see your challenge and can accept or decline it.
                            </Text>
                            <Pressable style={styles.doneBtn} onPress={handleClose}>
                                <Text style={styles.doneBtnText}>Done</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.body}>
                            <Text style={[styles.label, { color: textSecondary }]}>
                                Opponent: <Text style={{ color: textPrimary, fontWeight: '700' }}>{opponentName}</Text>
                            </Text>

                            <TextInput
                                style={[styles.topicInput, {
                                    color: textPrimary,
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF',
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                }]}
                                placeholder="State the thesis you want to debate…"
                                placeholderTextColor={theme.colors.text.muted}
                                value={topic}
                                onChangeText={setTopic}
                                multiline
                                maxLength={280}
                            />

                            <View style={styles.suggestionsRow}>
                                {TOPIC_SUGGESTIONS.map(s => (
                                    <Pressable
                                        key={s}
                                        style={[styles.suggestionChip, { borderColor: isDark ? 'rgba(217,228,255,0.15)' : 'rgba(0,0,0,0.1)' }]}
                                        onPress={() => setTopic(s)}
                                    >
                                        <Text style={[styles.suggestionText, { color: textSecondary }]} numberOfLines={1}>{s}</Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Text style={[styles.label, { color: textSecondary, marginTop: 16 }]}>Your side:</Text>
                            <View style={styles.sideRow}>
                                {(['FOR', 'AGAINST'] as ChallengeSide[]).map(s => (
                                    <Pressable
                                        key={s}
                                        style={[
                                            styles.sideBtn,
                                            side === s && styles.sideBtnActive,
                                        ]}
                                        onPress={() => setSide(s)}
                                    >
                                        <Text style={[styles.sideBtnText, { color: side === s ? '#000' : textSecondary }]}>
                                            {s === 'FOR' ? 'Argue FOR' : 'Argue AGAINST'}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            {error && <Text style={styles.errorText}>{error}</Text>}

                            <Pressable
                                style={[styles.sendBtn, (sending || topic.trim().length < 10) && { opacity: 0.5 }]}
                                onPress={handleSend}
                                disabled={sending || topic.trim().length < 10}
                            >
                                {sending
                                    ? <ActivityIndicator size="small" color="#000" />
                                    : (
                                        <>
                                            <Ionicons name="flash" size={16} color="#000" />
                                            <Text style={styles.sendBtnText}>Send Challenge</Text>
                                        </>
                                    )}
                            </Pressable>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '800',
    },
    body: {
        padding: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
    },
    topicInput: {
        minHeight: 84,
        maxHeight: 140,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 15,
        textAlignVertical: 'top',
    },
    suggestionsRow: {
        marginTop: 10,
        gap: 6,
    },
    suggestionChip: {
        borderWidth: 1,
        borderRadius: 100,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
        maxWidth: '100%',
    },
    suggestionText: {
        fontSize: 12,
    },
    sideRow: {
        flexDirection: 'row',
        gap: 10,
    },
    sideBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(128,128,128,0.12)',
    },
    sideBtnActive: {
        backgroundColor: '#D9E4FF',
    },
    sideBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 12,
    },
    sendBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: '#D9E4FF',
    },
    sendBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#000',
    },
    sentState: {
        alignItems: 'center',
        padding: 32,
        gap: 10,
    },
    sentTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    sentSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    doneBtn: {
        marginTop: 12,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 100,
        backgroundColor: '#D9E4FF',
    },
    doneBtnText: {
        fontWeight: '800',
        color: '#000',
    },
});
