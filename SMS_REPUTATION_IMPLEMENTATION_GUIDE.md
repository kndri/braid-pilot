# SMS-Only Reputation Management - Implementation Guide

## Overview
BraidPilot's reputation management system uses **SMS-only** review requests to maximize engagement and simplify implementation. The platform owns and manages all Twilio infrastructure, sending messages on behalf of salons.

## Why SMS-Only?
- **98% open rate** (vs 20% for email)
- **90% read within 3 minutes**
- **45% response rate** (vs 5-10% for email)
- **No spam filters** to worry about
- **Direct to mobile** where reviews happen
- **Simple opt-out** compliance (just "STOP")

## Architecture Overview

### Centralized SMS Infrastructure
- **ONE Twilio account** for entire platform
- **ONE phone number** for all salons
- **Platform absorbs SMS costs** (factor into pricing)
- **Salons only provide review URLs**

### Key Components
```
┌─────────────────┐
│   BraidPilot    │
│   Platform      │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Twilio  │
    │ Account │
    └────┬────┘
         │
    ┌────▼────┐
    │   SMS   │
    │Delivery │
    └────┬────┘
         │
    ┌────▼────┐
    │ Client  │
    │ Phone   │
    └─────────┘
```

## Implementation Files

### 1. Backend Logic
- `convex/reputationSMS.ts` - Core SMS reputation functions
- `convex/booking.ts` - Integration with booking completion
- `convex/schema.ts` - Database schema for tracking

### 2. Frontend Components
- `app/dashboard/reputation/page.tsx` - Main reputation page
- `components/reputation/SalonReviewSetupSMS.tsx` - Setup wizard
- `components/dashboard/QuickActions.tsx` - Dashboard link

### 3. Messaging Service
- `lib/messaging/smsMessaging.ts` - Twilio integration

## Phase 1: Platform Setup (Day 1)

### 1.1 Environment Configuration
```bash
# .env.production
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567  # Your platform number
TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid

# Platform settings
PLATFORM_NAME=BraidPilot
PLATFORM_WEBSITE=https://braidpilot.com
```

### 1.2 Twilio Setup
1. Create Twilio account
2. Purchase phone number with SMS capability
3. Configure messaging service for better deliverability
4. Set up webhook endpoints for opt-outs
5. Configure status callbacks

### 1.3 Database Schema
```typescript
// Already implemented in convex/schema.ts
- salonUsageTracking: SMS usage per salon
- salonMessagingSettings: SMS preferences
- optOutList: Platform-wide opt-out management
- reviewRequests: Request tracking
```

## Phase 2: Salon Onboarding (Day 2)

### 2.1 Simple Setup Flow
Salons only need to provide:
1. Google Review URL
2. Optional: Yelp Review URL
3. Timing preference (when to send)
4. Optional: Incentive text

### 2.2 SMS Message Template
```
Hi [Client Name]! Thanks for visiting [Salon Name]. 
We'd love your feedback! [Incentive if enabled]
Review us here: [Review URL]

Reply STOP to opt-out.
```

**Character limit**: 160 for single SMS segment

### 2.3 Pricing Tiers
```typescript
export const PRICING_TIERS = {
  starter: {
    price: 49,
    smsPerMonth: 50,
  },
  professional: {
    price: 99,
    smsPerMonth: 200,
  },
  unlimited: {
    price: 199,
    smsPerMonth: Infinity,
  },
};
```

## Phase 3: Automated Workflow

### 3.1 Trigger Flow
```typescript
1. Appointment marked complete
   ↓
2. Check salon settings (enabled? delay?)
   ↓
3. Schedule SMS (default: 2 hours)
   ↓
4. Check opt-out status
   ↓
5. Send SMS via Twilio
   ↓
6. Track usage & analytics
   ↓
7. Handle failures/retries
```

### 3.2 Key Functions
```typescript
// Send review request
await sendReviewRequest({
  bookingId,
  retryCount: 0,
});

// Track usage
await trackReviewRequest({
  salonId,
});

// Check quota
const quota = await checkReviewQuota({
  salonId,
});
```

## Phase 4: Compliance & Legal

### 4.1 TCPA Compliance
- Include "Reply STOP to opt-out" in every message
- Honor opt-outs immediately
- Maintain opt-out list permanently
- No messages between 9pm-8am local time

### 4.2 Terms of Service
```typescript
const PLATFORM_TERMS = {
  messaging: {
    consent: "Salon agrees BraidPilot may send SMS on their behalf",
    liability: "Platform acts as technical service provider",
    optOut: "All messages include TCPA-compliant opt-out",
  },
};
```

### 4.3 Opt-Out Management
```typescript
// Automatic handling via Twilio webhook
export const handleOptOut = mutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    // Add to platform-wide opt-out list
    await ctx.db.insert("optOutList", {
      contactInfo: args.phone,
      type: "sms",
      optedOutAt: Date.now(),
    });
  },
});
```

## Phase 5: Testing & QA

### 5.1 Test Scenarios
- [ ] Send test SMS to verify setup
- [ ] Test opt-out functionality
- [ ] Verify character count limits
- [ ] Test retry logic for failures
- [ ] Validate phone number formatting
- [ ] Test quota enforcement
- [ ] Verify delivery tracking

### 5.2 Test SMS Function
```typescript
await sendTestReviewRequest({
  salonId,
  testPhone: "+15551234567",
});
```

## Phase 6: Monitoring & Analytics

### 6.1 Key Metrics to Track
```typescript
- SMS sent per salon
- Delivery success rate
- Opt-out rate
- Response time to review
- Cost per SMS
- Revenue per salon
- Platform margin
```

### 6.2 Admin Dashboard Queries
```sql
-- Daily SMS metrics
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_sms,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  AVG(cost) as avg_cost
FROM review_requests
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at);

-- Salon usage
SELECT 
  salon_id,
  COUNT(*) as sms_sent,
  SUM(sms_cost) as total_cost
FROM salon_usage_tracking
WHERE month = DATE_FORMAT(NOW(), '%Y-%m')
GROUP BY salon_id;
```

## Cost Analysis

### Platform Costs
```typescript
const COSTS = {
  twilio: {
    perSMS: 0.0075,      // $0.0075 per SMS
    phoneNumber: 1.00,    // $1/month
  },
  
  // With 100 salons on Professional ($99/month)
  example: {
    salons: 100,
    avgSMSPerSalon: 150,
    totalSMS: 15000,
    smsCost: 112.50,     // 15000 × $0.0075
    revenue: 9900,        // 100 × $99
    margin: 98.9,         // 98.9% margin!
  },
};
```

## Implementation Timeline

### Week 1: Core Setup
- [ ] Set up Twilio account
- [ ] Configure phone number
- [ ] Deploy backend functions
- [ ] Set up database tables

### Week 2: Salon Features
- [ ] Build setup wizard
- [ ] Create SMS templates
- [ ] Implement opt-out handling
- [ ] Add usage tracking

### Week 3: Testing & Launch
- [ ] Load testing
- [ ] Delivery optimization
- [ ] Admin dashboard
- [ ] Documentation

## Production Checklist

### Pre-Launch
- [ ] Twilio account verified and funded
- [ ] Phone number purchased and configured
- [ ] Environment variables set
- [ ] Database migrations complete
- [ ] Opt-out webhook configured
- [ ] Rate limiting implemented
- [ ] Error logging set up

### Launch Day
- [ ] Send test SMS from production
- [ ] Verify webhook endpoints
- [ ] Check error monitoring
- [ ] Confirm usage tracking
- [ ] Test opt-out flow

### Post-Launch
- [ ] Monitor delivery rates
- [ ] Track opt-out rates
- [ ] Review error logs
- [ ] Analyze usage patterns
- [ ] Optimize message timing

## Monitoring & Alerts

```typescript
const ALERTS = {
  highFailureRate: {
    threshold: 10, // percent
    action: 'Check Twilio status',
  },
  highOptOutRate: {
    threshold: 5, // percent
    action: 'Review message content',
  },
  quotaExceeded: {
    threshold: 100, // percent
    action: 'Notify salon to upgrade',
  },
  lowBalance: {
    threshold: 100, // dollars
    action: 'Top up Twilio account',
  },
};
```

## Best Practices

### Message Timing
- **Best**: 2-4 hours after service
- **Good**: Same day evening
- **Avoid**: Next day or later
- **Never**: Before 8am or after 9pm

### Message Content
- Keep under 160 characters
- Include client's first name
- One clear call-to-action
- Always include opt-out

### URL Management
- Use URL shorteners if needed
- Track click rates
- Prioritize Google Reviews
- Test links regularly

## Success Metrics

### Target KPIs
- **Delivery Rate**: > 95%
- **Opt-out Rate**: < 2%
- **Response Rate**: > 40%
- **Time to Review**: < 24 hours
- **Cost per Review**: < $0.02
- **Platform Margin**: > 95%

## Troubleshooting

### Common Issues

**SMS not delivering**
- Check phone number format (E.164)
- Verify Twilio account balance
- Check for carrier filtering
- Review opt-out list

**Low response rates**
- Optimize message timing
- Test different incentives
- Shorten message content
- Improve review URL accessibility

**High opt-out rate**
- Reduce frequency
- Improve message relevance
- Check timing settings
- Review client satisfaction

## Future Enhancements

### Phase 2 (Month 2-3)
- MMS support for branded messages
- A/B testing for message optimization
- Predictive best-time-to-send
- Multi-language support

### Phase 3 (Month 4-6)
- AI-powered message personalization
- Review response automation
- Sentiment analysis
- Competitive benchmarking

## Support Resources

### Documentation
- Twilio SMS Best Practices
- TCPA Compliance Guide
- SMS Character Counter
- Phone Number Formatting

### Contacts
- Twilio Support: support@twilio.com
- Platform Team: dev@braidpilot.com
- Legal/Compliance: legal@braidpilot.com

---

## Quick Start Commands

```bash
# Test SMS
npm run test:sms -- --phone="+15551234567"

# Check delivery status
npm run sms:status -- --sid="SM..."

# Export usage report
npm run report:sms -- --month="2024-01"

# Process opt-outs
npm run sms:optout -- --sync
```

This SMS-only approach provides a cleaner, more focused implementation that delivers better results with less complexity!