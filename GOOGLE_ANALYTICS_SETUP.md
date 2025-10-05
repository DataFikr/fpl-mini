# Google Analytics 4 (GA4) Setup Guide for FPL Ranker

This guide walks you through setting up Google Analytics 4 for your FPL Ranker website to track traffic, user behavior, and gain valuable SEO insights.

## Table of Contents
1. [Create Google Analytics Account](#1-create-google-analytics-account)
2. [Get Your Measurement ID](#2-get-your-measurement-id)
3. [Configure Environment Variables](#3-configure-environment-variables)
4. [Deploy to Vercel](#4-deploy-to-vercel)
5. [Verify Setup](#5-verify-setup)
6. [Understanding Your Analytics](#6-understanding-your-analytics)
7. [Advanced Features](#7-advanced-features)

---

## 1. Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **"Start measuring"** or **"Admin"** (gear icon)
3. Click **"Create Account"**
   - **Account name**: FPL Ranker (or your preferred name)
   - Configure data sharing settings as preferred
   - Click **Next**

4. **Create a Property**:
   - **Property name**: FPL Ranker Website
   - **Reporting time zone**: Your timezone
   - **Currency**: Your currency
   - Click **Next**

5. **Business Information**:
   - **Industry**: Sports or Online Communities
   - **Business size**: Select appropriate size
   - **How you plan to use GA**: Get baseline reports, Measure customer engagement
   - Click **Create**

6. Accept the Terms of Service

---

## 2. Get Your Measurement ID

1. After creating your property, you'll see **"Choose a platform"**
2. Select **"Web"**
3. **Set up your data stream**:
   - **Website URL**: `https://fplranker.com`
   - **Stream name**: FPL Ranker Main Site
   - Click **"Create stream"**

4. **Copy your Measurement ID**:
   - You'll see a Measurement ID like `G-XXXXXXXXXX`
   - Copy this ID - you'll need it for the next step

---

## 3. Configure Environment Variables

### For Local Development (Optional)

Edit `.env.local`:
```bash
# Leave empty to disable analytics in development
NEXT_PUBLIC_GA_MEASUREMENT_ID=""

# OR set your Measurement ID to test in development
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### For Production (Vercel)

You'll set this in the Vercel dashboard (see next section).

---

## 4. Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **FPL Ranker** project
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar
5. Add a new variable:
   - **Key**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: Your Measurement ID (e.g., `G-XXXXXXXXXX`)
   - **Environment**: Select **"Production"** (and optionally Preview/Development)
6. Click **"Save"**
7. **Redeploy your site**:
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Set the environment variable
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID

# When prompted:
# - Enter your Measurement ID: G-XXXXXXXXXX
# - Select environment: Production
# - Add to Development? (optional)
# - Add to Preview? (optional)

# Redeploy
vercel --prod
```

---

## 5. Verify Setup

### Test in Browser

1. Visit your deployed site: `https://fplranker.com`
2. Open **Chrome DevTools** (F12 or Right-click → Inspect)
3. Go to **Console** tab
4. Look for GA4 initialization messages (no errors should appear)

### Verify in Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Click **"Reports"** → **"Realtime"**
4. Visit your website in a new tab
5. You should see yourself as an active user in the Realtime report within 30 seconds

### Test Cookie Consent Banner

1. Visit your site in an **incognito/private window**
2. You should see a cookie consent banner at the bottom
3. Click **"Accept"** or **"Decline"** to test functionality
4. Refresh - banner should not appear again (choice is saved)
5. Clear browser data to test again

---

## 6. Understanding Your Analytics

### Key Reports to Monitor

#### **Realtime Report**
- **Location**: Reports → Realtime
- **What it shows**: Current visitors, pages they're viewing
- **Use case**: Verify tracking is working, see immediate impact of marketing

#### **Acquisition Report**
- **Location**: Reports → Acquisition → Traffic acquisition
- **What it shows**: Where visitors come from (Google, Direct, Social, etc.)
- **Use case**: Understand which channels drive traffic

#### **Engagement Report**
- **Location**: Reports → Engagement → Pages and screens
- **What it shows**: Most visited pages, average engagement time
- **Use case**: Identify popular content, optimize high-traffic pages

#### **Demographics**
- **Location**: Reports → User → Demographics
- **What it shows**: User location, language, device type
- **Use case**: Understand your audience, optimize for their devices

### Custom Events Being Tracked

The implementation includes custom event tracking for:

```typescript
// League views
analytics.trackLeagueView(leagueId, leagueName);

// Newsletter subscriptions
analytics.trackNewsletterSubscribe(email);

// Gameweek changes
analytics.trackGameweekChange(gameweek);

// Team comparisons
analytics.trackTeamComparison(team1Id, team2Id);

// Search queries
analytics.trackSearch(searchTerm, resultCount);

// Feature usage
analytics.trackFeatureUse('bump_chart_view');

// Social shares
analytics.trackShare('twitter', 'league_stats');
```

### Viewing Custom Events

1. Go to **Reports** → **Engagement** → **Events**
2. You'll see all tracked events
3. Click on an event to see detailed metrics

---

## 7. Advanced Features

### Set Up Conversions

1. Go to **Admin** → **Events**
2. Click **"Create event"**
3. Create custom events for key actions:
   - Newsletter subscriptions
   - League searches
   - Feature usage

4. Go to **Admin** → **Conversions**
5. Mark important events as conversions

### Enable Google Search Console Integration

1. Go to **Admin** → **Property Settings**
2. Scroll to **"Search Console Links"**
3. Click **"Link"**
4. Follow prompts to connect your verified Search Console property
5. **Benefits**: See organic search queries, click-through rates, rankings

### Set Up Custom Dimensions

For deeper insights, create custom dimensions:

1. Go to **Admin** → **Custom definitions**
2. Click **"Create custom dimension"**
3. Examples for FPL Ranker:
   - **League ID**: Track specific league popularity
   - **Gameweek**: Analyze usage by gameweek
   - **User Type**: New vs. Returning visitors

### Create Custom Reports

1. Go to **Explore** tab
2. Click **"Blank"** to create a custom exploration
3. Add relevant dimensions and metrics
4. Save for quick access

### Set Up Alerts

1. Go to **Admin** → **Custom Alerts**
2. Create alerts for:
   - Traffic spikes or drops
   - High bounce rates
   - Conversion anomalies

---

## SEO Insights from GA4

### Monitor These Metrics for SEO

1. **Organic Search Traffic**
   - Reports → Acquisition → Traffic acquisition
   - Filter by "Organic Search"
   - Track growth over time

2. **Landing Pages Performance**
   - Reports → Engagement → Landing page
   - Identify high-performing entry points
   - Optimize underperforming pages

3. **Bounce Rate & Engagement**
   - Reports → Engagement → Pages and screens
   - Low engagement = potential SEO issue
   - Improve content quality

4. **Device Performance**
   - Reports → Tech → Overview
   - Ensure mobile experience is good (mobile-first indexing)

5. **Page Load Speed**
   - Reports → Engagement → Pages and screens
   - Sort by average engagement time
   - Slow pages = bad SEO

### Connect to Google Search Console

**Benefits**:
- See exact search queries bringing traffic
- Monitor click-through rates (CTR)
- Identify ranking opportunities
- Track impressions vs. clicks

**Setup**:
1. Verify your site in [Google Search Console](https://search.google.com/search-console)
2. Link to GA4 (Admin → Search Console Links)

---

## Monetization Preparation (AdSense/Affiliate)

### For Google AdSense Approval

GA4 data helps demonstrate:
- ✅ Consistent traffic (aim for 50+ daily visitors)
- ✅ User engagement (high time on page)
- ✅ Returning visitors (loyal audience)
- ✅ Multiple traffic sources (not just direct)

### For Affiliate Marketing

Track custom events for:
- Affiliate link clicks
- Product recommendations viewed
- Conversion funnels

**Example implementation**:
```typescript
// Track affiliate clicks
analytics.trackEvent('affiliate_click', {
  product: 'FPL_Tool_X',
  location: 'sidebar_widget'
});
```

---

## Troubleshooting

### Analytics Not Showing Data

1. **Check Measurement ID**:
   - Verify format: `G-XXXXXXXXXX`
   - Ensure it's set in Vercel environment variables

2. **Check Browser Console**:
   - Look for GA4 errors
   - Ensure scripts are loading

3. **Test in Incognito**:
   - Ad blockers might block GA
   - Cookie consent must be accepted

4. **Wait 24 Hours**:
   - Some reports take 24-48 hours to populate

### Cookie Consent Not Showing

1. Clear browser localStorage
2. Visit in incognito mode
3. Check console for errors

### Events Not Tracking

1. Verify event names in GA4 Events report
2. Check that `window.gtag` is defined
3. Test events in Realtime report (Events view)

---

## Privacy & Compliance

✅ **GDPR Compliant**:
- Cookie consent banner included
- IP anonymization enabled
- User can decline tracking

✅ **CCPA Compliant**:
- Privacy policy included at `/privacy`
- Clear data usage explanation

✅ **Best Practices**:
- Only tracks with consent
- Anonymizes IP addresses
- Secure cookie settings (SameSite, Secure)

---

## Next Steps

1. ✅ Set up GA4 account and get Measurement ID
2. ✅ Add to Vercel environment variables
3. ✅ Deploy and verify tracking works
4. ✅ Link Google Search Console
5. ✅ Set up conversion events
6. ✅ Monitor weekly reports
7. ✅ Use insights to improve SEO
8. ✅ Prepare for monetization (when ready)

---

## Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Best Practices](https://support.google.com/analytics/topic/9143382)
- [Google Search Console](https://search.google.com/search-console)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

**Need Help?** Check the [FPL Ranker GitHub Issues](https://github.com/your-repo/issues) or reach out through the contact form.
