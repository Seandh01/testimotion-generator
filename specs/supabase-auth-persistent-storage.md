# TESTIMOTION Generator - Supabase Auth + Persistent Storage

## Summary

Implemented Supabase authentication with magic link login (invite-only) and persistent version history storage.

## Files Created

| File | Purpose |
|------|---------|
| `generator/supabase.js` | Supabase client initialization |
| `generator/auth.js` | Authentication functions (login, logout, session management) |
| `generator/supabase-setup.sql` | Database schema for Supabase |

## Files Modified

| File | Changes |
|------|---------|
| `generator/index.html` | Added Supabase CDN, login modal, auth UI in header |
| `generator/style.css` | Added auth-related styles (login modal, auth UI) |
| `generator/history.js` | Migrated from server API to Supabase with localStorage fallback |
| `generator/app.js` | Integrated auth system, updated imports, added auth handlers |

## Architecture

### Authentication Flow

1. User clicks "Login" button in header
2. Login modal appears with email input
3. User enters email and clicks "Send Login Link"
4. Magic link sent via Supabase Auth
5. User clicks link in email
6. User authenticated, redirected back to generator
7. Auth state persists via Supabase session

### Version History Storage

- **Authenticated users**: Versions stored in Supabase `versions` table
- **Unauthenticated users**: Versions stored in localStorage (fallback)
- **Migration**: Local versions automatically migrate to Supabase on login

### Security

- Row Level Security (RLS) ensures users only access their own data
- Magic links (no passwords to manage)
- Supabase anon key is public-safe (RLS protects data)

## Setup Instructions

### 1. Supabase Database Setup

Run `generator/supabase-setup.sql` in Supabase SQL Editor:

```sql
-- Creates versions table
-- Enables Row Level Security
-- Creates necessary indexes
```

### 2. Configure Supabase Anon Key

In `generator/index.html`, update the anon key:

```html
<script>
  window.SUPABASE_ANON_KEY = 'your-actual-anon-key-here';
</script>
```

### 3. Invite Users

Use Supabase Dashboard:
1. Go to Authentication > Users
2. Click "Invite user"
3. Enter email address
4. Supabase sends magic link invitation

## API Reference

### Auth Module (`auth.js`)

```javascript
// Initialize auth (call on page load)
await initAuth()

// Send magic link
const result = await loginWithMagicLink(email)
// Returns: { success: boolean, error?: string }

// Sign out
await logout()

// Get current user
const user = getCurrentUser()

// Check if authenticated
const isLoggedIn = isAuthenticated()

// Get user email
const email = getUserEmail()

// Subscribe to auth changes
const unsubscribe = onAuthStateChange((user, event) => {
  // Handle auth state change
})
```

### History Module (`history.js`)

```javascript
// Fetch all versions
const history = await fetchVersions()
// Returns: { versions: [...] }

// Save a version
const version = await saveVersion(label, values, hidden)

// Load a specific version
const version = await loadVersion(versionId)

// Delete a version
await deleteVersion(versionId)

// Migrate local to Supabase (called automatically on login)
const count = await migrateLocalToSupabase()
```

## UI Components

### Header Auth UI

- **Logged out**: Shows "Login" button with icon
- **Logged in**: Shows user email + "Logout" link

### Login Modal

- Email input field
- "Send Login Link" button with loading state
- Success/error message display
- No "Register" or "Sign Up" option (invite-only)

### History Section

- Shows login prompt when not authenticated
- Lists saved versions with load/delete buttons
- Indicates cloud vs local storage

## Verification Checklist

- [ ] Login modal appears when clicking "Login" button
- [ ] Magic link email received after entering email
- [ ] Clicking magic link logs user in
- [ ] User email displayed in header when logged in
- [ ] Logout button works
- [ ] Session persists on page refresh
- [ ] Save version creates row in Supabase (when logged in)
- [ ] Load version retrieves correct data
- [ ] Delete version removes row
- [ ] User A cannot see User B's versions (RLS)
- [ ] Unauthenticated users can still use localStorage
- [ ] Local versions migrate to Supabase on login

## Environment Variables (Vercel)

```
SUPABASE_URL=https://rhdgpxdppwgveicjznok.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key
```

Note: The anon key is also embedded in index.html for client-side use.
