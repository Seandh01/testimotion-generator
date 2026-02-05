// Authentication module for TESTIMOTION Generator
// Uses Supabase Auth with magic link (invite-only system)

import { getSupabase, isSupabaseConfigured } from './supabase.js';

// Current user state
let currentUser = null;
let authListeners = [];

/**
 * Initialize authentication
 * Checks for existing session and sets up auth state listener
 * @returns {Promise<Object|null>} Current user or null
 */
export async function initAuth() {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Supabase not configured, auth disabled');
    return null;
  }

  try {
    // Check for existing session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    if (session?.user) {
      currentUser = session.user;
      notifyListeners(currentUser);
    }

    // Listen for auth state changes (login, logout, token refresh)
    supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;
      currentUser = user;
      notifyListeners(user, event);
    });

    return currentUser;
  } catch (err) {
    console.error('Auth initialization error:', err);
    return null;
  }
}

/**
 * Send magic link to email for login
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function loginWithMagicLink(email) {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Authentication not configured' };
  }

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // Redirect back to the current page after login
        emailRedirectTo: window.location.origin + window.location.pathname
      }
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('rate limit')) {
        return { success: false, error: 'Too many attempts. Please wait a moment.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Magic link error:', err);
    return { success: false, error: 'Failed to send login link. Please try again.' };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function logout() {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Authentication not configured' };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    currentUser = null;
    return { success: true };
  } catch (err) {
    console.error('Logout error:', err);
    return { success: false, error: 'Failed to sign out. Please try again.' };
  }
}

/**
 * Get the current authenticated user
 * @returns {Object|null} Current user or null if not authenticated
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return currentUser !== null;
}

/**
 * Get user's email address
 * @returns {string|null}
 */
export function getUserEmail() {
  return currentUser?.email || null;
}

/**
 * Get user's ID
 * @returns {string|null}
 */
export function getUserId() {
  return currentUser?.id || null;
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  if (typeof callback !== 'function') {
    console.error('onAuthStateChange requires a function callback');
    return () => {};
  }

  authListeners.push(callback);

  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(listener => listener !== callback);
  };
}

/**
 * Notify all listeners of auth state change
 * @param {Object|null} user - Current user
 * @param {string} event - Auth event type
 */
function notifyListeners(user, event = 'INITIAL') {
  authListeners.forEach(callback => {
    try {
      callback(user, event);
    } catch (err) {
      console.error('Auth listener error:', err);
    }
  });
}

/**
 * Check if authentication is available (Supabase configured)
 * @returns {boolean}
 */
export function isAuthAvailable() {
  return isSupabaseConfigured();
}
