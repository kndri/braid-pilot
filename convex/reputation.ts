import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Update reputation management settings for a salon
export const updateReputationSettings = mutation({
  args: {
    salonId: v.id("salons"),
    googleReviewUrl: v.optional(v.string()),
    yelpReviewUrl: v.optional(v.string()),
    reviewRequestDelay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) {
      throw new Error("Salon not found");
    }

    const updates: any = { updatedAt: Date.now() };
    
    if (args.googleReviewUrl !== undefined) updates.googleReviewUrl = args.googleReviewUrl;
    if (args.yelpReviewUrl !== undefined) updates.yelpReviewUrl = args.yelpReviewUrl;
    if (args.reviewRequestDelay !== undefined) updates.reviewRequestDelay = args.reviewRequestDelay;

    await ctx.db.patch(args.salonId, updates);
    return { success: true };
  },
});

// Update booking status to completed and trigger review request
export const markBookingComplete = mutation({
  args: {
    bookingId: v.id("bookings"),
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    // 1. Verify the booking exists and is paid
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // 2. Check if payment is completed
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_bookingId", (q) => q.eq("bookingId", args.bookingId))
      .filter((q) => q.eq(q.field("status"), "succeeded"))
      .first();

    if (!transaction) {
      throw new Error("Booking must be paid before marking as complete");
    }

    // 3. Update booking status
    await ctx.db.patch(args.bookingId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    // 4. Get salon settings to determine delay
    const salon = await ctx.db.get(args.salonId);
    const delayMinutes = salon?.reviewRequestDelay || 0;

    // 5. Schedule review request
    if (delayMinutes > 0) {
      await ctx.scheduler.runAfter(delayMinutes * 60 * 1000, api.reputation.sendReviewRequest, {
        bookingId: args.bookingId,
        salonId: args.salonId,
      });
    } else {
      // Send immediately
      await ctx.scheduler.runAfter(0, api.reputation.sendReviewRequest, {
        bookingId: args.bookingId,
        salonId: args.salonId,
      });
    }

    return { success: true };
  },
});

// Send review request to client
export const sendReviewRequest = action({
  args: {
    bookingId: v.id("bookings"),
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Fetch booking and client details
      const booking = await ctx.runQuery(api.booking.getBookingById, { 
        bookingId: args.bookingId 
      });
      
      if (!booking) {
        throw new Error("Booking not found");
      }

      const client = await ctx.runQuery(api.clients.getClientById, { 
        clientId: booking.clientId 
      });
      
      const salon = await ctx.runQuery(api.salons.getSalonById, { 
        salonId: args.salonId 
      });

      if (!client || !salon) {
        throw new Error("Required data not found");
      }

      // Only proceed if review URLs are configured
      if (!salon.googleReviewUrl && !salon.yelpReviewUrl) {
        console.log("No review URLs configured for salon");
        return { success: false, reason: "No review URLs configured" };
      }

      // 2. Create review request record
      const channels: ("email" | "sms")[] = [];
      if (client.email) channels.push("email");
      if (client.phone) channels.push("sms");

      const reviewRequestId = await ctx.runMutation(api.reputation.createReviewRequest, {
        bookingId: args.bookingId,
        salonId: args.salonId,
        clientId: booking.clientId,
        channels,
      });

      // 3. Send review request via configured channels
      let emailSent = false;
      let smsSent = false;

      if (client.email && (salon.googleReviewUrl || salon.yelpReviewUrl)) {
        try {
          await sendEmailReviewRequest(ctx, client.email, salon, client.name);
          emailSent = true;
        } catch (error) {
          console.error("Email review request failed:", error);
        }
      }

      if (client.phone && (salon.googleReviewUrl || salon.yelpReviewUrl)) {
        try {
          await sendSMSReviewRequest(ctx, client.phone, salon, client.name);
          smsSent = true;
        } catch (error) {
          console.error("SMS review request failed:", error);
        }
      }

      // 4. Update review request status
      if (emailSent || smsSent) {
        await ctx.runMutation(api.reputation.updateReviewRequestStatus, {
          reviewRequestId,
          status: "sent",
          sentAt: Date.now(),
        });
      } else {
        await ctx.runMutation(api.reputation.updateReviewRequestStatus, {
          reviewRequestId,
          status: "failed",
          failureReason: "No valid channels available",
        });
      }

      return { success: emailSent || smsSent, emailSent, smsSent };
    } catch (error) {
      console.error("Review request error:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Send email review request
async function sendEmailReviewRequest(ctx: any, email: string, salon: any, clientName: string) {
  const reviewButtons = [];
  
  if (salon.googleReviewUrl) {
    reviewButtons.push(`
      <a href="${salon.googleReviewUrl}" 
         style="background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-right: 15px; display: inline-block; margin-bottom: 10px;">
        ⭐ Review on Google
      </a>
    `);
  }
  
  if (salon.yelpReviewUrl) {
    reviewButtons.push(`
      <a href="${salon.yelpReviewUrl}" 
         style="background: #ff6600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-bottom: 10px;">
        🌟 Review on Yelp
      </a>
    `);
  }

  const emailContent = {
    personalizations: [{
      to: [{ email: email, name: clientName }],
      subject: `How was your experience at ${salon.name}? ⭐`,
    }],
    from: { 
      email: "reviews@braidpilot.com", 
      name: salon.name 
    },
    content: [{
      type: "text/html",
      value: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Thank You, ${clientName}! ✨</h1>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #333; line-height: 1.6; margin-bottom: 25px;">
              We hope you absolutely love your new look from <strong>${salon.name}</strong>! 
            </p>
            
            <p style="font-size: 16px; color: #666; line-height: 1.6; margin-bottom: 30px;">
              Your feedback means the world to us and helps other clients discover amazing stylists like ours. 
              Would you mind taking a moment to share your experience?
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              ${reviewButtons.join('')}
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="font-size: 14px; color: #666; margin: 0; text-align: center; font-style: italic;">
                "Your review helps us grow and helps other clients find great stylists!"
              </p>
            </div>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Thank you for choosing us! 💜
            </p>
            
            <p style="font-size: 16px; color: #333; margin: 0;">
              Best regards,<br>
              <strong>The ${salon.name} Team</strong>
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              Powered by BraidPilot | This review request was sent automatically after your appointment
            </p>
          </div>
        </div>
      `
    }]
  };

  try {
    // Send email using SendGrid or similar service
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailContent)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid API error: ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error("Email review request error:", error);
    throw error;
  }
}

// Send SMS review request
async function sendSMSReviewRequest(ctx: any, phone: string, salon: any, clientName: string) {
  let smsMessage = `Hi ${clientName}! ✨ Thank you for choosing ${salon.name}.\n\nWe'd love your feedback! Please leave us a review:\n`;
  
  if (salon.googleReviewUrl) {
    smsMessage += `⭐ Google: ${salon.googleReviewUrl}\n`;
  }
  
  if (salon.yelpReviewUrl) {
    smsMessage += `🌟 Yelp: ${salon.yelpReviewUrl}\n`;
  }
  
  smsMessage += `\nYour review helps other clients find great stylists! 💜`;

  try {
    // Send SMS using Twilio
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone,
          From: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
          Body: smsMessage,
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twilio SMS error: ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error("SMS review request error:", error);
    throw error;
  }
}

// Create review request record
export const createReviewRequest = mutation({
  args: {
    bookingId: v.id("bookings"),
    salonId: v.id("salons"),
    clientId: v.id("clients"),
    channels: v.array(v.union(v.literal("email"), v.literal("sms"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviewRequests", {
      bookingId: args.bookingId,
      salonId: args.salonId,
      clientId: args.clientId,
      status: "pending",
      channels: args.channels,
      retryCount: 0,
      maxRetries: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update review request status
export const updateReviewRequestStatus = mutation({
  args: {
    reviewRequestId: v.id("reviewRequests"),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("delivered"), v.literal("failed")),
    sentAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = { 
      status: args.status,
      updatedAt: Date.now()
    };
    
    if (args.sentAt) updates.sentAt = args.sentAt;
    if (args.deliveredAt) updates.deliveredAt = args.deliveredAt;
    if (args.failureReason) updates.failureReason = args.failureReason;

    await ctx.db.patch(args.reviewRequestId, updates);
    return { success: true };
  },
});

// Get review requests for a salon
export const getReviewRequests = query({
  args: {
    salonId: v.id("salons"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("reviewRequests")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .order("desc")
      .take(args.limit || 50);

    // Enrich with booking and client data
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const booking = await ctx.db.get(request.bookingId);
        const client = booking ? await ctx.db.get(booking.clientId) : null;
        
        return {
          ...request,
          booking,
          client,
        };
      })
    );

    return enrichedRequests;
  },
});

// Get review request analytics
export const getReviewAnalytics = query({
  args: {
    salonId: v.id("salons"),
    timeframe: v.optional(v.union(v.literal("7d"), v.literal("30d"), v.literal("90d"))),
  },
  handler: async (ctx, args) => {
    const timeframe = args.timeframe || "30d";
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);

    const requests = await ctx.db
      .query("reviewRequests")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.gte(q.field("createdAt"), cutoffDate))
      .collect();

    const totalRequests = requests.length;
    const sentRequests = requests.filter(r => r.status === "sent" || r.status === "delivered").length;
    const deliveredRequests = requests.filter(r => r.status === "delivered").length;
    const failedRequests = requests.filter(r => r.status === "failed").length;

    const emailRequests = requests.filter(r => r.channels.includes("email")).length;
    const smsRequests = requests.filter(r => r.channels.includes("sms")).length;

    return {
      totalRequests,
      sentRequests,
      deliveredRequests,
      failedRequests,
      emailRequests,
      smsRequests,
      successRate: totalRequests > 0 ? (sentRequests / totalRequests) * 100 : 0,
      deliveryRate: sentRequests > 0 ? (deliveredRequests / sentRequests) * 100 : 0,
    };
  },
});

// Test review request workflow
export const testReviewRequest = action({
  args: {
    salonId: v.id("salons"),
    testEmail: v.optional(v.string()),
    testPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const salon = await ctx.runQuery(api.salons.getSalonById, { 
        salonId: args.salonId 
      });

      if (!salon) {
        throw new Error("Salon not found");
      }

      if (!salon.googleReviewUrl && !salon.yelpReviewUrl) {
        throw new Error("No review URLs configured");
      }

      let emailSent = false;
      let smsSent = false;

      if (args.testEmail) {
        try {
          await sendEmailReviewRequest(ctx, args.testEmail, salon, "Test Client");
          emailSent = true;
        } catch (error) {
          console.error("Test email failed:", error);
        }
      }

      if (args.testPhone) {
        try {
          await sendSMSReviewRequest(ctx, args.testPhone, salon, "Test Client");
          smsSent = true;
        } catch (error) {
          console.error("Test SMS failed:", error);
        }
      }

      return { 
        success: emailSent || smsSent, 
        emailSent, 
        smsSent,
        message: emailSent || smsSent ? "Test review request sent successfully!" : "Failed to send test review request"
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
});