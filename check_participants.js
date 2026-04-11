
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkParticipants() {
    const userId = '7eb0e5c5-f4ed-4f0f-b092-0dedaf343b03';
    console.log('--- Checking Participants for User:', userId, '---');

    const { data, error } = await supabase
        .from('chat_participants')
        .select('chat_id, joined_at')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

    if (error) {
        console.error('Error fetching participants:', error.message);
    } else if (data.length === 0) {
        console.log('User is not a participant in any chats.');
    } else {
        console.log('User is in', data.length, 'chats:');
        data.slice(0, 5).forEach(p => console.log(`- Chat ${p.chat_id} joined at ${p.joined_at}`));
    }
}

checkParticipants();
