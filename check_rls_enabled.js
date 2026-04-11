
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log('--- Checking RLS Status ---');

    // We can't query pg_tables directly, but we can try an insert with the anon key 
    // and see if it fails with 42501 (Forbidden). If it succeeds, RLS might be off.

    const anonClient = createClient(supabaseUrl, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

    console.log('Testing INSERT on chats with ANON key (should fail if RLS is ON):');
    const { error } = await anonClient.from('chats').insert({ type: 'direct' });

    if (error && error.code === '42501') {
        console.log('RLS is ON (Correct): Received 42501 error.');
    } else if (error) {
        console.log('Received other error:', error);
    } else {
        console.log('RLS might be OFF or BROAD: Insert succeeded with ANON key.');
    }
}

checkRLS();
