require('dotenv').config();
const fs = require('fs');

async function fetchSchema() {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error("Missing credentials");
        return;
    }

    const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
    const data = await res.json();

    // Write just the paths (endpoints) which include tables and rpcs
    fs.writeFileSync('db_schema.json', JSON.stringify(Object.keys(data.paths), null, 2));
    console.log("Written schema to db_schema.json");
}

fetchSchema();
