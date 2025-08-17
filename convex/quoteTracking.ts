import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Create a new quote tracking record
export const createQuoteTracking = mutation({
  args: {
    quoteToken: v.string(),
    salonId: v.optional(v.id("salons")),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    clientName: v.optional(v.string()),
    serviceType: v.string(),
    size: v.string(),
    length: v.string(),
    addOns: v.optional(v.array(v.string())),
    totalPrice: v.number(),
    source: v.optional(v.union(
      v.literal("website"),
      v.literal("direct_link"),
      v.literal("social_media"),
      v.literal("qr_code"),
      v.literal("voice_assistant")
    )),
  },
  handler: async (ctx, args) => {
    const quoteId = await ctx.db.insert("quoteTracking", {
      ...args,
      status: "created",
      viewCount: 1,
      lastViewedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Trigger notification for salon admin if salonId is provided
    if (args.salonId) {
      await ctx.scheduler.runAfter(0, internal.notificationSystem.sendQuoteCreatedNotification, {
        salonId: args.salonId,
        quoteToken: args.quoteToken,
        serviceType: args.serviceType,
        totalPrice: args.totalPrice,
        clientEmail: args.clientEmail,
      });
    }

    // Update funnel analytics
    if (args.salonId) {
      await ctx.scheduler.runAfter(0, internal.quoteTracking.updateFunnelAnalytics, {
        salonId: args.salonId,
        event: "quote_created",
      });
    }

    return quoteId;
  },
});

// Track quote view
export const trackQuoteView = mutation({
  args: {
    quoteToken: v.string(),
  },
  handler: async (ctx, args) => {
    const quote = await ctx.db
      .query("quoteTracking")
      .withIndex("by_quoteToken", (q) => q.eq("quoteToken", args.quoteToken))
      .first();

    if (!quote) {
      throw new Error("Quote not found");
    }

    await ctx.db.patch(quote._id, {
      viewCount: quote.viewCount + 1,
      lastViewedAt: Date.now(),
      status: quote.status === "created" ? "viewed" : quote.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Convert quote to booking
export const convertQuoteToBooking = mutation({
  args: {
    quoteToken: v.string(),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const quote = await ctx.db
      .query("quoteTracking")
      .withIndex("by_quoteToken", (q) => q.eq("quoteToken", args.quoteToken))
      .first();

    if (!quote) {
      throw new Error("Quote not found");
    }

    const conversionTime = Date.now() - quote.createdAt;

    await ctx.db.patch(quote._id, {
      status: "converted",
      convertedToBookingId: args.bookingId,
      conversionTime,
      updatedAt: Date.now(),
    });

    // Update funnel analytics
    if (quote.salonId) {
      await ctx.scheduler.runAfter(0, internal.quoteTracking.updateFunnelAnalytics, {
        salonId: quote.salonId,
        event: "quote_converted",
        conversionTime,
      });
    }

    return { success: true, conversionTime };
  },
});

// Mark quote as abandoned (after 7 days without conversion)
export const markQuoteAsAbandoned = internalMutation({
  args: {
    quoteId: v.id("quoteTracking"),
  },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.quoteId);
    if (!quote || quote.status === "converted") {
      return;
    }

    await ctx.db.patch(args.quoteId, {
      status: "abandoned",
      updatedAt: Date.now(),
    });

    // Update funnel analytics
    if (quote.salonId) {
      await ctx.scheduler.runAfter(0, internal.quoteTracking.updateFunnelAnalytics, {
        salonId: quote.salonId,
        event: "quote_abandoned",
      });
    }
  },
});

// Get quote funnel analytics for a salon
export const getQuoteFunnelAnalytics = query({
  args: {
    salonId: v.id("salons"),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const { salonId, dateRange } = args;
    
    // Default to last 30 days if no date range provided
    const endDate = dateRange?.end || Date.now();
    const startDate = dateRange?.start || endDate - 30 * 24 * 60 * 60 * 1000;

    // Get all quotes for the salon in the date range
    const quotes = await ctx.db
      .query("quoteTracking")
      .withIndex("by_salonId", (q) => q.eq("salonId", salonId))
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      )
      .collect();

    // Calculate funnel metrics
    const totalQuotes = quotes.length;
    const viewedQuotes = quotes.filter(q => q.viewCount > 1).length;
    const convertedQuotes = quotes.filter(q => q.status === "converted").length;
    const abandonedQuotes = quotes.filter(q => q.status === "abandoned").length;
    
    // Calculate conversion rate
    const conversionRate = totalQuotes > 0 ? (convertedQuotes / totalQuotes) * 100 : 0;
    
    // Calculate average conversion time
    const convertedQuotesWithTime = quotes.filter(q => q.conversionTime);
    const avgConversionTime = convertedQuotesWithTime.length > 0
      ? convertedQuotesWithTime.reduce((sum, q) => sum + (q.conversionTime || 0), 0) / convertedQuotesWithTime.length
      : 0;

    // Calculate total revenue from converted quotes
    const totalRevenue = quotes
      .filter(q => q.status === "converted")
      .reduce((sum, q) => sum + q.totalPrice, 0);

    // Get source breakdown
    const sourceBreakdown: Record<string, number> = {
      website: 0,
      directLink: 0,
      socialMedia: 0,
      qrCode: 0,
      voiceAssistant: 0,
    };

    quotes.forEach(quote => {
      if (quote.source) {
        sourceBreakdown[quote.source]++;
      }
    });

    // Get top services
    const serviceStats: Record<string, { count: number; revenue: number }> = {};
    quotes.forEach(quote => {
      if (!serviceStats[quote.serviceType]) {
        serviceStats[quote.serviceType] = { count: 0, revenue: 0 };
      }
      serviceStats[quote.serviceType].count++;
      if (quote.status === "converted") {
        serviceStats[quote.serviceType].revenue += quote.totalPrice;
      }
    });

    const topServices = Object.entries(serviceStats)
      .map(([serviceName, stats]) => ({
        serviceName,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      funnel: {
        totalQuotes,
        viewedQuotes,
        convertedQuotes,
        abandonedQuotes,
      },
      metrics: {
        conversionRate,
        avgConversionTime: Math.round(avgConversionTime / (1000 * 60)), // Convert to minutes
        totalRevenue,
        avgQuoteValue: totalQuotes > 0 ? totalRevenue / convertedQuotes : 0,
      },
      sourceBreakdown,
      topServices,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  },
});

// Get recent quotes for a salon
export const getRecentQuotes = query({
  args: {
    salonId: v.id("salons"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const quotes = await ctx.db
      .query("quoteTracking")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .order("desc")
      .take(limit);

    return quotes;
  },
});

// Update funnel analytics (internal)
export const updateFunnelAnalytics = internalMutation({
  args: {
    salonId: v.id("salons"),
    event: v.union(
      v.literal("quote_created"),
      v.literal("quote_viewed"),
      v.literal("quote_converted"),
      v.literal("quote_abandoned"),
      v.literal("booking_created"),
      v.literal("booking_completed"),
      v.literal("booking_cancelled")
    ),
    conversionTime: v.optional(v.number()),
    revenue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get or create today's analytics record
    let analytics = await ctx.db
      .query("funnelAnalytics")
      .withIndex("by_salonId_date", (q: any) => 
        q.eq("salonId", args.salonId).eq("date", today)
      )
      .first();

    if (!analytics) {
      // Create new analytics record for today
      await ctx.db.insert("funnelAnalytics", {
        salonId: args.salonId,
        date: today,
        metrics: {
          quotesCreated: 0,
          quotesViewed: 0,
          bookingsCreated: 0,
          bookingsCompleted: 0,
          bookingsCancelled: 0,
          conversionRate: 0,
          averageQuoteToBookingTime: 0,
          totalRevenue: 0,
          averageBookingValue: 0,
        },
        topServices: [],
        sourceBreakdown: {
          website: 0,
          directLink: 0,
          socialMedia: 0,
          qrCode: 0,
          voiceAssistant: 0,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      analytics = await ctx.db
        .query("funnelAnalytics")
        .withIndex("by_salonId_date", (q: any) => 
          q.eq("salonId", args.salonId).eq("date", today)
        )
        .first();
    }

    if (!analytics) return;

    // Update metrics based on event
    const updatedMetrics = { ...analytics.metrics };
    
    switch (args.event) {
      case "quote_created":
        updatedMetrics.quotesCreated++;
        break;
      case "quote_viewed":
        updatedMetrics.quotesViewed++;
        break;
      case "quote_converted":
        if (args.conversionTime) {
          // Update average conversion time
          const totalTime = updatedMetrics.averageQuoteToBookingTime * updatedMetrics.bookingsCreated;
          updatedMetrics.bookingsCreated++;
          updatedMetrics.averageQuoteToBookingTime = 
            (totalTime + args.conversionTime / (1000 * 60)) / updatedMetrics.bookingsCreated;
        }
        break;
      case "booking_completed":
        updatedMetrics.bookingsCompleted++;
        if (args.revenue) {
          updatedMetrics.totalRevenue += args.revenue;
          updatedMetrics.averageBookingValue = 
            updatedMetrics.totalRevenue / updatedMetrics.bookingsCompleted;
        }
        break;
      case "booking_cancelled":
        updatedMetrics.bookingsCancelled++;
        break;
    }

    // Calculate conversion rate
    if (updatedMetrics.quotesCreated > 0) {
      updatedMetrics.conversionRate = 
        (updatedMetrics.bookingsCreated / updatedMetrics.quotesCreated) * 100;
    }

    await ctx.db.patch(analytics._id, {
      metrics: updatedMetrics,
      updatedAt: Date.now(),
    });
  },
});

// Cleanup old abandoned quotes (run daily)
export const cleanupAbandonedQuotes = internalMutation({
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    const oldQuotes = await ctx.db
      .query("quoteTracking")
      .withIndex("by_status", (q) => q.eq("status", "viewed"))
      .filter((q) => q.lt(q.field("lastViewedAt"), sevenDaysAgo))
      .collect();

    for (const quote of oldQuotes) {
      await ctx.runMutation(internal.quoteTracking.markQuoteAsAbandoned, {
        quoteId: quote._id,
      });
    }

    return { abandonedCount: oldQuotes.length };
  },
});