require('dotenv').config();
const fs = require('fs');

async function fetchFullSchema() {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error("Missing credentials");
        return;
    }

    try {
        const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
        const data = await res.json();
        fs.writeFileSync('full_db_schema.json', JSON.stringify(data, null, 2));
        console.log("Written full schema to full_db_schema.json");
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

fetchFullSchema();
