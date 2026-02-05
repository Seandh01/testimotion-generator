// Supabase client module for TESTIMOTION Generator
// Uses the Supabase JS library loaded via CDN in index.html

const SUPABASE_URL = 'https://rhdgpxdppwgveicjznok.supabase.co';

// The anon key is public and safe to expose - RLS policies protect data
// This will be injected from environment or set here
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';

let supabaseClient = null;

/**
 * Initialize and return the Supabase client
 * @returns {Object} Supabase client instance
 */
export function getSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Check if supabase library is loaded
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase JS library not loaded. Make sure to include the CDN script.');
    return null;
  }

  // Check if anon key is configured
  if (!SUPABASE_ANON_KEY) {
    console.error('SUPABASE_ANON_KEY not configured. Set window.SUPABASE_ANON_KEY before loading this module.');
    return null;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

/**
 * Check if Supabase is properly configured
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  return Boolean(SUPABASE_ANON_KEY && typeof window.supabase !== 'undefined');
}

export { SUPABASE_URL };
