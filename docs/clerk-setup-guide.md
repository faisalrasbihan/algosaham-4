# Clerk Development vs Production Setup Guide

## The Problem

You have **two separate Clerk instances**:
1. **Development Clerk** (for localhost) - Creates users like `user_39JrZ9N...`
2. **Production Clerk** (for Railway) - Creates users like `user_32eJBaRy...`

This causes:
- ❌ Different user IDs for the same email
- ❌ Payments on production don't reflect on localhost
- ❌ Localhost sign-ins don't sync to database (webhooks can't reach localhost)

## Solution: Use Production Clerk Everywhere

### Step 1: Update `.env.local` to Use Production Clerk

Replace your development Clerk keys with production keys:

```env
# Use PRODUCTION Clerk keys for both localhost and Railway
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY
```

**Comment out or remove the development keys:**
```env
# Development Keys (DON'T USE)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3VwZXItcG9sZWNhdC03MS5jbGVyay5hY2NvdW50cy5kZXYk
# CLERK_SECRET_KEY=sk_test_Ntk6ZtkQfBTUKbAj32PmU0tvvU82XvzisDsFsPPOao
```

### Step 2: Configure Clerk Webhook for Localhost (Optional)

If you want localhost sign-ins to sync to the database, you need to expose localhost to the internet using ngrok:

```bash
# Install ngrok
brew install ngrok

# Start your Next.js app
npm run dev

# In another terminal, create a tunnel
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
```

Then in Clerk Dashboard:
1. Go to **Webhooks** → **Add Endpoint**
2. Enter: `https://abc123.ngrok.io/api/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret** and add to `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

### Step 3: Clean Up Duplicate Users (Optional)

If you want to merge or remove duplicate users:

**Option A: Delete development user and use production user**
```sql
DELETE FROM users WHERE clerk_id = 'user_39JrZ9N58cZW0R02vL48UsKqy6L';
```

**Option B: Keep both but know which one to use**
- Use production account (`user_32eJBaRy...`) for testing payments
- Use development account for other testing

### Step 4: Test the Setup

1. **Sign out** from your app
2. **Sign in again** (will use production Clerk)
3. **Check database:**
   ```bash
   npx tsx db/check-user-subscription.ts
   ```
4. **Make a test payment** - should update the correct user now!

## Recommended Setup

### For Development (Localhost)
```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY
DATABASE_URL=postgresql://... (production database)
MIDTRANS_IS_PRODUCTION=false (use sandbox)
```

### For Production (Railway)
Set these as environment variables in Railway dashboard:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY
DATABASE_URL=postgresql://... (production database)
MIDTRANS_IS_PRODUCTION=false (or true when ready for production)
```

## Benefits of This Setup

✅ **Single source of truth** - One Clerk instance for all environments
✅ **Consistent user IDs** - Same user across localhost and production
✅ **Payments work correctly** - Updates reflect immediately
✅ **Easier testing** - Test payments on localhost with production Clerk

## Alternative: Keep Separate Instances

If you want to keep separate Clerk instances:

1. **Always test payments on production** (not localhost)
2. **Use production URL** for payment testing: `https://algosaham-4-production.up.railway.app`
3. **Accept that localhost and production have different users**

## Current Status

- ✅ Webhook is working correctly
- ✅ Payments are being recorded
- ✅ User tiers are being updated
- ⚠️ But you're checking the wrong user account

**The payment DID work!** User `user_32eJBaRy...` was upgraded to **suhu** tier.

You just need to either:
1. Use production Clerk keys everywhere (recommended)
2. Or log in with the production account that made the payment
