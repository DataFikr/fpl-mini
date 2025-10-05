# Email Automation & Subscriber Management Guide

This guide explains how to use the email automation system, manage subscribers, and configure cron jobs for automated weekly emails.

## Table of Contents

1. [Contact Form Email](#contact-form-email)
2. [Subscriber Management](#subscriber-management)
3. [Weekly Email Cron Jobs](#weekly-email-cron-jobs)
4. [Environment Variables](#environment-variables)
5. [Testing](#testing)

---

## Contact Form Email

### Overview
When users submit the contact form at `/contact`, an email is automatically sent to `support@fplranker.com`.

### API Endpoint
- **URL**: `/api/contact`
- **Method**: `POST`
- **Request Body**:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "message": "User's message here"
}
```

### Response
```json{
  "success": true,
  "message": "Message sent successfully! We will get back to you soon.",
  "emailId": "email-message-id"
}
```

### Implementation
The contact form in `/src/app/contact/page.tsx` now calls the `/api/contact` endpoint which:
1. Validates the input (name, email, message)
2. Sends a formatted email to `support@fplranker.com`
3. Returns success/failure status

---

## Subscriber Management

### Get All Subscribers

#### Endpoint
- **URL**: `/api/newsletter/subscriptions`
- **Method**: `GET`
- **Authentication**: None (consider adding authentication in production)

#### Response
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "subscription-id",
      "email": "user@example.com",
      "leagueId": 150789,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastSentAt": "2025-01-05T12:00:00.000Z"
    }
  ]
}
```

### Subscribe to Newsletter

#### Endpoint
- **URL**: `/api/newsletter/subscribe`
- **Method**: `POST`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "leagueId": 150789,
  "leagueName": "My League",
  "gameweek": 6,
  "subscriptionType": "newsletter"
}
```

### Database Schema
The newsletter subscriptions are stored in the `newsletterSubscription` table:
```prisma
model NewsletterSubscription {
  id         String   @id @default(cuid())
  email      String
  leagueId   Int
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  lastSentAt DateTime?
}
```

---

## Weekly Email Cron Jobs

### 1. Weekly Gameweek Summary (Monday)

#### Purpose
Sends a comprehensive gameweek summary to all subscribers after the gameweek completes (typically Sunday/Monday).

#### Configuration
- **Schedule**: Every Monday at 12:00 PM UTC (`0 12 * * 1`)
- **Endpoint**: `/api/cron/weekly-summary`
- **Method**: `POST`

#### What it Does
1. Fetches the current gameweek from FPL API
2. Gets all active subscribers from the database
3. Groups subscribers by league
4. Fetches league data for each unique league
5. Sends personalized weekly summary email to each subscriber
6. Updates `lastSentAt` timestamp for successful sends
7. Returns statistics (sent count, failed count)

#### Manual Trigger (Development Only)
```bash
# GET request (development only)
curl http://localhost:3000/api/cron/weekly-summary

# POST request (with optional authorization)
curl -X POST http://localhost:3000/api/cron/weekly-summary \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Response
```json
{
  "success": true,
  "message": "Weekly summary emails processed",
  "sent": 45,
  "failed": 2,
  "totalSubscriptions": 47
}
```

---

### 2. Thursday Reminder Email

#### Purpose
Sends reminder emails every Thursday to help users prepare their teams before the Friday deadline.

#### Configuration
- **Schedule**: Every Thursday at 10:00 AM UTC (`0 10 * * 4`)
- **Endpoint**: `/api/cron/thursday-reminder`
- **Method**: `POST`

#### What it Does
1. Calculates the upcoming gameweek
2. Gets all active subscribers
3. Groups subscribers by league
4. Sends personalized reminder emails with:
   - Deadline countdown
   - Pre-deadline checklist
   - Link to league page on fplranker.com
   - Tips for gameweek preparation
5. Returns statistics

#### Email Content
The Thursday reminder email includes:
- ⏰ Deadline alert (Friday 18:30 UK time)
- ✅ Pre-deadline checklist:
  - Make transfers
  - Pick captain
  - Check starting XI
  - Verify formations
  - Monitor price changes
  - Check injuries
- 🏆 Link to view league on fplranker.com
- 📊 What to expect during the gameweek
- 💡 Pro tips for tracking live performance

#### Manual Trigger (Development Only)
```bash
# GET request (development only)
curl http://localhost:3000/api/cron/thursday-reminder

# POST request (with optional authorization)
curl -X POST http://localhost:3000/api/cron/thursday-reminder \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Environment Variables

### Required Variables

Add these to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@fplranker.com

# Cron Job Security (Optional but Recommended)
CRON_SECRET=your_random_secret_string_here

# Base URL for email links
NEXT_PUBLIC_BASE_URL=https://fplranker.com

# Database
DATABASE_URL=postgresql://...
```

### Getting Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Create an API key
4. Add it to `.env.local`

---

## Vercel Cron Jobs Setup

The `vercel.json` file is configured with cron schedules:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-summary",
      "schedule": "0 12 * * 1"
    },
    {
      "path": "/api/cron/thursday-reminder",
      "schedule": "0 10 * * 4"
    }
  ]
}
```

### Cron Schedule Format
The schedule uses standard cron syntax: `minute hour day-of-month month day-of-week`

- `0 12 * * 1` = Every Monday at 12:00 PM UTC
- `0 10 * * 4` = Every Thursday at 10:00 AM UTC

### Deployment
1. Commit the `vercel.json` file
2. Deploy to Vercel
3. Vercel will automatically set up the cron jobs
4. Monitor cron job executions in Vercel Dashboard > Deployments > Cron Jobs

---

## Testing

### Test Contact Form (Local)
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

### Test Newsletter Subscription (Local)
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "leagueId": 150789,
    "leagueName": "Test League",
    "gameweek": 6
  }'
```

### Test Weekly Summary (Local)
```bash
# Development mode only
curl http://localhost:3000/api/cron/weekly-summary
```

### Test Thursday Reminder (Local)
```bash
# Development mode only
curl http://localhost:3000/api/cron/thursday-reminder
```

### Get Subscriber List (Local)
```bash
curl http://localhost:3000/api/newsletter/subscriptions
```

---

## Monitoring & Logs

### Check Cron Job Execution
1. Go to Vercel Dashboard
2. Select your project
3. Navigate to "Deployments"
4. Click on "Cron Jobs" tab
5. View execution history and logs

### Log Outputs
All cron jobs log detailed information:
- ✅ Success messages with count
- ❌ Error messages with details
- 📧 Individual email send status
- 🏆 League processing status

Example log output:
```
🔄 Starting weekly gameweek summary email cron job...
📅 Current gameweek: 6
📧 Found 47 active subscriptions
🏆 Processing 12 unique leagues
📨 Sending emails for league: Premier League Fanatics (8 subscribers)
✅ Email sent to user1@example.com
✅ Email sent to user2@example.com
...
✅ Weekly summary email job completed. Success: 45, Failed: 2
```

---

## Troubleshooting

### Emails Not Sending
1. Check `RESEND_API_KEY` is set correctly
2. Verify domain is verified in Resend dashboard
3. Check Resend API logs for errors
4. Ensure `FROM_EMAIL` matches verified domain

### Cron Jobs Not Running
1. Verify `vercel.json` is deployed
2. Check Vercel Cron Jobs dashboard
3. Ensure cron jobs are enabled for your plan
4. Check cron job logs for errors

### Database Connection Issues
1. Verify `DATABASE_URL` is correct
2. Run `npx prisma migrate deploy`
3. Check database is accessible from Vercel

### No Subscribers Found
1. Check database connection
2. Verify `newsletterSubscription` table exists
3. Check `isActive` field is `true`
4. Test subscription endpoint manually

---

## Best Practices

1. **Security**: Use `CRON_SECRET` to secure cron endpoints in production
2. **Monitoring**: Set up alerts for failed email sends
3. **Rate Limiting**: Implement rate limiting for contact form
4. **Testing**: Test thoroughly in development before deploying
5. **Unsubscribe**: Implement unsubscribe functionality
6. **GDPR Compliance**: Add privacy policy and consent forms
7. **Error Handling**: Log all errors for debugging
8. **Backup**: Regularly backup subscriber data

---

## Future Enhancements

- [ ] Add unsubscribe link in emails
- [ ] Implement email preferences (frequency, type)
- [ ] Add email templates for different events
- [ ] Create admin dashboard for subscriber management
- [ ] Add A/B testing for email templates
- [ ] Implement email analytics (open rate, click rate)
- [ ] Add SMS notifications option
- [ ] Create email digest preferences
