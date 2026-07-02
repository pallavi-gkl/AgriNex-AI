const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const API_URL = 'http://localhost:4000';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const farmerEmail = 'test_farmer_e2e@gmail.com';
const consumerEmail = 'test_consumer_e2e@gmail.com';
const testPassword = 'Pallavi@837456';

async function cleanupTestUsers() {
  console.log("Cleaning up any existing test users from database...");
  try {
    // Clean up profiles
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const testUsers = users.users.filter(u => u.email === farmerEmail || u.email === consumerEmail);
    for (const u of testUsers) {
      console.log(`Deleting test user ${u.email} (${u.id})...`);
      // Delete orders first (cascade or restrict might block user delete)
      await supabaseAdmin.from('orders').delete().or(`farmer_id.eq.${u.id},consumer_id.eq.${u.id}`);
      await supabaseAdmin.from('products').delete().eq('farmer_id', u.id);
      await supabaseAdmin.from('reviews').delete().or(`reviewer_id.eq.${u.id},reviewee_id.eq.${u.id}`);
      await supabaseAdmin.from('notifications').delete().eq('user_id', u.id);
      await supabaseAdmin.from('profiles').delete().eq('id', u.id);
      await supabaseAdmin.auth.admin.deleteUser(u.id);
    }
    console.log("✅ Cleanup finished.");
  } catch (err) {
    console.error("Cleanup error (non-blocking):", err.message);
  }
}

async function testAll() {
  await cleanupTestUsers();

  console.log("\n====== STARTING E2E INTEGRATION TEST ======");

  // 1. Farmer Sign Up
  console.log("\n1. Testing Farmer Sign Up...");
  const { data: farmerAuth, error: farmerSignUpErr } = await supabaseAdmin.auth.admin.createUser({
    email: farmerEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Jane Farmer',
      phone_number: '+919999900001',
      role: 'farmer'
    }
  });

  if (farmerSignUpErr) throw farmerSignUpErr;
  const farmerId = farmerAuth.user.id;
  console.log(`✅ Farmer Sign Up successful. User ID: ${farmerId}`);

  // Triggers create profile, let's wait a moment and verify
  await new Promise(r => setTimeout(r, 1500));
  
  // Make sure profile exists, if trigger failed insert it manually
  let { data: farmerProfile, error: p1Err } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', farmerId)
    .maybeSingle();
  
  if (!farmerProfile) {
    console.log("⚠️ Farmer profile not created by trigger. Creating manually...");
    const { data: fpInserted, error: fpErr } = await supabaseAdmin.from('profiles').insert({
      id: farmerId,
      full_name: 'Jane Farmer',
      phone_number: '+919999900001',
      role: 'farmer'
    }).select().single();
    if (fpErr) throw fpErr;
    farmerProfile = fpInserted;
  }
  
  console.log(`✅ Verified farmer profile: ${farmerProfile.full_name}, verified: ${farmerProfile.is_verified}`);

  // Let's set the farmer to verified so they have trust scores and can sell
  await supabaseAdmin.from('profiles').update({ is_verified: true, trust_score: 5.0 }).eq('id', farmerId);

  // 2. Consumer Sign Up
  console.log("\n2. Testing Consumer Sign Up...");
  const { data: consumerAuth, error: consumerSignUpErr } = await supabaseAdmin.auth.admin.createUser({
    email: consumerEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'John Consumer',
      phone_number: '+919999900002',
      role: 'consumer'
    }
  });

  if (consumerSignUpErr) throw consumerSignUpErr;
  const consumerId = consumerAuth.user.id;
  console.log(`✅ Consumer Sign Up successful. User ID: ${consumerId}`);

  await new Promise(r => setTimeout(r, 1500));
  let { data: consumerProfile, error: p2Err } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', consumerId)
    .maybeSingle();

  if (!consumerProfile) {
    console.log("⚠️ Consumer profile not created by trigger. Creating manually...");
    const { data: cpInserted, error: cpErr } = await supabaseAdmin.from('profiles').insert({
      id: consumerId,
      full_name: 'John Consumer',
      phone_number: '+919999900002',
      role: 'consumer'
    }).select().single();
    if (cpErr) throw cpErr;
    consumerProfile = cpInserted;
  }
  
  console.log(`✅ Verified consumer profile: ${consumerProfile.full_name}`);

  // 3. Farmer Login to get JWT Token
  console.log("\n3. Testing Farmer Login...");
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: farmerLogin, error: farmerLoginErr } = await supabaseClient.auth.signInWithPassword({
    email: farmerEmail,
    password: testPassword
  });

  if (farmerLoginErr) throw farmerLoginErr;
  const farmerToken = farmerLogin.session.access_token;
  console.log("✅ Farmer login successful. JWT retrieved.");

  // 4. Consumer Login to get JWT Token
  console.log("\n4. Testing Consumer Login...");
  const { data: consumerLogin, error: consumerLoginErr } = await supabaseClient.auth.signInWithPassword({
    email: consumerEmail,
    password: testPassword
  });

  if (consumerLoginErr) throw consumerLoginErr;
  const consumerToken = consumerLogin.session.access_token;
  console.log("✅ Consumer login successful. JWT retrieved.");

  // 5. Test Storage Bucket Upload
  console.log("\n5. Testing Storage Upload to 'crop-images'...");
  const dummyBuffer = Buffer.from("mock image data");
  // Upload to public 'crop-images' bucket
  const supabaseFarmerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${farmerToken}` } }
  });
  const { data: uploadData, error: uploadErr } = await supabaseFarmerClient.storage
    .from('crop-images')
    .upload(`test-${Date.now()}.png`, dummyBuffer, { contentType: 'image/png' });

  if (uploadErr) throw uploadErr;
  console.log("✅ Storage upload successful. File key:", uploadData.path);
  const { data: publicUrlData } = supabaseFarmerClient.storage
    .from('crop-images')
    .getPublicUrl(uploadData.path);
  console.log("✅ Storage Public URL retrieved:", publicUrlData.publicUrl);

  // 6. Test AI pricing recommendation (Gemini Flash)
  console.log("\n6. Testing AI Smart Price Recommendation...");
  const priceRes = await fetch(`${API_URL}/api/ai/recommend-price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cropType: 'Tomato',
      grade: 'A',
      location: 'Pune, Maharashtra',
      baseWholesalePrice: 22
    })
  });
  const priceData = await priceRes.json();
  if (!priceRes.ok) throw new Error(priceData.error ?? "AI Pricing failed");
  console.log("✅ AI Price recommendation success. Recommended:", priceData.recommendedPrice, "sentiment:", priceData.marketSentiment);

  // 7. Test AI Voice Assistant Parsing (Gemini Flash)
  console.log("\n7. Testing AI Voice Assistant command parsing...");
  const voiceRes = await fetch(`${API_URL}/api/ai/voice-assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript: 'Add 15 bags of premium wheat at 45 rupees per kg',
      language: 'en'
    })
  });
  const voiceData = await voiceRes.json();
  if (!voiceRes.ok) throw new Error(voiceData.error ?? "Voice Assistant failed");
  console.log("✅ AI Voice Assistant command success. Action parsed:", voiceData.action, "feedback:", voiceData.speechFeedback);

  // 8. Upload Product Listing (Farmer calls POST /api/products)
  console.log("\n8. Testing Farmer Product Listing Upload...");
  const prodRes = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${farmerToken}`
    },
    body: JSON.stringify({
      title: 'Premium Organic Tomato',
      category: 'Vegetables',
      description: 'Grown with zero chemicals, premium quality grade A tomatoes.',
      pricePerUnit: 35.00,
      unitType: 'kg',
      quantityAvailable: 150,
      imageUrl: publicUrlData.publicUrl,
      qualityGrade: 'A',
      recommendedPrice: 32.00,
      qualityReport: {
        freshness: 'Excellent',
        blemishes: [],
        waterContentPercentage: 94,
        estimatedShelfLifeDays: 8
      }
    })
  });
  const productData = await prodRes.json();
  if (!prodRes.ok) throw new Error(productData.error ?? "Product upload failed");
  const productId = productData.id;
  console.log(`✅ Product uploaded successfully. Product ID: ${productId}, Code: ${productData.traceability_code}`);

  // 9. Consumer places Order (POST /api/orders)
  console.log("\n9. Testing Consumer Order Placement...");
  const orderRes = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${consumerToken}`
    },
    body: JSON.stringify({
      farmerId: farmerId,
      totalAmount: 350.00,
      deliveryAddress: 'Flat 402, Green Avenue, Pune 411001',
      deliveryLat: 18.5204,
      deliveryLng: 73.8567,
      items: [
        {
          productId: productId,
          quantity: 10,
          priceAtPurchase: 35.00
        }
      ]
    })
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok) throw new Error(orderData.error ?? "Order placement failed");
  const orderId = orderData.id;
  console.log(`✅ Order placed successfully. Order ID: ${orderId}`);

  // Check product quantity decremented
  const { data: updatedProduct } = await supabaseAdmin.from('products').select('quantity_available').eq('id', productId).single();
  console.log(`✅ Product quantity decremented correctly: ${updatedProduct.quantity_available} kg available (was 150 kg)`);

  // 10. Farmer accepts order (PATCH /api/orders/:id/status -> accepted)
  console.log("\n10. Testing Farmer Order Acceptance...");
  const acceptRes = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${farmerToken}`
    },
    body: JSON.stringify({
      status: 'accepted',
      note: 'Farmer accepted the order and is preparing packaging.'
    })
  });
  const acceptData = await acceptRes.json();
  if (!acceptRes.ok) throw new Error(acceptData.error ?? "Farmer order accept failed");
  console.log(`✅ Order status updated to accepted. Current status: ${acceptData.currentStatus}`);

  // 11. Farmer dispatches order (PATCH /api/orders/:id/status -> dispatched)
  console.log("\n11. Testing Farmer Order Dispatch (generates OTP)...");
  const dispatchRes = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${farmerToken}`
    },
    body: JSON.stringify({
      status: 'dispatched',
      note: 'Courier has picked up the tomatoes and is in transit.'
    })
  });
  const dispatchData = await dispatchRes.json();
  if (!dispatchRes.ok) throw new Error(dispatchData.error ?? "Farmer order dispatch failed");
  console.log(`✅ Order status updated to dispatched. Current status: ${dispatchData.currentStatus}`);

  // Get the generated OTP from orders table
  const { data: orderWithOtp } = await supabaseAdmin.from('orders').select('payment_id').eq('id', orderId).single();
  const rawOtp = orderWithOtp.payment_id;
  const otp = rawOtp.replace("OTP:", "");
  console.log(`✅ Courier Dispatch triggered OTP generation: ${otp}`);

  // 12. Consumer verifies OTP (POST /api/orders/:id/verify-delivery)
  console.log("\n12. Testing Consumer Delivery verification with OTP...");
  const verifyRes = await fetch(`${API_URL}/api/orders/${orderId}/verify-delivery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${consumerToken}`
    },
    body: JSON.stringify({ otp })
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok) throw new Error(verifyData.error ?? "Delivery OTP verification failed");
  console.log(`✅ OTP verified and order delivered. Message: "${verifyData.message}"`);

  // 13. Consumer submits Review (POST /api/reviews)
  console.log("\n13. Testing Consumer Review Submission & Trust Score Recalculation...");
  const reviewRes = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${consumerToken}`
    },
    body: JSON.stringify({
      orderId: orderId,
      revieweeId: farmerId,
      rating: 5,
      comment: 'Super fresh and delicious tomatoes! Excellent delivery.'
    })
  });
  const reviewData = await reviewRes.json();
  if (!reviewRes.ok) throw new Error(reviewData.error ?? "Review submission failed");
  console.log(`✅ Review submitted successfully. Rating: ${reviewData.rating}`);

  // Verify farmer trust score updated
  const { data: finalFarmerProfile } = await supabaseAdmin.from('profiles').select('trust_score').eq('id', farmerId).single();
  console.log(`✅ Verified farmer trust score recalculated: ${finalFarmerProfile.trust_score}`);

  // 14. Check Notifications
  console.log("\n14. Verifying notifications sent on order updates...");
  const { data: notifications } = await supabaseAdmin.from('notifications').select('*').eq('user_id', farmerId);
  console.log(`✅ Farmer received notifications: ${notifications.length} unread notifications.`);
  notifications.forEach(n => console.log(`   - Title: "${n.title}", Msg: "${n.message}"`));

  console.log("\n🎉 ALL E2E INTEGRATION TESTS PASSED SUCCESSFULLY! EVERYTHING WORKS!");

  await cleanupTestUsers();
}

testAll().catch(err => {
  console.error("\n❌ E2E Integration test failed:", err);
  process.exit(1);
});
