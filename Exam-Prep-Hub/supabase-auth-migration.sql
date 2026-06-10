-- =============================================================================
-- Supabase migration: extend `profiles` for password auth + multi-identifier
-- login (email / phone / username) + onboarding fields used by Gurutron.
--
-- Safe to run multiple times — every statement is idempotent.
-- =============================================================================

-- 1. Add missing columns -------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone           TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school_name     TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS class_level     TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skip_class_join BOOLEAN DEFAULT FALSE;

-- The scrypt password hash (format: "scrypt$<saltHex>$<hashHex>").
-- Stored only in the backend writes; never returned to the client.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash   TEXT;

-- 2. Uniqueness ----------------------------------------------------------------
-- Case-insensitive unique username. We do NOT use a plain UNIQUE constraint
-- because we want "Foo" and "foo" to collide.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique_idx
  ON profiles (LOWER(username))
  WHERE username IS NOT NULL;

-- Phone uniqueness — strip non-digits to compare. Optional; comment out if
-- you want to allow shared phone numbers.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_digits_unique_idx
  ON profiles (regexp_replace(phone, '\D', '', 'g'))
  WHERE phone IS NOT NULL AND length(regexp_replace(phone, '\D', '', 'g')) >= 7;

-- 3. Lookup indexes (used by /auth/login multi-identifier search) -------------
CREATE INDEX IF NOT EXISTS profiles_email_lower_idx    ON profiles (LOWER(email));
CREATE INDEX IF NOT EXISTS profiles_username_lower_idx ON profiles (LOWER(username));
CREATE INDEX IF NOT EXISTS profiles_phone_idx          ON profiles (phone);

-- 4. Lock down `password_hash` via Row Level Security -------------------------
-- Existing policy "Allow all operations on profiles" still lets the backend
-- (service-role key) read/write everything. RLS only affects anon/auth-user
-- access. Add a SELECT policy that excludes the hash column for safety if
-- you ever expose the table directly to the client. The Gurutron backend
-- uses the service role and is unaffected.
--
-- (Nothing to change here if you only access profiles from the backend.
--  Just make sure SUPABASE_ANON_KEY is NEVER used to SELECT * from profiles
--  on the client.)
