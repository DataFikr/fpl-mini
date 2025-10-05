-- ============================================
-- FPL RANKER - DATABASE FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- 1. CREATE newsletter_subscriptions TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "public"."newsletter_subscriptions" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSentAt" TIMESTAMP(3)
);

-- 2. ADD UNIQUE CONSTRAINT
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'newsletter_subscriptions_email_leagueId_key'
    ) THEN
        ALTER TABLE "public"."newsletter_subscriptions"
        ADD CONSTRAINT "newsletter_subscriptions_email_leagueId_key"
        UNIQUE ("email", "leagueId");
    END IF;
END
$$;

-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_email_idx"
    ON "public"."newsletter_subscriptions"("email");

CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_leagueId_idx"
    ON "public"."newsletter_subscriptions"("leagueId");

CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_isActive_idx"
    ON "public"."newsletter_subscriptions"("isActive");

-- 4. GRANT PERMISSIONS (CRITICAL!)
-- ============================================
GRANT ALL ON TABLE "public"."newsletter_subscriptions" TO "postgres";
GRANT ALL ON TABLE "public"."newsletter_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscriptions" TO "service_role";
GRANT ALL ON TABLE "public"."newsletter_subscriptions" TO "anon";

-- Grant sequence permissions
GRANT ALL ON SEQUENCE "public"."newsletter_subscriptions_id_seq" TO "postgres";
GRANT ALL ON SEQUENCE "public"."newsletter_subscriptions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."newsletter_subscriptions_id_seq" TO "service_role";
GRANT ALL ON SEQUENCE "public"."newsletter_subscriptions_id_seq" TO "anon";

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE "public"."newsletter_subscriptions" ENABLE ROW LEVEL SECURITY;

-- 6. CREATE SECURITY POLICIES
-- ============================================
-- Allow service role (your backend API) full access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'newsletter_subscriptions'
        AND policyname = 'Allow service role full access'
    ) THEN
        CREATE POLICY "Allow service role full access"
        ON "public"."newsletter_subscriptions"
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- Allow anonymous users (website visitors) to insert subscriptions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'newsletter_subscriptions'
        AND policyname = 'Allow public insert for subscriptions'
    ) THEN
        CREATE POLICY "Allow public insert for subscriptions"
        ON "public"."newsletter_subscriptions"
        FOR INSERT
        TO anon
        WITH CHECK (true);
    END IF;
END
$$;

-- Allow authenticated users to insert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'newsletter_subscriptions'
        AND policyname = 'Allow authenticated users to insert'
    ) THEN
        CREATE POLICY "Allow authenticated users to insert"
        ON "public"."newsletter_subscriptions"
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;
END
$$;

-- Allow anyone to read (you can restrict this later if needed)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'newsletter_subscriptions'
        AND policyname = 'Allow public read'
    ) THEN
        CREATE POLICY "Allow public read"
        ON "public"."newsletter_subscriptions"
        FOR SELECT
        TO anon, authenticated
        USING (true);
    END IF;
END
$$;

-- 7. VERIFY TABLE EXISTS AND RLS IS ENABLED
-- ============================================
SELECT
    'SUCCESS: newsletter_subscriptions table is ready with RLS!' as message,
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'newsletter_subscriptions') as column_count,
    (SELECT count(*) FROM pg_indexes
     WHERE tablename = 'newsletter_subscriptions') as index_count,
    (SELECT rowsecurity FROM pg_tables
     WHERE tablename = 'newsletter_subscriptions') as rls_enabled,
    (SELECT count(*) FROM pg_policies
     WHERE tablename = 'newsletter_subscriptions') as policy_count;
