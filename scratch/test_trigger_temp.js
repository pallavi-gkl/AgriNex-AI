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
  
  console.log('1. Dropping trigger temporarily...');
  await pgClient.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
  
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const ts = Date.now();
  const email = `test.trigger.temp.${ts}@gmail.com`;
  console.log('2. Attempting to create user without trigger:', email);
  
  let userCreated = null;
  try {
    const { data, error } = await admin.auth.admin.createUser({
      email: email,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: { full_name: 'Test Temp', phone_number: '+919876500001', role: 'farmer' }
    });
    
    if (error) {
      console.error('Error returned:', error);
    } else {
      userCreated = data.user;
      console.log('Success! User created without trigger:', userCreated.id);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
  
  console.log('3. Recreating trigger...');
  await pgClient.query(`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `);
  
  if (userCreated) {
    console.log('4. Cleaning up created user...');
    await admin.auth.admin.deleteUser(userCreated.id);
    console.log('Cleanup done.');
  }
  
  await pgClient.end();
}
run().catch(e => console.error(e));
