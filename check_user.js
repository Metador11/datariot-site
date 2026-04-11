
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const userId = '7eb0e5c5-f4ed-4f0f-b092-0dedaf343b03';
    console.log('--- Checking User in Profiles ---');

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('User NOT found or error:', error.message);
    } else {
        console.log('User FOUND:', data);
    }
}

checkUser();
