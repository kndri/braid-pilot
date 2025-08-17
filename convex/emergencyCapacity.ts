import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Service duration mappings for different styles
const SERVICE_DURATIONS: Record<string, number> = {
  "Box Braids": 240, // 4 hours
  "Knotless Braids": 300, // 5 hours
  "Micro Braids": 480, // 8 hours
  "Cornrows": 180, // 3 hours
  "Senegalese Twists": 360, // 6 hours
  "Faux Locs": 420, // 7 hours
  "Crochet Braids": 180, // 3 hours
  "Goddess Braids": 240, // 4 hours
  "Fulani Braids": 300, // 5 hours
  "default": 240 // 4 hours default
};

// Get service duration based on style
export function getServiceDuration(style: string): number {
  return SERVICE_DURATIONS[style] || SERVICE_DURATIONS.default;
}

// Check capacity before booking
export const checkCapacity = query({
  args: {
    salonId: v.id("salons"),
    date: v.string(),
    time: v.string(),
    style: v.string(),
  },
  handler: async (ctx, args) => {
    // Get salon capacity settings
    const salon = await ctx.db.get(args.salonId);
    if (!salon) throw new Error("Salon not found");
    
    const maxConcurrent = salon.maxConcurrentBookings || 3;
    const bufferMinutes = salon.bufferMinutes || 30;
    const duration = getServiceDuration(args.style);
    
    // Check for overlapping bookings
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) =>
        q.and(
          q.eq(q.field("appointmentDate"), args.date),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();
    
    // Calculate overlapping bookings
    let overlappingCount = 0;
    const requestedStartMinutes = timeToMinutes(args.time);
    const requestedEndMinutes = requestedStartMinutes + duration + bufferMinutes;
    
    for (const booking of existingBookings) {
      const bookingStartMinutes = timeToMinutes(booking.appointmentTime);
      const bookingDuration = booking.serviceDurationMinutes || 
                              booking.serviceDetails.estimatedDuration || 
                              getServiceDuration(booking.serviceDetails.style);
      const bookingEndMinutes = bookingStartMinutes + bookingDuration + bufferMinutes;
      
      // Check if times overlap
      if (requestedStartMinutes < bookingEndMinutes && requestedEndMinutes > bookingStartMinutes) {
        overlappingCount++;
      }
    }
    
    const hasCapacity = overlappingCount < maxConcurrent;
    const remainingCapacity = Math.max(0, maxConcurrent - overlappingCount);
    
    return {
      hasCapacity,
      overlappingCount,
      maxCapacity: maxConcurrent,
      remainingCapacity,
      serviceDuration: duration,
      bufferTime: bufferMinutes,
      message: hasCapacity 
        ? `${remainingCapacity} slot(s) available` 
        : "This time slot is at full capacity"
    };
  },
});

// Validate capacity before creating booking
export const validateCapacity = mutation({
  args: {
    salonId: v.id("salons"),
    date: v.string(),
    time: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) throw new Error("Salon not found");
    
    // Check if emergency capacity is enabled
    if (salon.emergencyCapacityEnabled === false) {
      return { valid: true, message: "Capacity management disabled" };
    }
    
    const maxConcurrent = salon.maxConcurrentBookings || 3;
    const bufferMinutes = salon.bufferMinutes || 30;
    
    // Get existing bookings for the date
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) =>
        q.and(
          q.eq(q.field("appointmentDate"), args.date),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();
    
    // Check for capacity
    const requestedStartMinutes = timeToMinutes(args.time);
    const requestedEndMinutes = requestedStartMinutes + args.duration + bufferMinutes;
    
    let overlappingBookings = [];
    for (const booking of existingBookings) {
      const bookingStartMinutes = timeToMinutes(booking.appointmentTime);
      const bookingDuration = booking.serviceDurationMinutes || 
                              booking.serviceDetails.estimatedDuration || 
                              240;
      const bookingEndMinutes = bookingStartMinutes + bookingDuration + bufferMinutes;
      
      if (requestedStartMinutes < bookingEndMinutes && requestedEndMinutes > bookingStartMinutes) {
        overlappingBookings.push(booking);
      }
    }
    
    if (overlappingBookings.length >= maxConcurrent) {
      throw new Error(
        `Cannot book: Maximum capacity of ${maxConcurrent} concurrent bookings reached. ` +
        `Please choose a different time.`
      );
    }
    
    // Check if time slot is blocked
    const blockedSlots = await ctx.db
      .query("capacitySlots")
      .withIndex("by_salonId_and_date", (q) => 
        q.eq("salonId", args.salonId).eq("date", args.date)
      )
      .collect();
    
    for (const slot of blockedSlots) {
      if (slot.isBlocked) {
        const slotStartMinutes = timeToMinutes(slot.startTime);
        const slotEndMinutes = timeToMinutes(slot.endTime);
        
        if (requestedStartMinutes < slotEndMinutes && requestedEndMinutes > slotStartMinutes) {
          throw new Error(
            `Cannot book: Time slot is blocked. Reason: ${slot.blockedReason || "Administrative block"}`
          );
        }
      }
    }
    
    return {
      valid: true,
      overlappingCount: overlappingBookings.length,
      remainingCapacity: maxConcurrent - overlappingBookings.length,
      message: `Booking validated. ${maxConcurrent - overlappingBookings.length} slot(s) remaining.`
    };
  },
});

// Update salon capacity settings
export const updateCapacitySettings = mutation({
  args: {
    salonId: v.id("salons"),
    maxConcurrentBookings: v.optional(v.number()),
    bufferMinutes: v.optional(v.number()),
    emergencyCapacityEnabled: v.optional(v.boolean()),
    defaultServiceDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) throw new Error("Salon not found");
    
    // Validate settings
    if (args.maxConcurrentBookings !== undefined && args.maxConcurrentBookings < 1) {
      throw new Error("Maximum concurrent bookings must be at least 1");
    }
    
    if (args.bufferMinutes !== undefined && args.bufferMinutes < 0) {
      throw new Error("Buffer time cannot be negative");
    }
    
    // Update salon settings
    const updates: any = {};
    if (args.maxConcurrentBookings !== undefined) {
      updates.maxConcurrentBookings = args.maxConcurrentBookings;
    }
    if (args.bufferMinutes !== undefined) {
      updates.bufferMinutes = args.bufferMinutes;
    }
    if (args.emergencyCapacityEnabled !== undefined) {
      updates.emergencyCapacityEnabled = args.emergencyCapacityEnabled;
    }
    if (args.defaultServiceDuration !== undefined) {
      updates.defaultServiceDuration = args.defaultServiceDuration;
    }
    
    await ctx.db.patch(args.salonId, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return { 
      success: true,
      settings: {
        maxConcurrentBookings: args.maxConcurrentBookings ?? salon.maxConcurrentBookings ?? 3,
        bufferMinutes: args.bufferMinutes ?? salon.bufferMinutes ?? 30,
        emergencyCapacityEnabled: args.emergencyCapacityEnabled ?? salon.emergencyCapacityEnabled ?? true,
        defaultServiceDuration: args.defaultServiceDuration ?? salon.defaultServiceDuration ?? 240,
      }
    };
  },
});

// Block or unblock time slots
export const manageTimeSlot = mutation({
  args: {
    salonId: v.id("salons"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    block: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if slot already exists
    const existingSlot = await ctx.db
      .query("capacitySlots")
      .withIndex("by_salonId_and_date", (q) => 
        q.eq("salonId", args.salonId).eq("date", args.date)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("startTime"), args.startTime),
          q.eq(q.field("endTime"), args.endTime)
        )
      )
      .first();
    
    if (existingSlot) {
      // Update existing slot
      await ctx.db.patch(existingSlot._id, {
        isBlocked: args.block,
        blockedReason: args.reason,
        updatedAt: Date.now(),
      });
    } else {
      // Create new slot
      await ctx.db.insert("capacitySlots", {
        salonId: args.salonId,
        date: args.date,
        startTime: args.startTime,
        endTime: args.endTime,
        maxBookings: 0,
        currentBookings: 0,
        isBlocked: args.block,
        blockedReason: args.reason,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return { 
      success: true, 
      action: args.block ? "blocked" : "unblocked",
      slot: `${args.date} ${args.startTime}-${args.endTime}`
    };
  },
});

// Get capacity status for a date
export const getCapacityStatus = query({
  args: {
    salonId: v.id("salons"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) throw new Error("Salon not found");
    
    const maxConcurrent = salon.maxConcurrentBookings || 3;
    const bufferMinutes = salon.bufferMinutes || 30;
    
    // Get all bookings for the date
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) => 
        q.and(
          q.eq(q.field("appointmentDate"), args.date),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();
    
    // Get blocked slots
    const blockedSlots = await ctx.db
      .query("capacitySlots")
      .withIndex("by_salonId_and_date", (q) => 
        q.eq("salonId", args.salonId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("isBlocked"), true))
      .collect();
    
    // Calculate hourly capacity
    const hourlyCapacity: Record<string, any> = {};
    
    for (let hour = 9; hour < 18; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const startMinutes = hour * 60;
      
      // Count overlapping bookings at this hour
      let overlappingCount = 0;
      for (const booking of bookings) {
        const bookingStartMinutes = timeToMinutes(booking.appointmentTime);
        const bookingDuration = booking.serviceDurationMinutes || 
                                booking.serviceDetails.estimatedDuration || 
                                240;
        const bookingEndMinutes = bookingStartMinutes + bookingDuration + bufferMinutes;
        
        if (bookingStartMinutes <= startMinutes && bookingEndMinutes > startMinutes) {
          overlappingCount++;
        }
      }
      
      // Check if hour is blocked
      let isBlocked = false;
      let blockReason = "";
      for (const slot of blockedSlots) {
        const slotStartMinutes = timeToMinutes(slot.startTime);
        const slotEndMinutes = timeToMinutes(slot.endTime);
        
        if (slotStartMinutes <= startMinutes && slotEndMinutes > startMinutes) {
          isBlocked = true;
          blockReason = slot.blockedReason || "Administrative block";
          break;
        }
      }
      
      hourlyCapacity[timeStr] = {
        time: timeStr,
        current: overlappingCount,
        max: maxConcurrent,
        available: Math.max(0, maxConcurrent - overlappingCount),
        isBlocked,
        blockReason,
        status: isBlocked ? "blocked" : 
                overlappingCount >= maxConcurrent ? "full" : 
                overlappingCount > maxConcurrent * 0.7 ? "busy" : "available"
      };
    }
    
    return {
      date: args.date,
      settings: {
        maxConcurrentBookings: maxConcurrent,
        bufferMinutes,
        emergencyCapacityEnabled: salon.emergencyCapacityEnabled ?? true,
      },
      totalBookings: bookings.length,
      blockedSlots: blockedSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: slot.blockedReason,
      })),
      hourlyCapacity,
    };
  },
});

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

// Helper function to convert minutes to time string
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}