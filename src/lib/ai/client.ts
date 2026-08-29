import OpenAI from 'openai';

// Initialize keys
const openAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const anthropicKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

if (!openAIKey) console.warn('[Orvelis] Missing EXPO_PUBLIC_OPENAI_API_KEY — AI will use fallback/mock');
if (!anthropicKey) console.warn('[Orvelis] Missing EXPO_PUBLIC_ANTHROPIC_API_KEY — AI will use fallback/mock');

// Lazy initializer for OpenAI to avoid module load-time crashes in browsers
let _openai: OpenAI | null = null;
export function getOpenAI(): OpenAI {
    if (!_openai) {
        _openai = new OpenAI({
            apiKey: openAIKey || 'dummy-key',
            dangerouslyAllowBrowser: true // Required for React Native / Expo
        });
    }
    return _openai;
}

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

// Helper for Fallback Logic with timeout
async function callAI<T>(
    firstProvider: () => Promise<T>,
    secondProvider: () => Promise<T>,
    context: string,
    timeoutMs: number = 15000
): Promise<T> {
    const withTimeout = <R>(fn: () => Promise<R>): Promise<R> => {
        return Promise.race([
            fn(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
            )
        ]);
    };

    try {
        console.log(`[Orvelis] Trying primary provider for ${context}...`);
        return await withTimeout(firstProvider);
    } catch (firstError: any) {
        console.warn(`[Orvelis] Primary provider failed for ${context}: ${firstError.message}. Trying fallback...`);

        try {
            return await withTimeout(secondProvider);
        } catch (secondError: any) {
            console.warn(`[Orvelis] All providers failed for ${context}: ${secondError.message}. Switching to mock data.`);
            throw secondError;
        }
    }
}

// Helper function for direct Anthropic API calls via fetch
async function fetchAnthropic(system: string, user: string, history: any[] = []) {
    if (!anthropicKey || anthropicKey === 'dummy-key') {
        throw new Error('No Anthropic API key configured');
    }

    // Build the message list. The Anthropic Messages API requires the first
    // message to be from the user and roles to alternate, so we drop any
    // leading assistant turns (e.g. the on-screen welcome message).
    const mapped = history
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
        }));
    while (mapped.length && mapped[0].role === 'assistant') {
        mapped.shift();
    }
    const messages = [...mapped, { role: 'user', content: user }];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
                // Required for direct browser (web) calls, otherwise CORS blocks the request.
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: 'claude-opus-4-8',
                max_tokens: 2048,
                system: system,
                messages: messages,
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Anthropic API Error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        return (data.content[0] as any).text;
    } finally {
        clearTimeout(timeoutId);
    }
}

// ========== ORVELIS SYSTEM PROMPT ==========
const ORVELIS_SYSTEM_PROMPT = `You are Orvelis — the AI assistant of Datariot, a platform for critical thinkers and creators.

How you answer:
- Answer the question directly in the first sentence. No preamble, no filler.
- Be short: 1-3 sentences by default. Go longer ONLY if the user explicitly asks for detail.
- Use plain, simple language. No dramatic or sci-fi phrasing, no roleplay jargon.
- Always reply in the same language the user writes in.
- Use markdown (bold, short lists) only when it genuinely makes the answer clearer.
- If you don't know something, say so in one sentence.`;

// Generate Daily Insight
export async function generateDailyInsight(): Promise<DailyInsight> {
    const systemPrompt = "You are Orvelis, the AI of Datariot. Generate a personalized daily insight. Be motivational but not cheesy. Output valid JSON only.";
    const userPrompt = "Generate today's focus insight. Return JSON with keys: score (0-100 number), status (2-3 word status like 'Flow State', 'Deep Work', 'Rising Momentum'), message (motivational 1-2 sentences, insightful not generic), trend (e.g. +10% or +5%).";

    // Anthropic Implementation
    const callClaude = async () => {
        const text = await fetchAnthropic(systemPrompt, userPrompt);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    };

    // OpenAI Implementation
    const callGPT = async () => {
        if (!openAIKey || openAIKey === 'dummy-key') {
            throw new Error('No OpenAI API key configured');
        }
        const completion = await getOpenAI().chat.completions.create({
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
        console.warn("[Orvelis] Using offline insight data.");
        // Generate slightly varied mock data based on time
        const hour = new Date().getHours();
        const mockInsights = [
            { score: 92, status: "Deep Focus", message: "Your neural pathways are primed for complex work. Dive into that challenging project — your brain is ready.", trend: "+15%" },
            { score: 78, status: "Rising Momentum", message: "Solid foundation today. Stack small wins and watch them compound into something meaningful.", trend: "+8%" },
            { score: 85, status: "Flow State", message: "You're in the zone. Protect this energy — minimize distractions and let the work speak.", trend: "+12%" },
            { score: 67, status: "Recharge Mode", message: "Your mind is processing yesterday's input. Light creative work or strategic planning will serve you best.", trend: "+5%" },
        ];
        return mockInsights[hour % mockInsights.length];
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
    const systemPrompt = "You are Orvelis, the truth engine of Datariot. Analyze content to separate signal from noise. Be incisive and honest. Output valid JSON only.";
    const userPrompt = "Analyze this video's content. Return JSON with keys: essence (core message in 1-2 sentences), manipulation (any bias, emotional manipulation, or logical fallacies detected), realValue (the genuinely useful information extracted).";

    // Anthropic Implementation
    const callClaude = async () => {
        const text = await fetchAnthropic(systemPrompt, userPrompt);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    };

    // OpenAI Implementation
    const callGPT = async () => {
        if (!openAIKey || openAIKey === 'dummy-key') {
            throw new Error('No OpenAI API key configured');
        }
        const completion = await getOpenAI().chat.completions.create({
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
        return await callAI(callGPT, callClaude, 'VideoAnalysis');
    } catch {
        console.warn("[Orvelis] Using offline analysis data.");
        return {
            essence: "This content explores independent thinking and the importance of verifying sources before forming opinions. The creator advocates for media literacy.",
            manipulation: "Uses emotional music scoring and rapid-cut editing to create urgency. Framing suggests a single 'correct' perspective exists, which is a simplification of complex issues.",
            realValue: "The core framework of cross-referencing information from 3+ ideologically different sources is genuinely valuable. Apply this to any news story for clearer understanding."
        };
    }
}

// Mock Response Generator (Offline Mode) — Enhanced
function generateMockResponse(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('привет') || lower.includes('здрав')) {
        return "Hi. I'm in offline mode right now, but I can still help. What's your question?";
    }

    if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('sleep') || lower.includes('устал')) {
        return "Take a 20-minute nap or a short walk. Rest improves focus more than pushing through.";
    }

    if (lower.includes('focus') || lower.includes('distract') || lower.includes('фокус') || lower.includes('отвлек')) {
        return "Try Pomodoro: 25 minutes of work, 5 minutes off. Put your phone out of reach — distance works better than willpower.";
    }

    if (lower.includes('plan') || lower.includes('goal') || lower.includes('todo') || lower.includes('цель') || lower.includes('план')) {
        return "Define what success looks like tomorrow, then write down the 3 concrete actions that get you there.";
    }

    if (lower.includes('stress') || lower.includes('anxiety') || lower.includes('overwhelm') || lower.includes('стресс')) {
        return "Try 4-7-8 breathing: inhale 4 seconds, hold 7, exhale 8, repeat 4 times. Then name your single biggest stressor — naming it helps.";
    }

    if (lower.includes('help') || lower.includes('what can') || lower.includes('помог') || lower.includes('что ты')) {
        return "I'm **Orvelis**, Datariot's AI assistant. I can:\n\n• **Chat** — answer your questions directly\n• **Insight** — generate your daily focus reading\n• **Analyze** — break down content and flag manipulation\n\nPick a tool below or just ask.";
    }

    if (lower.includes('interesting') || lower.includes('fact') || lower.includes('интерес')) {
        return "The Dunning-Kruger effect works both ways: beginners overestimate their skill, experts underestimate theirs. Feeling like an impostor is often a sign of competence.";
    }

    const defaults = [
        "I'm in offline mode, but I can still help. What exactly do you want to know?",
        "What's the core question you're trying to answer? Give me that and I'll be direct.",
        "Cloud connection is down, but ask away — I'll answer with what I have.",
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
}

// Chat Function
export async function chatWithAI(message: string, history: any[]): Promise<string> {
    // Anthropic Implementation
    const callClaude = async () => {
        return await fetchAnthropic(ORVELIS_SYSTEM_PROMPT, message, history);
    };

    // OpenAI Implementation
    const callGPT = async () => {
        if (!openAIKey || openAIKey === 'dummy-key') {
            throw new Error('No OpenAI API key configured');
        }
        const completion = await getOpenAI().chat.completions.create({
            messages: [
                { role: "system", content: ORVELIS_SYSTEM_PROMPT },
                ...history,
                { role: "user", content: message }
            ],
            model: "gpt-4o",
        });
        return completion.choices[0].message.content || "";
    };

    try {
        // Orvelis runs on Claude first, with OpenAI as a fallback
        return await callAI(callClaude, callGPT, 'Chat');
    } catch {
        console.warn("[Orvelis] Operating in offline mode.");
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
        if (!openAIKey || openAIKey === 'dummy-key') {
            throw new Error('No OpenAI API key configured');
        }
        const completion = await getOpenAI().chat.completions.create({
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
        console.warn("[Orvelis] Debate seeding failed. Using generic seed.");
        return {
            thesis: `Should we prioritize logic over emotion in the discussion of: ${contentHint}?`,
            arguments: [
                { side: 'FOR', text: "Logical consistency is the only way to reach a universal truth.", strength: 10 },
                { side: 'AGAINST', text: "Human experience is fundamentally emotional, ignoring it leads to flawed conclusions.", strength: 12 }
            ]
        };
    }
}

export interface DeepDiveData {
    summary: string;
    keyTerms: { term: string; definition: string }[];
    recommendations: Recommendation[];
}

export interface DeepDiveMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Generate AI Deep Dive
export async function generateDeepDive(videoTitle: string, videoDescription: string = ''): Promise<DeepDiveData> {
    const systemPrompt = "You are Orvelis, the educational AI core of Datariot. Generate a deep-dive educational package. Output valid JSON only.";
    const userPrompt = `Generate a detailed educational deep-dive for a video titled "${videoTitle}" (Description: "${videoDescription}").
Return a JSON object with:
- summary (a detailed 3-5 bullet points explaining the core concepts, theories, and ideas behind this topic)
- keyTerms (an array of exactly 3 objects: { term: string, definition: string } explaining important scientific, technical, or academic terms related to this topic)
- recommendations (an array of exactly 3 objects: { title: string, type: "Video" | "Article" | "Podcast", duration?: string, readTime?: string, reason: string } recommending further reading/listening. For Articles use 'readTime', for Video/Podcast use 'duration')`;

    const callClaude = async () => {
        const text = await fetchAnthropic(systemPrompt, userPrompt);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    };

    const callGPT = async () => {
        if (!openAIKey || openAIKey === 'dummy-key') {
            throw new Error('No OpenAI API key configured');
        }
        const completion = await getOpenAI().chat.completions.create({
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
        return await callAI(callGPT, callClaude, 'DeepDive');
    } catch {
        console.warn("[Orvelis] Deep dive generation failed. Using mock data based on title:", videoTitle);
        return {
            summary: `• This topic explores the core principles of ${videoTitle}.\n• It highlights the foundational components and how they interact in complex systems.\n• Understanding these dynamics allows for better critical analysis of current trends and research.\n• The discussion raises important questions about future developments and systemic limitations.`,
            keyTerms: [
                { term: "Heuristic", definition: "A mental shortcut that allows people to solve problems and make judgments quickly and efficiently." },
                { term: "First Principles", definition: "A foundational proposition or assumption that cannot be deduced from any other proposition or assumption." },
                { term: "Cognitive Load", definition: "The total amount of mental effort being used in the working memory." }
            ],
            recommendations: [
                { id: "rec1", title: "Thinking, Fast and Slow", type: "Article", readTime: "15 min read", reason: "Explores the dual-system brain model and how heuristics shape our logical judgment." },
                { id: "rec2", title: "First Principles Thinking Explained", type: "Video", duration: "12 min", reason: "A deep-dive video detailing how Elon Musk and historic thinkers deconstruct complex problems." },
                { id: "rec3", title: "Navigating Information Overload", type: "Podcast", duration: "45 min", reason: "An episode on managing cognitive loads and filtering signal from noise in a hyper-connected age." }
            ]
        };
    }
}

// Chat contextually about a video
export async function chatWithVideo(
    videoTitle: string,
    videoDescription: string,
    message: string,
    history: DeepDiveMessage[]
): Promise<string> {
    const videoSystemPrompt = `You are Orvelis — the AI assistant of Datariot.
You are answering viewer questions about the video: "${videoTitle}" (Description: "${videoDescription}").
How you answer:
- Answer the question directly in the first sentence, based on academic/scientific consensus.
- Be short: 1-3 sentences by default. Go longer only if the viewer asks for detail.
- Plain, simple language. Reply in the same language the viewer writes in.
- Use markdown (bold, short lists) only when it makes the answer clearer.`;

    const callClaude = async () => {
        return await fetchAnthropic(videoSystemPrompt, message, history);
    };

    const callGPT = async () => {
        if (!openAIKey || openAIKey === 'dummy-key') {
            throw new Error('No OpenAI API key configured');
        }
        const completion = await getOpenAI().chat.completions.create({
            messages: [
                { role: "system", content: videoSystemPrompt },
                ...history,
                { role: "user", content: message }
            ],
            model: "gpt-4o",
        });
        return completion.choices[0].message.content || "";
    };

    try {
        return await callAI(callGPT, callClaude, 'ChatWithVideo');
    } catch {
        console.warn("[Orvelis] Offline chat fallback for video:", videoTitle);
        return `Regarding **${videoTitle}**, that's a fascinating question. 
        
Under local operating conditions, I'd say the core principle involves analyzing the hidden assumptions in this video's topic. Usually, critical thinkers should verify the backing data and search for logical fallacies, such as false equivalency or correlation-саusation confusion.

What specific aspect of this topic would you like to deconstruct further?`;
    }
}

