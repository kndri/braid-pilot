import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getServiceDuration } from "./emergencyCapacity";

// Auto-assign braider based on service requirements
export const autoAssignBraider = mutation({
  args: {
    salonId: v.id("salons"),
    serviceStyle: v.string(),
    date: v.string(),
    time: v.string(),
    duration: v.optional(v.number()),
    preferredBraiderId: v.optional(v.id("braiders")),
  },
  handler: async (ctx, args) => {
    // Get all active braiders for this salon
    const allBraiders = await ctx.db
      .query("braiders")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    if (allBraiders.length === 0) {
      throw new Error("No active braiders available");
    }
    
    // Filter braiders by specialization if needed
    let qualifiedBraiders = allBraiders;
    
    // All braiders are qualified (removed skill level check)
    // Filter based on specialties only
    
    // Check specialties
    qualifiedBraiders = qualifiedBraiders.filter(braider => {
      if (!braider.specialties || braider.specialties.length === 0) {
        return true; // Braider can do all styles
      }
      return braider.specialties.includes(args.serviceStyle);
    });
    
    if (qualifiedBraiders.length === 0) {
      throw new Error(`No braiders qualified for ${args.serviceStyle}`);
    }
    
    // Check availability for each qualified braider
    const duration = args.duration || getServiceDuration(args.serviceStyle);
    const availableBraiders = [];
    
    for (const braider of qualifiedBraiders) {
      const isAvailable = await checkBraiderAvailability(
        ctx,
        braider._id,
        args.date,
        args.time,
        duration
      );
      
      if (isAvailable) {
        const workload = await getBraiderWorkload(ctx, braider._id, args.date);
        availableBraiders.push({ ...braider, workload });
      }
    }
    
    if (availableBraiders.length === 0) {
      throw new Error("No qualified braiders available at this time");
    }
    
    // Select best braider
    let selectedBraider = availableBraiders[0];
    
    // Check if preferred braider is available
    if (args.preferredBraiderId) {
      const preferred = availableBraiders.find(b => b._id === args.preferredBraiderId);
      if (preferred) {
        selectedBraider = preferred;
      }
    } else {
      // Select braider with lowest workload
      selectedBraider = availableBraiders.reduce((best, current) => 
        current.workload < best.workload ? current : best
      );
    }
    
    return {
      success: true,
      assignedBraiderId: selectedBraider._id,
      braiderName: selectedBraider.name,
      splitPercentage: selectedBraider.splitPercentage || 60,
      workloadMinutes: selectedBraider.workload,
      message: `Assigned to ${selectedBraider.name}`
    };
  },
});

// Check braider availability
async function checkBraiderAvailability(
  ctx: any,
  braiderId: Id<"braiders">,
  date: string,
  time: string,
  duration: number
): Promise<boolean> {
  const braider = await ctx.db.get(braiderId);
  if (!braider || !braider.isActive) return false;
  
  // Check working days
  const dayOfWeek = new Date(date).getDay();
  if (braider.workingDays && !braider.workingDays.includes(dayOfWeek)) {
    return false;
  }
  
  // Check working hours
  const requestedTime = timeToMinutes(time);
  const defaultStart = braider.defaultStartTime ? timeToMinutes(braider.defaultStartTime) : 540; // 9 AM
  const defaultEnd = braider.defaultEndTime ? timeToMinutes(braider.defaultEndTime) : 1080; // 6 PM
  
  if (requestedTime < defaultStart || (requestedTime + duration) > defaultEnd) {
    return false;
  }
  
  // Check for availability exceptions
  const exceptions = await ctx.db
    .query("braiderAvailability")
    .withIndex("by_braiderId_and_date", (q: any) => 
      q.eq("braiderId", braiderId).eq("date", date)
    )
    .collect();
  
  for (const exception of exceptions) {
    if (!exception.isAvailable) {
      // Braider marked as unavailable for this date
      if (!exception.startTime || !exception.endTime) {
        return false; // Whole day unavailable
      }
      
      const exceptionStart = timeToMinutes(exception.startTime);
      const exceptionEnd = timeToMinutes(exception.endTime);
      
      if (requestedTime >= exceptionStart && (requestedTime + duration) <= exceptionEnd) {
        return false;
      }
    }
  }
  
  // Check existing bookings
  const existingBookings = await ctx.db
    .query("bookings")
    .withIndex("by_braiderId", (q: any) => q.eq("braiderId", braiderId))
    .filter((q: any) => 
      q.and(
        q.eq(q.field("appointmentDate"), date),
        q.neq(q.field("status"), "cancelled")
      )
    )
    .collect();
  
  // Check for conflicts
  for (const booking of existingBookings) {
    const bookingStart = timeToMinutes(booking.appointmentTime);
    const bookingDuration = booking.serviceDurationMinutes || 
                           booking.serviceDetails.estimatedDuration || 
                           240;
    const bookingEnd = bookingStart + bookingDuration + 30; // Add buffer
    
    if (requestedTime < bookingEnd && (requestedTime + duration) > bookingStart) {
      return false; // Conflict found
    }
  }
  
  // Check max daily bookings
  if (braider.maxDailyBookings) {
    const dailyBookings = existingBookings.length;
    if (dailyBookings >= braider.maxDailyBookings) {
      return false;
    }
  }
  
  return true;
}

// Get braider workload for a date
async function getBraiderWorkload(
  ctx: any,
  braiderId: Id<"braiders">,
  date: string
): Promise<number> {
  const bookings = await ctx.db
    .query("bookings")
    .withIndex("by_braiderId", (q: any) => q.eq("braiderId", braiderId))
    .filter((q: any) => 
      q.and(
        q.eq(q.field("appointmentDate"), date),
        q.neq(q.field("status"), "cancelled")
      )
    )
    .collect();
  
  let totalMinutes = 0;
  for (const booking of bookings) {
    const duration = booking.serviceDurationMinutes || 
                    booking.serviceDetails.estimatedDuration || 
                    240;
    totalMinutes += duration;
  }
  
  return totalMinutes;
}

// Manual braider reassignment
export const reassignBraider = mutation({
  args: {
    bookingId: v.id("bookings"),
    newBraiderId: v.id("braiders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    
    const newBraider = await ctx.db.get(args.newBraiderId);
    if (!newBraider || !newBraider.isActive) {
      throw new Error("New braider is not available");
    }
    
    // Check availability of new braider
    const duration = booking.serviceDurationMinutes || 
                    booking.serviceDetails.estimatedDuration || 
                    240;
    
    const isAvailable = await checkBraiderAvailability(
      ctx,
      args.newBraiderId,
      booking.appointmentDate,
      booking.appointmentTime,
      duration
    );
    
    if (!isAvailable) {
      throw new Error("New braider is not available at this time");
    }
    
    // Update booking
    await ctx.db.patch(args.bookingId, {
      braiderId: args.newBraiderId,
      assignedBraiderId: args.newBraiderId,
      braiderNotes: args.reason ? `Reassigned: ${args.reason}` : undefined,
      updatedAt: Date.now(),
    });
    
    return { 
      success: true,
      newBraider: newBraider.name,
      message: `Booking reassigned to ${newBraider.name}`
    };
  },
});

// Get available braiders for a time slot
export const getAvailableBraiders = query({
  args: {
    salonId: v.id("salons"),
    date: v.string(),
    time: v.string(),
    serviceStyle: v.string(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allBraiders = await ctx.db
      .query("braiders")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const duration = args.duration || getServiceDuration(args.serviceStyle);
    const availableBraiders = [];
    
    for (const braider of allBraiders) {
      const isAvailable = await checkBraiderAvailability(
        ctx,
        braider._id,
        args.date,
        args.time,
        duration
      );
      
      if (isAvailable) {
        const workload = await getBraiderWorkload(ctx, braider._id, args.date);
        
        // Check if braider is qualified for the service
        let isQualified = true;
        if (braider.specialties && braider.specialties.length > 0) {
          isQualified = braider.specialties.includes(args.serviceStyle);
        }
        
        availableBraiders.push({
          _id: braider._id,
          name: braider.name,
          splitPercentage: braider.splitPercentage || 60,
          specialties: braider.specialties,
          isQualified,
          workloadMinutes: workload,
          workloadHours: Math.round(workload / 60 * 10) / 10,
        });
      }
    }
    
    // Sort by qualification and workload
    availableBraiders.sort((a, b) => {
      if (a.isQualified !== b.isQualified) {
        return a.isQualified ? -1 : 1;
      }
      return a.workloadMinutes - b.workloadMinutes;
    });
    
    return availableBraiders;
  },
});

// Update braider availability
export const updateBraiderAvailability = mutation({
  args: {
    braiderId: v.id("braiders"),
    date: v.string(),
    isAvailable: v.boolean(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if exception already exists for this date
    const existing = await ctx.db
      .query("braiderAvailability")
      .withIndex("by_braiderId_and_date", (q) => 
        q.eq("braiderId", args.braiderId).eq("date", args.date)
      )
      .first();
    
    if (existing) {
      // Update existing exception
      await ctx.db.patch(existing._id, {
        isAvailable: args.isAvailable,
        startTime: args.startTime,
        endTime: args.endTime,
        reason: args.reason,
      });
    } else {
      // Create new exception
      await ctx.db.insert("braiderAvailability", {
        braiderId: args.braiderId,
        date: args.date,
        isAvailable: args.isAvailable,
        startTime: args.startTime,
        endTime: args.endTime,
        reason: args.reason,
        createdAt: Date.now(),
      });
    }
    
    return { 
      success: true,
      message: args.isAvailable 
        ? "Braider marked as available" 
        : "Braider marked as unavailable"
    };
  },
});

// Get braider schedule
export const getBraiderSchedule = query({
  args: {
    braiderId: v.id("braiders"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const braider = await ctx.db.get(args.braiderId);
    if (!braider) throw new Error("Braider not found");
    
    // Get bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_braiderId", (q) => q.eq("braiderId", args.braiderId))
      .filter((q) => 
        q.and(
          q.gte(q.field("appointmentDate"), args.startDate),
          q.lte(q.field("appointmentDate"), args.endDate),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();
    
    // Get availability exceptions
    const exceptions = await ctx.db
      .query("braiderAvailability")
      .withIndex("by_braiderId", (q) => q.eq("braiderId", args.braiderId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();
    
    // Enrich bookings with client info
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const client = await ctx.db.get(booking.clientId);
        return {
          ...booking,
          clientName: client?.name || "Unknown",
          clientPhone: client?.phone,
        };
      })
    );
    
    return {
      braider: {
        _id: braider._id,
        name: braider.name,
        splitPercentage: braider.splitPercentage || 60,
        defaultStartTime: braider.defaultStartTime || "09:00",
        defaultEndTime: braider.defaultEndTime || "18:00",
        workingDays: braider.workingDays || [1, 2, 3, 4, 5, 6], // Mon-Sat
      },
      bookings: enrichedBookings,
      exceptions,
      stats: {
        totalBookings: enrichedBookings.length,
        totalHours: enrichedBookings.reduce((sum, b) => 
          sum + (b.serviceDurationMinutes || 240) / 60, 0
        ),
      }
    };
  },
});

// Helper function to convert time to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}