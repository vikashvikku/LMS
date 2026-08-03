import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

/**
 * Creates a privileged Supabase client for server-side ONLY.
 * Bypasses RLS and has full administrative access.
 * NEVER import this in a Client Component.
 */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  
  // The project prefers SUPABASE_SECRET_KEY but falls back to SUPABASE_SERVICE_ROLE_KEY
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!secretKey) {
    throw new Error('Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) environment variable. Privileged admin actions are unavailable.');
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
