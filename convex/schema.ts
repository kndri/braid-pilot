import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.optional(v.string()), // Clerk user ID - optional during migration
    email: v.string(),
    name: v.optional(v.string()), // Optional for migration
    salonId: v.optional(v.id("salons")),
    onboardingComplete: v.optional(v.boolean()), // Optional for migration
    createdAt: v.optional(v.number()), // Optional for migration
    updatedAt: v.optional(v.number()), // Optional for migration
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),
  
  salons: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.string(),
    website: v.optional(v.string()),
    hours: v.optional(v.string()), // JSON string of business hours
    ownerId: v.id("users"), // Link to users table
    businessName: v.optional(v.string()),
    onboardingToken: v.optional(v.string()),
    quoteToolUrl: v.optional(v.string()),
    standardHairType: v.optional(v.string()), // Standard hair type for base pricing
    
    // AI Agent Configuration (Legacy Twilio)
    isAIagentEnabled: v.optional(v.boolean()),
    twilioPhoneNumber: v.optional(v.string()),
    twilioAccountSid: v.optional(v.string()),
    twilioAuthToken: v.optional(v.string()),
    
    // Vapi Platform Configuration
    vapiPhoneNumberId: v.optional(v.string()),
    vapiPhoneNumber: v.optional(v.string()),
    vapiAssistantId: v.optional(v.string()),
    vapiWebhookSecret: v.optional(v.string()),
    vapiIsActive: v.optional(v.boolean()),
    
    // Voice Configuration
    voiceProvider: v.optional(v.union(v.literal("elevenlabs"), v.literal("playht"), v.literal("azure"))),
    voiceId: v.optional(v.string()),
    voiceSettings: v.optional(v.object({
      speed: v.number(), // 0.5 to 2.0
      pitch: v.number(), // -20 to 20
      temperature: v.number(), // 0.0 to 1.0
      stability: v.number(), // 0.0 to 1.0
    })),
    
    // Business Context for AI
    businessContext: v.optional(v.object({
      businessHours: v.object({
        monday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        tuesday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        wednesday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        thursday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        friday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        saturday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        sunday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
      }),
      policies: v.object({
        cancellationPolicy: v.string(),
        depositRequired: v.boolean(),
        depositAmount: v.number(),
        latePolicy: v.string(),
        refundPolicy: v.string(),
      }),
      promotions: v.optional(v.array(v.object({
        title: v.string(),
        description: v.string(),
        discount: v.number(),
        validUntil: v.number(),
        conditions: v.array(v.string()),
      }))),
    })),
    
    // Reputation Management Configuration
    googleReviewUrl: v.optional(v.string()),
    yelpReviewUrl: v.optional(v.string()),
    reviewRequestDelay: v.optional(v.number()), // Minutes after completion
    
    // AI Agent Settings
    aiAgentPrompt: v.optional(v.string()), // Custom prompt for LLM
    aiAgentLanguage: v.optional(v.string()), // Default: "en"
    aiAgentPersonality: v.optional(v.string()), // "professional", "friendly", "casual"
    
    // Emergency Capacity Management
    maxConcurrentBookings: v.optional(v.number()), // Default: 3
    bufferMinutes: v.optional(v.number()), // Default: 30 minutes between appointments
    emergencyCapacityEnabled: v.optional(v.boolean()), // Default: true
    defaultServiceDuration: v.optional(v.number()), // Default: 240 minutes
    
    // Commission/Split Configuration
    defaultSplitPercentage: v.optional(v.number()), // Default percentage for braiders (0-100)
    splitType: v.optional(v.union(v.literal("percentage"), v.literal("fixed"))), // How splits are calculated
    
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_ownerId", ["ownerId"]),
  
  // Updated pricing configs for granular style-specific pricing
  pricingConfigs: defineTable({
    salonId: v.id("salons"),
    styleName: v.string(), // E.g., "Box Braids", "Knotless Braids", "Boho Knotless"
    adjustmentType: v.union(
      v.literal("base_price"),      // Base price for Jumbo/Shoulder-Length
      v.literal("length_adj"),      // Length adjustments (Bra, Mid-Back, Waist)
      v.literal("size_adj"),        // Size adjustments (Small, Medium, Large, XL)
      v.literal("hair_type_adj"),   // Global hair type adjustments
      v.literal("curly_hair_adj")   // Boho Knotless specific
    ),
    adjustmentLabel: v.string(), // E.g., "Bra-Length", "Small", "100% Human Hair"
    adjustmentValue: v.number(), // Price adjustment value
    isActive: v.optional(v.boolean()),
    metadata: v.optional(v.any()), // For storing additional config data
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salonId_and_style", ["salonId", "styleName"])
    .index("by_salonId", ["salonId"]),
  
  // Store selected styles for each salon
  salonStyles: defineTable({
    salonId: v.id("salons"),
    styleName: v.string(),
    isCustom: v.boolean(), // Whether it's a custom style
    displayOrder: v.number(), // For ordering in UI
    createdAt: v.number(),
  }).index("by_salonId", ["salonId"]),
  
  // Clients table with enhanced fields for CRM
  clients: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.string(),
    notes: v.optional(v.string()), // General notes about the client
    tags: v.optional(v.array(v.string())), // Client categories (VIP, regular, new)
    preferredStyles: v.optional(v.array(v.string())), // Preferred braiding styles
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),
  
  // Calendar slots for availability management
  calendarSlots: defineTable({
    salonId: v.id("salons"),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    startTime: v.string(), // Time string (HH:MM)
    endTime: v.string(), // Time string (HH:MM)
    isAvailable: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salonId_and_date", ["salonId", "date"])
    .index("by_salonId", ["salonId"]),
  
  // Bookings table for appointments
  bookings: defineTable({
    salonId: v.id("salons"),
    clientId: v.id("clients"),
    braiderId: v.optional(v.id("braiders")), // Assigned braider for multi-braider salons
    slotId: v.optional(v.id("calendarSlots")),
    serviceDetails: v.object({
      style: v.string(),
      size: v.string(),
      length: v.string(),
      hairType: v.string(),
      includeCurlyHair: v.optional(v.boolean()),
      finalPrice: v.number(),
      estimatedDuration: v.optional(v.number()), // Service duration in minutes
    }),
    appointmentDate: v.string(), // ISO date string
    appointmentTime: v.string(), // Time string
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
    notes: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    platformFee: v.number(),
    payoutAmount: v.number(),
    
    // Payment tracking for braiders
    paymentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("pending_payout"),
      v.literal("paid")
    )),
    braiderEarnings: v.optional(v.number()), // Amount earned by braider for this booking
    payoutDate: v.optional(v.number()), // When the braider was paid
    
    // Emergency Capacity Tracking
    serviceDurationMinutes: v.optional(v.number()), // Required field for duration
    concurrentBookingCount: v.optional(v.number()), // Track how many at this time
    capacityGroupId: v.optional(v.string()), // Group overlapping bookings
    
    // Braider Assignment
    assignedBraiderId: v.optional(v.id("braiders")),
    preferredBraiderId: v.optional(v.id("braiders")),
    braiderNotes: v.optional(v.string()),
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salonId", ["salonId"])
    .index("by_clientId", ["clientId"])
    .index("by_braiderId", ["braiderId"])
    .index("by_status", ["status"])
    .index("by_salonId_and_status", ["salonId", "status"])
    .index("by_date", ["appointmentDate"]),
  
  // Transactions table for payment tracking
  transactions: defineTable({
    bookingId: v.id("bookings"),
    braiderId: v.optional(v.id("braiders")), // Link to braider who performed service
    amount: v.number(), // Total amount paid by client
    platformFee: v.number(), // $5 platform fee
    payoutAmount: v.number(), // Amount to be paid to salon
    braiderPayout: v.optional(v.number()), // Amount to be paid to braider
    stripePaymentId: v.string(),
    stripePayoutId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("no_show")
    ),
    payoutStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed")
    )),
    payoutDate: v.optional(v.number()), // When payout was processed
    payoutMethod: v.optional(v.string()), // How braider was paid (cash, bank transfer, etc)
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_bookingId", ["bookingId"])
    .index("by_status", ["status"])
    .index("by_braiderId", ["braiderId"])
    .index("by_payoutStatus", ["payoutStatus"]),
  
  // Enhanced braiders table for multi-braider salon support
  braiders: defineTable({
    salonId: v.id("salons"),
    userId: v.optional(v.id("users")), // Link to user account if braider has one
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    
    // Service capabilities
    specialties: v.optional(v.array(v.string())), // List of specialized styles
    splitPercentage: v.optional(v.number()), // Percentage of service price that goes to braider (0-100)
    
    // Availability management
    isActive: v.boolean(),
    maxDailyBookings: v.optional(v.number()),
    preferredServices: v.optional(v.array(v.string())),
    
    // Default availability (simplified for MVP)
    defaultStartTime: v.optional(v.string()), // Default: "09:00"
    defaultEndTime: v.optional(v.string()), // Default: "18:00"
    workingDays: v.optional(v.array(v.number())), // 0-6 (Sunday-Saturday)
    
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salonId", ["salonId"])
    .index("by_userId", ["userId"]),
  
  // Client notes for specific bookings
  clientNotes: defineTable({
    salonId: v.id("salons"),
    clientId: v.id("clients"),
    bookingId: v.optional(v.id("bookings")),
    note: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salon_and_client", ["salonId", "clientId"])
    .index("by_booking", ["bookingId"]),

  // Communication logs for AI agent interactions
  communicationLogs: defineTable({
    salonId: v.id("salons"),
    clientPhone: v.string(),
    communicationType: v.union(v.literal("call"), v.literal("sms")),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    content: v.string(), // Transcribed speech or SMS content
    aiResponse: v.optional(v.string()), // AI-generated response
    status: v.union(v.literal("received"), v.literal("processed"), v.literal("completed")),
    metadata: v.optional(v.object({
      callDuration: v.optional(v.number()),
      smsCount: v.optional(v.number()),
      clientIntent: v.optional(v.string()),
      followUpSent: v.optional(v.boolean()),
      callSid: v.optional(v.string()),
      messageSid: v.optional(v.string()),
    })),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_salonId", ["salonId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_salon_and_phone", ["salonId", "clientPhone"]),

  // Capacity slots for emergency management
  capacitySlots: defineTable({
    salonId: v.id("salons"),
    date: v.string(), // ISO date string
    startTime: v.string(), // HH:MM format
    endTime: v.string(), // HH:MM format
    maxBookings: v.number(),
    currentBookings: v.number(),
    isBlocked: v.boolean(),
    blockedReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salonId_and_date", ["salonId", "date"])
    .index("by_salonId", ["salonId"]),
  
  // Services table for service management
  services: defineTable({
    salonId: v.id("salons"),
    name: v.string(),
    description: v.optional(v.string()),
    
    // Service requirements
    requiredSkillLevel: v.optional(v.union(v.literal("junior"), v.literal("senior"), v.literal("expert"))),
    estimatedDuration: v.number(), // Minutes
    complexity: v.optional(v.union(v.literal("simple"), v.literal("moderate"), v.literal("complex"))),
    
    // Pricing
    basePrice: v.number(),
    
    // Braider qualifications (simplified for MVP)
    requiresSpecialization: v.optional(v.boolean()),
    specialization: v.optional(v.string()),
    
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salonId", ["salonId"]),
  
  // Braider availability exceptions
  braiderAvailability: defineTable({
    braiderId: v.id("braiders"),
    date: v.string(), // ISO date string
    startTime: v.optional(v.string()), // HH:MM format
    endTime: v.optional(v.string()), // HH:MM format
    isAvailable: v.boolean(),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_braiderId_and_date", ["braiderId", "date"])
    .index("by_braiderId", ["braiderId"]),
  
  // Review requests for reputation management
  reviewRequests: defineTable({
    bookingId: v.id("bookings"),
    salonId: v.id("salons"),
    clientId: v.id("clients"),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("delivered"), v.literal("failed")),
    channels: v.array(v.union(v.literal("email"), v.literal("sms"))),
    sentAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    retryCount: v.number(),
    maxRetries: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_bookingId", ["bookingId"])
    .index("by_salonId", ["salonId"])
    .index("by_status", ["status"]),
  
  // Multi-tenant messaging usage tracking
  salonUsageTracking: defineTable({
    salonId: v.id("salons"),
    month: v.string(), // YYYY-MM format
    reviewRequestsSent: v.number(),
    emailsSent: v.number(),
    smsSent: v.number(),
    emailCost: v.number(), // Track actual costs
    smsCost: v.number(),
    totalCost: v.number(),
    tier: v.string(), // Current pricing tier
    overage: v.number(), // Requests over limit
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salon_month", ["salonId", "month"]),
  
  // Platform-wide messaging templates
  messageTemplates: defineTable({
    name: v.string(),
    type: v.union(v.literal("email"), v.literal("sms")),
    subject: v.optional(v.string()), // For emails
    content: v.string(),
    variables: v.array(v.string()), // ["{salonName}", "{clientName}", etc]
    isDefault: v.boolean(),
    customizable: v.boolean(), // Can salons override?
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_type", ["type"]),
  
  // Salon-specific messaging settings
  salonMessagingSettings: defineTable({
    salonId: v.id("salons"),
    // Branding
    usePlatformBranding: v.boolean(), // true = BraidPilot branding
    customLogo: v.optional(v.string()), // URL to salon logo
    brandColor: v.optional(v.string()), // Hex color for emails
    
    // Custom templates (if allowed by tier)
    customEmailTemplate: v.optional(v.string()),
    customSmsTemplate: v.optional(v.string()),
    
    // Sender identity (appears in message but sent from platform)
    displayName: v.string(), // "Sarah's Braids via BraidPilot"
    replyToEmail: v.optional(v.string()), // Salon's actual email
    
    // Settings
    reviewRequestDelay: v.number(), // Minutes after service
    enableAutoRequest: v.boolean(),
    includeIncentive: v.boolean(), // "Get 10% off next visit"
    incentiveText: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salonId", ["salonId"]),
  
  // Platform-wide opt-out list for compliance
  optOutList: defineTable({
    contactInfo: v.string(), // Email or phone (normalized/lowercase)
    type: v.union(v.literal("email"), v.literal("sms")),
    optedOutAt: v.number(),
    source: v.string(), // How they opted out
    createdAt: v.number(),
  }).index("by_contact_type", ["contactInfo", "type"]),

  // Vapi Call Management
  vapiCalls: defineTable({
    callId: v.string(), // Vapi call identifier
    salonId: v.id("salons"),
    phoneNumber: v.string(),
    status: v.union(v.literal("ringing"), v.literal("answered"), v.literal("completed"), v.literal("failed")),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    duration: v.optional(v.number()),
    
    // Conversation tracking
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
      confidence: v.optional(v.number()),
    })),
    
    // Call outcomes
    outcome: v.optional(v.union(v.literal("booking"), v.literal("inquiry"), v.literal("no_interest"), v.literal("transfer"))),
    bookingId: v.optional(v.id("bookings")),
    transferReason: v.optional(v.string()),
    
    // Performance metrics
    responseTimes: v.array(v.number()),
    averageResponseTime: v.optional(v.number()),
    interruptionCount: v.number(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_callId", ["callId"])
    .index("by_salonId", ["salonId"])
    .index("by_phone", ["phoneNumber"]),

  // Vapi Webhook Events
  vapiWebhookEvents: defineTable({
    callId: v.string(),
    eventType: v.union(v.literal("speech-update"), v.literal("function-call"), v.literal("call-end"), v.literal("error")),
    payload: v.any(), // Raw webhook payload
    processed: v.boolean(),
    error: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_callId", ["callId"])
    .index("by_eventType", ["eventType"]),

  // Vapi Sync Management
  vapiSyncLogs: defineTable({
    salonId: v.id("salons"),
    changeType: v.string(),
    scheduledAt: v.number(),
    executeAt: v.number(),
    completedAt: v.optional(v.number()),
    status: v.string(),
    error: v.optional(v.string()),
  }).index("by_salonId", ["salonId"]),

  vapiUpdateBatches: defineTable({
    salonId: v.id("salons"),
    changeTypes: v.array(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  }).index("by_salonId", ["salonId"]),

  vapiSyncMetrics: defineTable({
    salonId: v.id("salons"),
    date: v.string(),
    totalSyncs: v.number(),
    successfulSyncs: v.number(),
    failedSyncs: v.number(),
    lastSyncAt: v.number(),
  }).index("by_salonId_date", ["salonId", "date"]),

  vapiPromptUpdates: defineTable({
    salonId: v.id("salons"),
    updateType: v.string(),
    success: v.boolean(),
    error: v.optional(v.string()),
    timestamp: v.number(),
  }),

  vapiUpdateSchedules: defineTable({
    salonId: v.id("salons"),
    scheduledFor: v.number(),
    status: v.string(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  }).index("by_salonId", ["salonId"]),

  // Quote Tracking for Funnel Analytics
  quoteTracking: defineTable({
    quoteToken: v.string(), // Unique identifier for the quote
    salonId: v.optional(v.id("salons")), // Optional as quotes can be anonymous
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    clientName: v.optional(v.string()),
    serviceType: v.string(),
    size: v.string(),
    length: v.string(),
    addOns: v.optional(v.array(v.string())),
    totalPrice: v.number(),
    status: v.union(
      v.literal("created"),
      v.literal("viewed"),
      v.literal("converted"),
      v.literal("abandoned")
    ),
    source: v.optional(v.union(
      v.literal("website"),
      v.literal("direct_link"),
      v.literal("social_media"),
      v.literal("qr_code"),
      v.literal("voice_assistant")
    )),
    viewCount: v.number(),
    lastViewedAt: v.optional(v.number()),
    convertedToBookingId: v.optional(v.id("bookings")),
    conversionTime: v.optional(v.number()), // Time from quote to booking
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_quoteToken", ["quoteToken"])
    .index("by_salonId", ["salonId"])
    .index("by_status", ["status"])
    .index("by_clientEmail", ["clientEmail"])
    .index("by_createdAt", ["createdAt"]),

  // Notification Preferences
  notificationPreferences: defineTable({
    salonId: v.id("salons"),
    userId: v.id("users"),
    emailNotifications: v.object({
      newBooking: v.boolean(),
      bookingCancellation: v.boolean(),
      quoteCreated: v.boolean(),
      dailySummary: v.boolean(),
      weeklyReport: v.boolean(),
      paymentReceived: v.boolean(),
    }),
    smsNotifications: v.object({
      newBooking: v.boolean(),
      bookingCancellation: v.boolean(),
      urgentAlerts: v.boolean(),
    }),
    inAppNotifications: v.object({
      all: v.boolean(),
    }),
    quietHours: v.optional(v.object({
      enabled: v.boolean(),
      startTime: v.number(), // Hour in 24h format (0-23)
      endTime: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_salonId", ["salonId"]),

  // Notification Log
  notificationLogs: defineTable({
    salonId: v.id("salons"),
    userId: v.optional(v.id("users")),
    type: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("in_app"),
      v.literal("push")
    ),
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
    recipient: v.string(), // Email or phone number
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
    sentAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_salonId", ["salonId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_createdAt", ["createdAt"]),

  // Funnel Analytics
  funnelAnalytics: defineTable({
    salonId: v.id("salons"),
    date: v.string(), // YYYY-MM-DD format
    metrics: v.object({
      quotesCreated: v.number(),
      quotesViewed: v.number(),
      bookingsCreated: v.number(),
      bookingsCompleted: v.number(),
      bookingsCancelled: v.number(),
      conversionRate: v.number(), // Percentage
      averageQuoteToBookingTime: v.number(), // Minutes
      totalRevenue: v.number(),
      averageBookingValue: v.number(),
    }),
    topServices: v.array(v.object({
      serviceName: v.string(),
      count: v.number(),
      revenue: v.number(),
    })),
    sourceBreakdown: v.object({
      website: v.number(),
      directLink: v.number(),
      socialMedia: v.number(),
      qrCode: v.number(),
      voiceAssistant: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salonId_date", ["salonId", "date"])
    .index("by_salonId", ["salonId"]),
});