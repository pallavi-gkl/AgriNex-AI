const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const pgConfig = {
  host: 'db.kqmabbfjyrnvjcqkfxjy.supabase.co',
  port: 6543,
  user: 'postgres',
  password: 'Pallavi@837456',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function setupStorage() {
  console.log("Checking and creating storage buckets...");

  // 1. Check or Create 'crop-images' bucket
  try {
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) throw bErr;

    const hasCropImages = buckets.some(b => b.name === 'crop-images');
    if (!hasCropImages) {
      console.log("Creating public 'crop-images' bucket...");
      const { error } = await supabase.storage.createBucket('crop-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });
      if (error) throw error;
      console.log("✅ 'crop-images' bucket created.");
    } else {
      console.log("✅ 'crop-images' bucket already exists.");
    }

    const hasLandDocs = buckets.some(b => b.name === 'land-docs');
    if (!hasLandDocs) {
      console.log("Creating private 'land-docs' bucket...");
      const { error } = await supabase.storage.createBucket('land-docs', {
        public: false
      });
      if (error) throw error;
      console.log("✅ 'land-docs' bucket created.");
    } else {
      console.log("✅ 'land-docs' bucket already exists.");
    }

  } catch (err) {
    console.error("❌ Error setting up buckets via storage API:", err.message);
  }

  // 2. Apply SQL Storage Policies
  console.log("Connecting to Database to apply storage policies...");
  const client = new Client(pgConfig);
  try {
    await client.connect();
    console.log("Connected to database.");

    // Clean up policies first to prevent "policy already exists" errors
    console.log("Cleaning up existing storage policies...");
    const cleanupSql = `
      DROP POLICY IF EXISTS "crop-images: Public read access" ON storage.objects;
      DROP POLICY IF EXISTS "crop-images: Farmer upload" ON storage.objects;
      DROP POLICY IF EXISTS "crop-images: Farmer update own images" ON storage.objects;
      DROP POLICY IF EXISTS "crop-images: Farmer delete own images" ON storage.objects;
      DROP POLICY IF EXISTS "land-docs: Owner read own documents" ON storage.objects;
      DROP POLICY IF EXISTS "land-docs: Admin read all documents" ON storage.objects;
      DROP POLICY IF EXISTS "land-docs: Farmer upload own documents" ON storage.objects;
      DROP POLICY IF EXISTS "land-docs: Farmer update own documents" ON storage.objects;
      DROP POLICY IF EXISTS "land-docs: Farmer delete own documents" ON storage.objects;
    `;
    await client.query(cleanupSql);

    const sqlPath = path.join(__dirname, 'supabase', 'storage_policies.sql');
    console.log(`Reading policies from ${sqlPath}...`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing SQL policies script...");
    await client.query(sql);
    console.log("✅ Storage policies applied successfully!");

  } catch (err) {
    console.error("❌ Applying storage policies failed:", err.message);
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
}

setupStorage();
