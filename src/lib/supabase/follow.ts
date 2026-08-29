import { supabase } from './client';

// The schema dump defines public.followers (follower_id, followed_id), but
// older code wrote to a `follows` table with `following_id` — which made
// every follow action fail silently. This helper targets `followers` first
// and falls back to `follows` so it works on either schema generation.

async function tryBoth<T>(
    primary: () => PromiseLike<{ error: any; data?: T }>,
    fallback: () => PromiseLike<{ error: any; data?: T }>,
): Promise<{ error: any; data?: T }> {
    const first = await primary();
    if (!first.error) return first;
    // 42P01 = undefined_table, 42703 = undefined_column
    if (['42P01', '42703', 'PGRST205'].includes(first.error?.code)) {
        return await fallback();
    }
    return first;
}

export async function followUser(followerId: string, targetId: string): Promise<{ error: any }> {
    if (!supabase) return { error: new Error('No client') };
    return tryBoth(
        () => supabase.from('followers').insert({ follower_id: followerId, followed_id: targetId }),
        () => supabase.from('follows').insert({ follower_id: followerId, following_id: targetId }),
    );
}

export async function unfollowUser(followerId: string, targetId: string): Promise<{ error: any }> {
    if (!supabase) return { error: new Error('No client') };
    return tryBoth(
        () => supabase.from('followers').delete().eq('follower_id', followerId).eq('followed_id', targetId),
        () => supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', targetId),
    );
}

export async function isFollowingUser(followerId: string, targetId: string): Promise<boolean> {
    if (!supabase) return false;
    const result = await tryBoth<any[]>(
        () => supabase.from('followers').select('id').eq('follower_id', followerId).eq('followed_id', targetId).limit(1),
        () => supabase.from('follows').select('id').eq('follower_id', followerId).eq('following_id', targetId).limit(1),
    );
    return !result.error && !!result.data && result.data.length > 0;
}
