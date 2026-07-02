async function run() {
  try {
    const url = 'https://kqmabbfjyrnvjcqkfxjy.supabase.co/auth/v1/health';
    console.log('Fetching', url);
    const res = await fetch(url);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
run();
