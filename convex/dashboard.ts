import { query } from "./_generated/server";

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
    
    // Get completed bookings for revenue calculation
    const completedBookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId_and_status", (q) => 
        q.eq("salonId", user.salonId!).eq("status", "completed")
      )
      .collect();
    
    // Calculate revenue metrics
    const totalRevenue = completedBookings.reduce((sum, booking) => 
      sum + (booking.totalPrice || 0), 0
    );
    
    const totalFees = completedBookings.reduce((sum, booking) => 
      sum + (booking.platformFee || 0), 0
    );
    
    // Get upcoming appointments (next 5)
    const upcomingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId_and_status", (q) => 
        q.eq("salonId", user.salonId!).eq("status", "confirmed")
      )
      .order("asc")
      .take(5);
    
    // Check onboarding completion
    const onboardingComplete = user.onboardingComplete || false;
    
    // Get the full quote tool URL
    const baseUrl = 'http://localhost:3002'; // Will be replaced with environment variable in production
    let fullQuoteToolUrl = '';
    
    if (salon.onboardingToken) {
      const quoteToolPath = salon.quoteToolUrl || `/quote/${salon.onboardingToken}`;
      fullQuoteToolUrl = quoteToolPath.startsWith('http') ? quoteToolPath : `${baseUrl}${quoteToolPath}`;
    } else if (onboardingComplete) {
      // If onboarding is complete but no token exists, it needs to be generated
      // This will be handled by a separate mutation
      fullQuoteToolUrl = '';
    }
    
    return {
      salon: {
        name: salon.name,
        quoteToolUrl: fullQuoteToolUrl,
      },
      metrics: {
        totalRevenue,
        totalFees,
        upcomingAppointmentsCount: upcomingBookings.length,
      },
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking._id,
        clientName: booking.clientName,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        serviceQuoteDetails: booking.serviceQuoteDetails,
      })),
      onboardingComplete,
    };
  },
});