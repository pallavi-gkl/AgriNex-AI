const { Client } = require('pg');

const connectionConfig = {
  host: 'db.kqmabbfjyrnvjcqkfxjy.supabase.co',
  port: 6543,
  user: 'postgres',
  password: 'Pallavi@837456',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function addAutoConfirmTrigger() {
  console.log("Connecting to Supabase PostgreSQL database...");
  const client = new Client(connectionConfig);
  
  try {
    await client.connect();
    console.log("✅ Connected successfully!");

    const sql = `
      -- Trigger function to auto-confirm users
      CREATE OR REPLACE FUNCTION public.auto_confirm_user()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
        NEW.confirmed_at = COALESCE(NEW.confirmed_at, NOW());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Drop trigger if exists
      DROP TRIGGER IF EXISTS tr_auto_confirm_user ON auth.users;

      -- Create trigger BEFORE INSERT
      CREATE TRIGGER tr_auto_confirm_user
        BEFORE INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.auto_confirm_user();
    `;

    console.log("Executing SQL to add auto-confirm trigger on auth.users...");
    await client.query(sql);
    console.log("✅ Auto-confirm trigger added successfully!");

  } catch (err) {
    console.error("❌ Failed to add trigger:", err.message);
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
}

addAutoConfirmTrigger();
