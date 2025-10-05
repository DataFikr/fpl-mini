# GA4 Troubleshooting Guide

## Problem: "Data collection isn't active for your website"

This message in Google Analytics means GA4 hasn't received any data from your website yet.

### Common Causes:

1. **Measurement ID not added to website** ✅ Most likely cause
2. **Website not deployed with GA4 enabled**
3. **Ad blocker blocking GA4 scripts**
4. **Cookie consent not accepted**
5. **Wrong Measurement ID**

---

## Solution Steps:

### Step 1: Verify Measurement ID Format

Your Measurement ID should look like: `G-XXXXXXXXXX`
- Starts with `G-`
- Followed by 10 alphanumeric characters
- Example: `G-ABC1234567`

**Where to find it:**
1. Google Analytics → Admin (gear icon)
2. Property → Data Streams
3. Click your web stream
4. See "Measurement ID" at top right

### Step 2: Add to Vercel (Production)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select FPL Ranker project
3. Settings → Environment Variables
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX` (your actual ID)
   - **Environment**: Production ✅ (and Preview if you want)
5. Click Save

### Step 3: Redeploy

**Option A: Via Vercel Dashboard**
1. Go to Deployments tab
2. Click "..." menu on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

**Option B: Git Push**
```bash
git add .
git commit -m "Enable Google Analytics"
git push
```

### Step 4: Test on Your Live Site

1. Visit https://fplranker.com in **incognito mode**
2. Cookie banner should appear
3. Click **Accept**
4. Navigate around (click 2-3 pages)

### Step 5: Check Google Analytics Realtime

1. Go to Google Analytics
2. Reports → Realtime
3. You should see:
   - Active users: 1 (you)
   - Page views
   - Events

**If you see yourself, it's working! ✅**

---

## Detailed Troubleshooting:

### Issue: "Not seeing myself in Realtime"

**Check 1: Cookie Consent**
- Did you click "Accept" on the cookie banner?
- Try clearing cookies and accepting again

**Check 2: Ad Blocker**
- Disable ad blocker/privacy extensions
- Test in incognito mode

**Check 3: Browser Console**
1. F12 → Console tab
2. Look for GA4 errors
3. Type: `window.gtag`
   - Should show: `ƒ gtag(){dataLayer.push(arguments);}`
   - If `undefined`, GA4 didn't load

**Check 4: Network Requests**
1. F12 → Network tab
2. Filter by "gtag" or "google-analytics"
3. Visit a page
4. Should see requests to:
   - `googletagmanager.com/gtag/js`
   - `google-analytics.com/g/collect`

**Check 5: Environment Variable**
```bash
# In your project directory
vercel env ls

# Should show:
# NEXT_PUBLIC_GA_MEASUREMENT_ID (Production)
```

### Issue: "Variable shows but still not working"

**Check if deployment used the variable:**
1. Vercel → Deployments
2. Click latest deployment
3. Scroll to "Environment Variables"
4. Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is listed

**If not listed:**
- You added the variable AFTER deployment
- Need to redeploy for changes to take effect

### Issue: "Console shows: 'gtag is not defined'"

**Cause:** GA4 script didn't load

**Solutions:**
1. Check Measurement ID is correct
2. Verify it's set in Vercel
3. Clear browser cache and hard refresh (Ctrl+F5)
4. Check if cookie banner was accepted

### Issue: "Cookie banner doesn't appear"

**Possible reasons:**
1. Already accepted/declined (choice saved in localStorage)
2. Component not rendering

**Solutions:**
```javascript
// In browser console, run:
localStorage.removeItem('cookie-consent')
// Then refresh page - banner should appear
```

---

## Testing Checklist:

### Local Testing (Before Deploy)

1. **Set Measurement ID in `.env.local`**:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
   ```

2. **Restart dev server**:
   ```bash
   npm run dev
   ```

3. **Test in browser**:
   - Visit http://localhost:3000
   - Open DevTools → Console
   - No GA4 errors ✅
   - Type `window.gtag` → Should be function ✅
   - Type `window.dataLayer` → Should be array ✅

4. **Accept cookie banner** and click around

5. **Check GA4 Realtime** report

### Production Testing (After Deploy)

1. **Visit live site in incognito**: https://fplranker.com
2. **Cookie banner appears** ✅
3. **Click Accept** ✅
4. **No console errors** ✅
5. **Navigate 2-3 pages** ✅
6. **Check GA4 Realtime** → See yourself ✅

---

## Verification Commands:

### In Browser Console:

```javascript
// Check if gtag is loaded
window.gtag
// Should show: ƒ gtag(){dataLayer.push(arguments);}

// Check dataLayer
window.dataLayer
// Should show: Array with events

// Check if Measurement ID is set
console.log(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
// Note: Won't work in browser, only in build

// Check cookie consent
localStorage.getItem('cookie-consent')
// Should show: "accepted" or "declined" or null
```

### In Terminal (Vercel):

```bash
# List environment variables
vercel env ls

# Check if variable exists
vercel env ls | grep GA_MEASUREMENT_ID

# Pull latest environment variables
vercel env pull
```

---

## Common Mistakes:

❌ **Wrong variable name**
- Must be: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- NOT: `GA_MEASUREMENT_ID` or `GOOGLE_ANALYTICS_ID`

❌ **Not redeploying after adding variable**
- Variables only take effect on NEW deployments
- Must redeploy after adding

❌ **Testing with ad blocker enabled**
- Ad blockers block GA4
- Test in incognito without extensions

❌ **Not accepting cookie banner**
- GA4 only tracks after user accepts
- Must click "Accept" button

❌ **Wrong Measurement ID format**
- Must start with `G-`
- Example: `G-ABC1234567`

❌ **Testing too quickly**
- Realtime can take 10-30 seconds to show data
- Wait a bit after accepting cookies

---

## Still Not Working?

### Manual Verification:

1. **Check Source Code** (on live site):
   - Right-click → View Page Source
   - Search for: `gtag`
   - Should find script tags with googletagmanager.com
   - Should find your Measurement ID in code

2. **Check Build Logs**:
   - Vercel → Deployments → Latest → View Logs
   - Look for any errors during build
   - Environment variables should be listed

3. **Test Different Browser**:
   - Try Chrome, Firefox, Safari
   - Some browsers block tracking more aggressively

### Get Help:

If you've tried everything:

1. **Check environment variable** is set correctly in Vercel
2. **Verify Measurement ID** matches exactly (copy-paste)
3. **Redeploy** and wait for completion
4. **Test in incognito** with cookie acceptance
5. **Wait 5 minutes** then check Realtime

If still not working:
- Share browser console errors
- Share Network tab (any failed requests?)
- Verify build completed successfully in Vercel

---

## Success Indicators:

✅ Cookie banner appears on first visit
✅ No console errors related to gtag/GA4
✅ Network requests to google-analytics.com
✅ `window.gtag` is a function
✅ Realtime report shows active users
✅ Page views increment when navigating

When you see all of these, **GA4 is working correctly!** 🎉

---

## Next Steps After GA4 Works:

1. ✅ Link Google Search Console
2. ✅ Set up conversion events
3. ✅ Create custom dashboard
4. ✅ Monitor traffic for 1-2 weeks
5. ✅ Use insights to optimize SEO

Refer to [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md) for advanced configuration.
