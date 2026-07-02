const { Client } = require('pg');
const config = {
  host: 'db.kqmabbfjyrnvjcqkfxjy.supabase.co',
  port: 6543,
  user: 'postgres',
  password: 'Pallavi@837456',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};
async function run() {
  const client = new Client(config);
  await client.connect();
  
  await client.query('BEGIN;');
  try {
    const res = await client.query({
      text: "INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES (gen_random_uuid(), 'test_trigger_dummy@gmail.com', '{\"role\": \"farmer\", \"full_name\": \"Jane\"}'::jsonb) RETURNING id;"
    });
    console.log('Insert succeeded! ID:', res.rows[0].id);
    
    // Check if profile was created
    const profileRes = await client.query("SELECT * FROM public.profiles WHERE id = $1", [res.rows[0].id]);
    console.log('Profile created:', profileRes.rows);
  } catch (err) {
    console.error('Insert failed with error:', err.message);
    console.error(err);
  } finally {
    await client.query('ROLLBACK;');
    await client.end();
  }
}
run().catch(e => console.error(e));
