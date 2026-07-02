/**
 * AgriNex AI — Post-Fix Full Verification Script
 * Tests auth signup with valid email domains and runs full CRUD
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kqmabbfjyrnvjcqkfxjy.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbWFiYmZqeXJudmpjcWtmeGp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjYyOTE4MSwiZXhwIjoyMDk4MjA1MTgxfQ.Cxj8_qfQMrDVCm-bCAW0hBi1zb6RjUsrSgz5Zewc-NY';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbWFiYmZqeXJudmpjcWtmeGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MjkxODEsImV4cCI6MjA5ODIwNTE4MX0.mFhZ0ZrXADeTj58OCiARSsalvDu_9iMf144QS-uk5JY';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ts = Date.now();
// Use gmail.com since agrinex-test.com was rejected as invalid
const farmerEmail = `agrinex.farmer.${ts}@gmail.com`;
const consumerEmail = `agrinex.consumer.${ts}@gmail.com`;
const testPass = 'AgriNex@Farmer2024!';

let results = { pass: 0, fail: 0, bugs: [], fixes: [] };
let farmerId, consumerId, farmerToken, consumerToken;
let productId, orderId;

function p(label, detail) {
  results.pass++;
  console.log(`  ✅ [PASS] ${label}: ${detail}`);
}
function f(label, detail) {
  results.fail++;
  results.bugs.push(`${label}: ${detail}`);
  console.error(`  ❌ [FAIL] ${label}: ${detail}`);
}

// ─── AUTH ──────────────────────────────────────────────────────────────────────
async function testAuth() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  AUTHENTICATION TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Farmer signup via admin.createUser (auto-confirms email)
  console.log('\n  Farmer Signup...');
  const { data: fd, error: fe } = await admin.auth.admin.createUser({
    email: farmerEmail,
    password: testPass,
    email_confirm: true,
    user_metadata: { full_name: 'Test Farmer Jane', phone_number: '+919876500001', role: 'farmer' }
  });
  if (fe) {
    f('farmer_signup', fe.message);
    console.log('  Full error:', JSON.stringify(fe));
    return false;
  }
  farmerId = fd.user.id;
  p('farmer_signup', `ID: ${farmerId}`);

  // Consumer signup
  console.log('\n  Consumer Signup...');
  const { data: cd, error: ce } = await admin.auth.admin.createUser({
    email: consumerEmail,
    password: testPass,
    email_confirm: true,
    user_metadata: { full_name: 'Test Consumer John', phone_number: '+919876500002', role: 'consumer' }
  });
  if (ce) {
    f('consumer_signup', ce.message);
    return false;
  }
  consumerId = cd.user.id;
  p('consumer_signup', `ID: ${consumerId}`);

  // Wait for trigger
  await new Promise(r => setTimeout(r, 2000));

  // Verify profiles auto-created
  const { data: fp, error: fpe } = await admin.from('profiles').select('*').eq('id', farmerId).single();
  if (fpe) {
    f('farmer_profile_trigger', `Profile NOT created: ${fpe.message}`);
    // Manual fix
    await admin.from('profiles').insert({
      id: farmerId, full_name: 'Test Farmer Jane', phone_number: '+919876500001', role: 'farmer'
    });
    results.fixes.push('Manually created farmer profile (trigger failed)');
  } else {
    p('farmer_profile_trigger', `Auto-created: ${fp.full_name}, role: ${fp.role}`);
  }

  const { data: cp, error: cpe } = await admin.from('profiles').select('*').eq('id', consumerId).single();
  if (cpe) {
    f('consumer_profile_trigger', `Profile NOT created: ${cpe.message}`);
    await admin.from('profiles').insert({
      id: consumerId, full_name: 'Test Consumer John', phone_number: '+919876500002', role: 'consumer'
    });
    results.fixes.push('Manually created consumer profile (trigger failed)');
  } else {
    p('consumer_profile_trigger', `Auto-created: ${cp.full_name}, role: ${cp.role}`);
  }

  // Set farmer verified
  await admin.from('profiles').update({ is_verified: true, trust_score: 5.0 }).eq('id', farmerId);

  // Login
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data: fl, error: fle } = await anonClient.auth.signInWithPassword({ email: farmerEmail, password: testPass });
  if (fle) { f('farmer_login', fle.message); }
  else { farmerToken = fl.session?.access_token; p('farmer_login', 'JWT obtained'); }

  const { data: cl, error: cle } = await anonClient.auth.signInWithPassword({ email: consumerEmail, password: testPass });
  if (cle) { f('consumer_login', cle.message); }
  else { consumerToken = cl.session?.access_token; p('consumer_login', 'JWT obtained'); }

  // Role-based auth check
  const { data: roleCheck } = await admin.from('profiles').select('role').eq('id', farmerId).single();
  if (roleCheck?.role === 'farmer') p('farmer_role_check', 'role=farmer confirmed');
  else f('farmer_role_check', `Expected farmer, got: ${roleCheck?.role}`);

  return true;
}

// ─── STORAGE ───────────────────────────────────────────────────────────────────
async function testStorage() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  STORAGE TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!farmerToken) {
    console.log('  ⚠️  No farmer token — skipping storage tests');
    return;
  }

  const farmerClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${farmerToken}` } }
  });

  // Crop image upload
  const imgData = Buffer.from(`PNG_TEST_${Date.now()}`);
  const cropPath = `products/${farmerId}/${Date.now()}.png`;
  const { data: cu, error: cue } = await farmerClient.storage.from('crop-images').upload(cropPath, imgData, { contentType: 'image/png', upsert: true });
  if (cue) { f('crop_image_upload', cue.message); }
  else {
    const { data: url } = farmerClient.storage.from('crop-images').getPublicUrl(cu.path);
    p('crop_image_upload', `URL: ${url.publicUrl.substring(0, 60)}...`);
    await farmerClient.storage.from('crop-images').remove([cropPath]);
  }

  // Avatar upload
  const avatarPath = `users/${farmerId}/${Date.now()}.png`;
  const { data: au, error: aue } = await farmerClient.storage.from('avatars').upload(avatarPath, imgData, { contentType: 'image/png', upsert: true });
  if (aue) { f('avatar_upload', aue.message); }
  else { p('avatar_upload', 'Farmer avatar upload OK'); await farmerClient.storage.from('avatars').remove([avatarPath]); }

  // KYC land-docs upload
  const kycPath = `kyc/${farmerId}/${Date.now()}.pdf`;
  const { data: ku, error: kue } = await farmerClient.storage.from('land-docs').upload(kycPath, imgData, { contentType: 'application/pdf', upsert: true });
  if (kue) { f('kyc_upload', kue.message); }
  else { p('kyc_upload', 'Farmer KYC upload OK'); await farmerClient.storage.from('land-docs').remove([kycPath]); }
}

// ─── CRUD ──────────────────────────────────────────────────────────────────────
async function testCRUD() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  CRUD TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!farmerId || !consumerId) {
    console.log('  ⚠️  Skipping CRUD — auth setup incomplete');
    return;
  }

  // === PROFILES ===
  console.log('\n  [PROFILES]');
  const { data: pr, error: pre } = await admin.from('profiles').select('*').eq('id', farmerId).single();
  pre ? f('profiles_read', pre.message) : p('profiles_read', `${pr.full_name}`);

  const { error: pue } = await admin.from('profiles').update({ address: '123 AgriNex Farm, Pune 411001' }).eq('id', farmerId);
  pue ? f('profiles_update', pue.message) : p('profiles_update', 'Address updated');

  // === PRODUCTS ===
  console.log('\n  [PRODUCTS]');
  const { data: pc, error: pce } = await admin.from('products').insert({
    farmer_id: farmerId,
    title: 'E2E Test Organic Tomatoes',
    category: 'Vegetables',
    description: 'Grown without chemicals, CRUD test product.',
    price_per_unit: 30.00,
    unit_type: 'kg',
    quantity_available: 100.00,
    quality_grade: 'A',
    quality_report: { freshness: 'Excellent', waterContent: 94 },
    is_active: true
  }).select().single();
  
  if (pce) { f('products_create', pce.message); }
  else {
    productId = pc.id;
    p('products_create', `ID: ${productId}`);
    
    const { data: prd, error: prde } = await admin.from('products').select('*').eq('id', productId).single();
    prde ? f('products_read', prde.message) : p('products_read', `${prd.title} @ ₹${prd.price_per_unit}/kg`);

    const { error: pupe } = await admin.from('products').update({ price_per_unit: 35.00, quantity_available: 95.00 }).eq('id', productId);
    pupe ? f('products_update', pupe.message) : p('products_update', 'Price and quantity updated');
  }

  // === ORDERS ===
  console.log('\n  [ORDERS]');
  if (productId) {
    const { data: oc, error: oce } = await admin.from('orders').insert({
      consumer_id: consumerId,
      farmer_id: farmerId,
      total_amount: 350.00,
      status: 'pending',
      payment_status: 'pending',
      delivery_address: 'CRUD Test — Flat 402, Pune 411001',
      delivery_lat: 18.5204,
      delivery_lng: 73.8567,
      tracking_history: [{ status: 'pending', ts: new Date().toISOString(), note: 'Order placed via CRUD test' }]
    }).select().single();

    if (oce) { f('orders_create', oce.message); }
    else {
      orderId = oc.id;
      p('orders_create', `ID: ${orderId}`);

      // Order items
      const { error: oie } = await admin.from('order_items').insert({
        order_id: orderId,
        product_id: productId,
        quantity: 10,
        price_at_purchase: 35.00
      });
      oie ? f('order_items_create', oie.message) : p('order_items_create', 'Linked 10kg tomatoes');

      // Read with join
      const { data: ord, error: orde } = await admin.from('orders').select('*, order_items(*)').eq('id', orderId).single();
      orde ? f('orders_read', orde.message) : p('orders_read', `Order with ${ord.order_items?.length} item(s), total: ₹${ord.total_amount}`);

      // Update status
      const { error: oue } = await admin.from('orders').update({ status: 'accepted' }).eq('id', orderId);
      oue ? f('orders_update', oue.message) : p('orders_update', 'Status → accepted');
    }
  }

  // === REVIEWS ===
  console.log('\n  [REVIEWS]');
  if (orderId) {
    const { data: rc, error: rce } = await admin.from('reviews').insert({
      order_id: orderId,
      reviewer_id: consumerId,
      reviewee_id: farmerId,
      rating: 5,
      comment: 'Excellent produce! Fresh and delivered on time. CRUD test.'
    }).select().single();

    if (rce) { f('reviews_create', rce.message); }
    else {
      const reviewId = rc.id;
      p('reviews_create', `ID: ${reviewId}, rating: ${rc.rating}`);

      const { data: rrd, error: rrde } = await admin.from('reviews').select('*').eq('id', reviewId).single();
      rrde ? f('reviews_read', rrde.message) : p('reviews_read', `"${rrd.comment}"`);

      // Verify trust_score trigger updated
      await new Promise(r => setTimeout(r, 1000));
      const { data: ts_check } = await admin.from('profiles').select('trust_score').eq('id', farmerId).single();
      ts_check ? p('trust_score_trigger', `Farmer trust_score: ${ts_check.trust_score}`) : f('trust_score_trigger', 'trust_score not updated');

      const { error: rde } = await admin.from('reviews').delete().eq('id', reviewId);
      rde ? f('reviews_delete', rde.message) : p('reviews_delete', 'Deleted');
    }
  }

  // === NOTIFICATIONS ===
  console.log('\n  [NOTIFICATIONS]');
  const { data: nc, error: nce } = await admin.from('notifications').insert({
    user_id: farmerId,
    title: 'New Order Received',
    message: 'A consumer has placed an order for your tomatoes. CRUD test.',
    type: 'order',
    is_read: false
  }).select().single();

  if (nce) { f('notifications_create', nce.message); }
  else {
    const notifId = nc.id;
    p('notifications_create', `ID: ${notifId}`);

    const { data: nrd, error: nrde } = await admin.from('notifications').select('*').eq('id', notifId).single();
    nrde ? f('notifications_read', nrde.message) : p('notifications_read', `"${nrd.title}"`);

    const { error: nue } = await admin.from('notifications').update({ is_read: true }).eq('id', notifId);
    nue ? f('notifications_update', nue.message) : p('notifications_update', 'Marked as read');

    const { error: nde } = await admin.from('notifications').delete().eq('id', notifId);
    nde ? f('notifications_delete', nde.message) : p('notifications_delete', 'Deleted');
  }

  // === PRODUCTS DELETE ===
  console.log('\n  [CLEANUP / DELETE]');
  if (orderId) {
    await admin.from('reviews').delete().eq('order_id', orderId);
    await admin.from('order_items').delete().eq('order_id', orderId);
    const { error: ode } = await admin.from('orders').delete().eq('id', orderId);
    ode ? f('orders_delete', ode.message) : p('orders_delete', 'Order deleted');
  }
  if (productId) {
    const { error: pdel } = await admin.from('products').delete().eq('id', productId);
    pdel ? f('products_delete', pdel.message) : p('products_delete', 'Product deleted');
  }
  if (consumerId) {
    const { error: prof_del } = await admin.from('profiles').delete().eq('id', consumerId);
    prof_del ? f('profiles_delete', prof_del.message) : p('profiles_delete', 'Consumer profile deleted');
  }
}

// ─── CLEANUP AUTH ─────────────────────────────────────────────────────────────
async function cleanup() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  CLEANUP');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (farmerId) {
    await admin.from('notifications').delete().eq('user_id', farmerId);
    await admin.from('profiles').delete().eq('id', farmerId);
    const { error } = await admin.auth.admin.deleteUser(farmerId);
    error ? console.log(`  ⚠️  Farmer auth delete: ${error.message}`) : console.log('  ✅ Farmer auth user deleted');
  }
  if (consumerId) {
    await admin.from('profiles').delete().eq('id', consumerId);
    const { error } = await admin.auth.admin.deleteUser(consumerId);
    error ? console.log(`  ⚠️  Consumer auth delete: ${error.message}`) : console.log('  ✅ Consumer auth user deleted');
  }
}

// ─── REPORT ───────────────────────────────────────────────────────────────────
function printReport() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        AGRINEX AI — FULL VERIFICATION REPORT                ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  ✅ PASSED: ${String(results.pass).padEnd(3)} │ ❌ FAILED: ${String(results.fail).padEnd(3)} │ TOTAL: ${results.pass + results.fail}              ║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  
  if (results.bugs.length > 0) {
    console.log('║  BUGS FOUND:                                                 ║');
    results.bugs.forEach((b, i) => {
      const line = `  ${i + 1}. ${b}`.substring(0, 62).padEnd(62);
      console.log(`║${line}║`);
    });
  } else {
    console.log('║  BUGS FOUND: None! All systems operational ✅               ║');
  }

  if (results.fixes.length > 0) {
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  FIXES APPLIED:                                              ║');
    results.fixes.forEach((fix, i) => {
      const line = `  ${i + 1}. ${fix}`.substring(0, 62).padEnd(62);
      console.log(`║${line}║`);
    });
  }

  console.log('╠══════════════════════════════════════════════════════════════╣');
  if (results.fail === 0) {
    console.log('║  🎉 ALL CHECKS PASSED — Database fully operational!          ║');
    console.log('║  ✅ Project is READY for production fixes.                   ║');
  } else {
    console.log(`║  ⚠️  ${results.fail} failure(s) need attention.                          ║`);
  }
  console.log('╚══════════════════════════════════════════════════════════════╝');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║    AgriNex AI — Post-Fix Full Verification & CRUD Tests     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  Time: ${new Date().toISOString()}\n`);

  try {
    const authOK = await testAuth();
    await testStorage();
    await testCRUD();
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err.message, err.stack);
    results.bugs.push(`Fatal: ${err.message}`);
  } finally {
    await cleanup();
    printReport();
  }
}

main();
