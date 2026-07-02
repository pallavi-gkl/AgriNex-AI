const { Client } = require('pg');

const connectionConfig = {
  host: 'db.kqmabbfjyrnvjcqkfxjy.supabase.co',
  port: 6543,
  user: 'postgres',
  password: 'Pallavi@837456',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function updateRLS() {
  console.log("Connecting to Supabase PostgreSQL database to update RLS policies...");
  const client = new Client(connectionConfig);
  
  try {
    await client.connect();
    console.log("✅ Connected successfully!");

    const sql = `
      -- Drop old update policy
      DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

      -- Create new update policy that prevents changing the role column
      CREATE POLICY "Users update own profile" ON public.profiles
        FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (
          auth.uid() = id AND 
          (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
        );
    `;

    console.log("Updating 'Users update own profile' RLS policy...");
    await client.query(sql);
    console.log("✅ RLS policy updated successfully! Users can no longer modify their roles or others' profiles.");

  } catch (err) {
    console.error("❌ Failed to update RLS policy:", err.message);
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
}

updateRLS();
