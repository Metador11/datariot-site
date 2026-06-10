import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    ScrollView,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Theme/ThemeProvider';
import { runFactCheck, FactCheckReport, FactCheckClaim, FactVerdict } from '@lib/ai/factCheck';

interface FactCheckModalProps {
    visible: boolean;
    transcript: string;
    onClose: () => void;
}

const VERDICT_META: Record<FactVerdict, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
    TRUE: { label: 'ПОДТВЕРЖДЕНО', color: '#00C853', icon: 'checkmark-circle' },
    FALSE: { label: 'ОПРОВЕРГНУТО', color: '#EF4444', icon: 'close-circle' },
    MISLEADING: { label: 'ВВОДИТ В ЗАБЛУЖДЕНИЕ', color: '#FFAB00', icon: 'alert-circle' },
    UNVERIFIABLE: { label: 'НЕ ПРОВЕРЯЕМО', color: '#90A4AE', icon: 'help-circle' },
};

const LOADING_STEPS = [
    'Извлекаем утверждения из стенограммы…',
    'Сверяем факты с источниками…',
    'Формируем вердикты…',
];

const ClaimCard = React.memo(function ClaimCard({ item, isDark, textPrimary, textSecondary }: {
    item: FactCheckClaim;
    isDark: boolean;
    textPrimary: string;
    textSecondary: string;
}) {
    const meta = VERDICT_META[item.verdict];

    return (
        <View style={[styles.claimCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF' }]}>
            <View style={[styles.claimIndicator, { backgroundColor: meta.color }]} />
            <View style={styles.claimBody}>
                <View style={styles.claimHeader}>
                    <View style={[styles.verdictBadge, { backgroundColor: `${meta.color}22` }]}>
                        <Ionicons name={meta.icon} size={14} color={meta.color} />
                        <Text style={[styles.verdictText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                    <Text style={[styles.confidenceText, { color: textSecondary }]}>{item.confidence}%</Text>
                </View>

                <Text style={[styles.claimText, { color: textPrimary }]}>«{item.claim}»</Text>
                <Text style={[styles.explanationText, { color: textSecondary }]}>{item.explanation}</Text>

                <Pressable
                    style={styles.sourceRow}
                    onPress={() => Linking.openURL(item.sourceUrl).catch(() => { })}
                >
                    <Ionicons name="link-outline" size={14} color="#D9E4FF" />
                    <Text style={styles.sourceText} numberOfLines={1}>{item.source}</Text>
                </Pressable>
            </View>
        </View>
    );
});

export function FactCheckModal({ visible, transcript, onClose }: FactCheckModalProps) {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [report, setReport] = useState<FactCheckReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const requestIdRef = useRef(0);

    const check = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        setError(null);
        setReport(null);
        setLoadingStep(0);

        const stepTimer = setInterval(() => {
            setLoadingStep(prev => Math.min(prev + 1, LOADING_STEPS.length - 1));
        }, 800);

        try {
            const result = await runFactCheck(transcript);
            if (requestId === requestIdRef.current) setReport(result);
        } catch (err: any) {
            if (requestId === requestIdRef.current) {
                setError(err?.message || 'Не удалось проверить факты. Попробуйте ещё раз.');
            }
        } finally {
            clearInterval(stepTimer);
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [transcript]);

    useEffect(() => {
        if (visible) {
            check();
        } else {
            // Invalidate in-flight request so a stale response can't render later
            requestIdRef.current++;
            setReport(null);
            setError(null);
        }
    }, [visible, check]);

    const textPrimary = theme.colors.text.primary;
    const textSecondary = theme.colors.text.secondary;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <View style={[styles.sheet, { backgroundColor: isDark ? '#121418' : '#F7F8FA' }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                        <View style={styles.headerTitleRow}>
                            <Ionicons name="shield-checkmark" size={20} color="#D9E4FF" />
                            <Text style={[styles.headerTitle, { color: textPrimary }]}>Проверка фактов</Text>
                        </View>
                        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                            <Ionicons name="close" size={22} color={textSecondary} />
                        </Pressable>
                    </View>

                    {loading && (
                        <View style={styles.centerState}>
                            <ActivityIndicator size="large" color="#D9E4FF" />
                            <Text style={[styles.loadingStepText, { color: textSecondary }]}>
                                {LOADING_STEPS[loadingStep]}
                            </Text>
                        </View>
                    )}

                    {!loading && error && (
                        <View style={styles.centerState}>
                            <Ionicons name="cloud-offline-outline" size={36} color="#EF4444" />
                            <Text style={[styles.errorText, { color: textPrimary }]}>{error}</Text>
                            <Pressable style={styles.retryBtn} onPress={check}>
                                <Text style={styles.retryBtnText}>Повторить</Text>
                            </Pressable>
                        </View>
                    )}

                    {!loading && !error && report && (
                        <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
                            {/* Summary */}
                            <View style={styles.summaryRow}>
                                {(Object.keys(VERDICT_META) as FactVerdict[])
                                    .filter(v => report.summary[v] > 0)
                                    .map(verdict => (
                                        <View
                                            key={verdict}
                                            style={[styles.summaryChip, { backgroundColor: `${VERDICT_META[verdict].color}1A` }]}
                                        >
                                            <Ionicons name={VERDICT_META[verdict].icon} size={13} color={VERDICT_META[verdict].color} />
                                            <Text style={[styles.summaryChipText, { color: VERDICT_META[verdict].color }]}>
                                                {report.summary[verdict]}
                                            </Text>
                                        </View>
                                    ))}
                                <View style={styles.flexSpacer} />
                                <Text style={[styles.summaryTotal, { color: textSecondary }]}>
                                    Утверждений: {report.claims.length}
                                </Text>
                            </View>

                            {report.claims.map(claim => (
                                <ClaimCard
                                    key={claim.id}
                                    item={claim}
                                    isDark={isDark}
                                    textPrimary={textPrimary}
                                    textSecondary={textSecondary}
                                />
                            ))}

                            <Text style={[styles.disclaimer, { color: theme.colors.text.muted }]}>
                                Анализ выполнен ИИ и может содержать неточности. Проверяйте первоисточники.
                            </Text>
                        </ScrollView>
                    )}
                </View>
            </View>
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
        maxHeight: '85%',
        minHeight: '50%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
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
    closeBtn: {
        padding: 4,
    },
    centerState: {
        paddingVertical: 60,
        paddingHorizontal: 32,
        alignItems: 'center',
        gap: 16,
    },
    loadingStepText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
    },
    retryBtn: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#D9E4FF',
    },
    retryBtnText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 14,
    },
    resultsContent: {
        padding: 16,
        paddingBottom: 32,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    summaryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    summaryChipText: {
        fontSize: 12,
        fontWeight: '800',
    },
    summaryTotal: {
        fontSize: 12,
        fontWeight: '600',
    },
    flexSpacer: {
        flex: 1,
    },
    claimCard: {
        flexDirection: 'row',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.1)',
    },
    claimIndicator: {
        width: 4,
    },
    claimBody: {
        flex: 1,
        padding: 14,
    },
    claimHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    verdictBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        flexShrink: 1,
    },
    verdictText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    confidenceText: {
        fontSize: 12,
        fontWeight: '700',
    },
    claimText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    explanationText: {
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 10,
    },
    sourceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    sourceText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#D9E4FF',
        textDecorationLine: 'underline',
    },
    disclaimer: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 16,
    },
});
