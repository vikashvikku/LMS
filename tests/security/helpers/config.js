require('dotenv').config({ path: '.env.security-test.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
const legacyServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const securityTestEnabled = process.env.CAMPUSOS_SECURITY_TEST === 'true';

const privilegedKey = secretKey || legacyServiceRoleKey;
const privilegedKeySource = secretKey ? 'SUPABASE_SECRET_KEY' : (legacyServiceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : 'NONE');

function validateConfig() {
  console.log("=== Security Test Environment ===");
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${url ? 'SET' : 'NOT SET'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${publishableKey ? 'SET' : 'NOT SET'}`);
  console.log(`SUPABASE_SECRET_KEY: ${secretKey ? 'SET' : 'NOT SET'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${legacyServiceRoleKey ? 'SET' : 'NOT SET'} (optional)`);
  console.log(`CAMPUSOS_SECURITY_TEST: ${securityTestEnabled ? 'SET' : 'NOT SET'}`);
  console.log(`\nPrivileged credential selected: ${privilegedKeySource}`);
  console.log("=================================\n");

  let failed = false;

  if (!securityTestEnabled) {
    console.error("Missing CAMPUSOS_SECURITY_TEST=true");
    failed = true;
  }
  if (!url) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
    failed = true;
  }
  if (!publishableKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    failed = true;
  }
  if (!privilegedKey) {
    console.error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
    failed = true;
  }

  if (failed) {
    process.exit(1);
  }
}

// Automatically validate on require
validateConfig();

module.exports = {
  supabaseUrl: url,
  publishableKey,
  privilegedKey,
  privilegedKeySource,
  securityTestEnabled
};
