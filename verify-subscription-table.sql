-- Verify newsletter_subscriptions table exists and has correct structure
-- Run this against your production database to verify the migration

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'newsletter_subscriptions'
) as table_exists;

-- Show table structure
\d public.newsletter_subscriptions;

-- Show sample data (if any)
SELECT id, email, "leagueId", "isActive", "createdAt", "lastSentAt"
FROM public.newsletter_subscriptions
ORDER BY "createdAt" DESC
LIMIT 10;

-- Show count of subscriptions
SELECT COUNT(*) as total_subscriptions,
       COUNT(DISTINCT email) as unique_emails,
       COUNT(DISTINCT "leagueId") as leagues_with_subscriptions
FROM public.newsletter_subscriptions
WHERE "isActive" = true;
