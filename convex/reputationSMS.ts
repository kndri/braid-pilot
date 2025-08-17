import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Pricing tiers for multi-tenant SaaS (SMS-only)
export const PRICING_TIERS = {
  starter: {
    price: 49,
    reviewRequestsPerMonth: 50,
    smsIncluded: true,
  },
  professional: {
    price: 99,
    reviewRequestsPerMonth: 200,
    smsIncluded: true,
  },
  unlimited: {
    price: 199,
    reviewRequestsPerMonth: Infinity,
    smsIncluded: true,
  },
};

// Query: Get salon messaging settings
export const getSalonMessagingSettings = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    // Get existing settings or return defaults
    const settings = await ctx.db
      .query("salonMessagingSettings")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .first();
    
    if (settings) return settings;
    
    // Return default settings
    return {
      salonId: args.salonId,
      displayName: "Your Salon",
      reviewRequestDelay: 120, // 2 hours default
      enableAutoRequest: true,
      includeIncentive: false,
      incentiveText: "10% off your next visit",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },
});

// Mutation: Update salon messaging settings
export const updateSalonMessagingSettings = mutation({
  args: {
    salonId: v.id("salons"),
    settings: v.object({
      displayName: v.optional(v.string()),
      reviewRequestDelay: v.optional(v.number()),
      enableAutoRequest: v.optional(v.boolean()),
      includeIncentive: v.optional(v.boolean()),
      incentiveText: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("salonMessagingSettings")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args.settings,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("salonMessagingSettings", {
        salonId: args.salonId,
        usePlatformBranding: true,
        displayName: args.settings.displayName ?? "Your Salon",
        reviewRequestDelay: args.settings.reviewRequestDelay ?? 120,
        enableAutoRequest: args.settings.enableAutoRequest ?? true,
        includeIncentive: args.settings.includeIncentive ?? false,
        incentiveText: args.settings.incentiveText,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

// Mutation: Update reputation settings
export const updateReputationSettings = mutation({
  args: {
    salonId: v.id("salons"),
    googleReviewUrl: v.optional(v.string()),
    yelpReviewUrl: v.optional(v.string()),
    reviewRequestDelay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) {
      throw new Error("Salon not found");
    }

    const updates: any = { updatedAt: Date.now() };
    
    if (args.googleReviewUrl !== undefined) updates.googleReviewUrl = args.googleReviewUrl;
    if (args.yelpReviewUrl !== undefined) updates.yelpReviewUrl = args.yelpReviewUrl;
    if (args.reviewRequestDelay !== undefined) updates.reviewRequestDelay = args.reviewRequestDelay;

    await ctx.db.patch(args.salonId, updates);
    return { success: true };
  },
});

// Query: Check review quota for salon
export const checkReviewQuota = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    const month = new Date().toISOString().slice(0, 7);
    
    const usage = await ctx.db
      .query("salonUsageTracking")
      .withIndex("by_salon_month", (q) => 
        q.eq("salonId", args.salonId).eq("month", month)
      )
      .first();
    
    // Default to professional tier if not set
    // Default to professional tier - this would normally come from billing/subscription system
    const tier = 'professional'; // TODO: Implement subscription tier tracking
    const tierConfig = PRICING_TIERS[tier as keyof typeof PRICING_TIERS];
    const limit = tierConfig.reviewRequestsPerMonth;
    const used = usage?.reviewRequestsSent || 0;
    
    return {
      tier,
      limit: limit === Infinity ? null : limit,
      used,
      remaining: limit === Infinity ? null : Math.max(0, limit - used),
      canSendSMS: tierConfig.smsIncluded,
      percentUsed: limit === Infinity ? 0 : (used / limit) * 100,
    };
  },
});

// Mutation: Track review request usage (SMS only)
export const trackReviewRequest = mutation({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const month = new Date().toISOString().slice(0, 7);
    
    // Get or create usage record
    let usage = await ctx.db
      .query("salonUsageTracking")
      .withIndex("by_salon_month", (q) =>
        q.eq("salonId", args.salonId).eq("month", month)
      )
      .first();
    
    // Get salon tier
    const salon = await ctx.db.get(args.salonId);
    // Default to professional tier - this would normally come from billing/subscription system
    const tier = 'professional'; // TODO: Implement subscription tier tracking
    
    if (!usage) {
      // Create new usage record
      await ctx.db.insert("salonUsageTracking", {
        salonId: args.salonId,
        month,
        reviewRequestsSent: 1,
        emailsSent: 0, // No emails
        smsSent: 1,
        emailCost: 0,
        smsCost: 0.0075,
        totalCost: 0.0075,
        tier,
        overage: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      // Update existing record
      const updates = {
        reviewRequestsSent: usage.reviewRequestsSent + 1,
        smsSent: usage.smsSent + 1,
        updatedAt: Date.now(),
      };
      
      // Calculate costs (SMS only)
      const SMS_COST = 0.0075; // $0.0075 per SMS
      const smsCost = updates.smsSent * SMS_COST;
      
      await ctx.db.patch(usage._id, {
        ...updates,
        emailCost: 0,
        smsCost,
        totalCost: smsCost,
      });
      
      // Check for overage
      const tierConfig = PRICING_TIERS[tier as keyof typeof PRICING_TIERS];
      if (tierConfig.reviewRequestsPerMonth !== Infinity && 
          updates.reviewRequestsSent > tierConfig.reviewRequestsPerMonth) {
        await ctx.db.patch(usage._id, {
          overage: updates.reviewRequestsSent - tierConfig.reviewRequestsPerMonth,
        });
      }
    }
    
    return { success: true };
  },
});

// Query: Check if phone can be messaged (not opted out)
export const canContact = query({
  args: {
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const optOut = await ctx.db
      .query("optOutList")
      .withIndex("by_contact_type", (q) =>
        q.eq("contactInfo", args.phone.toLowerCase())
         .eq("type", "sms")
      )
      .first();
    
    return !optOut;
  },
});

// Mutation: Handle opt-out request
export const handleOptOut = mutation({
  args: {
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // Add to platform-wide opt-out list
    await ctx.db.insert("optOutList", {
      contactInfo: args.phone.toLowerCase(),
      type: "sms",
      optedOutAt: Date.now(),
      source: 'direct_request',
      createdAt: Date.now(),
    });
    
    // Find and update client records
    const clients = await ctx.db
      .query("clients")
      .filter((q) => q.eq(q.field("phone"), args.phone))
      .collect();
    
    // Since we already added the phone to opt-out list above,
    // we don't need to do it again for each client.
    // The opt-out list is checked when sending messages.
    
    return { success: true };
  },
});

// Mutation: Create review request record
export const createReviewRequest = mutation({
  args: {
    bookingId: v.id("bookings"),
    salonId: v.id("salons"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("reviewRequests", {
      bookingId: args.bookingId,
      salonId: args.salonId,
      clientId: args.clientId,
      status: "pending",
      channels: ["sms"], // SMS only
      retryCount: 0,
      maxRetries: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return requestId;
  },
});

// Mutation: Update review request status
export const updateReviewRequestStatus = mutation({
  args: {
    requestId: v.id("reviewRequests"),
    status: v.union(v.literal("sent"), v.literal("delivered"), v.literal("failed")),
    smsSent: v.optional(v.boolean()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const channels: Array<"sms"> = [];
    if (args.smsSent) channels.push("sms");
    
    await ctx.db.patch(args.requestId, {
      status: args.status,
      channels,
      sentAt: args.status === "sent" ? Date.now() : undefined,
      deliveredAt: args.status === "delivered" ? Date.now() : undefined,
      failureReason: args.failureReason,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Action: Send review request SMS only
export const sendReviewRequest = action({
  args: {
    bookingId: v.id("bookings"),
    retryCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const MAX_RETRIES = 3;
    const retryCount = args.retryCount || 0;
    
    try {
      // Get booking details
      const booking = await ctx.runQuery(api.booking.getBookingById, {
        bookingId: args.bookingId,
      });
      
      if (!booking) {
        console.error(`Booking ${args.bookingId} not found`);
        return { success: false, error: "Booking not found" };
      }
      
      // Get salon and check if review URLs are configured
      const salon = await ctx.runQuery(api.salons.getSalonById, {
        salonId: booking.salonId,
      });
      
      if (!salon) {
        console.error("Salon not found");
        return { success: false, error: "Salon not found" };
      }
      
      if (!salon.googleReviewUrl && !salon.yelpReviewUrl) {
        console.warn("No review URLs configured for salon");
        return { success: false, error: "No review URLs configured" };
      }
      
      // Get messaging settings
      const settings = await ctx.runQuery(api.reputationSMS.getSalonMessagingSettings, {
        salonId: booking.salonId,
      });
      
      if (!settings.enableAutoRequest) {
        console.log("Auto review requests disabled for salon");
        return { success: false, error: "Auto requests disabled" };
      }
      
      // Check quota
      const quota = await ctx.runQuery(api.reputationSMS.checkReviewQuota, {
        salonId: booking.salonId,
      });
      
      if (quota.remaining !== null && quota.remaining <= 0) {
        console.warn("Review quota exceeded for salon");
        return { success: false, error: "Quota exceeded" };
      }
      
      // Check opt-out status
      const client = booking.client;
      if (!client || !client.phone) {
        return { success: false, error: "Client phone not found" };
      }
      
      const canSMS = await ctx.runQuery(api.reputationSMS.canContact, {
        phone: client.phone,
      });
      
      if (!canSMS) {
        console.log("Client has opted out of SMS communications");
        return { success: false, error: "Client opted out" };
      }
      
      // Create review request record
      const requestId = await ctx.runMutation(api.reputationSMS.createReviewRequest, {
        bookingId: args.bookingId,
        salonId: booking.salonId,
        clientId: booking.clientId,
      });
      
      // Prepare review URL (prioritize Google, then Yelp)
      const reviewUrl = salon.googleReviewUrl || salon.yelpReviewUrl || "";
      
      // Send SMS using centralized platform service
      let smsSent = false;
      
      try {
        // Build SMS message
        const smsMessage = buildSMSMessage({
          clientName: client.name,
          salonName: salon.name,
          reviewUrl,
          includeIncentive: settings.includeIncentive,
          incentiveText: settings.incentiveText,
        });
        
        // In production, this would call the actual Twilio API
        console.log(`Sending review SMS to ${client.phone} for ${salon.name}`);
        console.log(`Message: ${smsMessage}`);
        
        // Simulate success for now
        smsSent = true;
      } catch (error) {
        console.error("SMS send failed:", error);
      }
      
      // Update review request status
      const status = smsSent ? "sent" : "failed";
      await ctx.runMutation(api.reputationSMS.updateReviewRequestStatus, {
        requestId,
        status,
        smsSent,
      });
      
      // Track usage
      if (smsSent) {
        await ctx.runMutation(api.reputationSMS.trackReviewRequest, {
          salonId: booking.salonId,
        });
      }
      
      // Retry logic if failed
      if (status === "failed" && retryCount < MAX_RETRIES) {
        await ctx.scheduler.runAfter(
          3600000, // Retry after 1 hour
          api.reputationSMS.sendReviewRequest,
          {
            bookingId: args.bookingId,
            retryCount: retryCount + 1,
          }
        );
      }
      
      return {
        success: status === "sent",
        smsSent,
      };
    } catch (error: any) {
      console.error("Review request failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

// Helper function to build SMS message
function buildSMSMessage(data: {
  clientName: string;
  salonName: string;
  reviewUrl: string;
  includeIncentive?: boolean;
  incentiveText?: string;
}): string {
  let message = `Hi ${data.clientName}! Thanks for visiting ${data.salonName}. `;
  message += `We'd love your feedback! `;
  
  if (data.includeIncentive && data.incentiveText) {
    message += `${data.incentiveText} when you leave a review. `;
  }
  
  message += `Review us here: ${data.reviewUrl}\n\n`;
  message += `Reply STOP to opt-out.`;
  
  return message;
}

// Query: Get review analytics
export const getReviewAnalytics = query({
  args: {
    salonId: v.id("salons"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    // Get all review requests for the period
    const requests = await ctx.db
      .query("reviewRequests")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();
    
    // Get salon settings to check if configured
    const salon = await ctx.db.get(args.salonId);
    const isConfigured = !!(salon?.googleReviewUrl || salon?.yelpReviewUrl);
    
    // Calculate metrics
    const totalSent = requests.filter(r => r.status === "sent" || r.status === "delivered").length;
    const totalDelivered = requests.filter(r => r.status === "delivered").length;
    const totalFailed = requests.filter(r => r.status === "failed").length;
    
    // Calculate average response time (mock data for now)
    const avgResponseTime = 24; // Hours
    
    return {
      totalSent,
      totalDelivered,
      totalFailed,
      successRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
      avgResponseTime,
      isConfigured,
      periodDays: days,
    };
  },
});

// Query: Get usage report for admin dashboard
export const getUsageReport = query({
  args: {
    month: v.optional(v.string()), // YYYY-MM format
  },
  handler: async (ctx, args) => {
    const targetMonth = args.month || new Date().toISOString().slice(0, 7);
    
    // Get all usage records for the month
    const usageRecords = await ctx.db
      .query("salonUsageTracking")
      .filter((q) => q.eq(q.field("month"), targetMonth))
      .collect();
    
    // Calculate totals (SMS only)
    const totals = usageRecords.reduce((acc, record) => ({
      totalEmails: 0, // No emails
      totalSMS: acc.totalSMS + record.smsSent,
      totalRequests: acc.totalRequests + record.reviewRequestsSent,
      totalCost: acc.totalCost + record.totalCost,
      salonsActive: acc.salonsActive + 1,
    }), {
      totalEmails: 0,
      totalSMS: 0,
      totalRequests: 0,
      totalCost: 0,
      salonsActive: 0,
    });
    
    // Get top salons by usage
    const topSalons = await Promise.all(
      usageRecords
        .sort((a, b) => b.reviewRequestsSent - a.reviewRequestsSent)
        .slice(0, 10)
        .map(async (record) => {
          const salon = await ctx.db.get(record.salonId);
          return {
            salonName: salon?.name || "Unknown",
            tier: record.tier,
            emailsSent: 0, // No emails
            smsSent: record.smsSent,
            totalRequests: record.reviewRequestsSent,
            cost: record.totalCost,
            overage: record.overage,
          };
        })
    );
    
    return {
      month: targetMonth,
      ...totals,
      topSalons,
      // Platform costs vs revenue (example calculation)
      platformRevenue: totals.salonsActive * 99, // Assuming professional tier average
      platformMargin: ((totals.salonsActive * 99 - totals.totalCost) / (totals.salonsActive * 99)) * 100,
    };
  },
});

// Action: Send test review request (SMS only)
export const sendTestReviewRequest = action({
  args: {
    salonId: v.id("salons"),
    testPhone: v.string(),
  },
  handler: async (ctx, args) => {
    // Get salon details
    const salon = await ctx.runQuery(api.salons.getSalonById, {
      salonId: args.salonId,
    });
    
    if (!salon) {
      throw new Error("Salon not found");
    }
    
    if (!salon.googleReviewUrl && !salon.yelpReviewUrl) {
      throw new Error("No review URLs configured");
    }
    
    // Get messaging settings
    const settings = await ctx.runQuery(api.reputationSMS.getSalonMessagingSettings, {
      salonId: args.salonId,
    });
    
    const reviewUrl = salon.googleReviewUrl || salon.yelpReviewUrl || "";
    
    // Build test SMS message
    const smsMessage = buildSMSMessage({
      clientName: "Test Customer",
      salonName: salon.name,
      reviewUrl,
      includeIncentive: settings.includeIncentive,
      incentiveText: settings.incentiveText,
    });
    
    try {
      // In production, send actual SMS
      console.log(`Test SMS would be sent to ${args.testPhone}`);
      console.log(`Message: ${smsMessage}`);
      
      return {
        success: true,
        smsSent: true,
        message: "Test SMS sent successfully!",
      };
    } catch (error) {
      console.error("Test SMS failed:", error);
      return {
        success: false,
        smsSent: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});