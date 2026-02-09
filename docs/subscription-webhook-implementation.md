# Subscription Payment Webhook Implementation

## Overview
This document describes the implementation of the Midtrans payment webhook system that automatically updates user subscription tiers and records payment transactions.

## Database Schema Changes

### Users Table Updates
Added new fields to track subscription periods:

```typescript
// db/schema.ts - users table
subscriptionTier: text("subscription_tier").default("ritel"), // ritel, suhu, bandar
subscriptionStatus: text("subscription_status").default("active"), // active, canceled, expired, past_due
subscriptionPeriodStart: timestamp("subscription_period_start", { withTimezone: true }),
subscriptionPeriodEnd: timestamp("subscription_period_end", { withTimezone: true }),
```

**Subscription Tiers:**
- `ritel` - Free tier (previously "free")
- `suhu` - Premium tier (Rp99,000/month or Rp49,500/month yearly)
- `bandar` - Pro tier (Rp189,000/month or Rp94,500/month yearly)

### Payments Table
The payments table already exists and stores all payment records with the following key fields:
- `orderId` - Unique Midtrans order ID
- `transactionStatus` - settlement, pending, deny, cancel, expire, refund
- `subscriptionTier` - Which tier was purchased (suhu/bandar)
- `billingPeriod` - monthly or yearly
- `periodStart` / `periodEnd` - Subscription period covered by this payment
- `metadata` - Additional payment information (JSON)

## Webhook Implementation

### Endpoint
`POST /api/subscriptions/webhook`

This endpoint receives payment notifications from Midtrans and processes them accordingly.

### Payment Flow

#### 1. Successful Payment (settlement/capture)
When a payment is successful, the webhook:

1. **Verifies the signature** to ensure the request is from Midtrans
2. **Parses the order ID** to extract:
   - Plan type (suhu or bandar)
   - User ID
3. **Calculates subscription period:**
   - **Monthly:** Current date + 1 month
   - **Yearly:** Current date + 1 year
4. **Updates the users table:**
   ```typescript
   {
     subscriptionTier: 'suhu' | 'bandar',
     subscriptionStatus: 'active',
     subscriptionPeriodStart: now,
     subscriptionPeriodEnd: calculatedEndDate,
     updatedAt: now
   }
   ```
5. **Creates a payment record** in the payments table
6. **Optionally creates recurring subscription** (for credit card payments with saved tokens)

#### 2. Failed Payment (deny/cancel/expire)
When a payment fails, the webhook:

1. **Records the failed payment** in the payments table for tracking
2. **Does NOT update** the user's subscription tier
3. **Logs the failure reason** in the metadata

#### 3. Refund
When a refund is processed:
- Records the refund transaction
- Can be used to downgrade user subscription (TODO)

### Period Calculation Logic

```typescript
// Monthly subscription
const periodEnd = new Date(now);
periodEnd.setMonth(periodEnd.getMonth() + 1);

// Yearly subscription
const periodEnd = new Date(now);
periodEnd.setFullYear(periodEnd.getFullYear() + 1);
```

## Testing with Sandbox

### Test Card Numbers
Use these test cards in the Midtrans Snap popup:

**Successful Payment:**
- VISA: `4811 1111 1111 1114`
- Mastercard: `5211 1111 1111 1117`
- Expiry: `01/25`
- CVV: `123`
- OTP: `112233`

**Failed Payment:**
- VISA: `4911 1111 1111 1113` (Denied by Bank)
- Mastercard: `5111 1111 1111 1118` (Denied by Bank)

### Testing Flow
1. Go to `/harga` page
2. Click "Pilih Paket" on Suhu or Bandar plan
3. Login if needed
4. Select payment method in dialog
5. Use test card in Midtrans Snap popup
6. Complete payment
7. Webhook receives notification
8. User's subscription tier is updated
9. Payment record is created

### Verifying Success
After successful payment:
1. Check the database `users` table - `subscription_tier` should be updated
2. Check the database `payments` table - new payment record should exist
3. User should have access to tier-specific features

## Order ID Format
Order IDs follow this format:
```
AS-{PLAN_INITIAL}-{USER_ID_SHORT}-{TIMESTAMP}
```

Example: `AS-S-user_2abc-1707512345678`
- `AS` - AlgoSaham prefix
- `S` - Suhu plan (or `B` for Bandar)
- `user_2abc` - Shortened user ID
- `1707512345678` - Timestamp

## Security
- **Signature verification** ensures requests are from Midtrans
- **SHA512 hash** of `order_id + status_code + gross_amount + server_key`
- Invalid signatures are rejected with 403 status

## Error Handling
- All errors are logged but webhook returns 200 OK to prevent Midtrans retries
- Database errors are caught and logged
- User not found errors are handled gracefully
- Failed recurring subscription creation doesn't affect the main payment

## Future Enhancements
- [ ] Email notifications on successful payment
- [ ] Automatic downgrade when subscription expires
- [ ] Subscription renewal reminders
- [ ] Support for subscription cancellation
- [ ] Proration for plan upgrades/downgrades
- [ ] Save recurring subscriptions to `paymentSubscriptions` table

## Files Modified
1. `db/schema.ts` - Updated users table with subscription period fields
2. `app/api/subscriptions/webhook/route.ts` - Implemented webhook handlers
3. `db/migration-update-users-subscription.sql` - Migration script

## Migration Applied
The database migration has been applied using:
```bash
npm run db:push
```

This updated the production database schema to match the new TypeScript definitions.
