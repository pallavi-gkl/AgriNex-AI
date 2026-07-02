const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log("Checking Supabase connection and tables...");
  
  // 1. Check Profiles table
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
  if (pError) {
    console.error("❌ Error fetching profiles:", pError.message);
  } else {
    console.log("✅ Profiles table connected. Rows found:", profiles.length);
  }

  // 2. Check Products table
  const { data: products, error: prodError } = await supabase.from('products').select('*').limit(1);
  if (prodError) {
    console.error("❌ Error fetching products:", prodError.message);
  } else {
    console.log("✅ Products table connected. Rows found:", products.length);
  }

  // 3. Check Orders table
  const { data: orders, error: oError } = await supabase.from('orders').select('*').limit(1);
  if (oError) {
    console.error("❌ Error fetching orders:", oError.message);
  } else {
    console.log("✅ Orders table connected. Rows found:", orders.length);
  }

  // 4. Check Reviews table
  const { data: reviews, error: rError } = await supabase.from('reviews').select('*').limit(1);
  if (rError) {
    console.error("❌ Error fetching reviews:", rError.message);
  } else {
    console.log("✅ Reviews table connected. Rows found:", reviews.length);
  }

  // 5. Check Notifications table
  const { data: notifications, error: nError } = await supabase.from('notifications').select('*').limit(1);
  if (nError) {
    console.error("❌ Error fetching notifications:", nError.message);
  } else {
    console.log("✅ Notifications table connected. Rows found:", notifications.length);
  }
}

testSupabase();
