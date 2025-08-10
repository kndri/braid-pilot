import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  users: defineTable({
    email: v.string(),
    name: v.string(),
    emailVerified: v.boolean(),
    image: v.union(v.string(), v.null()),
    salonId: v.optional(v.id("salons")),
    onboardingComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_salonId", ["salonId"]),
  
  salons: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.string(),
    ownerId: v.id("users"),
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