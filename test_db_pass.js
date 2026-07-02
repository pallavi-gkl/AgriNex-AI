const { Client } = require('pg');

const passwords = [
  'postgres',
  'supabase',
  'kqmabbfjyrnvjcqkfxjy',
  'admin',
  'admin123',
  'password'
];

async function tryPasswords() {
  for (const password of passwords) {
    console.log(`Trying password: ${password}`);
    const client = new Client({
      host: 'db.kqmabbfjyrnvjcqkfxjy.supabase.co',
      port: 5432,
      user: 'postgres',
      password: password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log(`🎉 SUCCESS! Password is: ${password}`);
      await client.end();
      return;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }
  console.log("None of the guessed passwords worked.");
}

tryPasswords();
