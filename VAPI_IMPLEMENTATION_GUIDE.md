# Vapi Voice Assistant Implementation Guide

## Architecture Overview

Your Vapi integration follows a **server-side dynamic generation approach** that automatically keeps voice assistants synchronized with salon data changes.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Salon Admin   │────▶│  Braid Pilot UI  │────▶│  Convex Backend │
│  Updates Data   │     │   (React/Next)   │     │   (Real-time)   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Vapi Assistant │◀────│ Prompt Generator │◀────│  Sync Manager   │
│   (Updated)     │     │   (Dynamic)      │     │  (Automatic)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Key Components

### 1. **Server-Side Prompt Generation** (`convex/vapiPromptGenerator.ts`)
- Dynamically generates system prompts from salon data
- No hardcoded values - everything comes from your database
- Automatically includes:
  - Current pricing from `pricingConfigs`
  - Business hours and policies from `businessContext`
  - Active promotions
  - Salon-specific information

### 2. **Real-Time Sync Manager** (`convex/vapiSyncManager.ts`)
- Monitors database changes and triggers updates
- Smart batching to avoid excessive API calls
- Priority-based update delays:
  - Pricing changes: 10 seconds
  - Hours changes: 15 seconds
  - Policy changes: 30 seconds
  - Promotions: 20 seconds
- Automatic retry for critical failures

### 3. **UI Management Component** (`components/vapi/VapiAssistantManager.tsx`)
- One-click provisioning of phone numbers
- Real-time analytics dashboard
- Manual sync triggers
- Live call monitoring
- System prompt preview

## Implementation Workflow

### Step 1: Initial Setup
```typescript
// When a salon activates Vapi:
1. UI calls provisionVapiPhoneNumber()
2. System provisions phone number via Vapi API
3. Creates assistant with generated prompt
4. Stores configuration in database
```

### Step 2: Automatic Updates
```typescript
// When salon data changes:
1. Database mutation triggers sync manager
2. Sync manager batches changes (5-60 second delay)
3. Prompt generator creates new system prompt
4. Vapi API updates assistant configuration
5. Changes reflect immediately in next call
```

### Step 3: Function Integration
The assistant has access to these custom functions:
- `book_appointment` - Creates appointments in your system
- `check_availability` - Real-time schedule checking
- `get_quote` - Uses Price My Style tool
- `send_price_tool_link` - SMS delivery
- `send_appointment_details` - Confirmation delivery
- `transfer_to_stylist` - Human handoff

## Database Schema Extensions

Add these collections to your Convex schema:

```typescript
// convex/schema.ts additions
vapiSyncLogs: defineTable({
  salonId: v.id("salons"),
  changeType: v.string(),
  scheduledAt: v.number(),
  executeAt: v.number(),
  completedAt: v.optional(v.number()),
  status: v.string(),
  error: v.optional(v.string()),
}).index("by_salonId", ["salonId"]),

vapiUpdateBatches: defineTable({
  salonId: v.id("salons"),
  changeTypes: v.array(v.string()),
  status: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
  error: v.optional(v.string()),
}).index("by_salonId", ["salonId"]),

vapiSyncMetrics: defineTable({
  salonId: v.id("salons"),
  date: v.string(),
  totalSyncs: v.number(),
  successfulSyncs: v.number(),
  failedSyncs: v.number(),
  lastSyncAt: v.number(),
}).index("by_salonId_date", ["salonId", "date"]),

vapiPromptUpdates: defineTable({
  salonId: v.id("salons"),
  updateType: v.string(),
  success: v.boolean(),
  error: v.optional(v.string()),
  timestamp: v.number(),
}),

vapiUpdateSchedules: defineTable({
  salonId: v.id("salons"),
  scheduledFor: v.number(),
  status: v.string(),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
  error: v.optional(v.string()),
}).index("by_salonId", ["salonId"]),
```

## Environment Variables

Add to your `.env.local`:
```bash
VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_SECRET=your_webhook_secret
CONVEX_URL=https://your-app.convex.site
NEXT_PUBLIC_APP_URL=https://your-app.com
```

## Deployment Steps

### 1. Deploy Convex Functions
```bash
npx convex deploy
```

### 2. Set Up Webhook Endpoint
Your webhook is already configured at:
```
https://your-app.convex.site/vapiWebhook
```

### 3. Configure Vapi Dashboard
1. Add your webhook URL in Vapi settings
2. Set webhook secret
3. Enable required events:
   - `call-started`
   - `speech-update`
   - `function-call`
   - `call-ended`

### 4. Test the Integration
```typescript
// Use the test function to verify setup:
const result = await testVapiConfiguration({ salonId });
```

## Monitoring & Maintenance

### Health Monitoring
```typescript
// Check sync health
const health = await getSyncHealth({ salonId });
// Returns: successRate, pendingSyncs, lastSyncAt, health status
```

### Manual Sync
```typescript
// Force immediate update
await manualSync({ salonId });
```

### Analytics Tracking
- Total calls
- Completed calls
- Booking conversions
- Average duration
- Transfer rate

## Best Practices

### 1. **Update Batching**
- Changes are automatically batched to reduce API calls
- Multiple changes within 5 seconds are combined
- Critical changes (pricing, hours) get priority

### 2. **Error Handling**
- Failed updates automatically retry for critical changes
- Non-critical failures are logged but don't block operations
- Health monitoring alerts you to persistent issues

### 3. **Performance**
- System prompts are cached and only regenerate on changes
- Updates happen asynchronously without blocking UI
- Webhook responses are optimized for low latency

### 4. **Security**
- All API keys stored in environment variables
- Webhook signatures validated
- Customer data never exposed in prompts

## Advanced Customization

### Custom Voice Selection
```typescript
updateVoiceConfiguration({
  salonId,
  voiceProvider: "elevenlabs",
  voiceId: "custom_voice_id",
  voiceSettings: {
    speed: 1.0,
    pitch: 1.0,
    temperature: 0.7,
    stability: 0.5
  }
});
```

### Dynamic Variables
Pass runtime variables for personalization:
```typescript
assistantOverrides: {
  variableValues: {
    customerName: "John",
    lastVisit: "2 weeks ago",
    preferredStylist: "Maria"
  }
}
```

### Custom Functions
Add new capabilities:
```typescript
// In vapiWebhook.ts
case 'check_stylist_availability':
  return await handleStylistAvailability(ctx, call.id, functionCall.arguments);
```

## Troubleshooting

### Assistant Not Updating
1. Check sync health: `getSyncHealth({ salonId })`
2. Verify Vapi API key is valid
3. Check for errors in `vapiSyncLogs`
4. Manually trigger sync: `manualSync({ salonId })`

### Calls Not Working
1. Verify phone number is provisioned
2. Check webhook URL is accessible
3. Validate assistant configuration
4. Review recent call logs in UI

### Performance Issues
1. Check update frequency in metrics
2. Adjust batching delays if needed
3. Monitor API rate limits
4. Review prompt size (keep under 4000 tokens)

## Summary

This implementation provides:
- ✅ **Fully automated** prompt updates when business data changes
- ✅ **Server-side generation** - no manual variable replacement
- ✅ **Real-time synchronization** with intelligent batching
- ✅ **Complete UI integration** for management and monitoring
- ✅ **Production-ready** error handling and retry logic
- ✅ **Scalable architecture** supporting multiple salons

The system ensures your Vapi assistants always have the latest information without manual intervention, while optimizing API usage through smart batching and caching.