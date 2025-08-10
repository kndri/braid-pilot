import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Get user record
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if user already has a salon
    if (user.salonId) {
      return user.salonId;
    }
    
    // Create salon record
    const salonId = await ctx.db.insert("salons", {
      ...args.salonData,
      ownerId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update user record with salon ID
    await ctx.db.patch(userId, {
      salonId,
      updatedAt: Date.now(),
    });
    
    return salonId;
  },
});

export const checkOnboardingStatus = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    // Get user record
    const user = await ctx.db.get(userId);
    if (!user) {
      return { hasRecord: false, onboardingComplete: false };
    }
    
    // Check if user has completed onboarding
    if (user.salonId) {
      const pricingConfigs = await ctx.db
        .query("pricingConfigs")
        .withIndex("by_salonId", (q) => q.eq("salonId", user.salonId!))
        .collect();
      
      // Consider onboarding complete if user has at least 3 pricing configs
      // or if the onboardingComplete flag is true
      const isComplete = user.onboardingComplete || pricingConfigs.length >= 3;
      
      return { 
        hasRecord: true, 
        onboardingComplete: isComplete,
        salonId: user.salonId,
        pricingConfigCount: pricingConfigs.length
      };
    }
    
    return { 
      hasRecord: true, 
      onboardingComplete: false,
      salonId: undefined,
      pricingConfigCount: 0
    };
  },
});

export const completeOnboarding = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Update onboarding status
    await ctx.db.patch(userId, {
      onboardingComplete: true,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    
    let salon = null;
    if (user.salonId) {
      salon = await ctx.db.get(user.salonId);
    }
    
    return {
      user,
      salon,
    };
  },
});

export const viewer = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    const user = await ctx.db.get(userId);
    return user;
  },
});