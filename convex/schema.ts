import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Merge auth tables with custom tables
const schema = defineSchema({
  ...authTables,
  
  // Extended user profile data
  userProfiles: defineTable({
    userId: v.id("users"),
    salonId: v.optional(v.id("salons")),
    onboardingComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_salonId", ["salonId"]),
  
  salons: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.string(),
    ownerId: v.id("userProfiles"),
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

export default schema;