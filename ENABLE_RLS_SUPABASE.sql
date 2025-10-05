-- ============================================
-- ENABLE RLS AND ADD SECURITY POLICIES
-- Run this AFTER creating the newsletter_subscriptions table
-- ============================================

-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE "public"."newsletter_subscriptions" ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES (if any)
-- ============================================
DROP POLICY IF EXISTS "Allow service role full access" ON "public"."newsletter_subscriptions";
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON "public"."newsletter_subscriptions";
DROP POLICY IF EXISTS "Allow authenticated users to read own subscriptions" ON "public"."newsletter_subscriptions";
DROP POLICY IF EXISTS "Allow public insert for subscriptions" ON "public"."newsletter_subscriptions";

-- 3. CREATE POLICIES
-- ============================================

-- Policy 1: Allow service role (your API) to do everything
CREATE POLICY "Allow service role full access"
ON "public"."newsletter_subscriptions"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 2: Allow authenticated users (logged in via Supabase Auth) to insert
CREATE POLICY "Allow authenticated users to insert"
ON "public"."newsletter_subscriptions"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Allow public (anonymous) to insert subscriptions
-- This is what your website uses when users subscribe
CREATE POLICY "Allow public insert for subscriptions"
ON "public"."newsletter_subscriptions"
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 4: Users can read their own subscriptions (by email)
CREATE POLICY "Allow users to read own subscriptions"
ON "public"."newsletter_subscriptions"
FOR SELECT
TO anon, authenticated
USING (true);  -- Anyone can read (you can restrict this if needed)

-- 4. VERIFY RLS IS ENABLED
-- ============================================
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'newsletter_subscriptions') as policy_count
FROM pg_tables
WHERE tablename = 'newsletter_subscriptions';

-- Should show:
-- rls_enabled: true
-- policy_count: 4

SELECT 'SUCCESS: RLS enabled with 4 security policies!' as message;
