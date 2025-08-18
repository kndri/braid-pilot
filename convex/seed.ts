import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

// Helper function to generate random dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate phone number
const generatePhone = () => {
  const area = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return `(${area}) ${prefix}-${line}`;
};

// Seed data for development
export const seedDevelopmentData = mutation({
  args: {
    userEmail: v.string(),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("🌱 Starting seed process...");
    
    // 1. Create or get test user
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();
    
    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId || `test_${Date.now()}`,
        email: args.userEmail,
        name: "Sarah Johnson",
        onboardingComplete: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }
    
    if (!user) throw new Error("Failed to create user");
    
    // 2. Create salon
    const username = "elitebraids";
    const salonId = await ctx.db.insert("salons", {
      name: "Elite Braids & Beauty",
      username: username,
      email: args.userEmail,
      address: "1234 Main Street, Atlanta, GA 30301",
      phone: "(404) 555-0123",
      website: "https://elitebraidsbeauty.com",
      businessName: "Elite Braids & Beauty LLC",
      defaultSplitPercentage: 60,
      splitType: "percentage",
      hours: JSON.stringify({
        monday: { open: "9:00 AM", close: "7:00 PM", closed: false },
        tuesday: { open: "9:00 AM", close: "7:00 PM", closed: false },
        wednesday: { open: "9:00 AM", close: "7:00 PM", closed: false },
        thursday: { open: "9:00 AM", close: "8:00 PM", closed: false },
        friday: { open: "9:00 AM", close: "8:00 PM", closed: false },
        saturday: { open: "8:00 AM", close: "6:00 PM", closed: false },
        sunday: { open: "11:00 AM", close: "5:00 PM", closed: false },
      }),
      ownerId: user._id,
      onboardingToken: `token_${Date.now()}`,
      quoteToolUrl: `/quote/${username}`,
      standardHairType: "4A",
      maxConcurrentBookings: 4,
      bufferMinutes: 30,
      emergencyCapacityEnabled: true,
      defaultServiceDuration: 240,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update user with salon ID
    await ctx.db.patch(user._id, {
      salonId,
      updatedAt: Date.now(),
    });
    
    // 3. Create pricing configurations for different styles
    const styles = [
      { name: "Box Braids", basePrice: 180 },
      { name: "Knotless Braids", basePrice: 220 },
      { name: "Goddess Locs", basePrice: 250 },
      { name: "Passion Twists", basePrice: 200 },
      { name: "Senegalese Twists", basePrice: 190 },
      { name: "Fulani Braids", basePrice: 160 },
      { name: "Cornrows", basePrice: 80 },
      { name: "Micro Braids", basePrice: 300 },
    ];
    
    for (const style of styles) {
      // Base price
      await ctx.db.insert("pricingConfigs", {
        salonId,
        styleName: style.name,
        adjustmentType: "base_price",
        adjustmentLabel: "Base Price",
        adjustmentValue: style.basePrice,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Length adjustments
      const lengthAdj = [
        { label: "Bra-Length", value: 30 },
        { label: "Mid-Back", value: 50 },
        { label: "Waist-Length", value: 70 },
      ];
      
      for (const adj of lengthAdj) {
        await ctx.db.insert("pricingConfigs", {
          salonId,
          styleName: style.name,
          adjustmentType: "length_adj",
          adjustmentLabel: adj.label,
          adjustmentValue: adj.value,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      
      // Size adjustments
      const sizeAdj = [
        { label: "Small", value: -20 },
        { label: "Medium", value: 0 },
        { label: "Large", value: 20 },
        { label: "Extra Large", value: 40 },
      ];
      
      for (const adj of sizeAdj) {
        await ctx.db.insert("pricingConfigs", {
          salonId,
          styleName: style.name,
          adjustmentType: "size_adj",
          adjustmentLabel: adj.label,
          adjustmentValue: adj.value,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      
      // Add to salon styles
      await ctx.db.insert("salonStyles", {
        salonId,
        styleName: style.name,
        isCustom: false,
        displayOrder: styles.indexOf(style),
        createdAt: Date.now(),
      });
    }
    
    // 4. Create braiders
    const braiderNames = [
      { name: "Michelle Williams", split: 65, specialties: ["Box Braids", "Knotless Braids", "Goddess Locs"] },
      { name: "Jasmine Taylor", split: 60, specialties: ["Passion Twists", "Senegalese Twists", "Box Braids"] },
      { name: "Aisha Johnson", split: 55, specialties: ["Fulani Braids", "Cornrows", "Knotless Braids"] },
      { name: "Destiny Brown", split: 70, specialties: ["Micro Braids", "Box Braids", "Goddess Locs"] },
      { name: "Keisha Davis", split: 60, specialties: ["Knotless Braids", "Passion Twists", "Fulani Braids"] },
      { name: "Tamara Wilson", split: 50, specialties: ["Cornrows", "Box Braids", "Senegalese Twists"] },
    ];
    
    const braiderIds = [];
    for (const braiderData of braiderNames) {
      const braiderId = await ctx.db.insert("braiders", {
        salonId,
        name: braiderData.name,
        email: braiderData.name.toLowerCase().replace(" ", ".") + "@elitebraids.com",
        phone: generatePhone(),
        specialties: braiderData.specialties,
        splitPercentage: braiderData.split,
        isActive: true,
        maxDailyBookings: 4,
        defaultStartTime: "09:00",
        defaultEndTime: "18:00",
        workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      braiderIds.push(braiderId);
    }
    
    // 5. Create clients
    const firstNames = ["Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
    
    const clientIds = [];
    const numClients = 100;
    
    for (let i = 0; i < numClients; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      
      const clientId = await ctx.db.insert("clients", {
        name: fullName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        phone: generatePhone(),
        notes: i % 5 === 0 ? "VIP client - always request specific braider" : 
               i % 3 === 0 ? "Prefers morning appointments" : undefined,
        tags: i % 10 === 0 ? ["VIP"] : i % 5 === 0 ? ["Regular"] : ["New"],
        preferredStyles: [styles[Math.floor(Math.random() * styles.length)].name],
        createdAt: Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in past year
        updatedAt: Date.now(),
      });
      clientIds.push(clientId);
    }
    
    // 6. Create bookings with proper payment tracking
    const bookingStatuses = ["completed", "confirmed", "pending", "cancelled"];
    const currentDate = new Date();
    const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
    const twoMonthsFromNow = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, currentDate.getDate());
    
    const bookingIds = [];
    
    for (let i = 0; i < 150; i++) {
      const client = await ctx.db.get(clientIds[Math.floor(Math.random() * clientIds.length)]);
      const braiderId = braiderIds[Math.floor(Math.random() * braiderIds.length)];
      const braider = await ctx.db.get(braiderId);
      const style = styles[Math.floor(Math.random() * styles.length)];
      const bookingDate = randomDate(oneYearAgo, twoMonthsFromNow);
      const isPast = bookingDate < currentDate;
      
      // Determine status based on date
      let status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
      if (isPast) {
        const rand = Math.random();
        if (rand > 0.85) status = "cancelled";
        else if (rand > 0.8) status = "no_show";
        else status = "completed";
      } else {
        status = Math.random() > 0.3 ? "confirmed" : "pending";
      }
      
      if (client && braider) {
        const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
        const duration = 180 + Math.floor(Math.random() * 120); // 3-5 hours
        const finalPrice = style.basePrice + Math.floor(Math.random() * 100);
        const braiderEarnings = finalPrice * ((braider.splitPercentage || 60) / 100);
        
        // Determine payment status for completed bookings
        let paymentStatus: "pending" | "pending_payout" | "paid" | undefined;
        let payoutDate: number | undefined;
        
        if (status === "completed") {
          const rand = Math.random();
          if (rand > 0.7) {
            paymentStatus = "paid";
            payoutDate = bookingDate.getTime() + (3 * 24 * 60 * 60 * 1000); // Paid 3 days after
          } else if (rand > 0.3) {
            paymentStatus = "pending_payout";
          } else {
            paymentStatus = "pending";
          }
        }
        
        const bookingId = await ctx.db.insert("bookings", {
          salonId,
          clientId,
          serviceDetails: {
            style: style.name,
            size: ["Small", "Medium", "Large"][Math.floor(Math.random() * 3)],
            length: ["Shoulder", "Bra-Length", "Mid-Back"][Math.floor(Math.random() * 3)],
            hairType: "4A",
            includeCurlyHair: Math.random() > 0.7,
            finalPrice,
            estimatedDuration: duration,
          },
          appointmentDate: bookingDate.toISOString().split('T')[0],
          appointmentTime: `${9 + Math.floor(Math.random() * 9)}:00`, // 9 AM to 5 PM
          status,
          braiderId: Math.random() > 0.3 ? braiderId : undefined,
          assignedBraiderId: Math.random() > 0.3 ? braiderId : undefined,
          serviceDurationMinutes: duration,
          platformFee: 5, // $5 platform fee
          payoutAmount: finalPrice,
          braiderEarnings: status === "completed" ? braiderEarnings : undefined,
          paymentStatus,
          payoutDate,
          braiderNotes: Math.random() > 0.7 ? "Client requested specific products" : undefined,
          stripePaymentIntentId: status !== "pending" ? `pi_${Date.now()}_${i}` : undefined,
          createdAt: bookingDate.getTime() - (7 * 24 * 60 * 60 * 1000), // Created 1 week before appointment
          updatedAt: Date.now(),
        });
        
        bookingIds.push(bookingId);
      }
    }
    
    // 7. Create transactions for completed bookings
    // Create transactions for some completed bookings
    const completedBookings = bookingIds.slice(0, Math.floor(bookingIds.length * 0.6)); // 60% completed
    for (const bookingId of completedBookings) {
        await ctx.db.insert("transactions", {
          bookingId: bookingId,
          braiderId: braiderIds[Math.floor(Math.random() * braiderIds.length)],
          amount: styles[Math.floor(Math.random() * styles.length)].basePrice + Math.floor(Math.random() * 100),
          platformFee: 5,
          payoutAmount: styles[Math.floor(Math.random() * styles.length)].basePrice + Math.floor(Math.random() * 100) - 5,
          braiderPayout: Math.random() * 100 + 50,
          stripePaymentId: `pi_${Date.now()}_${Math.random()}`,
          status: "succeeded",
          payoutStatus: Math.random() > 0.5 ? "paid" : "pending",
          payoutDate: Math.random() > 0.5 ? Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
          payoutMethod: Math.random() > 0.5 ? ["cash", "bank_transfer", "venmo", "cashapp"][Math.floor(Math.random() * 4)] : undefined,
          createdAt: Date.now() - (Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date in past 60 days
          updatedAt: Date.now(),
        });
    }
    
    // 9. Create notification preferences for salon owner
    await ctx.db.insert("notificationPreferences", {
      salonId,
      userId: user._id,
      emailNotifications: {
        newBooking: true,
        bookingCancellation: true,
        quoteCreated: true,
        dailySummary: false,
        weeklyReport: true,
        paymentReceived: true,
      },
      smsNotifications: {
        newBooking: true,
        bookingCancellation: true,
        urgentAlerts: true,
      },
      inAppNotifications: {
        all: true,
      },
      quietHours: {
        enabled: true,
        startTime: 22, // 10 PM
        endTime: 8,    // 8 AM
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // 10. Create quote tracking records
    const quoteStatuses = ["created", "viewed", "converted", "abandoned"];
    const quoteSources = ["website", "direct_link", "social_media", "qr_code", "voice_assistant"];
    const quoteIds = [];
    
    for (let i = 0; i < 50; i++) {
      const createdDate = Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000; // Random date in past 30 days
      const status = quoteStatuses[Math.floor(Math.random() * quoteStatuses.length)];
      const style = styles[Math.floor(Math.random() * styles.length)];
      const size = ["small", "medium", "large"][Math.floor(Math.random() * 3)];
      const length = ["shoulder", "mid-back", "waist"][Math.floor(Math.random() * 3)];
      
      // Calculate price based on style, size, and length
      let totalPrice = style.basePrice;
      if (size === "small") totalPrice *= 1.3;
      if (size === "large") totalPrice *= 0.8;
      if (length === "mid-back") totalPrice *= 1.2;
      if (length === "waist") totalPrice *= 1.4;
      
      const quoteId = await ctx.db.insert("quoteTracking", {
        quoteToken: `quote_${Date.now()}_${i}`,
        salonId,
        clientEmail: Math.random() > 0.3 ? `client${i}@example.com` : undefined,
        clientPhone: Math.random() > 0.4 ? generatePhone() : undefined,
        clientName: Math.random() > 0.5 ? `Client ${i}` : undefined,
        serviceType: style.name,
        size,
        length,
        addOns: Math.random() > 0.7 ? ["Hair included", "Hot oil treatment"] : undefined,
        totalPrice: Math.round(totalPrice),
        status: status as any,
        source: quoteSources[Math.floor(Math.random() * quoteSources.length)] as any,
        viewCount: Math.floor(Math.random() * 10) + 1,
        lastViewedAt: createdDate + Math.random() * 24 * 60 * 60 * 1000,
        convertedToBookingId: status === "converted" && Math.random() > 0.5 
          ? bookingIds[Math.floor(Math.random() * bookingIds.length)] 
          : undefined,
        conversionTime: status === "converted" 
          ? Math.random() * 3 * 24 * 60 * 60 * 1000 // 0-3 days
          : undefined,
        createdAt: createdDate,
        updatedAt: Date.now(),
      });
      
      quoteIds.push(quoteId);
    }
    
    // 11. Create notification logs
    const notificationCategories = [
      "booking_confirmation", "booking_cancellation", "quote_created", 
      "payment_received", "daily_summary", "weekly_report"
    ];
    
    for (let i = 0; i < 30; i++) {
      const category = notificationCategories[Math.floor(Math.random() * notificationCategories.length)];
      const createdDate = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000; // Past week
      
      await ctx.db.insert("notificationLogs", {
        salonId,
        userId: user._id,
        type: Math.random() > 0.2 ? "email" : "sms",
        category: category as any,
        subject: `${category.replace(/_/g, ' ').toUpperCase()} - ${new Date(createdDate).toLocaleDateString()}`,
        content: `This is a sample ${category.replace(/_/g, ' ')} notification content.`,
        recipient: Math.random() > 0.5 ? args.userEmail : generatePhone(),
        status: Math.random() > 0.1 ? "sent" : "failed",
        metadata: category === "booking_confirmation" ? {
          bookingId: bookingIds[Math.floor(Math.random() * bookingIds.length)],
        } : category === "quote_created" ? {
          quoteToken: `quote_${Date.now()}_${i}`,
        } : undefined,
        sentAt: createdDate + 1000,
        createdAt: createdDate,
      });
    }
    
    // 12. Create funnel analytics
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      await ctx.db.insert("funnelAnalytics", {
        salonId,
        date: dateStr,
        metrics: {
          quotesCreated: Math.floor(Math.random() * 20) + 5,
          quotesViewed: Math.floor(Math.random() * 30) + 10,
          bookingsCreated: Math.floor(Math.random() * 15) + 3,
          bookingsCompleted: Math.floor(Math.random() * 12) + 2,
          bookingsCancelled: Math.floor(Math.random() * 3),
          conversionRate: Math.random() * 40 + 10, // 10-50%
          averageQuoteToBookingTime: Math.random() * 2880 + 60, // 1 hour to 2 days in minutes
          totalRevenue: Math.random() * 5000 + 1000,
          averageBookingValue: Math.random() * 200 + 100,
        },
        topServices: styles.slice(0, 5).map(style => ({
          serviceName: style.name,
          count: Math.floor(Math.random() * 10) + 1,
          revenue: Math.random() * 1000 + 200,
        })),
        sourceBreakdown: {
          website: Math.floor(Math.random() * 10),
          directLink: Math.floor(Math.random() * 8),
          socialMedia: Math.floor(Math.random() * 12),
          qrCode: Math.floor(Math.random() * 5),
          voiceAssistant: Math.floor(Math.random() * 3),
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    console.log("✅ Seed data created successfully!");
    
    return {
      success: true,
      stats: {
        salon: salonId,
        braiders: braiderIds.length,
        clients: clientIds.length,
        bookings: 150,
        styles: styles.length,
        quotes: quoteIds.length,
        notifications: 30,
      }
    };
  },
});

// Clean up all test data
export const cleanupTestData = mutation({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("🧹 Starting cleanup process...");
    
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();
    
    if (!user || !user.salonId) {
      return { success: false, message: "User or salon not found" };
    }
    
    const salonId = user.salonId;
    
    // Delete bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", salonId))
      .collect();
    
    for (const booking of bookings) {
      await ctx.db.delete(booking._id);
    }
    
    // Delete braiders
    const braiders = await ctx.db
      .query("braiders")
      .withIndex("by_salonId", (q) => q.eq("salonId", salonId))
      .collect();
    
    for (const braider of braiders) {
      await ctx.db.delete(braider._id);
    }
    
    // Delete pricing configs
    const pricingConfigs = await ctx.db
      .query("pricingConfigs")
      .withIndex("by_salonId", (q) => q.eq("salonId", salonId))
      .collect();
    
    for (const config of pricingConfigs) {
      await ctx.db.delete(config._id);
    }
    
    // Delete salon styles
    const salonStyles = await ctx.db
      .query("salonStyles")
      .withIndex("by_salonId", (q) => q.eq("salonId", salonId))
      .collect();
    
    for (const style of salonStyles) {
      await ctx.db.delete(style._id);
    }
    
    // Delete notification preferences
    const notifPrefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_salonId", (q) => q.eq("salonId", salonId))
      .collect();
    
    for (const pref of notifPrefs) {
      await ctx.db.delete(pref._id);
    }
    
    // Delete notification logs
    const notifLogs = await ctx.db
      .query("notificationLogs")
      .withIndex("by_salonId", (q) => q.eq("salonId", salonId))
      .collect();
    
    for (const log of notifLogs) {
      await ctx.db.delete(log._id);
    }
    
    // Delete quote tracking
    const quotes = await ctx.db
      .query("quoteTracking")
      .withIndex("by_salonId", (q) => q.eq("salonId", salonId))
      .collect();
    
    for (const quote of quotes) {
      await ctx.db.delete(quote._id);
    }
    
    // Delete funnel analytics
    const analytics = await ctx.db
      .query("funnelAnalytics")
      .withIndex("by_salonId", (q) => q.eq("salonId", salonId))
      .collect();
    
    for (const analytic of analytics) {
      await ctx.db.delete(analytic._id);
    }
    
    // Delete salon
    await ctx.db.delete(salonId);
    
    // Update user to remove salon reference
    await ctx.db.patch(user._id, {
      salonId: undefined,
      onboardingComplete: false,
      updatedAt: Date.now(),
    });
    
    console.log("✅ Test data cleaned up successfully!");
    
    return {
      success: true,
      message: "All test data removed",
    };
  },
});