// History management module for TESTIMOTION Generator v3
// Provides server-backed history with localStorage fallback

const API_BASE = '/api/history';
const LOCAL_HISTORY_KEY = 'testimotion_history';

// Generate a client ID based on URL or stored preference
export function getClientId() {
  // Check URL params first
  const params = new URLSearchParams(window.location.search);
  let clientId = params.get('clientId');

  // Fallback to localStorage
  if (!clientId) {
    clientId = localStorage.getItem('testimotion_client_id');
  }

  // Generate new ID if none exists
  if (!clientId) {
    clientId = 'client-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('testimotion_client_id', clientId);
  }

  return clientId;
}

// Check if server is available
async function isServerAvailable() {
  try {
    const response = await fetch('/api/health', { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

// Get local history fallback
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

// Save local history fallback
function saveLocalHistory(history) {
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
}

// Fetch all versions for current client
export async function fetchVersions() {
  const clientId = getClientId();

  if (await isServerAvailable()) {
    try {
      const response = await fetch(`${API_BASE}/${clientId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Server unavailable, using local storage:', err);
    }
  }

  // Fallback to localStorage
  return getLocalHistory();
}

// Save a new version
export async function saveVersion(label, values, hidden) {
  const clientId = getClientId();
  const version = {
    id: 'v-' + Date.now(),
    timestamp: new Date().toISOString(),
    label: label || `Version ${Date.now()}`,
    values,
    hidden
  };

  if (await isServerAvailable()) {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, label, values, hidden })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Server unavailable, saving locally:', err);
    }
  }

  // Fallback to localStorage
  const history = getLocalHistory();
  history.versions.unshift(version);

  // Keep only last 20 versions locally
  if (history.versions.length > 20) {
    history.versions = history.versions.slice(0, 20);
  }

  saveLocalHistory(history);
  return version;
}

// Load a specific version
export async function loadVersion(versionId) {
  const clientId = getClientId();

  if (await isServerAvailable()) {
    try {
      const response = await fetch(`${API_BASE}/${clientId}/${versionId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Server unavailable, loading from local storage:', err);
    }
  }

  // Fallback to localStorage
  const history = getLocalHistory();
  return history.versions.find(v => v.id === versionId);
}

// Delete a version
export async function deleteVersion(versionId) {
  const clientId = getClientId();

  if (await isServerAvailable()) {
    try {
      const response = await fetch(`${API_BASE}/${clientId}/${versionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        return true;
      }
    } catch (err) {
      console.warn('Server unavailable, deleting from local storage:', err);
    }
  }

  // Fallback to localStorage
  const history = getLocalHistory();
  const index = history.versions.findIndex(v => v.id === versionId);
  if (index > -1) {
    history.versions.splice(index, 1);
    saveLocalHistory(history);
    return true;
  }

  return false;
}

// Format timestamp for display
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
