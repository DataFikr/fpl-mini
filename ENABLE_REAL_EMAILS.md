# 📧 Enable Real Email Sending

## ✅ Current Status:
- Database: **WORKING** ✅
- Newsletter Subscription: **WORKING** ✅
- Email Sending: **Demo Mode** (needs RESEND_API_KEY)

---

## 🎯 Add RESEND_API_KEY to Vercel

### Environment Variables Needed:

```env
RESEND_API_KEY=re_UcBTz32N_9XWMBp7U5qoDNjU38qhxDSXA
FROM_EMAIL=onboarding@resend.dev
```

---

## 📋 Step-by-Step:

### Step 1: Add RESEND_API_KEY

1. **Vercel Dashboard**: https://vercel.com/dashboard
2. **Your Project** → **Settings** → **Environment Variables**
3. **Click "Add New"**
4. Fill in:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_UcBTz32N_9XWMBp7U5qoDNjU38qhxDSXA`
   - **Environments**: Check **Production** ✅
5. **Click "Save"**

### Step 2: Add FROM_EMAIL

1. **Click "Add New"** again
2. Fill in:
   - **Key**: `FROM_EMAIL`
   - **Value**: `onboarding@resend.dev`
   - **Environments**: Check **Production** ✅
3. **Click "Save"**

### Step 3: Redeploy

1. Go to **"Deployments"** tab
2. Click **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Wait for **"Ready"** status

---

## ✅ Test Email Delivery

After redeployment:

1. **Go to**: https://fplranker.com
2. **Search for a league**
3. **Click "Get Newsletter"**
4. **Enter your email**
5. **Submit**

**Expected Result:**
```
✅ Newsletter sent successfully and subscription saved!
```

**NOT:**
```
❌ Subscription saved! Email service is currently in demo mode.
```

### Verify Email Received:

1. **Check your inbox** (might take 1-2 minutes)
2. **Check spam folder** if not in inbox
3. **Email should contain**: Gameweek summary with league stories

---

## 🔧 Troubleshooting

### Issue: "Email service is currently in demo mode"

**Cause**: RESEND_API_KEY not set or deployment hasn't updated

**Fix**:
1. Verify RESEND_API_KEY is in Vercel environment variables
2. Check it's set for **Production** environment
3. Redeploy (deployment must happen AFTER adding variables)
4. Clear browser cache and try again

### Issue: "Failed to send email"

**Possible causes**:

1. **API Key Invalid**:
   - Check if key starts with `re_`
   - Verify it's correct in Vercel
   - Try regenerating key in Resend dashboard

2. **FROM_EMAIL Not Verified**:
   - `onboarding@resend.dev` is pre-verified by Resend
   - If using custom domain, verify it in Resend first

3. **Rate Limit**:
   - Resend free tier: 100 emails/day
   - Check usage in Resend dashboard

---

## 📊 Resend Dashboard

Check email delivery:

1. **Go to**: https://resend.com/emails
2. **Login** with your account
3. **See sent emails** in the dashboard
4. **Check delivery status**

---

## 🎨 Using Custom Domain (Optional)

To send from `noreply@fplranker.com`:

### Step 1: Add Domain in Resend

1. **Resend Dashboard**: https://resend.com/domains
2. **Click "Add Domain"**
3. **Enter**: `fplranker.com`
4. **Add DNS Records** shown to your domain provider
5. **Wait for verification** (can take up to 48 hours)

### Step 2: Update FROM_EMAIL

Once verified:
1. **Vercel** → **Environment Variables**
2. **Edit FROM_EMAIL**
3. **Change to**: `noreply@fplranker.com`
4. **Save and Redeploy**

---

## ✅ Final Checklist:

**In Vercel:**
- [ ] DATABASE_URL set (Session mode - port 5432)
- [ ] RESEND_API_KEY set for Production
- [ ] FROM_EMAIL set for Production
- [ ] Latest deployment shows "Ready"

**Testing:**
- [ ] Newsletter subscription works
- [ ] Sees "Newsletter sent successfully!"
- [ ] Email received in inbox
- [ ] No "demo mode" message

**Optional:**
- [ ] Custom domain verified in Resend
- [ ] FROM_EMAIL updated to custom domain
- [ ] Pooler connection investigated (if time)

---

## 🎉 Success Indicators:

When everything works:

1. ✅ **Subscribe to newsletter** → Success message
2. ✅ **Email arrives** in inbox within 2 minutes
3. ✅ **Email contains** league stories and gameweek summary
4. ✅ **From address** shows `onboarding@resend.dev`
5. ✅ **No error messages** in browser console

---

**Add those environment variables to Vercel RIGHT NOW and test!** 🚀
