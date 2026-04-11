import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, KeyboardAvoidingView, Platform, FlatList, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@design-system/theme';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../components/Theme/ThemeProvider';
import { generateVideoAnalysis, chatWithAI, generateDailyInsight, VideoAnalysis, DailyInsight } from '../../lib/ai/client';

const { width } = Dimensions.get('window');

type ToolType = 'chat' | 'insight' | 'analyze';

interface Message {
    id: string;
    role: 'user' | 'system' | 'assistant';
    content: string;
    type?: 'text' | 'analysis' | 'insight'; // structured data
    data?: any;
}

// Example prompts for first-time users
const EXAMPLE_PROMPTS = [
    { icon: '💡', text: 'Give me my daily insight', tool: 'insight' as ToolType },
    { icon: '🔍', text: 'Analyze a video', tool: 'analyze' as ToolType },
    { icon: '💬', text: 'What can you help me with?', tool: 'chat' as ToolType },
    { icon: '✨', text: 'Tell me something interesting', tool: 'chat' as ToolType },
];

export default function AIScreen() {
    // Chat State
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'assistant',
            content: 'I am Orvelis. Select a tool below or just start talking.',
            type: 'text'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedTool, setSelectedTool] = useState<ToolType>('chat');

    // Onboarding State
    const [showSuggestions, setShowSuggestions] = useState(true);

    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    // Refs
    const flatListRef = useRef<FlatList>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleExamplePrompt = (prompt: typeof EXAMPLE_PROMPTS[0]) => {
        setShowSuggestions(false);
        setSelectedTool(prompt.tool);

        if (prompt.tool === 'chat') {
            setInputText(prompt.text);
        } else {
            handleToolSelect(prompt.tool);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        // Hide suggestions after first message
        setShowSuggestions(false);

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputText, type: 'text' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);
        scrollToBottom();

        try {
            // Context mapping based on selected tool? 
            // For now, simple chat updates. If specific tool logic is needed, we add it.
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await chatWithAI(userMsg.content, history);

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: response,
                type: 'text'
            }]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    };

    const handleToolSelect = async (tool: ToolType) => {
        setSelectedTool(tool);

        if (tool === 'insight') {
            setLoading(true);
            try {
                const insight = await generateDailyInsight();
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: 'Daily Insight Generated',
                    type: 'insight',
                    data: insight
                }]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
                scrollToBottom();
            }
        } else if (tool === 'analyze') {
            // Mocking analysis trigger for current context
            setLoading(true);
            try {
                const analysis = await generateVideoAnalysis();
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: 'Analysis Complete',
                    type: 'analysis',
                    data: analysis
                }]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
                scrollToBottom();
            }
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        if (item.type === 'insight') {
            const insight = item.data as DailyInsight;
            return (
                <Animated.View entering={FadeInUp.springify()} style={[styles.messageBubble, styles.aiBubble, styles.cardBubble, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="lightning-bolt" size={20} color={theme.colors.secondary.DEFAULT} />
                        <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>DAILY INSIGHT</Text>
                    </View>
                    <Text style={[styles.insightScore, { color: theme.colors.text.primary }]}>{insight.score}</Text>
                    <Text style={styles.insightStatus}>{insight.status}</Text>
                    <Text style={[styles.cardText, { color: theme.colors.text.secondary }]}>{insight.message}</Text>
                </Animated.View>
            );
        }

        if (item.type === 'analysis') {
            const analysis = item.data as VideoAnalysis;
            return (
                <Animated.View entering={FadeInUp.springify()} style={[styles.messageBubble, styles.aiBubble, styles.cardBubble, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
                    <View style={styles.cardHeader}>
                        <Feather name="eye" size={20} color={theme.colors.primary.light} />
                        <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>TRUTH ANALYSIS</Text>
                    </View>

                    <View style={styles.analysisSection}>
                        <Text style={styles.analysisLabel}>ESSENCE</Text>
                        <Text style={[styles.cardText, { color: theme.colors.text.secondary }]}>{analysis.essence}</Text>
                    </View>
                    <View style={styles.analysisSection}>
                        <Text style={[styles.analysisLabel, { color: '#F87171' }]}>MANIPULATION</Text>
                        <Text style={[styles.cardText, { color: theme.colors.text.secondary }]}>{analysis.manipulation}</Text>
                    </View>
                    <View style={styles.analysisSection}>
                        <Text style={[styles.analysisLabel, { color: '#4ADE80' }]}>REAL VALUE</Text>
                        <Text style={[styles.cardText, { color: theme.colors.text.secondary }]}>{analysis.realValue}</Text>
                    </View>
                </Animated.View>
            );
        }

        return (
            <View style={[
                styles.messageBubble,
                item.role === 'user' ? [styles.userBubble, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }] : styles.aiBubble
            ]}>
                <Text style={[styles.messageText, { color: item.role === 'user' ? theme.colors.text.primary : theme.colors.text.secondary }]}>{item.content}</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { backgroundColor: theme.colors.background.primary }]}>
                    <Text style={styles.headerTitle}>Orvelis AI</Text>
                    {/* Add more header controls if needed */}
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatList}
                    renderItem={renderMessage}
                    showsVerticalScrollIndicator={false}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                    style={[styles.keyboardArea, { backgroundColor: theme.colors.background.primary }]}
                >
                    {/* Example Prompt Suggestions */}
                    {showSuggestions && messages.length <= 1 && (
                        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.suggestionsContainer}>
                            <Text style={[styles.suggestionsTitle, { color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }]}>Try asking:</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.suggestionsList}
                            >
                                {EXAMPLE_PROMPTS.map((prompt, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.suggestionChip, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)' }]}
                                        onPress={() => handleExamplePrompt(prompt)}
                                    >
                                        <Text style={styles.suggestionIcon}>{prompt.icon}</Text>
                                        <Text style={[styles.suggestionText, { color: theme.colors.text.primary }]}>{prompt.text}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </Animated.View>
                    )}

                    {loading && <Text style={styles.typingIndicator}>Orvelis is thinking...</Text>}

                    {/* Tool Selector */}
                    <View style={styles.toolSelector}>
                        <TouchableOpacity
                            style={[styles.toolButton, selectedTool === 'chat' && styles.toolButtonActive]}
                            onPress={() => handleToolSelect('chat')}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color={selectedTool === 'chat' ? theme.colors.text.primary : theme.colors.text.muted} />
                            <Text style={[styles.toolText, selectedTool === 'chat' && [styles.toolTextActive, { color: theme.colors.text.primary }]]}>Chat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.toolButton, selectedTool === 'insight' && styles.toolButtonActive]}
                            onPress={() => handleToolSelect('insight')}
                        >
                            <Ionicons name="bulb-outline" size={20} color={selectedTool === 'insight' ? theme.colors.text.primary : theme.colors.text.muted} />
                            <Text style={[styles.toolText, selectedTool === 'insight' && [styles.toolTextActive, { color: theme.colors.text.primary }]]}>Insight</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.toolButton, selectedTool === 'analyze' && styles.toolButtonActive]}
                            onPress={() => handleToolSelect('analyze')}
                        >
                            <Ionicons name="scan-outline" size={20} color={selectedTool === 'analyze' ? theme.colors.text.primary : theme.colors.text.muted} />
                            <Text style={[styles.toolText, selectedTool === 'analyze' && [styles.toolTextActive, { color: theme.colors.text.primary }]]}>Analyze</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Input Area */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text.primary }]}
                            placeholder={selectedTool === 'chat' ? "Ask anything..." : selectedTool === 'insight' ? "Generating insight..." : "Analyzing context..."}
                            placeholderTextColor={theme.colors.text.muted}
                            value={inputText}
                            onChangeText={setInputText}
                            editable={selectedTool === 'chat'}
                        />
                        <TouchableOpacity onPress={handleSendMessage} style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }, { backgroundColor: theme.colors.text.primary }]} disabled={!inputText.trim()}>
                            <Ionicons name="arrow-up" size={24} color={theme.colors.background.primary} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.3)',
        shadowColor: '#60A5FA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    headerTitle: {
        color: '#60A5FA', // Blue accent
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 4, // Wide spacing for terminal look
        marginBottom: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        textTransform: 'uppercase',
    },
    chatList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 20,
    },
    messageBubble: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        maxWidth: '85%',
    },
    userBubble: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: 'transparent',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    cardBubble: {
        width: '95%',
        maxWidth: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
    },
    messageText: {
        color: '#E2E8F0',
        fontSize: 16,
        lineHeight: 24,
    },
    keyboardArea: {
        width: '100%',
        backgroundColor: '#000', // Match container
        // Removed borderTop for cleaner look
    },
    typingIndicator: {
        marginLeft: 24,
        marginTop: 8,
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontStyle: 'italic',
    },
    // Tool Selector
    toolSelector: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    toolButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        gap: 6,
    },
    toolButtonActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    toolText: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
    },
    toolTextActive: {
        color: '#FFF',
    },
    // Input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 4,
        // Slightly lower than before (was 95/85)
        paddingBottom: Platform.OS === 'ios' ? 55 : 65,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        color: '#FFF',
        fontSize: 16,
        marginRight: 12,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Card Styles
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    cardTitle: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
    },
    insightScore: {
        fontSize: 48,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
    },
    insightStatus: {
        fontSize: 18,
        color: theme.colors.secondary.DEFAULT,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 15,
        lineHeight: 22,
    },
    analysisSection: {
        marginBottom: 16,
    },
    analysisLabel: {
        color: '#60A5FA',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    // Suggestion Chips
    suggestionsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'transparent', // Make it transparent as per new design
        // Removed borderTop as it's now inside the list
    },
    suggestionsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    suggestionsList: {
        gap: 12,
        paddingRight: 20,
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        gap: 8,
    },
    suggestionIcon: {
        fontSize: 18,
    },
    suggestionText: {
        fontSize: 14,
        color: '#E2E8F0',
        fontWeight: '500',
    },
});
