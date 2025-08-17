import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Internal mutation to send booking confirmation email
export const sendBookingConfirmation = internalMutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const client = await ctx.db.get(booking.clientId);
    const salon = await ctx.db.get(booking.salonId);
    
    if (!client || !salon) {
      throw new Error("Client or salon not found");
    }
    
    // In production, this would integrate with an email service like SendGrid, Resend, etc.
    // For now, we'll just log the email details
    const emailData = {
      to: client.email,
      subject: `Booking Confirmation - ${salon.name}`,
      body: `
        Dear ${client.name},
        
        Your appointment has been confirmed!
        
        Salon: ${salon.name}
        Date: ${booking.appointmentDate}
        Time: ${booking.appointmentTime}
        Service: ${booking.serviceDetails.style}
        Size: ${booking.serviceDetails.size}
        Length: ${booking.serviceDetails.length}
        Hair Type: ${booking.serviceDetails.hairType}
        Service Price: $${booking.serviceDetails.finalPrice}
        
        Payment Details:
        - Booking Fee Paid: $5.00
        - Amount Due at Appointment: $${booking.serviceDetails.finalPrice}
        
        Location: ${salon.address || 'Will be provided'}
        Phone: ${salon.phone || 'N/A'}
        
        Please arrive 10 minutes early for your appointment.
        
        Thank you for choosing ${salon.name}!
      `,
    };
    
    console.log("📧 Sending booking confirmation email:", emailData);
    
    // Return success
    return { success: true, emailSent: true };
  },
});

// Internal mutation to send salon notification email
export const sendSalonNotification = internalMutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const client = await ctx.db.get(booking.clientId);
    const salon = await ctx.db.get(booking.salonId);
    
    if (!client || !salon) {
      throw new Error("Client or salon not found");
    }
    
    // In production, this would integrate with an email service
    const emailData = {
      to: salon.email,
      subject: `New Booking - ${client.name}`,
      body: `
        You have a new booking!
        
        Client: ${client.name}
        Email: ${client.email}
        Phone: ${client.phone}
        
        Date: ${booking.appointmentDate}
        Time: ${booking.appointmentTime}
        
        Service Details:
        - Style: ${booking.serviceDetails.style}
        - Size: ${booking.serviceDetails.size}
        - Length: ${booking.serviceDetails.length}
        - Hair Type: ${booking.serviceDetails.hairType}
        ${booking.serviceDetails.includeCurlyHair ? '- Includes Curly Hair' : ''}
        
        Service Price: $${booking.serviceDetails.finalPrice}
        Booking Fee Collected: $${booking.platformFee} (platform fee)
        You Will Receive: $${booking.payoutAmount} (paid by client at appointment)
        
        ${booking.notes ? `Client Notes: ${booking.notes}` : ''}
        
        Log in to your dashboard to manage this booking.
      `,
    };
    
    console.log("📧 Sending salon notification email:", emailData);
    
    // Return success
    return { success: true, emailSent: true };
  },
});

// Internal mutation to send SMS notification
export const sendSMSNotification = internalMutation({
  args: {
    phone: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // In production, this would integrate with an SMS service like Twilio
    console.log("📱 Sending SMS notification:", {
      to: args.phone,
      message: args.message,
    });
    
    return { success: true, smsSent: true };
  },
});

// Mutation to trigger notifications after booking confirmation
export const triggerBookingNotifications = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    // Only send notifications for confirmed bookings
    if (booking.status !== "confirmed") {
      return { success: false, message: "Booking is not confirmed" };
    }
    
    try {
      // Schedule email notifications
      await ctx.scheduler.runAfter(0, internal.notifications.sendBookingConfirmation, {
        bookingId: args.bookingId,
      });
      
      await ctx.scheduler.runAfter(0, internal.notifications.sendSalonNotification, {
        bookingId: args.bookingId,
      });
      
      // Get client for SMS
      const client = await ctx.db.get(booking.clientId);
      if (client && client.phone) {
        const salon = await ctx.db.get(booking.salonId);
        const smsMessage = `Your appointment at ${salon?.name} on ${booking.appointmentDate} at ${booking.appointmentTime} is confirmed! Service price: $${booking.serviceDetails.finalPrice} (due at appointment). Booking fee of $5 has been paid.`;
        
        await ctx.scheduler.runAfter(0, internal.notifications.sendSMSNotification, {
          phone: client.phone,
          message: smsMessage,
        });
      }
      
      return { success: true, message: "Notifications scheduled" };
    } catch (error) {
      console.error("Error triggering notifications:", error);
      return { success: false, message: "Failed to send notifications" };
    }
  },
});

// Mutation to send review request after appointment completion
export const sendReviewRequest = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const client = await ctx.db.get(booking.clientId);
    const salon = await ctx.db.get(booking.salonId);
    
    if (!client || !salon) {
      throw new Error("Client or salon not found");
    }
    
    // In production, this would integrate with email/SMS services
    // For now, we'll just log the review request
    console.log("Review request would be sent to:", client.email);
    console.log("Review URLs:", {
      google: salon.googleReviewUrl,
      yelp: salon.yelpReviewUrl
    });
    
    // Could also create a review request record in the database
    // to track if review was completed
    
    return { success: true, message: "Review request scheduled" };
  },
});

// Mutation to send reschedule notification
export const sendRescheduleNotification = mutation({
  args: {
    bookingId: v.id("bookings"),
    oldDate: v.string(),
    oldTime: v.string(),
    newDate: v.string(),
    newTime: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const client = await ctx.db.get(booking.clientId);
    const salon = await ctx.db.get(booking.salonId);
    
    if (!client || !salon) {
      throw new Error("Client or salon not found");
    }
    
    // In production, send actual notification
    const message = `Your appointment at ${salon.name} has been rescheduled from ${args.oldDate} ${args.oldTime} to ${args.newDate} ${args.newTime}`;
    
    console.log("Reschedule notification:", {
      to: client.email,
      message
    });
    
    // If client has phone, send SMS too
    if (client.phone) {
      console.log("SMS notification:", {
        to: client.phone,
        message
      });
    }
    
    return { success: true, message: "Reschedule notification sent" };
  },
});