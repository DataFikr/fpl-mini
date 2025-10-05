-- FIX DATABASE FOR NEWSLETTER SUBSCRIPTIONS
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Step 1: Check if table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'newsletter_subscriptions'
    ) THEN
        RAISE NOTICE 'Table does not exist, will create it';
    ELSE
        RAISE NOTICE 'Table already exists';
    END IF;
END
$$;

-- Step 2: Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."newsletter_subscriptions" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSentAt" TIMESTAMP(3)
);

-- Step 3: Create unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'newsletter_subscriptions_email_leagueId_key'
    ) THEN
        ALTER TABLE "public"."newsletter_subscriptions"
        ADD CONSTRAINT "newsletter_subscriptions_email_leagueId_key"
        UNIQUE ("email", "leagueId");
        RAISE NOTICE 'Unique constraint created';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END
$$;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_email_idx"
    ON "public"."newsletter_subscriptions"("email");

CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_leagueId_idx"
    ON "public"."newsletter_subscriptions"("leagueId");

CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_isActive_idx"
    ON "public"."newsletter_subscriptions"("isActive");

-- Step 5: Grant permissions
GRANT ALL ON TABLE "public"."newsletter_subscriptions" TO "postgres";
GRANT ALL ON TABLE "public"."newsletter_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscriptions" TO "service_role";

-- Step 6: Grant sequence permissions
GRANT ALL ON SEQUENCE "public"."newsletter_subscriptions_id_seq" TO "postgres";
GRANT ALL ON SEQUENCE "public"."newsletter_subscriptions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."newsletter_subscriptions_id_seq" TO "service_role";

-- Step 7: Verify table was created
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'newsletter_subscriptions') as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'newsletter_subscriptions';

-- Success message
SELECT 'Newsletter subscriptions table is ready!' as status;
