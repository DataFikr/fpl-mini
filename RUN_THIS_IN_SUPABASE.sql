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

-- 5. VERIFY TABLE EXISTS
-- ============================================
SELECT
    'SUCCESS: newsletter_subscriptions table is ready!' as message,
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'newsletter_subscriptions') as column_count,
    (SELECT count(*) FROM pg_indexes
     WHERE tablename = 'newsletter_subscriptions') as index_count;
