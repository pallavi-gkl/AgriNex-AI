const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const pgConfig = {
  host: 'db.kqmabbfjyrnvjcqkfxjy.supabase.co',
  port: 6543,
  user: 'postgres',
  password: 'Pallavi@837456',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const pgClient = new Client(pgConfig);
  await pgClient.connect();
  
  console.log('1. Creating trigger_logs table...');
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS public.trigger_logs (
      id serial PRIMARY KEY,
      err_msg text,
      err_detail text,
      created_at timestamp DEFAULT now()
    );
  `);
  
  console.log('2. Redefining trigger function with exception handling...');
  await pgClient.query(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      BEGIN
        INSERT INTO public.profiles (id, full_name, phone_number, role)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
          COALESCE(NEW.raw_user_meta_data->>'phone_number', '0000000000'),
          COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'consumer')
        )
        ON CONFLICT (id) DO NOTHING;
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO public.trigger_logs (err_msg, err_detail)
        VALUES (SQLERRM, SQLSTATE);
      END;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const ts = Date.now();
  const email = `test.trigger.debug.${ts}@gmail.com`;
  console.log('3. Attempting to create user to trigger the function:', email);
  
  const { data, error } = await admin.auth.admin.createUser({
    email: email,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: { full_name: 'Test Debugger', phone_number: '+919876500001', role: 'farmer' }
  });
  
  if (error) {
    console.error('User creation failed even with exception handler:', error);
  } else {
    console.log('User creation succeeded! ID:', data.user.id);
    
    // Check if any error was logged in trigger_logs
    const logRes = await pgClient.query('SELECT * FROM public.trigger_logs;');
    console.log('Trigger logs inside PG:', logRes.rows);
    
    // Check if profile was created
    const profRes = await pgClient.query('SELECT * FROM public.profiles WHERE id = $1;', [data.user.id]);
    console.log('Profiles table entry:', profRes.rows);
    
    // Cleanup
    await admin.auth.admin.deleteUser(data.user.id);
    console.log('Cleanup user done.');
  }
  
  // Cleanup logging table
  await pgClient.query('DROP TABLE IF EXISTS public.trigger_logs;');
  await pgClient.end();
}
run().catch(e => console.error(e));
