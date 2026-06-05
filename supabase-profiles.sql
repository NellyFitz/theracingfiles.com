-- ============================================================
-- Universal profiles table (all users: members + creators)
-- ============================================================
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  address_line1 text,
  address_line2 text,
  city          text,
  state         text,
  zip           text,
  role          text NOT NULL DEFAULT 'member'
                  CHECK (role IN ('member', 'creator')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and write their own row
CREATE POLICY "own profile select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- user_profiles: keep as-is, but role in profiles governs
-- access. Drop the address columns we added earlier since they
-- now live in profiles (run only if you ran the previous migration).
-- ============================================================
-- ALTER TABLE user_profiles
--   DROP COLUMN IF EXISTS address_line1,
--   DROP COLUMN IF EXISTS address_line2,
--   DROP COLUMN IF EXISTS city,
--   DROP COLUMN IF EXISTS state,
--   DROP COLUMN IF EXISTS zip;
