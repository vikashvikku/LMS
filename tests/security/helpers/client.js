const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

// Admin client for setting up and tearing down fixtures
const getAdminClient = () => createClient(config.supabaseUrl, config.privilegedKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
});

// Helper to authenticate a user and return their client
const getAuthenticatedClient = async (email, password = 'TestPassword123!') => {
  const client = createClient(config.supabaseUrl, config.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
  
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Failed to authenticate ${email}: ${error.message}`);
  
  return client;
};

// Helper for anonymous client
const getAnonClient = () => createClient(config.supabaseUrl, config.publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
});

module.exports = { getAdminClient, getAuthenticatedClient, getAnonClient };
