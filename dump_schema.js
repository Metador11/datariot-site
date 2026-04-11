require('dotenv').config();
async function dump() {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    console.log("URL:", url);
    const res = await fetch(url + '/rest/v1/?apikey=' + key);
    const data = await res.json();
    if (data.definitions) {
        console.log("CHATS columns:", Object.keys(data.definitions.chats.properties));
        console.log("MESSAGES columns:", Object.keys(data.definitions.messages.properties));
        console.log("PARTICIPANTS columns:", Object.keys(data.definitions.chat_participants.properties));
    } else {
        console.log("No definitions found");
    }
}
dump();
