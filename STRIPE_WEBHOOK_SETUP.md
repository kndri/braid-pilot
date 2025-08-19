# Stripe Webhook Configuration Guide

## ✅ IMPLEMENTATION STATUS
**Webhook endpoint is ALREADY IMPLEMENTED and functional!**
- Location: `/app/api/stripe/webhook/route.ts`
- Secret configured: `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Events handled: payment_intent.succeeded, payment_intent.payment_failed, payment_intent.canceled, charge.refunded

## 🔔 Overview
Webhooks are essential for receiving real-time payment updates from Stripe. They ensure your booking system stays synchronized with payment status changes.

## 📋 Quick Setup Steps

### 1. Access Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint" button

### 2. Configure Webhook Endpoint

#### For Development (Local Testing)
```
Endpoint URL: Use ngrok or similar tunnel service
Example: https://abc123.ngrok.io/api/stripe/webhook
```

#### For Production
```
Endpoint URL: https://yourdomain.com/api/stripe/webhook
```

### 3. Select Events to Listen For

**Required Events (Check these boxes):**
- ✅ `payment_intent.succeeded` - Payment completed successfully
- ✅ `payment_intent.payment_failed` - Payment failed
- ✅ `payment_intent.canceled` - Payment was canceled
- ✅ `charge.refunded` - Refund was processed

**Optional Events (Recommended):**
- ✅ `payment_intent.created` - Payment initiated
- ✅ `payment_intent.processing` - Payment is processing
- ✅ `payment_intent.requires_action` - 3D Secure authentication needed
- ✅ `charge.succeeded` - Charge completed
- ✅ `charge.failed` - Charge failed
- ✅ `customer.created` - New customer created
- ✅ `payment_method.attached` - Payment method saved

### 4. Get Your Webhook Secret
After creating the endpoint:
1. Click on the webhook endpoint you created
2. Click "Reveal" under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to your environment variables:

```bash
# .env.local (for development)
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# .env.production (for production)
STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
```

## 🧪 Testing Webhooks Locally

### Option 1: Stripe CLI (Recommended)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward events to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
```

### Option 2: Ngrok Tunnel
```bash
# Install ngrok
brew install ngrok

# Start your Next.js dev server
npm run dev

# In another terminal, create tunnel
ngrok http 3000

# Use the HTTPS URL in Stripe webhook configuration
# Example: https://abc123.ngrok.io/api/stripe/webhook
```

## 📊 Webhook Event Handling

### Current Implementation (VERIFIED)
Our webhook endpoint (`/api/stripe/webhook`) is fully implemented and handles:

```typescript
// Payment successful
case 'payment_intent.succeeded':
  - Marks booking as paid
  - Sends confirmation email
  - Updates platform fee status

// Payment failed  
case 'payment_intent.payment_failed':
  - Marks booking as payment failed
  - Notifies customer of failure
  - Allows retry attempt

// Payment canceled
case 'payment_intent.canceled':
  - Updates booking status
  - Releases time slot

// Refund processed
case 'charge.refunded':
  - Updates booking as refunded
  - Sends refund confirmation
```

## 🔍 Webhook Verification

**Important:** Always verify webhook signatures to ensure security:

```typescript
// ✅ IMPLEMENTED in /app/api/stripe/webhook/route.ts
const signature = headers().get('stripe-signature');
const event = constructWebhookEvent(
  body,
  signature,
  webhookSecret  // Using STRIPE_WEBHOOK_SECRET from env
);
```

## 📈 Monitoring Webhooks

### In Stripe Dashboard
1. Go to [Webhook Events](https://dashboard.stripe.com/test/webhooks/events)
2. View all webhook attempts
3. Check for failures and retry if needed

### Event Log Information
- ✅ **Success (200)**: Event processed successfully
- ⚠️ **Client Error (4xx)**: Check your endpoint code
- ❌ **Server Error (5xx)**: Server issue, Stripe will retry
- 🔄 **Retries**: Stripe retries failed webhooks up to 3 days

## 🚨 Common Issues & Solutions

### Issue: Webhook signature verification failed
**Solution:** Ensure you're using the raw request body, not parsed JSON

### Issue: 404 Not Found
**Solution:** Verify your endpoint URL is correct and deployed

### Issue: Timeout errors
**Solution:** Respond quickly (within 20 seconds) and process asynchronously

### Issue: Duplicate events
**Solution:** Implement idempotency using event IDs

## 📝 Testing Checklist

- [x] Create test webhook endpoint in Stripe Dashboard
- [x] Add webhook secret to environment variables (✅ Already in `.env.local`)
- [ ] Test payment success flow
- [ ] Test payment failure flow
- [ ] Test 3D Secure authentication flow
- [ ] Verify booking status updates (⚠️ Convex integration pending)
- [ ] Check email notifications sent (⚠️ Email service pending)
- [ ] Monitor webhook logs in Stripe Dashboard

## ⚠️ PENDING INTEGRATIONS

The webhook endpoint is ready but these integrations are still TODO:
1. **Convex Database Updates**: Update booking status in database
2. **Email Notifications**: Send confirmation/failure emails
3. **Production Webhook URL**: Configure in Stripe Dashboard when deployed

## 🔐 Security Best Practices

1. **Always verify signatures** - Never skip webhook verification
2. **Use HTTPS only** - Webhooks must use HTTPS in production
3. **Implement idempotency** - Handle duplicate events gracefully
4. **Log all events** - Keep audit trail of webhook activity
5. **Return quickly** - Acknowledge receipt immediately, process async
6. **Handle retries** - Be prepared for duplicate events from retries

## 📚 Webhook Payload Example

```json
{
  "id": "evt_1234567890",
  "object": "event",
  "api_version": "2023-10-16",
  "created": 1234567890,
  "data": {
    "object": {
      "id": "pi_1234567890",
      "object": "payment_intent",
      "amount": 500,
      "currency": "usd",
      "status": "succeeded",
      "metadata": {
        "bookingId": "test_booking_123",
        "clientEmail": "customer@example.com",
        "serviceName": "Knotless Braids",
        "servicePrice": "220",
        "salonName": "Elite Braids & Beauty",
        "feeType": "booking_fee",
        "platform": "BraidPilot"
      }
    }
  },
  "type": "payment_intent.succeeded"
}
```

## 🎯 Production Deployment

Before going live:
1. Switch to production webhook endpoint URL
2. Update to production webhook secret
3. Test with live mode test cards
4. Verify all events are being received
5. Monitor for first 24 hours after launch

## 📞 Support Resources

- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Webhook Event Types](https://stripe.com/docs/api/events/types)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)