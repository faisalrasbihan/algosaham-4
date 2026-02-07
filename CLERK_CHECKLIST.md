# ✅ Clerk Production Implementation Checklist

## 🎯 Overview
This checklist will guide you through completing the Clerk production setup for algosaham.ai.

---

## ✅ Completed Tasks

- [x] Updated `.env.local` with production key placeholders
- [x] Enhanced middleware with route protection
- [x] Added ClerkProvider appearance customization (dark theme)
- [x] Created Clerk webhook handler for user sync
- [x] Installed `svix` package for webhook verification
- [x] Configured public routes for webhooks
- [x] Set NODE_ENV to production

---

## 📋 Required Actions

### 1️⃣ Get Production Keys from Clerk

**Time Required:** 5 minutes

1. Visit [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application (or create new production instance)
3. Navigate to **API Keys**
4. **Toggle to "Production"** (top of page)
5. Copy both keys:
   - `Publishable key` → starts with `pk_live_`
   - `Secret key` → starts with `sk_live_`

**Status:** ⏳ Pending

---

### 2️⃣ Update Environment Variables

**Time Required:** 2 minutes

Open `.env.local` and replace these lines:

```bash
# Current (placeholders):
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET_KEY_HERE

# Replace with your actual keys from Step 1
```

**Status:** ⏳ Pending

---

### 3️⃣ Configure Production Domain

**Time Required:** 3 minutes

In Clerk Dashboard:

1. Go to **Domains** section
2. Click **Add domain**
3. Add: `algosaham.ai`
4. Add: `https://algosaham.ai` (with HTTPS)
5. Also add Railway URL: `https://backtester-production-6541.up.railway.app`
6. Save changes

**Status:** ⏳ Pending

---

### 4️⃣ Configure Authentication Methods

**Time Required:** 5 minutes

In Clerk Dashboard → **User & Authentication** → **Email, Phone, Username**:

**Recommended Settings:**
- ✅ Email address (enable)
- ✅ Password (enable)
- ✅ Email verification (enable)
- ✅ Google OAuth (optional but recommended)
- ✅ GitHub OAuth (optional)

**Status:** ⏳ Pending

---

### 5️⃣ Set Up Clerk Webhook (Recommended)

**Time Required:** 5 minutes

This syncs user data to your database automatically.

In Clerk Dashboard → **Webhooks**:

1. Click **Add Endpoint**
2. Enter URL: `https://algosaham.ai/api/webhooks/clerk`
3. Select events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
4. Copy the **Signing Secret** (starts with `whsec_`)
5. Add to `.env.local`:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

**Status:** ⏳ Pending

---

### 6️⃣ Test Locally with Production Keys

**Time Required:** 10 minutes

Before deploying, test everything locally:

```bash
# Make sure .env.local has production keys
npm run dev
```

**Test these flows:**
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Access `/portfolio` (should require auth)
- [ ] Call `/api/strategies/list` (should require auth)
- [ ] Sign out
- [ ] Verify webhook creates free subscription (check database)

**Status:** ⏳ Pending

---

### 7️⃣ Update Production Environment Variables

**Time Required:** 5 minutes

Add these to your hosting platform (Railway/Vercel):

```bash
# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Webhook Secret (if using webhooks)
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=https://algosaham.ai

# Keep existing variables:
# - DATABASE_URL
# - GENKI_DB_URL
# - MIDTRANS_SERVER_KEY
# - NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
# - MIDTRANS_IS_PRODUCTION
```

**Status:** ⏳ Pending

---

### 8️⃣ Deploy to Production

**Time Required:** 10 minutes

```bash
# Build and test locally first
npm run build
npm start

# If successful, deploy to Railway/Vercel
git add .
git commit -m "feat: implement Clerk production mode"
git push origin main
```

**Status:** ⏳ Pending

---

### 9️⃣ Verify Production Deployment

**Time Required:** 10 minutes

After deployment, test on production:

- [ ] Visit `https://algosaham.ai`
- [ ] Sign up with a new account
- [ ] Verify email works
- [ ] Check database for free subscription
- [ ] Test protected routes
- [ ] Test sign out
- [ ] Test sign in again

**Status:** ⏳ Pending

---

## 🔒 Security Checklist

Before going live:

- [ ] Production keys are set in environment variables
- [ ] Test keys removed from production environment
- [ ] `.env.local` is in `.gitignore`
- [ ] Domain configured in Clerk Dashboard
- [ ] HTTPS enabled on production domain
- [ ] Webhook endpoint is secured with signature verification
- [ ] Protected routes tested and working
- [ ] Public routes accessible without auth

---

## 📊 What's Protected

### Protected Routes (Require Authentication)
- `/portfolio` - User portfolio page
- `/api/strategies/*` - Strategy management
- `/api/subscriptions/create` - Subscription creation
- `/api/subscriptions/gopay/*` - GoPay integration

### Public Routes (No Authentication)
- `/` - Home page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/api/webhooks/*` - Webhook endpoints
- `/api/subscriptions/webhook` - Midtrans webhook

---

## 🎨 UI Customization

Your Clerk components now feature:
- **Dark theme** matching your app
- **Emerald accent color** (#10b981)
- **Custom styling** for buttons, inputs, cards
- **Consistent branding** across all auth flows

---

## 🆘 Troubleshooting

### Issue: "Invalid publishable key"
**Solution:** 
- Verify you're using `pk_live_` keys (not `pk_test_`)
- Restart dev server after changing `.env.local`
- Check keys are correctly copied from Clerk Dashboard

### Issue: Redirects not working
**Solution:**
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check domain is added in Clerk Dashboard
- Ensure HTTPS is enabled in production

### Issue: Webhook not receiving events
**Solution:**
- Verify webhook URL is publicly accessible
- Check webhook secret is correct
- View webhook logs in Clerk Dashboard
- Ensure route is in public routes matcher

### Issue: Authentication not persisting
**Solution:**
- Check cookies are enabled in browser
- Verify HTTPS is enabled in production
- Check browser console for errors
- Clear cookies and try again

---

## 📚 Additional Resources

- [Clerk Production Checklist](https://clerk.com/docs/deployments/production-checklist)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Webhooks Guide](https://clerk.com/docs/integrations/webhooks)
- [Clerk Dashboard](https://dashboard.clerk.com)

---

## 📝 Notes

- **Free subscriptions** are automatically created for new users via webhook
- **User data** is synced to your database on create/update/delete
- **Midtrans integration** works alongside Clerk authentication
- **Production mode** requires HTTPS for security

---

## ✨ Next Steps After Production

1. **Monitor webhook logs** in Clerk Dashboard
2. **Set up email customization** (optional)
3. **Enable MFA** for enhanced security (optional)
4. **Configure session settings** (optional)
5. **Add custom user metadata** (optional)

---

**Last Updated:** 2026-02-06
**Status:** Ready for production deployment after completing required actions
