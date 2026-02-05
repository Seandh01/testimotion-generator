// History management module for TESTIMOTION Generator v4
// Uses Supabase for persistent storage with localStorage fallback

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { getCurrentUser, isAuthenticated, getUserId } from './auth.js';

const LOCAL_HISTORY_KEY = 'testimotion_history';

/**
 * Get local history fallback
 * @returns {Object}
 */
function getLocalHistory() {
  const data = localStorage.getItem(LOCAL_HISTORY_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return { versions: [] };
    }
  }
  return { versions: [] };
}

/**
 * Save local history fallback
 * @param {Object} history
 */
function saveLocalHistory(history) {
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
}

/**
 * Fetch all versions for current user
 * @returns {Promise<Object>}
 */
export async function fetchVersions() {
  // If not authenticated or Supabase not configured, use localStorage
  if (!isSupabaseConfigured() || !isAuthenticated()) {
    return getLocalHistory();
  }

  const supabase = getSupabase();
  const userId = getUserId();

  if (!supabase || !userId) {
    return getLocalHistory();
  }

  try {
    const { data, error } = await supabase
      .from('versions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return getLocalHistory();
    }

    // Transform to expected format
    return {
      versions: (data || []).map(row => ({
        id: row.id,
        timestamp: row.created_at,
        label: row.label,
        values: row.values,
        hidden: row.hidden || []
      }))
    };
  } catch (err) {
    console.error('Failed to fetch versions:', err);
    return getLocalHistory();
  }
}

/**
 * Save a new version
 * @param {string} label - Version label
 * @param {Object} values - Form values
 * @param {Array} hidden - Hidden field names
 * @returns {Promise<Object>}
 */
export async function saveVersion(label, values, hidden) {
  const version = {
    id: 'v-' + Date.now(),
    timestamp: new Date().toISOString(),
    label: label || `Version ${Date.now()}`,
    values,
    hidden
  };

  // If not authenticated or Supabase not configured, use localStorage
  if (!isSupabaseConfigured() || !isAuthenticated()) {
    const history = getLocalHistory();
    history.versions.unshift(version);

    // Keep only last 20 versions locally
    if (history.versions.length > 20) {
      history.versions = history.versions.slice(0, 20);
    }

    saveLocalHistory(history);
    return version;
  }

  const supabase = getSupabase();
  const userId = getUserId();

  if (!supabase || !userId) {
    // Fallback to localStorage
    const history = getLocalHistory();
    history.versions.unshift(version);
    if (history.versions.length > 20) {
      history.versions = history.versions.slice(0, 20);
    }
    saveLocalHistory(history);
    return version;
  }

  try {
    const { data, error } = await supabase
      .from('versions')
      .insert({
        user_id: userId,
        label: version.label,
        values: values,
        hidden: hidden || []
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // Fallback to localStorage
      const history = getLocalHistory();
      history.versions.unshift(version);
      if (history.versions.length > 20) {
        history.versions = history.versions.slice(0, 20);
      }
      saveLocalHistory(history);
      return version;
    }

    // Return the created version
    return {
      id: data.id,
      timestamp: data.created_at,
      label: data.label,
      values: data.values,
      hidden: data.hidden || []
    };
  } catch (err) {
    console.error('Failed to save version:', err);
    // Fallback to localStorage
    const history = getLocalHistory();
    history.versions.unshift(version);
    if (history.versions.length > 20) {
      history.versions = history.versions.slice(0, 20);
    }
    saveLocalHistory(history);
    return version;
  }
}

/**
 * Load a specific version
 * @param {string} versionId - Version ID
 * @returns {Promise<Object|null>}
 */
export async function loadVersion(versionId) {
  // If not authenticated or Supabase not configured, use localStorage
  if (!isSupabaseConfigured() || !isAuthenticated()) {
    const history = getLocalHistory();
    return history.versions.find(v => v.id === versionId) || null;
  }

  const supabase = getSupabase();
  const userId = getUserId();

  if (!supabase || !userId) {
    const history = getLocalHistory();
    return history.versions.find(v => v.id === versionId) || null;
  }

  try {
    const { data, error } = await supabase
      .from('versions')
      .select('*')
      .eq('id', versionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Supabase load error:', error);
      // Try localStorage fallback
      const history = getLocalHistory();
      return history.versions.find(v => v.id === versionId) || null;
    }

    if (!data) return null;

    return {
      id: data.id,
      timestamp: data.created_at,
      label: data.label,
      values: data.values,
      hidden: data.hidden || []
    };
  } catch (err) {
    console.error('Failed to load version:', err);
    const history = getLocalHistory();
    return history.versions.find(v => v.id === versionId) || null;
  }
}

/**
 * Delete a version
 * @param {string} versionId - Version ID
 * @returns {Promise<boolean>}
 */
export async function deleteVersion(versionId) {
  // If not authenticated or Supabase not configured, use localStorage
  if (!isSupabaseConfigured() || !isAuthenticated()) {
    const history = getLocalHistory();
    const index = history.versions.findIndex(v => v.id === versionId);
    if (index > -1) {
      history.versions.splice(index, 1);
      saveLocalHistory(history);
      return true;
    }
    return false;
  }

  const supabase = getSupabase();
  const userId = getUserId();

  if (!supabase || !userId) {
    const history = getLocalHistory();
    const index = history.versions.findIndex(v => v.id === versionId);
    if (index > -1) {
      history.versions.splice(index, 1);
      saveLocalHistory(history);
      return true;
    }
    return false;
  }

  try {
    const { error } = await supabase
      .from('versions')
      .delete()
      .eq('id', versionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase delete error:', error);
      // Try localStorage fallback
      const history = getLocalHistory();
      const index = history.versions.findIndex(v => v.id === versionId);
      if (index > -1) {
        history.versions.splice(index, 1);
        saveLocalHistory(history);
        return true;
      }
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to delete version:', err);
    const history = getLocalHistory();
    const index = history.versions.findIndex(v => v.id === versionId);
    if (index > -1) {
      history.versions.splice(index, 1);
      saveLocalHistory(history);
      return true;
    }
    return false;
  }
}

/**
 * Format timestamp for display
 * @param {string} isoString - ISO timestamp string
 * @returns {string}
 */
export function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Migrate local versions to Supabase (called after login)
 * @returns {Promise<number>} Number of versions migrated
 */
export async function migrateLocalToSupabase() {
  if (!isSupabaseConfigured() || !isAuthenticated()) {
    return 0;
  }

  const supabase = getSupabase();
  const userId = getUserId();

  if (!supabase || !userId) {
    return 0;
  }

  const localHistory = getLocalHistory();
  if (!localHistory.versions || localHistory.versions.length === 0) {
    return 0;
  }

  let migrated = 0;

  for (const version of localHistory.versions) {
    try {
      const { error } = await supabase
        .from('versions')
        .insert({
          user_id: userId,
          label: version.label,
          values: version.values,
          hidden: version.hidden || [],
          created_at: version.timestamp
        });

      if (!error) {
        migrated++;
      }
    } catch (err) {
      console.error('Migration error for version:', version.label, err);
    }
  }

  // Clear local storage after successful migration
  if (migrated > 0) {
    localStorage.removeItem(LOCAL_HISTORY_KEY);
  }

  return migrated;
}
