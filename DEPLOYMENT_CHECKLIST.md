# BraidPilot Deployment Checklist

## Pre-Deployment Status
- ✅ Payment processing temporarily disabled (Stripe verification pending)
- ✅ Booking flow updated to skip payment
- ✅ Feature flags configured for easy re-enabling

## Environment Variables Required

### 1. Core Configuration
```bash
# Next.js
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://braidpilot.com

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOY_KEY=xxx
```

### 2. Payment Configuration (For Later)
```bash
# Stripe (Add when account is verified)
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
PLATFORM_BOOKING_FEE=500  # $5 in cents
```

### 3. Optional Services
```bash
# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Tracking (Optional)
SENTRY_DSN=xxx
```

## Deployment Steps

### Step 1: Vercel Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

2. **Configure Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all required variables from above
   - Ensure variables are set for Production environment

3. **Configure Domain**
   - Add custom domain: `braidpilot.com`
   - Add www subdomain: `www.braidpilot.com`
   - Configure DNS records at your domain registrar

### Step 2: Convex Setup

1. **Deploy Convex Functions**
   ```bash
   npx convex deploy --prod
   ```

2. **Run Initial Seed (Optional)**
   ```bash
   npx convex run seed:seedDevelopmentData --prod
   ```

### Step 3: Clerk Configuration

1. **Production Instance**
   - Create production instance at clerk.com
   - Configure allowed URLs:
     - `https://braidpilot.com`
     - `https://www.braidpilot.com`

2. **Configure OAuth (Optional)**
   - Google OAuth
   - Facebook OAuth

### Step 4: Post-Deployment Testing

#### Critical Paths to Test:

1. **Landing Page Flow**
   - [ ] Homepage loads correctly
   - [ ] "Get Started" button works
   - [ ] Quote tool is accessible

2. **Salon Onboarding**
   - [ ] Sign up works
   - [ ] Onboarding wizard completes
   - [ ] Pricing configuration saves
   - [ ] Post-onboarding setup page appears
   - [ ] Dashboard is accessible

3. **Quote Tool**
   - [ ] Public quote tool works
   - [ ] Style selection works
   - [ ] Size/length adjustments calculate correctly
   - [ ] Final price displays
   - [ ] Booking flow initiates

4. **Booking Flow (Without Payment)**
   - [ ] Calendar shows available slots
   - [ ] Contact form submits
   - [ ] Booking confirms without payment
   - [ ] Confirmation message shows "pay at salon"
   - [ ] Email notification sent (if configured)

5. **Dashboard Functions**
   - [ ] Login works
   - [ ] Stats display correctly
   - [ ] Bookings page loads
   - [ ] Braiders page works
   - [ ] Settings are editable

## Feature Flags to Configure

Edit `/lib/config.ts`:

```typescript
export const config = {
  payment: {
    enabled: false,  // Set to true when Stripe is ready
    bookingFeeAmount: 5,
    testMode: false,  // Set to true for testing
  },
  features: {
    paymentProcessing: false,  // Enable when ready
    virtualReceptionist: false,
    reputationManagement: false,
    smsNotifications: false,  // Enable if Twilio configured
    emailNotifications: true,
  },
};
```

## When Stripe is Verified (Future)

1. **Update Configuration**
   - Set `PAYMENT_REQUIRED = true` in `/convex/booking.ts`
   - Set `payment.enabled = true` in `/lib/config.ts`
   - Add Stripe environment variables

2. **Configure Webhook**
   - Add webhook endpoint in Stripe Dashboard
   - URL: `https://braidpilot.com/api/stripe-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

3. **Test Payment Flow**
   - Use test cards first
   - Process a real $5 payment
   - Verify webhook receives events

## Monitoring & Analytics

### 1. Basic Monitoring
- Vercel Analytics (built-in)
- Convex Dashboard for database monitoring
- Clerk Dashboard for auth metrics

### 2. Error Tracking (Optional)
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure with wizard
npx @sentry/wizard@latest -i nextjs
```

### 3. User Analytics (Optional)
- PostHog for product analytics
- Google Analytics for traffic

## Launch Checklist

### Soft Launch (Current)
- [x] Deploy without payment processing
- [x] Test with a few friendly salons
- [x] Gather feedback on core features
- [x] Fix any critical bugs

### Full Launch (After Stripe)
- [ ] Enable payment processing
- [ ] Test payment flow thoroughly
- [ ] Update landing page with payment info
- [ ] Launch marketing campaign
- [ ] Monitor for issues

## Rollback Plan

If issues occur:
1. **Quick Fix**: Toggle feature flags in `/lib/config.ts`
2. **Rollback**: `vercel rollback` to previous deployment
3. **Database**: Convex maintains automatic backups

## Support Documentation

Create these pages before launch:
- [ ] `/help` - Help center
- [ ] `/faq` - Frequently asked questions
- [ ] `/terms` - Terms of service
- [ ] `/privacy` - Privacy policy
- [ ] `/contact` - Contact form

## Contact for Issues

- **Vercel Support**: support@vercel.com
- **Convex Support**: support@convex.dev
- **Clerk Support**: support@clerk.com

## Notes

1. **Current State**: Platform ready for deployment without payment processing
2. **Booking Flow**: Clients book appointments, pay directly at salon
3. **Revenue Model**: $5 booking fee (to be activated after Stripe verification)
4. **Timeline**: Deploy now, enable payments when Stripe is ready

Remember: The platform is fully functional without payment processing. Salons can use it immediately for booking management.