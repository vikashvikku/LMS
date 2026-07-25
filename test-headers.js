const { createClient } = require('@supabase/supabase-js');
const client = createClient('https://xyz.supabase.co', 'sb_secret_123', {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  global: {
    fetch: (url, options) => {
      console.log('Headers:', options.headers);
      return Promise.resolve({
        ok: true,
        headers: new Map([['x-total-count', '0']]),
        json: () => Promise.resolve({ users: [] })
      });
    }
  }
});
async function run() {
  await client.auth.admin.listUsers();
  await client.auth.admin.listUsers();
}
run();
