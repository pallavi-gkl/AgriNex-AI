const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionConfig = {
  host: 'db.kqmabbfjyrnvjcqkfxjy.supabase.co',
  port: 6543, // Transaction pooler port (often bypasses port 5432 blocks)
  user: 'postgres',
  password: 'Pallavi@837456',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function runMigration() {
  console.log("Connecting to Supabase PostgreSQL database on port 6543...");
  const client = new Client(connectionConfig);
  
  try {
    await client.connect();
    console.log("✅ Connected successfully!");

    const sqlPath = path.join(__dirname, 'supabase', 'migration_complete.sql');
    console.log(`Reading migration file from ${sqlPath}...`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing SQL migration script (this might take a few seconds)...");
    await client.query(sql);
    console.log("✅ Migration completed successfully!");

  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    
    // If port 6543 failed, try port 5432
    if (connectionConfig.port === 6543) {
      console.log("\nRetrying connection on port 5432...");
      connectionConfig.port = 5432;
      const client5432 = new Client(connectionConfig);
      try {
        await client5432.connect();
        console.log("✅ Connected successfully on port 5432!");
        const sqlPath = path.join(__dirname, 'supabase', 'migration_complete.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await client5432.query(sql);
        console.log("✅ Migration completed successfully on port 5432!");
        await client5432.end();
        return;
      } catch (err5432) {
        console.error("❌ Retry on port 5432 failed:", err5432.message);
      }
    }
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
}

runMigration();
