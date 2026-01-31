# Midtrans Subscription Integration - Implementation Guide

## Overview

This implementation provides **true recurring/subscription payments** using Midtrans APIs, supporting both **Credit Card** and **GoPay** payment methods.

## Architecture

### Payment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User clicks "Pilih Paket" on pricing page                       │
│                        ↓                                            │
│  2. Payment Method Dialog opens                                     │
│     ┌────────────────┬────────────────┐                             │
│     │  Credit Card   │     GoPay      │                             │
│     └────────┬───────┴───────┬────────┘                             │
│              ↓               ↓                                      │
│  ┌───────────────────┐ ┌────────────────────────┐                   │
│  │ 3a. Snap Popup    │ │ 3b. Enter Phone Number │                   │
│  │ (One-time payment)│ │     ↓                  │                   │
│  │     ↓             │ │ 4b. Link GoPay Account │                   │
│  │ 4a. Webhook saves │ │ (Redirect to GoPay app)│                   │
│  │ card token        │ │     ↓                  │                   │
│  │     ↓             │ │ 5b. Confirm linking    │                   │
│  │ 5a. Create        │ │     ↓                  │                   │
│  │ recurring sub     │ │ 6b. Create GoPay       │                   │
│  │ (with saved token)│ │ subscription           │                   │
│  └───────────────────┘ └────────────────────────┘                   │
│              ↓               ↓                                      │
│  ┌──────────────────────────────────────────────┐                   │
│  │   Midtrans Subscription API handles          │                   │
│  │   automatic recurring payments               │                   │
│  └──────────────────────────────────────────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Files Created/Modified

### New Files

| File | Purpose |
|------|---------|
| `app/api/subscriptions/gopay/link/route.ts` | Initiate GoPay account linking |
| `app/api/subscriptions/gopay/callback/route.ts` | Handle GoPay linking callback |
| `app/api/subscriptions/gopay/status/route.ts` | Check GoPay linking status |
| `components/payment-method-dialog.tsx` | Payment method selection UI |
| `db/migration-gopay-accounts.sql` | Database migration for GoPay |

### Modified Files

| File | Changes |
|------|---------|
| `lib/midtrans.ts` | Added GoPay account linking APIs |
| `db/schema-subscriptions.ts` | Added GoPay accounts table, payment method enum |
| `app/api/subscriptions/create/route.ts` | Support both Card & GoPay subscriptions |
| `app/api/subscriptions/webhook/route.ts` | Handle recurring payment webhooks |
| `components/pricing-matrix.tsx` | Integrated payment dialog |

## API Endpoints

### POST `/api/subscriptions/gopay/link`
Initiate GoPay account linking.

**Request:**
```json
{
  "phoneNumber": "08123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountId": "phy56f8f-2683...",
    "accountStatus": "PENDING",
    "activationUrl": "https://gopay.co.id/...",
    "activationType": "activation-deeplink"
  }
}
```

### GET `/api/subscriptions/gopay/callback`
Callback URL after user completes GoPay linking.

### GET `/api/subscriptions/gopay/status?accountId=xxx`
Check if GoPay account is successfully linked.

### POST `/api/subscriptions/create`
Create a subscription (updated to support both methods).

**Request (Credit Card):**
```json
{
  "planType": "suhu",
  "billingInterval": "monthly",
  "paymentMethod": "credit_card"
}
```

**Request (GoPay):**
```json
{
  "planType": "suhu",
  "billingInterval": "monthly",
  "paymentMethod": "gopay",
  "gopayAccountId": "phy56f8f-2683...",
  "gopayToken": "token_from_metadata..."
}
```

### POST `/api/subscriptions/webhook`
Webhook handler for Midtrans notifications.

## Database Schema

### New Tables

#### `gopay_accounts`
Stores linked GoPay accounts for recurring payments.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| user_id | TEXT | Clerk user ID (unique) |
| user_email | TEXT | User's email |
| account_id | TEXT | Midtrans GoPay account_id |
| account_status | ENUM | pending, active, expired, disabled |
| payment_option_token | TEXT | Token for executing charges |
| metadata | TEXT | JSON metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| linked_at | TIMESTAMPTZ | When linking completed |
| expires_at | TIMESTAMPTZ | Token expiration |

#### Updated `payment_subscriptions`
| New Column | Type | Description |
|------------|------|-------------|
| payment_method | ENUM | credit_card or gopay |
| gopay_account_id | BIGINT | FK to gopay_accounts |

## Setup Instructions

### 1. Run Database Migration

```bash
# Connect to your Postgres database and run:
psql -f db/migration-gopay-accounts.sql
```

### 2. Configure Midtrans Dashboard

1. **Enable GoPay Tokenization**
   - Go to Settings > Payment Channels
   - Enable "GoPay Tokenization" / "Pay Account"

2. **Configure Webhook URL**
   - Go to Settings > Configuration
   - Set Payment Notification URL to:
     - Local: `https://your-ngrok-url.ngrok.io/api/subscriptions/webhook`
     - Production: `https://yourdomain.com/api/subscriptions/webhook`

3. **Enable Subscription Notifications**
   - Enable recurring/subscription notifications if available

### 3. Environment Variables

Add to your `.env.local`:

```bash
MIDTRANS_SERVER_KEY=your_server_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
MIDTRANS_IS_PRODUCTION=false  # Set to true for production
```

## Testing

### Sandbox Testing

1. **Credit Card Test Numbers:**
   - Visa: 4811 1111 1111 1114
   - CVV: 123
   - Expiry: Any future date

2. **GoPay Sandbox:**
   - Use phone: 08123456789
   - The sandbox will simulate the linking process

### Testing Flow

1. Go to `/harga` page
2. Click "Pilih Paket" on Suhu or Bandar
3. Select payment method:
   - Credit Card → Opens Snap popup
   - GoPay → Enter phone → Link account → Confirm
4. Complete payment
5. Check webhook logs for subscription creation

## Webhook Events

The webhook handles these transaction statuses:

| Status | Action |
|--------|--------|
| `capture` | Process payment (card with fraud check) |
| `settlement` | Payment successful, create recurring subscription |
| `pending` | Payment pending |
| `deny/cancel/expire` | Payment failed |
| `refund` | Handle refunds |

For credit card payments with `save_card: true`, the webhook receives a `saved_token_id` which is used to create the recurring subscription automatically.

## TODO: Complete Implementation

The following areas need database integration (marked with TODO in code):

1. **Save GoPay accounts** to `gopay_accounts` table
2. **Create subscription records** in `payment_subscriptions` table
3. **Create transaction records** in `payment_transactions` table
4. **Update user plan** in your users table
5. **Handle subscription renewal** notifications

## Security Considerations

1. **Signature Verification** - All webhook requests are verified using Midtrans signature
2. **Server-side Token Storage** - Card tokens and GoPay account IDs are stored server-side only
3. **User Authentication** - All API endpoints require Clerk authentication
4. **Phone Number Validation** - Phone numbers are cleaned and validated before sending to Midtrans
