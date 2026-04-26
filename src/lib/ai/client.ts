import OpenAI from 'openai';

// Initialize OpenAI client
// We use EXPO_PUBLIC_ prefix for Expo to inject these at build time
const openAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const anthropicKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

if (!openAIKey) console.warn('Missing EXPO_PUBLIC_OPENAI_API_KEY');
if (!anthropicKey) console.warn('Missing EXPO_PUBLIC_ANTHROPIC_API_KEY');

export const openai = new OpenAI({
    apiKey: openAIKey || 'dummy-key',
    dangerouslyAllowBrowser: true // Required for React Native / Expo
});

export interface DailyInsight {
    score: number;
    status: string;
    message: string;
    trend: string;
}

export interface Recommendation {
    id: string;
    title: string;
    type: 'Video' | 'Article' | 'Podcast';
    duration?: string;
    readTime?: string;
    reason: string;
    image?: string;
}

// Helper for Fallback Logic
async function callAI<T>(
    firstProvider: () => Promise<T>,
    secondProvider: () => Promise<T>,
    context: string
): Promise<T> {
    try {
        console.log(`[AI] Trying First Provider (OpenAI) for ${context}...`);
        // Note: Validation of specific keys should ideally rely on the caller or be checked here if we know which propertie is which.
        // For now, we assume implicit checks in the callback or we just try.
        return await firstProvider();
    } catch (firstError: any) {
        console.warn(`[AI] First provider failed for ${context}. Falling back to Second Provider (Anthropic).`, firstError);

        try {
            return await secondProvider();
        } catch (secondError: any) {
            console.warn(`[AI] All providers failed for ${context}. Switching to mock data.`, secondError);
            throw secondError;
        }
    }
}

// Helper function for direct Anthropic API calls via fetch
async function fetchAnthropic(system: string, user: string, history: any[] = []) {
    const messages = history.filter(m => m.role !== 'system').map(m => ({
        role: m.role,
        content: m.content
    }));
    messages.push({ role: 'user', content: user });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': anthropicKey || '',
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            system: system,
            messages: messages
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Anthropic API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return (data.content[0] as any).text;
}

// Generate Daily Insight
export async function generateDailyInsight(): Promise<DailyInsight> {
    const systemPrompt = "You are an AI assistant for personal growth and focus. Generate a JSON summary of the user's daily focus status.";
    const userPrompt = "Generate a daily insight. Return JSON with keys: score (0-100), status (short string), message (motivational 1-2 sentences), trend (e.g. +10%).";

    // Anthropic Implementation
    const callClaude = async () => {
        const text = await fetchAnthropic(systemPrompt, userPrompt);
        // Manual JSON parsing
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    };

    // OpenAI Implementation
    const callGPT = async () => {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "gpt-4o",
            response_format: { type: "json_object" }
        });
        const content = completion.choices[0].message.content;
        return content ? JSON.parse(content) : null;
    };

    try {
        return await callAI(callClaude, callGPT, 'DailyInsight');
    } catch {
        console.warn("[AI] Quota exceeded or API unavailable. Using mock data.");
        return {
            score: 85,
            status: "Flow State",
            message: "You're crushing it today! Keep up the momentum and stay focused on your goals.",
            trend: "+12%"
        };
    }
}

// Generate Recommendations (Mock for now or implement if needed)
export async function getRecommendations(): Promise<Recommendation[]> {
    return [];
}

export interface VideoAnalysis {
    essence: string;
    manipulation: string;
    realValue: string;
}

// Generate Video Analysis
export async function generateVideoAnalysis(): Promise<VideoAnalysis> {
    const systemPrompt = "You are Orvelis, an AI that analyzes video content to find truth. Identify the essence, any manipulation, and the real value.";
    const userPrompt = "Analyze this video context. Return JSON with keys: essence (summary), manipulation (detection of bias/tactics), realValue (actual useful info).";

    // Anthropic Implementation
    const callClaude = async () => {
        const text = await fetchAnthropic(systemPrompt, userPrompt);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    };

    // OpenAI Implementation
    const callGPT = async () => {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "gpt-4o",
            response_format: { type: "json_object" }
        });
        const content = completion.choices[0].message.content;
        return content ? JSON.parse(content) : null;
    };

    try {
        // Prioritize OpenAI (ChatGPT) as requested by user
        return await callAI(callGPT, callClaude, 'VideoAnalysis');
    } catch {
        console.warn("[AI] Quota exceeded or API unavailable. Using mock analysis.");
        return {
            essence: "This video discusses independent thinking and the importance of verifying sources before forming an opinion.",
            manipulation: "Uses emotional music and rapid cuts to create a sense of urgency and anxiety, potentially overriding critical analysis.",
            realValue: "The core tip about cross-referencing news from three different political spectrums is a valuable takeaway for media literacy."
        };
    }
}

// Mock Response Generator (Offline Mode)
function generateMockResponse(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        return "Hello! I'm currently running in low-power mode (offline), but I'm still here to help you focus. What's on your mind?";
    }

    if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('sleep')) {
        return "It sounds like you need a recharge. Remember, rest is productive too. Have you considered taking a 20-minute power nap or a short walk?";
    }

    if (lower.includes('focus') || lower.includes('distract')) {
        return "To regain focus, try the Pomodoro technique: 25 minutes of work followed by a 5-minute break. Shall we start a timer together?";
    }

    if (lower.includes('plan') || lower.includes('goal') || lower.includes('todo')) {
        return "Planning is the first step to success. Try breaking your big goal down into 3 small, actionable tasks you can do right now.";
    }

    if (lower.includes('stress') || lower.includes('anxiety') || lower.includes('overwhelm')) {
        return "Take a deep breath. Inhale for 4 seconds, hold for 7, and exhale for 8. You've got this. What's the one thing causing the most stress right now?";
    }

    const defaults = [
        "I'm listening. Even without my full cloud brain, I'm here to support your journey.",
        "That's interesting. Tell me more about how that impacts your daily focus.",
        "Keep going. Consistency is key to long-term growth.",
        "I'm currently offline, but I believe in your ability to figure this out. What's your next step?",
        "Focus on the present moment. What is the most important thing you can do right now?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
}

// Chat Function
export async function chatWithAI(message: string, history: any[]): Promise<string> {
    const systemPrompt = "You are Orvelis, a helpful AI assistant for focus and growth. Be concise and insightful.";

    // Anthropic Implementation
    const callClaude = async () => {
        return await fetchAnthropic(systemPrompt, message, history);
    };

    // OpenAI Implementation
    const callGPT = async () => {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...history,
                { role: "user", content: message }
            ],
            model: "gpt-4o",
            // response_format: { type: "json_object" } // Chat is usually text, not JSON
        });
        return completion.choices[0].message.content || "";
    };

    try {
        // Prioritize OpenAI (ChatGPT) as requested by user
        return await callAI(callGPT, callClaude, 'Chat');
    } catch {
        console.warn("[AI] Quota exceeded or API unavailable. Using mock response.");
        return generateMockResponse(message);
    }
}

export interface DebateSeed {
    thesis: string;
    arguments: { side: 'FOR' | 'AGAINST'; text: string; strength: number }[];
}

// Generate Debate Seed (Thesis + Arguments)
export async function generateDebateSeed(contentHint: string): Promise<DebateSeed> {
    const systemPrompt = "You are the Datariot Logic Oracle. Analyze a topic and generate a controversial but logical 'Post Thesis' and 4 balanced arguments (2 FOR, 2 AGAINST). Output JSON.";
    const userPrompt = `Topic/Video info: "${contentHint}". Return JSON with: thesis (1 sentence, provocative), arguments (array of {side, text, strength}). Strength should be 5-20.`;

    const callGPT = async () => {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "gpt-4o",
            response_format: { type: "json_object" }
        });
        const content = completion.choices[0].message.content;
        return content ? JSON.parse(content) : null;
    };

    try {
        return await callGPT();
    } catch {
        console.warn("[AI] Debate seeding failed. Using generic seed.");
        return {
            thesis: `Should we prioritize logic over emotion in the discussion of: ${contentHint}?`,
            arguments: [
                { side: 'FOR', text: "Logical consistency is the only way to reach a universal truth.", strength: 10 },
                { side: 'AGAINST', text: "Human experience is fundamentally emotional, ignoring it leads to flawed conclusions.", strength: 12 }
            ]
        };
    }
}
