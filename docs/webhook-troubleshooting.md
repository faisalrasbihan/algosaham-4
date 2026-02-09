# Webhook Troubleshooting Guide

## Issue
Midtrans webhook test is failing with: "Failed to send HTTP notification due to issues related to the URL"

## Solution Applied

### 1. Added GET Handler to Webhook Endpoint
The webhook endpoint now responds to GET requests (which Midtrans uses to test connectivity):

**File:** `app/api/subscriptions/webhook/route.ts`

```typescript
export async function GET(request: NextRequest) {
    return NextResponse.json({
        status: "ok",
        message: "Midtrans webhook endpoint is ready",
        timestamp: new Date().toISOString(),
    });
}
```

### 2. Webhook URL Configuration

**Correct Webhook URL:**
```
https://backtester-production-6541.up.railway.app/api/subscriptions/webhook
```

### 3. Steps to Test After Deployment

1. **Wait for Railway Deployment** (2-3 minutes)
   - Check Railway dashboard for deployment status
   - Look for "Deployment successful" message

2. **Test the Webhook Endpoint Manually**
   ```bash
   curl https://backtester-production-6541.up.railway.app/api/subscriptions/webhook
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "message": "Midtrans webhook endpoint is ready",
     "timestamp": "2026-02-09T21:06:00.000Z"
   }
   ```

3. **Test in Midtrans Dashboard**
   - Go to Midtrans Dashboard → Settings → Configuration
   - Enter the webhook URL
   - Click "Test notification URL"
   - Should show "Test successful" ✅

4. **Make a Test Payment**
   - Go to your `/harga` page
   - Select a plan (Suhu or Bandar)
   - Complete payment with test card: `4811 1111 1111 1114`
   - Check database for payment record:
     ```bash
     npx tsx db/check-user-subscription.ts
     ```

## Common Issues & Solutions

### Issue: "Test failed" in Midtrans
**Causes:**
- Railway deployment not complete yet
- Wrong URL format
- Endpoint not publicly accessible

**Solutions:**
- Wait for deployment to complete
- Verify URL has no trailing slash
- Check Railway logs for errors

### Issue: Webhook receives notification but doesn't update database
**Causes:**
- Database connection issue
- Invalid signature
- User not found

**Solutions:**
- Check Railway logs for errors
- Verify `MIDTRANS_SERVER_KEY` is set correctly
- Ensure user exists in database

### Issue: Payment successful but no webhook received
**Causes:**
- Webhook URL not saved in Midtrans
- Using wrong environment (production vs sandbox)

**Solutions:**
- Re-save webhook URL in Midtrans dashboard
- Verify using sandbox keys with sandbox webhook URL

## Verification Checklist

- [ ] Code deployed to Railway
- [ ] Webhook URL responds to GET requests
- [ ] Webhook URL configured in Midtrans dashboard
- [ ] Test notification successful in Midtrans
- [ ] Test payment creates payment record in database
- [ ] User subscription tier updated after payment

## Testing Commands

```bash
# Check if webhook is live
curl https://backtester-production-6541.up.railway.app/api/subscriptions/webhook

# Check user subscription status
npx tsx db/check-user-subscription.ts

# Check recent payments
npx tsx db/check-user-subscription.ts
```

## Next Steps

1. Wait for Railway deployment to complete
2. Test the webhook URL with curl command above
3. Re-test in Midtrans dashboard
4. If successful, make a test payment
5. Verify user tier is updated in database
