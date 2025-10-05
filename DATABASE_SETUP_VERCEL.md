# Database Setup for Vercel Production

## Issue: Newsletter Subscription Error

If you're seeing "Failed to save subscription" errors on the deployed site, it's because the database migrations haven't been run on your production database yet.

## Solution: Run Migrations on Vercel

### Option 1: Via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   cd "C:\Users\Family\FPL Mini"
   vercel link
   ```

4. **Pull production environment variables**:
   ```bash
   vercel env pull .env.production.local
   ```

5. **Run migrations on production database**:
   ```bash
   npx prisma migrate deploy
   ```

   This will apply all pending migrations to your production database.

### Option 2: Via Database Client (Supabase)

If the above doesn't work or you prefer using SQL directly:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (FPL Ranker)
3. **Click SQL Editor**
4. **Run this SQL**:

```sql
-- Check if newsletter_subscriptions table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_name = 'newsletter_subscriptions'
);

-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS "newsletter_subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "leagueId" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSentAt" TIMESTAMP(3),
  CONSTRAINT "newsletter_subscriptions_email_leagueId_key" UNIQUE ("email", "leagueId")
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_email_idx" ON "newsletter_subscriptions"("email");
CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_leagueId_idx" ON "newsletter_subscriptions"("leagueId");
```

5. **Click "Run"**

### Option 3: Via Prisma Studio (Vercel)

1. **Add a Vercel environment variable** to enable Prisma Studio:
   ```
   ENABLE_PRISMA_STUDIO=true
   ```

2. **Deploy and run**:
   ```bash
   vercel
   npx prisma studio
   ```

## Verify Migration Success

After running migrations, test the newsletter subscription:

1. Visit https://fplranker.com
2. Search for a league
3. Click "Get Newsletter"
4. Enter your email
5. Submit

**Expected Result**:
- ✅ "Newsletter sent successfully and subscription saved!"
- ❌ NOT: "Failed to save subscription"

## Troubleshooting

### Error: "relation newsletter_subscriptions does not exist"

**Solution**: The migrations haven't been applied. Follow Option 1 or 2 above.

### Error: "Database connection failed"

**Possible causes**:
1. **DATABASE_URL not set in Vercel**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `DATABASE_URL` is set for Production environment
   - Should look like: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`

2. **Supabase database paused**:
   - Free tier Supabase projects pause after inactivity
   - Go to Supabase dashboard and wake it up

3. **Incorrect connection string**:
   - Get the correct connection string from Supabase:
     - Supabase Dashboard → Project Settings → Database
     - Copy "Connection string" under "Connection pooling"
   - Update in Vercel environment variables

### Error: "Email service not configured"

This is expected if `RESEND_API_KEY` is not set. The subscription will still be saved to the database, but emails won't be sent.

**To fix**:
1. Sign up at https://resend.com
2. Get your API key
3. Add to Vercel environment variables:
   - Key: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxx`
4. Redeploy

## Current Environment Variables Needed

Make sure these are set in Vercel for Production:

```env
# Required
DATABASE_URL=postgresql://...  (from Supabase)

# Optional but recommended
RESEND_API_KEY=re_xxxxx  (for email functionality)
FROM_EMAIL=noreply@fplranker.com  (your verified domain)

# Optional
REDIS_URL=  (leave empty to use memory cache)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  (for analytics)
```

## Database Migration Files

Your project has these migrations in `prisma/migrations/`:
- ✅ `20250921040712_init` - Initial schema

If you add new models or fields, create a new migration:
```bash
npx prisma migrate dev --name description_of_change
```

Then deploy to production:
```bash
npx prisma migrate deploy
```

## Quick Check

Run this command to see the current database schema:
```bash
npx prisma db pull
```

This will show you what's actually in your production database.

---

**After fixing the database, your newsletter subscriptions should work!** 📧✅
