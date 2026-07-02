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
  
  console.log('1. Redefining trigger function with public.user_role...');
  await pgClient.query(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, full_name, phone_number, role)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', '0000000000'),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'consumer'::public.user_role)
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const ts = Date.now();
  const email = `test.trigger.fix.${ts}@gmail.com`;
  console.log('2. Attempting to create user with fixed trigger:', email);
  
  try {
    const { data, error } = await admin.auth.admin.createUser({
      email: email,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: { full_name: 'Test Fixed Trigger', phone_number: '+919876500001', role: 'farmer' }
    });
    
    if (error) {
      console.error('User creation failed:', error);
    } else {
      console.log('User creation succeeded! ID:', data.user.id);
      
      // Check if profile was created
      const profRes = await pgClient.query('SELECT * FROM public.profiles WHERE id = $1;', [data.user.id]);
      console.log('Profiles table entry:', profRes.rows);
      
      // Cleanup
      await admin.auth.admin.deleteUser(data.user.id);
      console.log('Cleanup user done.');
    }
  } catch (err) {
    console.error('Exception:', err);
  }
  
  await pgClient.end();
}
run().catch(e => console.error(e));
