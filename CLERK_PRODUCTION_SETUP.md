# Clerk Production Setup Guide

This guide will help you complete the Clerk production setup for algosaham.ai.

## ✅ Completed Steps

1. **Updated Environment Variables Structure** - `.env.local` now has placeholders for production keys
2. **Enhanced Middleware** - Added route protection for authenticated routes
3. **Styled ClerkProvider** - Added dark theme appearance matching your app design

## 🔧 Required Actions

### Step 1: Get Production Keys from Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application (or create a new production instance)
3. Navigate to **API Keys** section
4. **Switch to Production instance** (toggle at the top)
5. Copy your production keys:
   - `Publishable key` (starts with `pk_live_`)
   - `Secret key` (starts with `sk_live_`)

### Step 2: Update `.env.local` with Production Keys

Replace the placeholder values in `.env.local`:

```bash
# Replace these lines:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET_KEY_HERE

# With your actual production keys from Step 1
```

### Step 3: Configure Production Domain in Clerk Dashboard

1. In Clerk Dashboard, go to **Domains** section
2. Add your production domain: `algosaham.ai`
3. Add your production URL: `https://algosaham.ai`
4. If deploying to Railway, also add: `https://backtester-production-6541.up.railway.app`

### Step 4: Configure Sign-In/Sign-Up Settings

In Clerk Dashboard, go to **User & Authentication** → **Email, Phone, Username**:

1. **Enable sign-in methods:**
   - ✅ Email address (recommended)
   - ✅ Google OAuth (optional but recommended)
   - ✅ GitHub OAuth (optional)

2. **Configure email settings:**
   - Go to **Emails** section
   - Customize email templates (optional)
   - Set up custom email domain (optional, for branded emails)

### Step 5: Set Up Webhooks (Optional but Recommended)

For syncing user data to your database:

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Add your webhook URL: `https://algosaham.ai/api/webhooks/clerk`
4. Select events to listen to:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** and add to `.env.local`:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Step 6: Update Production Environment Variables

For deployment (Railway, Vercel, etc.), add these environment variables:

```bash
# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Optional: Webhook Secret
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App URL (important for redirects)
NEXT_PUBLIC_APP_URL=https://algosaham.ai
```

### Step 7: Test Production Setup Locally

Before deploying, test with production keys locally:

```bash
# Make sure .env.local has production keys
npm run dev
```

Test these flows:
- ✅ Sign up new user
- ✅ Sign in existing user
- ✅ Access protected routes (`/portfolio`)
- ✅ API authentication (`/api/strategies/*`)
- ✅ Sign out

### Step 8: Deploy to Production

Once tested locally:

```bash
# Build for production
npm run build

# Deploy to your hosting platform
# (Railway, Vercel, etc.)
```

## 🔒 Protected Routes

The following routes now require authentication:

- `/portfolio` - User portfolio page
- `/api/strategies/*` - Strategy management APIs
- `/api/subscriptions/create` - Subscription creation
- `/api/subscriptions/gopay/*` - GoPay integration

## 🎨 Clerk UI Customization

The Clerk sign-in/sign-up components now match your app's dark theme:

- **Primary Color:** Emerald (#10b981)
- **Background:** Dark zinc tones
- **Borders:** Subtle zinc-800
- **Buttons:** Emerald with hover effects

## 📝 Additional Configuration Options

### Custom Sign-In/Sign-Up Pages (Optional)

If you want custom pages instead of Clerk's components:

1. Create custom pages:
   - `app/sign-in/[[...sign-in]]/page.tsx`
   - `app/sign-up/[[...sign-up]]/page.tsx`

2. Update middleware to allow these routes

### Session Management

Current configuration:
- Sessions are managed by Clerk automatically
- JWT tokens are used for API authentication
- Sessions persist across page refreshes

### Multi-Factor Authentication (Optional)

Enable in Clerk Dashboard:
1. Go to **User & Authentication** → **Multi-factor**
2. Enable SMS or Authenticator app
3. Configure settings

## 🚨 Security Checklist

Before going live:

- [ ] Production keys are set in environment variables
- [ ] Test keys are removed from production environment
- [ ] Domain is configured in Clerk Dashboard
- [ ] Protected routes are working correctly
- [ ] Sign-in/Sign-up flows are tested
- [ ] Webhook endpoint is secured (if using webhooks)
- [ ] HTTPS is enabled on production domain
- [ ] Environment variables are not committed to git

## 📚 Additional Resources

- [Clerk Production Checklist](https://clerk.com/docs/deployments/production-checklist)
- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Dashboard](https://dashboard.clerk.com)

## 🆘 Troubleshooting

### "Invalid publishable key" error
- Make sure you're using `pk_live_` keys in production
- Verify keys are correctly set in environment variables
- Restart your dev server after changing `.env.local`

### Redirects not working
- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Verify domain is added in Clerk Dashboard
- Ensure middleware matcher is correct

### Authentication not persisting
- Check cookies are enabled
- Verify HTTPS is enabled in production
- Check browser console for errors

---

**Need Help?** Contact Clerk support or check their documentation at [clerk.com/docs](https://clerk.com/docs)
