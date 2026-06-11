// ELO rating helpers and league mapping for the debate arena.
// The authoritative calculation lives in the finalize_debate SQL function —
// these mirrors are for optimistic UI only.

export interface League {
    key: string;
    label: string;
    color: string;
    icon: 'shield-outline' | 'shield-half' | 'shield' | 'shield-checkmark' | 'trophy';
    min: number;
}

export const LEAGUES: League[] = [
    { key: 'bronze', label: 'BRONZE', color: '#CD7F32', icon: 'shield-outline', min: 0 },
    { key: 'silver', label: 'SILVER', color: '#C0C0C0', icon: 'shield-half', min: 900 },
    { key: 'gold', label: 'GOLD', color: '#FFD700', icon: 'shield', min: 1100 },
    { key: 'platinum', label: 'PLATINUM', color: '#7DD3FC', icon: 'shield-checkmark', min: 1300 },
    { key: 'master', label: 'DEBATE MASTER', color: '#D9E4FF', icon: 'trophy', min: 1500 },
];

export function leagueForRating(rating: number): League {
    let current = LEAGUES[0];
    for (const l of LEAGUES) {
        if (rating >= l.min) current = l;
    }
    return current;
}

export function nextLeague(rating: number): League | null {
    for (const l of LEAGUES) {
        if (rating < l.min) return l;
    }
    return null;
}

export function expectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function eloDelta(ratingA: number, ratingB: number, scoreA: 0 | 0.5 | 1, k = 32): number {
    return Math.round(k * (scoreA - expectedScore(ratingA, ratingB)));
}
