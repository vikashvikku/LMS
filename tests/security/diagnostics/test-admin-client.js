require('dotenv').config({ path: '.env.security-test.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !secretKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}

const adminClient = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
});

async function runTest() {
  console.log(`Supabase URL: SET`);
  console.log(`SUPABASE_SECRET_KEY: SET`);
  console.log(`Credential type: ${secretKey.startsWith('sb_secret_') ? 'sb_secret' : 'jwt'}`);
  console.log("Admin client creation: PASS");

  try {
    const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      console.error("Admin listUsers request: FAIL");
      console.error(error);
      process.exit(1);
    }
    console.log("Admin listUsers request 1: PASS");
    
    const { data: data2, error: error2 } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error2) {
      console.error("Admin listUsers request 2: FAIL");
      console.error(error2);
      process.exit(1);
    }
    console.log("Admin listUsers request 2: PASS");
  } catch (err) {
    console.error("Admin listUsers request: ERROR");
    console.error(err);
    process.exit(1);
  }
}

runTest();
