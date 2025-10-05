# 🔍 Database Connection Troubleshooting

## Current DATABASE_URL:
```
postgresql://postgres.hpkeiuwwsexuqvefmawy:fplranker@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

This looks ALMOST correct, but the connection is still failing.

---

## 🎯 Possible Issues:

### Issue 1: Wrong Region/Host
- Your URL says: `aws-1-us-east-2`
- Supabase pooler URLs usually say: `aws-0-us-east-1`

**The host might be slightly wrong!**

### Issue 2: Wrong Password
- Shows: `fplranker`
- Might not be the actual password

### Issue 3: Project Paused
- Supabase free tier pauses after inactivity
- Need to wake it up

---

## ✅ FIX METHOD 1: Copy EXACT String from Supabase

**IMPORTANT: Don't type it manually - COPY it!**

### Steps:

1. **Go to Supabase**: https://supabase.com/dashboard
2. **Click your project**
3. **Settings (⚙️) → Database**
4. **Scroll to "Connection string"**
5. **Click "URI" tab**
6. **Select "Transaction" mode**
7. **Click the COPY button** 📋 (don't type it!)
8. **Paste into Vercel DATABASE_URL**

### What to Look For:

After copying, check if it says:
- `aws-0` or `aws-1`?
- Different region?
- Different password?

The **EXACT** string Supabase shows is what you need!

---

## ✅ FIX METHOD 2: Check if Supabase is Paused

### Step 1: Check Project Status

1. Go to Supabase Dashboard
2. Look at your project
3. **Does it say "Paused" or "Inactive"?**

### Step 2: Resume if Paused

If paused:
1. Click **"Resume"** or **"Restore"** button
2. Wait 30 seconds for project to wake up
3. Then copy the connection string again

---

## ✅ FIX METHOD 3: Use Direct Connection (Temporary Test)

To test if it's a pooler issue, try the **Session mode** connection:

### Get Session Mode URL:

1. Supabase → Settings → Database
2. Connection string
3. URI tab
4. **Select "Session" mode** (not Transaction)
5. Copy that URL

Should look like:
```
postgresql://postgres:PASSWORD@db.hpkeiuwwsexuqvefmawy.supabase.co:5432/postgres
```

**Differences:**
- Port: `5432` (not 6543)
- Host: `db.xxx.supabase.co` (not pooler)

**Try this in Vercel temporarily to test connection.**

If this works but pooler doesn't, there might be a Supabase pooler issue.

---

## ✅ FIX METHOD 4: Reset Database Password

The password might have changed or be incorrect.

### Steps:

1. **Supabase → Settings → Database**
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. **Copy the NEW password** shown
5. Click **"Update password"**
6. Wait 30 seconds
7. **Get the NEW connection string** (it will have the new password)
8. **Update in Vercel**
9. **Redeploy**

---

## 🧪 Test Connection Locally First

Before updating Vercel, test if the connection works:

### Method 1: Test in Supabase SQL Editor

1. Go to Supabase SQL Editor
2. Run this:
```sql
SELECT 'Connection test successful!' as message;
```

If this works, Supabase is running and connection should work.

### Method 2: Test with Prisma Locally

In your terminal:
```bash
# Update your .env.local with the connection string
# Then run:
npx prisma db pull
```

If this works, the connection string is correct!

---

## 📊 Comparison Table

| Component | Your Current | Should Be |
|-----------|--------------|-----------|
| Username | `postgres.hpkeiuwwsexuqvefmawy` | ✅ Looks good |
| Password | `fplranker` | ⚠️ Verify this is correct |
| Host | `aws-1-us-east-2.pooler.supabase.com` | ⚠️ Check exact host from Supabase |
| Port | `6543` | ✅ Correct for pooler |
| Database | `postgres` | ✅ Correct |

---

## 🎯 Most Likely Solutions (In Order):

### 1. **Host is Slightly Wrong** (Most Likely)
- Copy the EXACT string from Supabase
- Don't type it manually
- Paste directly into Vercel

### 2. **Supabase Project is Paused**
- Check Supabase dashboard
- Resume if paused
- Wait 30 seconds

### 3. **Password Changed or Wrong**
- Reset password in Supabase
- Get new connection string
- Update in Vercel

### 4. **Try Direct Connection Instead**
- Use Session mode (port 5432)
- Works for small apps
- Test if pooler has issues

---

## 🚀 IMMEDIATE ACTION:

**Do this RIGHT NOW:**

1. **Open Supabase in one tab**
2. **Open Vercel in another tab**
3. **In Supabase:**
   - Settings → Database
   - Connection string
   - URI → Transaction mode
   - **Click COPY button** 📋
4. **In Vercel:**
   - Settings → Environment Variables
   - DATABASE_URL → Edit
   - **Paste** (Ctrl+V)
   - Save
   - Redeploy

**Don't type ANYTHING manually - just copy and paste!**

---

## 🆘 Still Not Working?

If connection still fails after copying exact string:

### Check These:

1. **Supabase Project Status:**
   - Dashboard → Is it active/paused?
   - Any error messages in Supabase?

2. **Supabase Region:**
   - Settings → General
   - What region is your project in?
   - Should match the URL

3. **Try Session Mode:**
   - Temporarily use direct connection
   - Port 5432 instead of 6543
   - See if that works

4. **Check Supabase Service Status:**
   - Visit: https://status.supabase.com
   - Any ongoing issues?

---

## 📞 Tell Me:

After copying the EXACT string from Supabase:

1. Does the host say `aws-0` or `aws-1`?
2. Does the password match what's in Supabase settings?
3. Is your Supabase project showing as "Active" or "Paused"?
4. Does the connection work when you test locally with `npx prisma db pull`?

---

**Copy that connection string from Supabase RIGHT NOW and paste it EXACTLY into Vercel!** 🚀
