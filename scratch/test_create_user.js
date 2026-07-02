const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const ts = Date.now();
  const email = `test.user.${ts}@gmail.com`;
  console.log('Attempting to create user:', email);
  
  try {
    const { data, error } = await admin.auth.admin.createUser({
      email: email,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: { full_name: 'Test Jane', phone_number: '+919876500001', role: 'farmer' }
    });
    
    if (error) {
      console.error('Error returned by Supabase:', error);
    } else {
      console.log('Success! User created:', data.user.id);
      // Clean up user
      await admin.auth.admin.deleteUser(data.user.id);
      console.log('User deleted.');
    }
  } catch (err) {
    console.error('Caught exception:', err);
  }
}
run();
