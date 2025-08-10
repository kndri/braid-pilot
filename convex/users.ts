import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createInitialSalonRecord = mutation({
  args: {
    salonData: v.object({
      name: v.string(),
      email: v.string(),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
    })
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }
    
    const clerkId = identity.subject
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first()
    
    if (existingUser) {
      return existingUser.salonId
    }
    
    // Create salon record
    const salonId = await ctx.db.insert("salons", {
      ...args.salonData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    // Create user record linking clerkId to salonId
    await ctx.db.insert("users", {
      clerkId,
      salonId,
      onboardingComplete: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    return salonId
  },
})

export const checkOnboardingStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }
    
    const clerkId = identity.subject
    
    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first()
    
    if (!user) {
      return { hasRecord: false, onboardingComplete: false }
    }
    
    // Check if user has completed onboarding
    // This could be based on having pricing configs or a specific flag
    const pricingConfigs = await ctx.db
      .query("pricingConfigs")
      .withIndex("by_salonId", (q) => q.eq("salonId", user.salonId))
      .collect()
    
    // Consider onboarding complete if user has at least 3 pricing configs
    // or if the onboardingComplete flag is true
    const isComplete = user.onboardingComplete || pricingConfigs.length >= 3
    
    return { 
      hasRecord: true, 
      onboardingComplete: isComplete,
      salonId: user.salonId,
      pricingConfigCount: pricingConfigs.length
    }
  },
})

export const completeOnboarding = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }
    
    const clerkId = identity.subject
    
    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first()
    
    if (!user) {
      throw new Error("User not found")
    }
    
    // Update onboarding status
    await ctx.db.patch(user._id, {
      onboardingComplete: true,
      updatedAt: Date.now(),
    })
    
    return { success: true }
  },
})

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }
    
    const clerkId = identity.subject
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first()
    
    if (!user) {
      return null
    }
    
    const salon = await ctx.db.get(user.salonId)
    
    return {
      user,
      salon,
      identity: {
        email: identity.email,
        name: identity.name,
        profileUrl: identity.pictureUrl,
      }
    }
  },
})