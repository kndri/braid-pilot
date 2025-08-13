import { query } from "./_generated/server";

export const getDashboardData = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const clerkId = identity.subject;
    
    // Get user and salon data
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    if (!user.salonId) {
      throw new Error("Salon not found");
    }
    
    const salon = await ctx.db.get(user.salonId);
    if (!salon) {
      throw new Error("Salon not found");
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://braidpilot.com';
    const quoteToolPath = salon.quoteToolUrl || `/quote/${salon.onboardingToken}`;
    const fullQuoteToolUrl = `${baseUrl}${quoteToolPath}`;
    
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