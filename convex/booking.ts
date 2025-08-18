import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Platform fee constant
const PLATFORM_FEE = 5; // $5 per booking

// Check if payment is required (can be configured)
const PAYMENT_REQUIRED = true; // Stripe is now ready!

// Query: Get booking by ID
export const getBookingById = query({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return null;
    
    // Populate client information if clientId exists
    let client = null;
    if (booking.clientId) {
      client = await ctx.db.get(booking.clientId);
    }
    
    return {
      ...booking,
      client
    };
  },
});

// Query: Get calendar availability for a salon
export const getCalendarAvailability = query({
  args: {
    salonId: v.id("salons"),
    startDate: v.string(), // ISO date string
    endDate: v.string(), // ISO date string
  },
  handler: async (ctx, args) => {
    // Get all calendar slots for the date range
    const slots = await ctx.db
      .query("calendarSlots")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();
    
    // Get all bookings for the date range to check availability
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) =>
        q.and(
          q.gte(q.field("appointmentDate"), args.startDate),
          q.lte(q.field("appointmentDate"), args.endDate),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();
    
    // Create a map of booked times
    const bookedTimes = new Map();
    bookings.forEach(booking => {
      const key = `${booking.appointmentDate}_${booking.appointmentTime}`;
      bookedTimes.set(key, true);
    });
    
    // If no slots are defined, generate default slots
    if (slots.length === 0) {
      return generateDefaultSlots(args.startDate, args.endDate, bookedTimes);
    }
    
    // Mark slots as unavailable if they're booked
    const availableSlots = slots.map(slot => {
      const key = `${slot.date}_${slot.startTime}`;
      return {
        ...slot,
        isAvailable: slot.isAvailable && !bookedTimes.has(key)
      };
    });
    
    return availableSlots;
  },
});

// Helper function to generate default slots (9 AM - 6 PM, hourly)
function generateDefaultSlots(startDate: string, endDate: string, bookedTimes: Map<string, boolean>) {
  const slots = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip Sundays (day 0)
    if (date.getDay() === 0) continue;
    
    // Generate hourly slots from 9 AM to 6 PM
    for (let hour = 9; hour < 18; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const key = `${dateStr}_${timeStr}`;
      
      slots.push({
        date: dateStr,
        startTime: timeStr,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        isAvailable: !bookedTimes.has(key),
      });
    }
  }
  
  return slots;
}

// Query: Get salon bookings
export const getSalonBookings = query({
  args: {
    salonId: v.id("salons"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    let bookingsQuery = ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId));
    
    if (args.status) {
      bookingsQuery = bookingsQuery.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    const bookings = await bookingsQuery.collect();
    
    // Get client details for each booking
    const bookingsWithClients = await Promise.all(
      bookings.map(async (booking) => {
        const client = await ctx.db.get(booking.clientId);
        return {
          ...booking,
          client,
        };
      })
    );
    
    return bookingsWithClients.sort((a, b) => {
      // Sort by appointment date and time
      const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
      const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  },
});

// Mutation: Create or update client
export const upsertClient = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if client exists
    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingClient) {
      // Update existing client
      await ctx.db.patch(existingClient._id, {
        name: args.name,
        phone: args.phone,
        updatedAt: Date.now(),
      });
      return existingClient._id;
    } else {
      // Create new client
      const clientId = await ctx.db.insert("clients", {
        email: args.email,
        name: args.name,
        phone: args.phone,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return clientId;
    }
  },
});

// Import capacity and braider functions  
import { getServiceDuration } from "./emergencyCapacity";

// Mutation: Create new booking
export const createBooking = mutation({
  args: {
    salonId: v.id("salons"),
    clientDetails: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
    }),
    serviceDetails: v.object({
      style: v.string(),
      size: v.string(),
      length: v.string(),
      hairType: v.string(),
      includeCurlyHair: v.optional(v.boolean()),
      finalPrice: v.number(),
    }),
    appointmentDate: v.string(),
    appointmentTime: v.string(),
    notes: v.optional(v.string()),
    preferredBraiderId: v.optional(v.id("braiders")),
  },
  handler: async (ctx, args): Promise<{
    bookingId: Id<"bookings">;
    assignedBraider: string | undefined;
    capacityInfo: {
      overlappingBookings: number;
      remainingCapacity: number;
    };
  }> => {
    // 1. Get service duration for capacity checking
    const serviceDuration = getServiceDuration(args.serviceDetails.style);
    
    // 2. Validate capacity BEFORE creating anything
    const capacityCheck: any = await ctx.runMutation(api.emergencyCapacity.validateCapacity, {
      salonId: args.salonId,
      date: args.appointmentDate,
      time: args.appointmentTime,
      duration: serviceDuration,
    });
    
    if (!capacityCheck.valid) {
      throw new Error(capacityCheck.message || "Capacity validation failed");
    }
    
    // 3. Auto-assign a braider
    let assignedBraiderId: Id<"braiders"> | undefined;
    let braiderName: string | undefined;
    try {
      const braiderAssignment: any = await ctx.runMutation(api.braiderAssignment.autoAssignBraider, {
        salonId: args.salonId,
        serviceStyle: args.serviceDetails.style,
        date: args.appointmentDate,
        time: args.appointmentTime,
        duration: serviceDuration,
        preferredBraiderId: args.preferredBraiderId,
      });
      
      assignedBraiderId = braiderAssignment.assignedBraiderId;
      braiderName = braiderAssignment.braiderName;
    } catch (error) {
      // If auto-assignment fails, continue without braider assignment
      console.error("Auto-assignment failed:", error);
      assignedBraiderId = undefined;
      braiderName = undefined;
    }
    
    // 4. Create or update client
    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.clientDetails.email))
      .first();
    
    let clientId;
    if (existingClient) {
      // Update existing client
      await ctx.db.patch(existingClient._id, {
        name: args.clientDetails.name,
        phone: args.clientDetails.phone,
        updatedAt: Date.now(),
      });
      clientId = existingClient._id;
    } else {
      // Create new client
      clientId = await ctx.db.insert("clients", {
        email: args.clientDetails.email,
        name: args.clientDetails.name,
        phone: args.clientDetails.phone,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // 5. Calculate amounts
    // Client pays only $5 platform fee at booking
    // The salon receives the full service price when appointment is completed
    const totalServicePrice = args.serviceDetails.finalPrice;
    const bookingFee = PLATFORM_FEE; // $5 platform fee paid at booking
    const salonPayout = totalServicePrice; // Salon gets full amount after service
    
    // 6. Create booking with capacity tracking and braider assignment
    const bookingId = await ctx.db.insert("bookings", {
      salonId: args.salonId,
      clientId,
      serviceDetails: {
        ...args.serviceDetails,
        finalPrice: totalServicePrice, // The quoted service price
        estimatedDuration: serviceDuration,
      },
      appointmentDate: args.appointmentDate,
      appointmentTime: args.appointmentTime,
      status: PAYMENT_REQUIRED ? "pending" : "confirmed", // Auto-confirm if payment disabled
      notes: args.notes,
      platformFee: PAYMENT_REQUIRED ? bookingFee : 0, // No fee if payment disabled
      payoutAmount: salonPayout, // Full service price goes to salon
      
      // Emergency Capacity Tracking
      serviceDurationMinutes: serviceDuration,
      concurrentBookingCount: capacityCheck.overlappingCount + 1,
      capacityGroupId: `${args.appointmentDate}_${args.appointmentTime}`,
      
      // Braider Assignment
      braiderId: assignedBraiderId,
      assignedBraiderId: assignedBraiderId,
      preferredBraiderId: args.preferredBraiderId,
      braiderNotes: braiderName ? `Assigned to ${braiderName}` : undefined,
      
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return {
      bookingId,
      assignedBraider: braiderName,
      capacityInfo: {
        overlappingBookings: capacityCheck.overlappingCount,
        remainingCapacity: capacityCheck.remainingCapacity,
      },
    };
  },
});

// Mutation: Confirm booking after payment
export const confirmBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    // Update booking status
    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: Date.now(),
    });
    
    // Create transaction record for the booking fee payment
    await ctx.db.insert("transactions", {
      bookingId: args.bookingId,
      amount: PLATFORM_FEE, // Only $5 platform fee is paid at booking
      platformFee: PLATFORM_FEE,
      payoutAmount: booking.payoutAmount, // Salon will receive full service price later
      stripePaymentId: args.stripePaymentIntentId,
      status: "succeeded",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Trigger notifications (emails and SMS)
    await ctx.scheduler.runAfter(0, api.notifications.triggerBookingNotifications, {
      bookingId: args.bookingId,
    });
    
    return { success: true };
  },
});

// Mutation: Cancel booking
export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    // Check if booking can be cancelled
    if (booking.status === "completed") {
      throw new Error("Cannot cancel a completed booking");
    }
    
    // Update booking status
    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      notes: args.reason ? `Cancelled: ${args.reason}` : booking.notes,
      updatedAt: Date.now(),
    });
    
    // If there's a transaction, update it
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_bookingId", (q) => q.eq("bookingId", args.bookingId))
      .first();
    
    if (transaction) {
      await ctx.db.patch(transaction._id, {
        status: "refunded",
        updatedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

// Mutation: Update calendar slot availability
export const updateSlotAvailability = mutation({
  args: {
    salonId: v.id("salons"),
    date: v.string(),
    startTime: v.string(),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if slot exists
    const existingSlot = await ctx.db
      .query("calendarSlots")
      .withIndex("by_salonId_and_date", (q) => 
        q.eq("salonId", args.salonId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("startTime"), args.startTime))
      .first();
    
    if (existingSlot) {
      // Update existing slot
      await ctx.db.patch(existingSlot._id, {
        isAvailable: args.isAvailable,
        updatedAt: Date.now(),
      });
    } else {
      // Create new slot
      await ctx.db.insert("calendarSlots", {
        salonId: args.salonId,
        date: args.date,
        startTime: args.startTime,
        endTime: `${(parseInt(args.startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
        isAvailable: args.isAvailable,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

// Mutation: Update booking status (for marking complete, no-show, cancelled)
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("completed"),
      v.literal("no_show"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    // Update booking status
    await ctx.db.patch(args.bookingId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    
    // Handle status-specific logic
    if (args.status === "completed") {
      // Calculate braider earnings if braider is assigned
      let braiderPayout = 0;
      if (booking.braiderId) {
        const braider = await ctx.db.get(booking.braiderId);
        if (braider) {
          // Use braider's split percentage or default to 60%
          const splitPercentage = braider.splitPercentage || 60;
          braiderPayout = (booking.serviceDetails?.finalPrice || 0) * (splitPercentage / 100);
          
          // Update booking with braider earnings
          await ctx.db.patch(args.bookingId, {
            braiderEarnings: braiderPayout,
            paymentStatus: "pending_payout",
          });
        }
      }

      // Trigger payment processing for the service amount
      // The salon receives the full service price after completion
      await ctx.db.insert("transactions", {
        bookingId: args.bookingId,
        braiderId: booking.braiderId,
        amount: booking.serviceDetails?.finalPrice || 0,
        platformFee: 0, // Platform fee was already paid at booking
        payoutAmount: booking.payoutAmount || booking.serviceDetails?.finalPrice || 0,
        braiderPayout,
        stripePaymentId: booking.stripePaymentIntentId || `completed_${args.bookingId}`,
        status: "succeeded",
        payoutStatus: braiderPayout > 0 ? "pending" : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Trigger review request using centralized reputation system
      const salon = await ctx.db.get(booking.salonId);
      if (salon) {
        const delayMinutes = salon.reviewRequestDelay || 120; // Default 2 hours
        await ctx.scheduler.runAfter(
          delayMinutes * 60 * 1000,
          api.reputation.sendReviewRequest,
          {
            bookingId: args.bookingId,
            salonId: booking.salonId,
          }
        );
      }
    } else if (args.status === "no_show") {
      // Free up the time slot for rebooking
      // Could potentially charge a no-show fee here
      const transaction = await ctx.db
        .query("transactions")
        .withIndex("by_bookingId", (q) => q.eq("bookingId", args.bookingId))
        .first();
      
      if (transaction) {
        await ctx.db.patch(transaction._id, {
          status: "no_show",
          updatedAt: Date.now(),
        });
      }
    }
    
    return { success: true };
  },
});

// Mutation: Reschedule booking
export const rescheduleBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    newDate: v.string(),
    newTime: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    // Check if booking can be rescheduled
    if (booking.status === "completed" || booking.status === "cancelled") {
      throw new Error(`Cannot reschedule a ${booking.status} booking`);
    }
    
    // Validate new slot availability
    const existingBooking = await ctx.db
      .query("bookings")
      .withIndex("by_salonId", (q) => q.eq("salonId", booking.salonId))
      .filter((q) =>
        q.and(
          q.eq(q.field("appointmentDate"), args.newDate),
          q.eq(q.field("appointmentTime"), args.newTime),
          q.neq(q.field("status"), "cancelled"),
          q.neq(q.field("_id"), args.bookingId)
        )
      )
      .first();
    
    if (existingBooking) {
      throw new Error("The selected time slot is already booked");
    }
    
    // Update booking with new date and time
    await ctx.db.patch(args.bookingId, {
      appointmentDate: args.newDate,
      appointmentTime: args.newTime,
      notes: booking.notes ? `${booking.notes}\nRescheduled from ${booking.appointmentDate} ${booking.appointmentTime}` : `Rescheduled from ${booking.appointmentDate} ${booking.appointmentTime}`,
      updatedAt: Date.now(),
    });
    
    // Send reschedule notification to client
    await ctx.scheduler.runAfter(0, api.notifications.sendRescheduleNotification, {
      bookingId: args.bookingId,
      oldDate: booking.appointmentDate,
      oldTime: booking.appointmentTime,
      newDate: args.newDate,
      newTime: args.newTime,
    });
    
    return { success: true };
  },
});

// Mutation: Mark booking complete and trigger review request
export const markBookingCompleteWithReview = mutation({
  args: {
    bookingId: v.id("bookings"),
    braiderNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    
    // Update booking status
    await ctx.db.patch(args.bookingId, {
      status: "completed",
      braiderNotes: args.braiderNotes,
      updatedAt: Date.now(),
    });
    
    // Get salon settings for review request
    const salon = await ctx.db.get(booking.salonId);
    if (salon) {
      // Check if messaging settings exist
      const messagingSettings = await ctx.db
        .query("salonMessagingSettings")
        .withIndex("by_salonId", (q) => q.eq("salonId", booking.salonId))
        .first();
      
      // Only trigger if auto-request is enabled (default true)
      const enableAutoRequest = messagingSettings?.enableAutoRequest ?? true;
      
      if (enableAutoRequest && (salon.googleReviewUrl || salon.yelpReviewUrl)) {
        const delayMinutes = messagingSettings?.reviewRequestDelay || salon.reviewRequestDelay || 120;
        
        await ctx.scheduler.runAfter(
          delayMinutes * 60 * 1000, // Convert minutes to ms
          api.reputation.sendReviewRequest,
          { 
            bookingId: args.bookingId,
            salonId: booking.salonId,
          }
        );
      }
    }
    
    return { success: true };
  },
});

// Mutation: Assign braider to booking
export const assignBraider = mutation({
  args: {
    bookingId: v.id("bookings"),
    braiderId: v.id("braiders"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const braider = await ctx.db.get(args.braiderId);
    if (!braider) {
      throw new Error("Braider not found");
    }
    
    // Update booking with new braider assignment
    await ctx.db.patch(args.bookingId, {
      braiderId: args.braiderId,
      assignedBraiderId: args.braiderId,
      braiderNotes: `Assigned to ${braider.name}`,
      updatedAt: Date.now(),
    });
    
    return { 
      success: true,
      braiderName: braider.name 
    };
  },
});