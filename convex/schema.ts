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
    ownerId: v.id("users"), // Link to users table
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_ownerId", ["ownerId"]),
  
  pricingConfigs: defineTable({
    salonId: v.id("salons"),
    serviceName: v.string(),
    basePrice: v.number(),
    duration: v.number(),
    category: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_salonId", ["salonId"]),
});