import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    salonId: v.id("salons"),
    onboardingComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),
  
  salons: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  
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
})