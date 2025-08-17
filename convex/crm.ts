import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all clients for a salon with aggregated data
export const getAllClients = query({
  args: { 
    salonId: v.id("salons"),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all bookings for this salon
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();
    
    // Get unique client IDs
    const clientIds = [...new Set(bookings.map(b => b.clientId))];
    
    // Fetch all unique clients
    const clients = await Promise.all(
      clientIds.map(id => ctx.db.get(id))
    );
    
    // Filter out null clients and apply search if provided
    let validClients = clients.filter(c => c !== null);
    
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      validClients = validClients.filter(client => 
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.includes(query)
      );
    }
    
    // Aggregate data for each client
    const clientsWithData = validClients.map(client => {
      const clientBookings = bookings.filter(b => b.clientId === client._id);
      
      // Calculate total spend
      const totalSpend = clientBookings
        .filter(b => b.status === "completed" || b.status === "confirmed")
        .reduce((sum, b) => sum + b.serviceDetails.finalPrice, 0);
      
      // Get booking count
      const bookingCount = clientBookings.length;
      
      // Get last visit date
      const lastVisit = clientBookings
        .filter(b => b.status === "completed")
        .sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate))[0]?.appointmentDate || null;
      
      // Determine client tag
      let tag = "New";
      if (bookingCount >= 5) tag = "VIP";
      else if (bookingCount >= 2) tag = "Regular";
      
      return {
        ...client,
        totalSpend,
        bookingCount,
        lastVisit,
        tag,
      };
    });
    
    // Sort by total spend (highest first)
    return clientsWithData.sort((a, b) => b.totalSpend - a.totalSpend);
  },
});

// Query: Get detailed client profile with booking history
export const getClientProfile = query({
  args: { 
    clientId: v.id("clients"),
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    
    // Get all bookings for this client at this salon
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .filter((q) => q.eq(q.field("salonId"), args.salonId))
      .collect();
    
    // Get client notes
    const notes = await ctx.db
      .query("clientNotes")
      .withIndex("by_salon_and_client", (q) => 
        q.eq("salonId", args.salonId).eq("clientId", args.clientId)
      )
      .collect();
    
    // Calculate lifetime value
    const lifetimeValue = bookings
      .filter(b => b.status === "completed" || b.status === "confirmed")
      .reduce((sum, b) => sum + b.serviceDetails.finalPrice, 0);
    
    // Analyze service preferences
    const styleFrequency: Record<string, number> = {};
    bookings.forEach(booking => {
      const style = booking.serviceDetails.style;
      styleFrequency[style] = (styleFrequency[style] || 0) + 1;
    });
    
    const preferredStyles = Object.entries(styleFrequency)
      .sort(([, a], [, b]) => b - a)
      .map(([style]) => style);
    
    // Sort bookings by date (newest first)
    const sortedBookings = bookings.sort((a, b) => 
      b.appointmentDate.localeCompare(a.appointmentDate)
    );
    
    return {
      client,
      bookings: sortedBookings,
      notes,
      stats: {
        lifetimeValue,
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === "completed").length,
        cancelledBookings: bookings.filter(b => b.status === "cancelled").length,
        preferredStyles,
        averageSpend: lifetimeValue / (bookings.filter(b => b.status === "completed").length || 1),
      },
    };
  },
});

// Query: Get all braiders for a salon
export const getAllBraiders = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const braiders = await ctx.db
      .query("braiders")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();
    
    // Get performance data for each braider
    const braidersWithPerformance = await Promise.all(
      braiders.map(async (braider) => {
        // Get all bookings for this braider
        const bookings = await ctx.db
          .query("bookings")
          .withIndex("by_braiderId", (q) => q.eq("braiderId", braider._id))
          .collect();
        
        // Calculate total revenue
        const totalRevenue = bookings
          .filter(b => b.status === "completed" || b.status === "confirmed")
          .reduce((sum, b) => sum + b.serviceDetails.finalPrice, 0);
        
        // Count completed bookings
        const completedBookings = bookings.filter(b => b.status === "completed").length;
        
        // Find most popular style
        const styleCount: Record<string, number> = {};
        bookings.forEach(b => {
          const style = b.serviceDetails.style;
          styleCount[style] = (styleCount[style] || 0) + 1;
        });
        
        const mostPopularStyle = Object.entries(styleCount)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";
        
        return {
          ...braider,
          performance: {
            totalRevenue,
            completedBookings,
            totalBookings: bookings.length,
            mostPopularStyle,
            averageRevenue: totalRevenue / (completedBookings || 1),
          },
        };
      })
    );
    
    // Sort by total revenue (highest first)
    return braidersWithPerformance.sort((a, b) => 
      b.performance.totalRevenue - a.performance.totalRevenue
    );
  },
});

// Query: Get detailed braider performance metrics
export const getBraiderPerformance = query({
  args: { 
    braiderId: v.id("braiders"),
    dateRange: v.optional(v.object({
      startDate: v.string(),
      endDate: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const braider = await ctx.db.get(args.braiderId);
    if (!braider) {
      throw new Error("Braider not found");
    }
    
    // Get all bookings for this braider
    let bookings = await ctx.db
      .query("bookings")
      .withIndex("by_braiderId", (q) => q.eq("braiderId", args.braiderId))
      .collect();
    
    // Apply date range filter if provided
    if (args.dateRange) {
      bookings = bookings.filter(b => 
        b.appointmentDate >= args.dateRange!.startDate &&
        b.appointmentDate <= args.dateRange!.endDate
      );
    }
    
    // Calculate metrics
    const totalRevenue = bookings
      .filter(b => b.status === "completed" || b.status === "confirmed")
      .reduce((sum, b) => sum + b.serviceDetails.finalPrice, 0);
    
    const completedBookings = bookings.filter(b => b.status === "completed");
    const cancelledBookings = bookings.filter(b => b.status === "cancelled");
    
    // Style analysis
    const styleAnalysis: Record<string, { count: number; revenue: number }> = {};
    completedBookings.forEach(b => {
      const style = b.serviceDetails.style;
      if (!styleAnalysis[style]) {
        styleAnalysis[style] = { count: 0, revenue: 0 };
      }
      styleAnalysis[style].count++;
      styleAnalysis[style].revenue += b.serviceDetails.finalPrice;
    });
    
    // Client retention (repeat clients)
    const clientBookings: Record<string, number> = {};
    bookings.forEach(b => {
      clientBookings[b.clientId] = (clientBookings[b.clientId] || 0) + 1;
    });
    const repeatClients = Object.values(clientBookings).filter(count => count > 1).length;
    const totalClients = Object.keys(clientBookings).length;
    
    // Weekly performance
    const weeklyRevenue: Record<string, number> = {};
    completedBookings.forEach(b => {
      const week = b.appointmentDate.substring(0, 10); // Use date as key for simplicity
      weeklyRevenue[week] = (weeklyRevenue[week] || 0) + b.serviceDetails.finalPrice;
    });
    
    return {
      braider,
      metrics: {
        totalRevenue,
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        cancelledBookings: cancelledBookings.length,
        cancellationRate: (cancelledBookings.length / bookings.length) * 100,
        averageRevenue: totalRevenue / (completedBookings.length || 1),
        repeatClientRate: (repeatClients / totalClients) * 100,
        uniqueClients: totalClients,
        repeatClients,
      },
      styleAnalysis: Object.entries(styleAnalysis)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .map(([style, data]) => ({
          style,
          ...data,
          averagePrice: data.revenue / data.count,
        })),
      weeklyRevenue: Object.entries(weeklyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, revenue]) => ({ week, revenue })),
    };
  },
});

// Query: Get salon business analytics
export const getSalonAnalytics = query({
  args: { 
    salonId: v.id("salons"),
    dateRange: v.optional(v.object({
      startDate: v.string(),
      endDate: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Get all bookings for the salon
    let bookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();
    
    // Apply date range filter if provided
    if (args.dateRange) {
      bookings = bookings.filter(b => 
        b.appointmentDate >= args.dateRange!.startDate &&
        b.appointmentDate <= args.dateRange!.endDate
      );
    }
    
    // Get all transactions for revenue calculation
    const bookingIds = bookings.map(b => b._id);
    const transactions = await Promise.all(
      bookingIds.map(id => 
        ctx.db
          .query("transactions")
          .withIndex("by_bookingId", (q) => q.eq("bookingId", id))
          .first()
      )
    );
    
    // Calculate total revenue
    const totalRevenue = transactions
      .filter(t => t && t.status === "succeeded")
      .reduce((sum, t) => sum + (t?.amount || 0), 0);
    
    // Calculate platform fees and net revenue
    const totalPlatformFees = transactions
      .filter(t => t && t.status === "succeeded")
      .reduce((sum, t) => sum + (t?.platformFee || 0), 0);
    
    const netRevenue = totalRevenue - totalPlatformFees;
    
    // Count unique clients
    const uniqueClientIds = new Set(bookings.map(b => b.clientId));
    const totalClients = uniqueClientIds.size;
    
    // Find most popular style
    const styleCount: Record<string, number> = {};
    bookings.forEach(b => {
      const style = b.serviceDetails.style;
      styleCount[style] = (styleCount[style] || 0) + 1;
    });
    
    const mostPopularStyle = Object.entries(styleCount)
      .sort(([, a], [, b]) => b - a)[0] || ["N/A", 0];
    
    // Calculate growth metrics (compare to previous period)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const sixtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    
    const currentPeriodBookings = bookings.filter(b => 
      new Date(b.appointmentDate) >= thirtyDaysAgo
    );
    
    const previousPeriodBookings = bookings.filter(b => 
      new Date(b.appointmentDate) >= sixtyDaysAgo &&
      new Date(b.appointmentDate) < thirtyDaysAgo
    );
    
    const currentRevenue = currentPeriodBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + b.serviceDetails.finalPrice, 0);
    
    const previousRevenue = previousPeriodBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + b.serviceDetails.finalPrice, 0);
    
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    
    // Service breakdown
    const serviceBreakdown = Object.entries(styleCount).map(([style, count]) => {
      const styleBookings = bookings.filter(b => b.serviceDetails.style === style);
      const revenue = styleBookings
        .filter(b => b.status === "completed" || b.status === "confirmed")
        .reduce((sum, b) => sum + b.serviceDetails.finalPrice, 0);
      
      return {
        style,
        count,
        revenue,
        averagePrice: revenue / count,
      };
    }).sort((a, b) => b.revenue - a.revenue);
    
    // Monthly revenue trend
    const monthlyRevenue: Record<string, number> = {};
    bookings
      .filter(b => b.status === "completed" || b.status === "confirmed")
      .forEach(b => {
        const month = b.appointmentDate.substring(0, 7); // YYYY-MM
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + b.serviceDetails.finalPrice;
      });
    
    return {
      overview: {
        totalRevenue,
        netRevenue,
        totalPlatformFees,
        totalClients,
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === "completed").length,
        upcomingBookings: bookings.filter(b => b.status === "confirmed").length,
        averageBookingValue: totalRevenue / (bookings.filter(b => b.status === "completed").length || 1),
      },
      growth: {
        revenueGrowth,
        currentPeriodRevenue: currentRevenue,
        previousPeriodRevenue: previousRevenue,
        newClients: currentPeriodBookings.length,
      },
      popularServices: {
        mostPopular: {
          style: mostPopularStyle[0],
          count: mostPopularStyle[1],
        },
        breakdown: serviceBreakdown,
      },
      monthlyTrend: Object.entries(monthlyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, revenue]) => ({ month, revenue })),
    };
  },
});

// Mutation: Add or update client notes
export const updateClientNotes = mutation({
  args: {
    clientId: v.id("clients"),
    salonId: v.id("salons"),
    bookingId: v.optional(v.id("bookings")),
    note: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Create a new note entry
    const noteId = await ctx.db.insert("clientNotes", {
      salonId: args.salonId,
      clientId: args.clientId,
      bookingId: args.bookingId,
      note: args.note,
      createdBy: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return { success: true, noteId };
  },
});

// Mutation: Update client tags and preferences
export const updateClientTags = mutation({
  args: {
    clientId: v.id("clients"),
    tags: v.optional(v.array(v.string())),
    preferredStyles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    
    await ctx.db.patch(args.clientId, {
      tags: args.tags,
      preferredStyles: args.preferredStyles,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Mutation: Create or update braider
export const upsertBraider = mutation({
  args: {
    salonId: v.id("salons"),
    braiderId: v.optional(v.id("braiders")),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.braiderId) {
      // Update existing braider
      await ctx.db.patch(args.braiderId, {
        name: args.name,
        email: args.email,
        phone: args.phone,
        specialties: args.specialties,
        isActive: args.isActive,
        updatedAt: Date.now(),
      });
      return { success: true, braiderId: args.braiderId };
    } else {
      // Create new braider
      const braiderId = await ctx.db.insert("braiders", {
        salonId: args.salonId,
        name: args.name,
        email: args.email,
        phone: args.phone,
        specialties: args.specialties,
        isActive: args.isActive,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { success: true, braiderId };
    }
  },
});