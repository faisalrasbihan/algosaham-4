# Automatic User Upsert Implementation

## Overview
Added automatic user creation (upsert) logic that ensures users exist in the database even if the Clerk webhook wasn't triggered.

## How It Works

### The Problem
Users might not be created in the database if:
- Clerk webhook wasn't configured
- Webhook failed to fire
- User signed up before webhook was set up
- Testing on localhost (webhooks can't reach localhost)

### The Solution
Created a helper function `ensureUserInDatabase()` that:
1. Checks if the current user exists in the database
2. If not, creates them automatically
3. Returns the user record

## Files Created

### `lib/ensure-user.ts`
```typescript
export async function ensureUserInDatabase()
export async function getCurrentUserFromDB()
```

**What it does:**
- Gets the current Clerk user
- Checks if they exist in the database
- Creates them if they don't exist
- Sets default tier to 'ritel'
- Returns the user record

## Where It's Used

The upsert logic is automatically triggered when users access:

### 1. Portfolio Page
**File:** `app/api/strategies/list/route.ts`
- When users visit `/portfolio`
- Fetches their saved strategies
- **Automatically creates user** if they don't exist

### 2. Subscription Page
**File:** `app/api/subscriptions/create/route.ts`
- When users try to subscribe to a plan
- Before creating payment
- **Automatically creates user** if they don't exist

## How to Test

### Option 1: Visit Portfolio Page
1. Sign in to your app (production or localhost)
2. Go to `/portfolio`
3. The API will automatically create your user in the database
4. Check database:
   ```bash
   npx tsx db/check-user-subscription.ts
   ```

### Option 2: Try to Subscribe
1. Sign in to your app
2. Go to `/harga`
3. Click "Pilih Paket" on any plan
4. Select payment method
5. The API will automatically create your user before showing payment
6. Check database to verify

### Option 3: Use the Helper Directly
You can also call the helper function in any API route:

```typescript
import { ensureUserInDatabase } from '@/lib/ensure-user';

export async function GET(request: NextRequest) {
    const user = await ensureUserInDatabase();
    
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use user.clerkId, user.email, user.subscriptionTier, etc.
}
```

## Benefits

✅ **No webhook configuration needed** - Works even without Clerk webhook
✅ **Works on localhost** - Users are created when they access protected routes
✅ **Automatic fallback** - If webhook fails, upsert still works
✅ **Idempotent** - Safe to call multiple times, won't create duplicates
✅ **Consistent data** - Ensures all signed-in users exist in database

## When to Use Clerk Webhook vs Upsert

### Use Clerk Webhook (Recommended for Production)
- ✅ Creates users immediately on sign-up
- ✅ Keeps database in sync with Clerk
- ✅ Handles user updates and deletions
- ✅ More efficient (one-time creation)

**Setup:** Configure webhook in Clerk dashboard pointing to:
```
https://algosaham-4-production.up.railway.app/api/webhooks/clerk
```

### Use Upsert Logic (Fallback)
- ✅ Works without webhook configuration
- ✅ Perfect for localhost development
- ✅ Safety net if webhook fails
- ✅ No additional setup needed

**Already works!** Just access any protected route.

## Best Practice: Use Both

1. **Configure Clerk webhook** for production (creates users on sign-up)
2. **Keep upsert logic** as a fallback (handles edge cases)

This ensures users are always in the database, regardless of how they access the app.

## Testing Checklist

- [ ] Sign up with a new account
- [ ] Visit `/portfolio` page
- [ ] Check database - user should exist
- [ ] Try to subscribe to a plan
- [ ] Check database - payment should work correctly
- [ ] User tier should update after payment

## Current Status

✅ Upsert logic implemented
✅ Added to portfolio API endpoint
✅ Added to subscription API endpoint  
✅ Deployed to production
⏳ Waiting for you to test by visiting `/portfolio`

## Next Steps

1. **Test on production:**
   - Sign in at https://algosaham-4-production.up.railway.app
   - Visit `/portfolio`
   - Run `npx tsx db/check-user-subscription.ts` to verify

2. **Optional: Configure Clerk webhook** (for immediate user creation)
   - See `docs/clerk-setup-guide.md` for instructions

3. **Make a test payment** to verify subscription updates work correctly
