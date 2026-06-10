// Fact-checking service for video debates.
// Currently a mock that simulates an AI API call (latency + deterministic
// results derived from the transcript). Swap `runFactCheck` internals for a
// real call via lib/ai/client.ts (callAI / fetchAnthropic) when ready.

export type FactVerdict = 'TRUE' | 'FALSE' | 'MISLEADING' | 'UNVERIFIABLE';

export interface FactCheckClaim {
    id: string;
    claim: string;
    verdict: FactVerdict;
    confidence: number; // 0-100
    source: string;
    sourceUrl: string;
    explanation: string;
}

export interface FactCheckReport {
    claims: FactCheckClaim[];
    summary: Record<FactVerdict, number>;
    checkedAt: string;
}

const MOCK_LATENCY_MS = { min: 1200, max: 2400 };

const VERDICT_POOL: FactVerdict[] = ['TRUE', 'FALSE', 'MISLEADING', 'UNVERIFIABLE', 'TRUE', 'MISLEADING'];

const MOCK_SOURCES = [
    { source: 'Reuters Fact Check', sourceUrl: 'https://www.reuters.com/fact-check/' },
    { source: 'Росстат — открытые данные', sourceUrl: 'https://rosstat.gov.ru/' },
    { source: 'Nature (peer-reviewed)', sourceUrl: 'https://www.nature.com/' },
    { source: 'Всемирный банк, Open Data', sourceUrl: 'https://data.worldbank.org/' },
    { source: 'WHO — официальная статистика', sourceUrl: 'https://www.who.int/data' },
    { source: 'Snopes', sourceUrl: 'https://www.snopes.com/' },
];

const MOCK_EXPLANATIONS: Record<FactVerdict, string[]> = {
    TRUE: [
        'Утверждение согласуется с данными первоисточника. Цифры и формулировка соответствуют опубликованной статистике.',
        'Независимые источники подтверждают это утверждение. Существенных расхождений не обнаружено.',
    ],
    FALSE: [
        'Утверждение противоречит официальным данным. Первоисточник приводит существенно иные цифры.',
        'Проверка показала, что заявленный факт не подтверждается ни одним из авторитетных источников.',
    ],
    MISLEADING: [
        'Факт частично верен, но вырван из контекста: опущены важные оговорки, меняющие смысл.',
        'Цифры близки к реальным, однако сравнение некорректно — данные относятся к разным периодам.',
    ],
    UNVERIFIABLE: [
        'Это оценочное суждение или прогноз — его невозможно проверить по открытым данным.',
        'Недостаточно открытых данных для проверки. Первоисточник утверждения не установлен.',
    ],
};

// Deterministic hash so the same transcript always yields the same mock report
function hashString(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}

function extractClaims(transcript: string): string[] {
    return transcript
        .split(/(?<=[.!?])\s+|\n+/)
        .map(s => s.trim())
        .filter(s => s.length >= 25)
        .slice(0, 5);
}

export async function runFactCheck(transcript: string): Promise<FactCheckReport> {
    const text = transcript.trim();
    if (!text) {
        throw new Error('Пустая стенограмма: нечего проверять.');
    }

    // Simulate network/AI latency
    const latency = MOCK_LATENCY_MS.min + Math.random() * (MOCK_LATENCY_MS.max - MOCK_LATENCY_MS.min);
    await new Promise(resolve => setTimeout(resolve, latency));

    const sentences = extractClaims(text);
    const claimTexts = sentences.length > 0 ? sentences : [text.slice(0, 200)];

    const claims: FactCheckClaim[] = claimTexts.map((claim, index) => {
        const seed = hashString(claim);
        const verdict = VERDICT_POOL[seed % VERDICT_POOL.length];
        const sourceInfo = MOCK_SOURCES[seed % MOCK_SOURCES.length];
        const explanations = MOCK_EXPLANATIONS[verdict];

        return {
            id: `claim-${index}-${seed}`,
            claim,
            verdict,
            confidence: 62 + (seed % 36), // 62–97
            ...sourceInfo,
            explanation: explanations[seed % explanations.length],
        };
    });

    const summary: Record<FactVerdict, number> = { TRUE: 0, FALSE: 0, MISLEADING: 0, UNVERIFIABLE: 0 };
    claims.forEach(c => { summary[c.verdict]++; });

    return { claims, summary, checkedAt: new Date().toISOString() };
}
