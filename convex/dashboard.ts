import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardData = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return null instead of throwing error to handle auth loading state
      return null;
    }
    
    const clerkId = identity.subject;
    
    // Get user and salon data
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (!user) {
      // User might not be synced yet
      return null;
    }
    
    if (!user.salonId) {
      // User exists but no salon yet
      return null;
    }
    
    const salon = await ctx.db.get(user.salonId);
    if (!salon) {
      // Salon ID exists but salon not found
      return null;
    }
    
    // Get all bookings for metrics
    const allBookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", user.salonId!))
      .collect();
    
    // Filter bookings by status
    const completedBookings = allBookings.filter(b => b.status === "completed");
    const confirmedBookings = allBookings.filter(b => b.status === "confirmed");
    
    // Get today's bookings
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = allBookings.filter(b => 
      b.appointmentDate === today && (b.status === "confirmed" || b.status === "completed")
    );
    
    // Calculate revenue metrics
    const totalRevenue = completedBookings.reduce((sum, booking) => 
      sum + (booking.serviceDetails?.finalPrice || 0), 0
    );
    
    const totalFees = completedBookings.reduce((sum, booking) => 
      sum + (booking.platformFee || 0), 0
    );
    
    // Get unique clients
    const uniqueClientIds = new Set(allBookings.map(b => b.clientId).filter(id => id));
    
    // Get upcoming appointments (next 5)
    const upcomingBookings = confirmedBookings
      .sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
    
    // Check onboarding completion
    const onboardingComplete = user.onboardingComplete || false;
    
    // Check if pricing is configured
    const pricingConfigs = await ctx.db
      .query("pricingConfigs")
      .withIndex("by_salonId", (q) => q.eq("salonId", user.salonId!))
      .collect();
    
    const hasPricingConfigured = pricingConfigs.length > 0;
    
    // Get the full quote tool URL based on environment
    const baseUrl = process.env.PLATFORM_URL || 'https://braidpilot.com';
    let fullQuoteToolUrl = '';
    
    if (salon.username) {
      const quoteToolPath = `/quote/${salon.username}`;
      fullQuoteToolUrl = `${baseUrl}${quoteToolPath}`;
    } else if (salon.onboardingToken) {
      const quoteToolPath = salon.quoteToolUrl || `/quote/${salon.onboardingToken}`;
      fullQuoteToolUrl = quoteToolPath.startsWith('http') ? quoteToolPath : `${baseUrl}${quoteToolPath}`;
    } else if (onboardingComplete) {
      // If onboarding is complete but no token/username exists, it needs to be generated
      // This will be handled by a separate mutation
      fullQuoteToolUrl = '';
    }
    
    return {
      salon: {
        _id: salon._id,
        name: salon.name,
        quoteToolUrl: fullQuoteToolUrl,
      },
      metrics: {
        totalRevenue,
        totalFees,
        upcomingAppointmentsCount: upcomingBookings.length,
        totalClients: uniqueClientIds.size,
        completedBookings: completedBookings.length,
        todayBookings: todayBookings.length,
        monthlyGrowth: 0, // TODO: Calculate month-over-month growth
      },
      upcomingBookings: await Promise.all(upcomingBookings.map(async (booking) => {
        const client = await ctx.db.get(booking.clientId);
        return {
          id: booking._id,
          clientName: client?.name || 'Unknown Client',
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          serviceDetails: booking.serviceDetails,
        };
      })),
      onboardingComplete,
      hasPricingConfigured,
    };
  },
});

// Get dashboard statistics
export const getStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (!user?.salonId) return null;
    
    // Get all bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", user.salonId!))
      .collect();
    
    // Get completed bookings for revenue
    const completedBookings = bookings.filter(b => b.status === "completed");
    const totalRevenue = completedBookings.reduce((sum, booking) => 
      sum + (booking.serviceDetails?.finalPrice || 0), 0
    );
    
    // Get unique clients
    const uniqueClientIds = new Set(bookings.map(b => b.clientId).filter(id => id));
    
    // Get braiders count
    const braiders = await ctx.db
      .query("braiders")
      .withIndex("by_salonId", (q) => q.eq("salonId", user.salonId!))
      .collect();
    
    const activeBraiders = braiders.filter(b => b.isActive);
    
    return {
      totalBookings: bookings.length,
      totalRevenue,
      totalClients: uniqueClientIds.size,
      totalBraiders: activeBraiders.length,
      completedBookings: completedBookings.length,
      pendingBookings: bookings.filter(b => b.status === "pending").length,
      confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
    };
  },
});

// Get recent bookings for transactions table
export const getRecentBookings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (!user?.salonId) return [];
    
    // Get recent bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", user.salonId!))
      .order("desc")
      .take(10);
    
    // Get client details for each booking
    const bookingsWithClients = await Promise.all(
      bookings.map(async (booking) => {
        const client = booking.clientId ? await ctx.db.get(booking.clientId) : null;
        return {
          _id: booking._id,
          clientName: client?.name || 'Unknown Client',
          clientEmail: client?.email || '',
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          serviceDetails: booking.serviceDetails,
          status: booking.status,
          platformFee: booking.platformFee,
          payoutAmount: booking.payoutAmount,
        };
      })
    );
    
    return bookingsWithClients;
  },
});

// Get upcoming appointments
export const getUpcomingAppointments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (!user?.salonId) return [];
    
    // Get confirmed bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", user.salonId!))
      .filter(q => q.eq(q.field("status"), "confirmed"))
      .collect();
    
    // Sort by date and time
    const sortedBookings = bookings.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
      const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Take next 5 appointments
    const upcomingBookings = sortedBookings.slice(0, 5);
    
    // Get client and braider details
    const bookingsWithDetails = await Promise.all(
      upcomingBookings.map(async (booking) => {
        const client = booking.clientId ? await ctx.db.get(booking.clientId) : null;
        const braider = booking.braiderId ? await ctx.db.get(booking.braiderId) : null;
        
        return {
          _id: booking._id,
          clientName: client?.name || 'Unknown Client',
          braiderName: braider?.name || 'Unassigned',
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          serviceDetails: booking.serviceDetails,
          status: booking.status,
        };
      })
    );
    
    return bookingsWithDetails;
  },
});