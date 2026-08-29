import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../client';
import { useAuth } from './useAuth';

// Daily streaks + quest progress, backed by user_daily_activity.
// Requires scripts/create_engagement_features.sql.

export interface DailyQuest {
    key: string;
    label: string;
    target: number;
    progress: number;
    done: boolean;
}

const TABLE_MISSING_CODES = ['42P01', 'PGRST205'];

function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

// Fire-and-forget activity recorder, usable outside React components.
export async function recordDailyActivity(kind: 'vote' | 'argument') {
    if (!supabase) return;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const day = todayStr();
        const col = kind === 'vote' ? 'votes' : 'arguments';

        const { data: existing } = await supabase
            .from('user_daily_activity')
            .select('votes, arguments')
            .eq('user_id', user.id)
            .eq('day', day)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('user_daily_activity')
                .update({ [col]: (existing as any)[col] + 1 })
                .eq('user_id', user.id)
                .eq('day', day);
        } else {
            await supabase
                .from('user_daily_activity')
                .insert({ user_id: user.id, day, [col]: 1 });
        }
    } catch {
        // Streaks must never break the action they piggyback on
    }
}

export function useStreak() {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);
    const [quests, setQuests] = useState<DailyQuest[]>([]);
    const [rating, setRating] = useState<number | null>(null);
    const [xp, setXp] = useState<number | null>(null);
    const [unavailable, setUnavailable] = useState(false);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!supabase || !user) return;
        setLoading(true);
        try {
            const [activityRes, ratingRes] = await Promise.all([
                supabase
                    .from('user_daily_activity')
                    .select('day, votes, arguments')
                    .eq('user_id', user.id)
                    .order('day', { ascending: false })
                    .limit(60),
                supabase
                    .from('user_ratings')
                    .select('rating, xp')
                    .eq('user_id', user.id)
                    .maybeSingle(),
            ]);

            if (activityRes.error) {
                if (TABLE_MISSING_CODES.includes((activityRes.error as any).code)) {
                    setUnavailable(true);
                    return;
                }
                throw activityRes.error;
            }

            const rows = activityRes.data || [];
            const days = new Set(rows.map((r: any) => r.day));

            // Streak: consecutive days ending today or yesterday
            let s = 0;
            const cursor = new Date();
            if (!days.has(cursor.toISOString().slice(0, 10))) {
                cursor.setDate(cursor.getDate() - 1); // today not yet active — count from yesterday
            }
            while (days.has(cursor.toISOString().slice(0, 10))) {
                s++;
                cursor.setDate(cursor.getDate() - 1);
            }
            setStreak(s);

            const today = rows.find((r: any) => r.day === todayStr()) as any;
            const votesToday = today?.votes || 0;
            const argsToday = today?.arguments || 0;
            setQuests([
                { key: 'vote3', label: 'Vote in 3 debates', target: 3, progress: Math.min(votesToday, 3), done: votesToday >= 3 },
                { key: 'arg1', label: 'Post 1 argument', target: 1, progress: Math.min(argsToday, 1), done: argsToday >= 1 },
                { key: 'active', label: 'Keep the streak alive', target: 1, progress: votesToday + argsToday > 0 ? 1 : 0, done: votesToday + argsToday > 0 },
            ]);

            const r = ratingRes.data as any;
            setRating(r?.rating ?? 1000);
            setXp(r?.xp ?? 500);
        } catch (err) {
            console.error('Error fetching streak:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) refresh();
    }, [user, refresh]);

    return { streak, quests, rating, xp, unavailable, loading, refresh };
}
