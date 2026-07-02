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
  
  const res = await client.query(`
    SELECT 
      tgname,
      relname,
      nspname,
      pg_get_triggerdef(pg_trigger.oid) as def
    FROM pg_trigger 
    JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
    JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
    WHERE relname = 'users' AND nspname = 'auth';
  `);
  
  console.log('=== ALL TRIGGERS ON auth.users ===');
  res.rows.forEach(r => {
    console.log(`Trigger: ${r.tgname}\nDefinition: ${r.def}\n`);
  });
  
  await client.end();
}
run().catch(e => console.error(e));
