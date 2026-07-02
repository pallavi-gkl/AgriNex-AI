const { Client } = require('pg');

const connectionConfig = {
  host: 'db.kqmabbfjyrnvjcqkfxjy.supabase.co',
  port: 6543,
  user: 'postgres',
  password: 'Pallavi@837456',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function dropAllTriggers() {
  console.log("Connecting to Supabase PostgreSQL database...");
  const client = new Client(connectionConfig);
  
  try {
    await client.connect();
    console.log("✅ Connected successfully!");

    const sql = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      DROP FUNCTION IF EXISTS public.handle_new_user();
    `;

    console.log("Dropping on_auth_user_created trigger on auth.users...");
    await client.query(sql);
    console.log("✅ Successfully dropped trigger!");

  } catch (err) {
    console.error("❌ Failed to drop trigger:", err.message);
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
}

dropAllTriggers();
