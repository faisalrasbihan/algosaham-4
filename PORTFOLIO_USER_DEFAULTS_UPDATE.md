# Portfolio & User Defaults Update ✅

## Changes Made

### 1. **Portfolio Page - Community Strategies Section**

**Changed:** "Subscribed Strategies" → "Community Strategies"

**File:** `app/portfolio/page.tsx`

**Before:**
```tsx
{/* Subscribed Strategies Section */}
<h2>Subscribed Strategies</h2>
<p>Strategies you're following from other traders</p>
```

**After:**
```tsx
{/* Community Strategies Section */}
<h2>Community Strategies</h2>
<p>Popular strategies from the community</p>
```

**Rationale:** Better reflects that these are popular/featured strategies from the community rather than strategies the user is actively subscribed to.

---

### 2. **Default User Tier - Already Configured ✅**

All new users are automatically created with the **free plan** by default. This is enforced in three places:

#### **Database Schema Default** (`db/schema.ts`)
```typescript
subscriptionTier: text("subscription_tier").default("free"), // free, premium, pro
subscriptionStatus: text("subscription_status").default("active"),
```

#### **Clerk Webhook Handler** (`app/api/webhooks/clerk/route.ts`)
```typescript
await db.insert(users).values({
    clerkId: id,
    email: email_addresses[0]?.email_address || '',
    name: ...,
    imageUrl: ...,
    subscriptionTier: 'free',      // ✅ Default free plan
    subscriptionStatus: 'active',   // ✅ Active status
});
```

#### **Auto-Create User Function** (`app/api/strategies/save/route.ts`)
```typescript
await db.insert(users).values({
    clerkId: userId,
    email: ...,
    name: ...,
    imageUrl: ...,
    subscriptionTier: 'free',      // ✅ Default free plan
    subscriptionStatus: 'active',   // ✅ Active status
});
```

---

## Default User State

When a new user is created (either via Clerk webhook or auto-creation), they get:

| Field | Default Value | Description |
|-------|--------------|-------------|
| `subscriptionTier` | `'free'` | Free plan access |
| `subscriptionStatus` | `'active'` | Account is active |
| `createdAt` | `NOW()` | Timestamp of creation |
| `updatedAt` | `NOW()` | Timestamp of last update |

### Subscription Tiers Available:
- **free** - Default tier for all new users
- **premium** - Upgraded tier (requires payment)
- **pro** - Highest tier (requires payment)

### Subscription Statuses:
- **active** - Default status, user can access features
- **canceled** - User canceled but still has access until period ends
- **expired** - Subscription period ended
- **past_due** - Payment failed, grace period

---

## Summary

✅ **Portfolio page updated** - "Community Strategies" section renamed
✅ **Default tier confirmed** - All new users get `free` plan
✅ **Default status confirmed** - All new users are `active`
✅ **Triple redundancy** - Defaults set in schema, webhook, and auto-create function

All new users will automatically start with the free plan and active status! 🎉
