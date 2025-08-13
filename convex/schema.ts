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
  
  // Bookings table for appointments
  bookings: defineTable({
    salonId: v.id("salons"),
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    appointmentDate: v.string(), // ISO date string
    appointmentTime: v.string(), // Time string
    serviceQuoteDetails: v.string(),
    totalPrice: v.number(),
    platformFee: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salonId", ["salonId"])
    .index("by_status", ["status"])
    .index("by_salonId_and_status", ["salonId", "status"]),
});