const { Client } = require('pg');

const connectionConfig = {
  host: 'db.kqmabbfjyrnvjcqkfxjy.supabase.co',
  port: 6543,
  user: 'postgres',
  password: 'Pallavi@837456',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function dropTrigger() {
  console.log("Connecting to Supabase PostgreSQL database to clean up...");
  const client = new Client(connectionConfig);
  
  try {
    await client.connect();
    console.log("✅ Connected successfully!");

    const sql = `
      DROP TRIGGER IF EXISTS tr_auto_confirm_user ON auth.users;
      DROP FUNCTION IF EXISTS public.auto_confirm_user();
    `;

    console.log("Dropping the auto-confirm trigger and function...");
    await client.query(sql);
    console.log("✅ Successfully dropped trigger and function!");

  } catch (err) {
    console.error("❌ Failed to drop trigger:", err.message);
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
}

dropTrigger();
