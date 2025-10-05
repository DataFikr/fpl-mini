# Database Migration Guide for FPL Mini League Hub

## Issue: "Failed to save subscription" Error

If you're seeing this error in production, it means the database migrations haven't been run on your production database.

## Solution: Deploy Database Migrations

### Option 1: Using Vercel CLI (Recommended)

1. **Set up DATABASE_URL in Vercel**
   ```bash
   # First, ensure your DATABASE_URL is set in Vercel
   vercel env pull .env.production.local
   ```

2. **Run migrations on production database**
   ```bash
   # Load production environment variables
   source .env.production.local  # On Mac/Linux
   # OR
   Get-Content .env.production.local | ForEach-Object { $name, $value = $_.Split('='); [Environment]::SetEnvironmentVariable($name, $value) }  # On Windows PowerShell

   # Run migrations
   npx prisma migrate deploy
   ```

### Option 2: Using Vercel Build Command

1. **Update build script in package.json**

   The current build script already includes Prisma generation:
   ```json
   "build": "prisma generate && next build"
   ```

   To also run migrations during build, update to:
   ```json
   "build": "prisma generate && prisma migrate deploy && next build"
   ```

   **⚠️ Note:** Running migrations during build is not always recommended as it can slow down deployments and may cause issues with concurrent builds.

### Option 3: Manual Database Setup (PostgreSQL)

If you have direct access to your PostgreSQL database:

1. **Connect to your database**
   ```bash
   psql "your-database-url-here"
   ```

2. **Run the migration SQL manually**
   ```sql
   -- This is from prisma/migrations/20250921040712_init/migration.sql

   CREATE TABLE IF NOT EXISTS "public"."newsletter_subscriptions" (
       "id" SERIAL NOT NULL,
       "email" TEXT NOT NULL,
       "leagueId" INTEGER NOT NULL,
       "isActive" BOOLEAN NOT NULL DEFAULT true,
       "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       "lastSentAt" TIMESTAMP(3),
       CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
   );

   CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscriptions_email_leagueId_key"
   ON "public"."newsletter_subscriptions"("email", "leagueId");
   ```

## Verifying the Migration

After running migrations, verify the table exists:

```bash
# Using Prisma Studio
npx prisma studio

# Or using psql
psql "your-database-url-here" -c "\dt public.*"
```

You should see the `newsletter_subscriptions` table listed.

## Environment Variables Required

Ensure these environment variables are set in Vercel:

1. **DATABASE_URL** - Your PostgreSQL connection string
   ```
   postgresql://user:password@host:port/database
   ```

2. **RESEND_API_KEY** (Optional, for actual email sending)
   ```
   re_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **FROM_EMAIL** (Optional, for actual email sending)
   ```
   noreply@yourdomain.com
   ```

## Testing After Migration

1. Visit your deployed site
2. Go to any league page
3. Click "Send Newsletter & Subscribe"
4. Enter an email address
5. Click submit

You should now see:
- ✅ Success message instead of "Failed to save subscription"
- Email saved in the database
- Newsletter sent (if RESEND_API_KEY is configured)

## Troubleshooting

### Error: "relation does not exist"
- The migrations haven't been run yet
- Follow Option 1 or Option 3 above

### Error: "Database connection failed"
- Check that DATABASE_URL is set correctly in Vercel environment variables
- Verify your database is accessible from Vercel's servers
- Check database credentials and network settings

### Error: "Failed to save subscription" (after migration)
- Check Vercel deployment logs: `vercel logs`
- Look for specific error messages in the API route logs
- Verify the NewsletterSubscription model matches the database schema

## Additional Notes

- The migration file is located at: `prisma/migrations/20250921040712_init/migration.sql`
- All other tables (teams, leagues, gameweek_data, etc.) are also created by this migration
- The application uses PostgreSQL as the database provider
- Connection pooling is configured in `src/lib/database.ts`
