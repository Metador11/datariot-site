require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function test() {
    const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

    // get one comment
    const { data: comment, error: cerr } = await supabase.from('comments').select('*').limit(1);
    console.log("Comment schema:", comment && comment[0] ? Object.keys(comment[0]) : cerr);

    // get one post
    const { data: post, error: perr } = await supabase.from('posts').select('*').limit(1);
    console.log("Post schema:", post && post[0] ? Object.keys(post[0]) : perr);
}
test();
