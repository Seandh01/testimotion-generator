-- TESTIMOTION Generator - Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================
-- PART 1: AUTHENTICATION SETUP
-- ============================================

-- Supabase Auth is pre-configured, but you need to:
--
-- 1. Go to Authentication > Providers
--    - Ensure "Email" provider is ENABLED
--    - Enable "Confirm email" (for magic links)
--    - Disable "Secure email change" if you want simpler flow
--
-- 2. Go to Authentication > URL Configuration
--    - Site URL: https://your-vercel-domain.vercel.app/generator/
--    - Redirect URLs: Add your domains:
--      - http://localhost:3000/generator/
--      - http://localhost:5000/generator/
--      - https://your-vercel-domain.vercel.app/generator/
--      - https://your-custom-domain.com/generator/
--
-- 3. Go to Authentication > Email Templates
--    - Customize "Magic Link" template (optional)
--    - Subject: "Login to TESTIMOTION Generator"
--    - Body: Use {{ .ConfirmationURL }} for the magic link
--
-- 4. Go to Authentication > Settings
--    - JWT expiry: 3600 (1 hour) or 86400 (24 hours)
--    - Enable "Allow new users to sign up" = OFF (invite-only)
--
-- 5. To invite users:
--    - Go to Authentication > Users
--    - Click "Invite user"
--    - Enter their email address
--    - They receive a magic link to set up their account

-- ============================================
-- PART 2: VERSIONS TABLE
-- Stores user configuration versions
-- ============================================

CREATE TABLE IF NOT EXISTS versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  values JSONB NOT NULL,
  hidden TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================

-- Enable RLS on the table
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own versions
CREATE POLICY "Users can view own versions" ON versions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own versions
CREATE POLICY "Users can insert own versions" ON versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own versions
CREATE POLICY "Users can update own versions" ON versions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own versions
CREATE POLICY "Users can delete own versions" ON versions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- For faster queries
-- ============================================

CREATE INDEX IF NOT EXISTS idx_versions_user_id ON versions(user_id);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON versions(created_at DESC);

-- ============================================
-- VERIFICATION
-- Run these to verify setup
-- ============================================

-- Check table exists
-- SELECT * FROM versions LIMIT 1;

-- Check RLS is enabled
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'versions';

-- Check policies exist
-- SELECT * FROM pg_policies WHERE tablename = 'versions';

-- ============================================
-- PART 4: AUTH CONFIGURATION (Dashboard Steps)
-- ============================================

/*
STEP-BY-STEP SUPABASE DASHBOARD CONFIGURATION:

1. EMAIL PROVIDER SETTINGS
   Location: Authentication > Providers > Email

   Settings to configure:
   - Enable Email provider: ON
   - Confirm email: ON (required for magic links)
   - Secure email change: OFF (optional, simplifies flow)
   - Double confirm email changes: OFF (optional)

2. URL CONFIGURATION (CRITICAL)
   Location: Authentication > URL Configuration

   Site URL:
   - https://testimotion-generator.vercel.app/generator/
   (Replace with your actual Vercel URL)

   Redirect URLs (add all of these):
   - http://localhost:3000/generator/
   - http://localhost:5000/generator/
   - http://127.0.0.1:3000/generator/
   - https://testimotion-generator.vercel.app/generator/
   - https://your-custom-domain.com/generator/

3. RATE LIMITS
   Location: Authentication > Rate Limits

   Recommended settings:
   - Rate limit for sending emails: 4 per hour
   - Rate limit for token refresh: 360 per hour

4. DISABLE SIGN-UPS (INVITE-ONLY)
   Location: Authentication > Settings

   - Enable "Disable signup": ON

   This makes it invite-only. Users can ONLY join via:
   - Admin inviting them from Dashboard
   - API invite (requires service_role key)

5. EMAIL TEMPLATES (Optional Customization)
   Location: Authentication > Email Templates

   Magic Link Template:

   Subject: Login to TESTIMOTION Generator

   Body:
   <h2>Login to TESTIMOTION Generator</h2>
   <p>Click the button below to log in:</p>
   <p><a href="{{ .ConfirmationURL }}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Login Now</a></p>
   <p>Or copy this link: {{ .ConfirmationURL }}</p>
   <p>This link expires in 24 hours.</p>

6. INVITING USERS
   Location: Authentication > Users > Invite user

   - Click "Invite user" button
   - Enter email address
   - Click "Invite"
   - User receives email with magic link
   - First click creates their account + logs them in

*/

-- ============================================
-- PART 5: USEFUL QUERIES
-- ============================================

-- List all users (run as admin)
-- SELECT id, email, created_at, last_sign_in_at
-- FROM auth.users
-- ORDER BY created_at DESC;

-- Count versions per user
-- SELECT
--   u.email,
--   COUNT(v.id) as version_count
-- FROM auth.users u
-- LEFT JOIN public.versions v ON u.id = v.user_id
-- GROUP BY u.id, u.email
-- ORDER BY version_count DESC;

-- Delete all versions for a specific user (use with caution)
-- DELETE FROM public.versions
-- WHERE user_id = 'user-uuid-here';

-- ============================================
-- PART 6: TROUBLESHOOTING
-- ============================================

/*
COMMON ISSUES:

1. "Invalid login credentials" or no magic link received:
   - Check spam folder
   - Verify email provider is enabled
   - Check rate limits haven't been exceeded
   - Ensure user was invited (if signup disabled)

2. "Invalid redirect URL":
   - Add the exact URL to Redirect URLs in dashboard
   - Include trailing slash if your app uses it
   - Check for http vs https mismatch

3. "User not found" after clicking magic link:
   - Link may have expired (24 hours default)
   - User may need to be re-invited

4. RLS errors (user can't see their data):
   - Verify RLS policies are created
   - Check auth.uid() returns correct user ID
   - Ensure user_id column matches auth.users(id)

5. CORS errors:
   - This shouldn't happen with Supabase
   - If it does, check your Supabase URL is correct

*/
