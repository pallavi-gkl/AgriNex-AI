const pg = require('pg');

const dbConfig = {
  host: 'db.kqmabbfjyrnvjcqkfxjy.supabase.co',
  port: 6543,
  user: 'postgres',
  password: 'Pallavi@837456',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function auditStorage() {
  const client = new pg.Client(dbConfig);
  await client.connect();
  console.log("Connected to DB\n");

  const res = await client.query(`
    SELECT policyname, cmd, roles, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage'
  `);
  console.log("Policies on storage.objects:");
  res.rows.forEach(r => {
    console.log(`- Policy: ${r.policyname}`);
    console.log(`  Cmd: ${r.cmd}`);
    console.log(`  Roles: ${r.roles}`);
    console.log(`  Qual: ${r.qual}`);
    console.log(`  WithCheck: ${r.with_check}\n`);
  });

  await client.end();
}

auditStorage().catch(err => console.error(err));
