import { v } from "convex/values";
import { mutation, query, action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Initialize notification preferences for a new user
export const initializeNotificationPreferences = mutation({
  args: {
    salonId: v.id("salons"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if preferences already exist
    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create default preferences
    const prefId = await ctx.db.insert("notificationPreferences", {
      salonId: args.salonId,
      userId: args.userId,
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
        enabled: false,
        startTime: 22, // 10 PM
        endTime: 8,    // 8 AM
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return prefId;
  },
});

// Update notification preferences
export const updateNotificationPreferences = mutation({
  args: {
    userId: v.id("users"),
    emailNotifications: v.optional(v.object({
      newBooking: v.optional(v.boolean()),
      bookingCancellation: v.optional(v.boolean()),
      quoteCreated: v.optional(v.boolean()),
      dailySummary: v.optional(v.boolean()),
      weeklyReport: v.optional(v.boolean()),
      paymentReceived: v.optional(v.boolean()),
    })),
    smsNotifications: v.optional(v.object({
      newBooking: v.optional(v.boolean()),
      bookingCancellation: v.optional(v.boolean()),
      urgentAlerts: v.optional(v.boolean()),
    })),
    quietHours: v.optional(v.object({
      enabled: v.boolean(),
      startTime: v.number(),
      endTime: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!prefs) {
      throw new Error("Notification preferences not found");
    }

    const updates: any = { updatedAt: Date.now() };

    if (args.emailNotifications) {
      updates.emailNotifications = {
        ...prefs.emailNotifications,
        ...args.emailNotifications,
      };
    }

    if (args.smsNotifications) {
      updates.smsNotifications = {
        ...prefs.smsNotifications,
        ...args.smsNotifications,
      };
    }

    if (args.quietHours) {
      updates.quietHours = args.quietHours;
    }

    await ctx.db.patch(prefs._id, updates);
    return { success: true };
  },
});

// Send booking confirmation email
export const sendBookingNotification = internalAction({
  args: {
    bookingId: v.id("bookings"),
    type: v.union(
      v.literal("confirmation"),
      v.literal("cancellation"),
      v.literal("reminder")
    ),
  },
  handler: async (ctx, args) => {
    // Get booking details
    const booking = await ctx.runQuery(api.booking.getBookingById, {
      bookingId: args.bookingId,
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Get salon details
    const salon = await ctx.runQuery(api.salons.getSalonById, {
      salonId: booking.salonId,
    });

    if (!salon) {
      throw new Error("Salon not found");
    }

    // Get salon owner details
    const owner = await ctx.runQuery(api.users.getUserById, {
      userId: salon.ownerId,
    });

    if (!owner) {
      throw new Error("Salon owner not found");
    }

    // Check notification preferences
    const prefs = await ctx.runQuery(internal.notificationSystem.getNotificationPreferences, {
      userId: salon.ownerId,
    });

    const shouldSendEmail = args.type === "confirmation" 
      ? prefs?.emailNotifications.newBooking 
      : args.type === "cancellation"
      ? prefs?.emailNotifications.bookingCancellation
      : false;

    if (!shouldSendEmail) {
      return { sent: false, reason: "Notifications disabled" };
    }

    // Check quiet hours
    if (prefs?.quietHours?.enabled) {
      const currentHour = new Date().getHours();
      const { startTime, endTime } = prefs.quietHours;
      
      const inQuietHours = startTime > endTime
        ? currentHour >= startTime || currentHour < endTime
        : currentHour >= startTime && currentHour < endTime;

      if (inQuietHours) {
        // Schedule for after quiet hours
        const delayHours = endTime > currentHour ? endTime - currentHour : 24 - currentHour + endTime;
        await ctx.scheduler.runAfter(delayHours * 60 * 60 * 1000, 
          internal.notificationSystem.sendBookingNotification, args);
        return { sent: false, reason: "Scheduled for after quiet hours" };
      }
    }

    // Prepare email content
    const emailContent = generateBookingEmailContent(booking, salon, args.type);
    
    // Send email via email service (Resend, SendGrid, etc.)
    const result = await sendEmail({
      to: owner.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Log the notification
    await ctx.runMutation(internal.notificationSystem.logNotification, {
      salonId: booking.salonId,
      userId: salon.ownerId,
      type: "email",
      category: args.type === "confirmation" ? "booking_confirmation" : "booking_cancellation",
      subject: emailContent.subject,
      content: emailContent.text,
      recipient: owner.email,
      status: result.success ? "sent" : "failed",
      metadata: {
        bookingId: args.bookingId,
        errorMessage: result.error,
      },
    });

    // Update funnel analytics for booking
    await ctx.runMutation(internal.quoteTracking.updateFunnelAnalytics, {
      salonId: booking.salonId,
      event: args.type === "confirmation" ? "booking_created" : "booking_cancelled",
      revenue: args.type === "confirmation" ? booking.serviceDetails?.finalPrice : undefined,
    });

    return { sent: result.success, messageId: result.messageId };
  },
});

// Send quote created notification
export const sendQuoteCreatedNotification = internalAction({
  args: {
    salonId: v.id("salons"),
    quoteToken: v.string(),
    serviceType: v.string(),
    totalPrice: v.number(),
    clientEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get salon and owner details
    const salon = await ctx.runQuery(api.salons.getSalonById, {
      salonId: args.salonId,
    });

    if (!salon) return;

    const owner = await ctx.runQuery(api.users.getUserById, {
      userId: salon.ownerId,
    });

    if (!owner) return;

    // Check notification preferences
    const prefs = await ctx.runQuery(internal.notificationSystem.getNotificationPreferences, {
      userId: salon.ownerId,
    });

    if (!prefs?.emailNotifications.quoteCreated) {
      return { sent: false, reason: "Quote notifications disabled" };
    }

    // Prepare email content
    const emailContent = {
      subject: `New Quote Request - ${args.serviceType} - $${args.totalPrice}`,
      text: `A new quote has been requested:\n\nService: ${args.serviceType}\nPrice: $${args.totalPrice}\nClient Email: ${args.clientEmail || 'Not provided'}\n\nView details in your dashboard.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Quote Request</h2>
          <p>A potential client has requested a quote:</p>
          <ul>
            <li><strong>Service:</strong> ${args.serviceType}</li>
            <li><strong>Price:</strong> $${args.totalPrice}</li>
            <li><strong>Client Email:</strong> ${args.clientEmail || 'Not provided'}</li>
          </ul>
          <p>Log in to your dashboard to view more details and follow up with the client.</p>
        </div>
      `,
    };

    // Send email
    const result = await sendEmail({
      to: owner.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Log the notification
    await ctx.runMutation(internal.notificationSystem.logNotification, {
      salonId: args.salonId,
      userId: salon.ownerId,
      type: "email",
      category: "quote_created",
      subject: emailContent.subject,
      content: emailContent.text,
      recipient: owner.email,
      status: result.success ? "sent" : "failed",
      metadata: {
        quoteToken: args.quoteToken,
        errorMessage: result.error,
      },
    });

    return { sent: result.success };
  },
});

// Get notification preferences (internal)
export const getNotificationPreferences = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Log notification (internal)
export const logNotification = internalMutation({
  args: {
    salonId: v.id("salons"),
    userId: v.optional(v.id("users")),
    type: v.union(v.literal("email"), v.literal("sms"), v.literal("in_app"), v.literal("push")),
    category: v.union(
      v.literal("booking_confirmation"),
      v.literal("booking_cancellation"),
      v.literal("booking_reminder"),
      v.literal("quote_created"),
      v.literal("payment_received"),
      v.literal("daily_summary"),
      v.literal("weekly_report"),
      v.literal("system_alert")
    ),
    subject: v.string(),
    content: v.string(),
    recipient: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("bounced")
    ),
    metadata: v.optional(v.object({
      bookingId: v.optional(v.id("bookings")),
      quoteToken: v.optional(v.string()),
      transactionId: v.optional(v.id("transactions")),
      errorMessage: v.optional(v.string()),
      retryCount: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notificationLogs", {
      ...args,
      sentAt: args.status === "sent" ? Date.now() : undefined,
      createdAt: Date.now(),
    });
  },
});

// Get notification logs for a salon
export const getNotificationLogs = query({
  args: {
    salonId: v.id("salons"),
    limit: v.optional(v.number()),
    category: v.optional(v.union(
      v.literal("booking_confirmation"),
      v.literal("booking_cancellation"),
      v.literal("booking_reminder"),
      v.literal("quote_created"),
      v.literal("payment_received"),
      v.literal("daily_summary"),
      v.literal("weekly_report"),
      v.literal("system_alert")
    )),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let query = ctx.db
      .query("notificationLogs")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    return await query.order("desc").take(limit);
  },
});

// Helper function to generate booking email content
function generateBookingEmailContent(booking: any, salon: any, type: string) {
  const formattedDate = new Date(booking.appointmentDate).toLocaleDateString();
  const formattedTime = new Date(booking.appointmentDate).toLocaleTimeString();
  
  if (type === "confirmation") {
    return {
      subject: `New Booking - ${booking.clientName} - ${formattedDate}`,
      text: `New booking received!\n\nClient: ${booking.clientName}\nService: ${booking.serviceDetails?.style || 'N/A'}\nDate: ${formattedDate}\nTime: ${formattedTime}\nPhone: ${booking.clientPhone}\nEmail: ${booking.clientEmail}\nTotal: $${booking.serviceDetails?.finalPrice || 0}\n\nLog in to your dashboard to manage this booking.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">New Booking Confirmed! 🎉</h1>
          </div>
          <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Booking Details</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Client:</strong> ${booking.clientName}</p>
              <p><strong>Service:</strong> ${booking.serviceDetails?.style || 'N/A'}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              <p><strong>Duration:</strong> ${booking.serviceDetails?.estimatedDuration ? `${booking.serviceDetails.estimatedDuration} minutes` : 'TBD'}</p>
              <p><strong>Total Price:</strong> $${booking.serviceDetails?.finalPrice || 0}</p>
            </div>
            <h3 style="color: #333;">Contact Information</h3>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p><strong>Phone:</strong> ${booking.clientPhone}</p>
              <p><strong>Email:</strong> ${booking.clientEmail}</p>
            </div>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Dashboard</a>
            </div>
          </div>
        </div>
      `,
    };
  } else if (type === "cancellation") {
    return {
      subject: `Booking Cancelled - ${booking.clientName} - ${formattedDate}`,
      text: `A booking has been cancelled.\n\nClient: ${booking.clientName}\nService: ${booking.serviceDetails?.style || 'N/A'}\nOriginal Date: ${formattedDate}\nOriginal Time: ${formattedTime}\n\nThe time slot is now available for other bookings.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #ff6b6b; color: white; padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Booking Cancelled</h1>
          </div>
          <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p><strong>Client:</strong> ${booking.clientName}</p>
              <p><strong>Service:</strong> ${booking.serviceDetails?.style || 'N/A'}</p>
              <p><strong>Original Date:</strong> ${formattedDate}</p>
              <p><strong>Original Time:</strong> ${formattedTime}</p>
            </div>
            <p style="margin-top: 20px; color: #666;">The time slot is now available for other bookings.</p>
          </div>
        </div>
      `,
    };
  } else {
    return {
      subject: `Booking Reminder - ${booking.clientName} - Tomorrow`,
      text: `Reminder: You have a booking tomorrow.\n\nClient: ${booking.clientName}\nService: ${booking.serviceType}\nTime: ${formattedTime}`,
      html: `<p>Reminder: You have a booking tomorrow with ${booking.clientName} at ${formattedTime}</p>`,
    };
  }
}

// Mock email sending function (replace with actual email service)
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // In production, integrate with Resend, SendGrid, AWS SES, etc.
  console.log("Sending email:", params);
  
  // For now, simulate sending
  try {
    // Here you would call your email service API
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const data = await resend.emails.send({
    //   from: 'Braid Pilot <notifications@braidpilot.com>',
    //   to: params.to,
    //   subject: params.subject,
    //   html: params.html,
    //   text: params.text,
    // });
    
    return { 
      success: true, 
      messageId: `msg_${Date.now()}` 
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}