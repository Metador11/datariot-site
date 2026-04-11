
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentChats() {
    console.log('--- Checking for Recent Chat Creation ---');
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('chats')
        .select('id, created_at')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching chats:', error.message);
    } else if (data.length === 0) {
        console.log('No chats created in the last 5 minutes.');
    } else {
        console.log('Found', data.length, 'recent chats:');
        data.forEach(chat => console.log(`- ${chat.id} created at ${chat.created_at}`));
    }
}

checkRecentChats();
