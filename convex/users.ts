import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to get or create user profile
async function getOrCreateUserProfile(ctx: any, userId: string) {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
  
  if (profile) {
    return profile;
  }
  
  // Create new profile
  const profileId = await ctx.db.insert("userProfiles", {
    userId,
    onboardingComplete: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  
  return await ctx.db.get(profileId);
}

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
    
    // Get or create user profile
    const profile = await getOrCreateUserProfile(ctx, userId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    // Check if profile already has a salon
    if (profile.salonId) {
      return profile.salonId;
    }
    
    // Create salon record
    const salonId = await ctx.db.insert("salons", {
      ...args.salonData,
      ownerId: profile._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update profile with salon ID
    await ctx.db.patch(profile._id, {
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
    
    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) {
      return { hasRecord: false, onboardingComplete: false };
    }
    
    // Check if profile has completed onboarding
    if (profile.salonId) {
      const pricingConfigs = await ctx.db
        .query("pricingConfigs")
        .withIndex("by_salonId", (q) => q.eq("salonId", profile.salonId!))
        .collect();
      
      // Consider onboarding complete if user has at least 3 pricing configs
      // or if the onboardingComplete flag is true
      const isComplete = profile.onboardingComplete || pricingConfigs.length >= 3;
      
      return { 
        hasRecord: true, 
        onboardingComplete: isComplete,
        salonId: profile.salonId,
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
    
    // Get or create user profile
    const profile = await getOrCreateUserProfile(ctx, userId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    // Update onboarding status
    await ctx.db.patch(profile._id, {
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
    
    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    let salon = null;
    if (profile?.salonId) {
      salon = await ctx.db.get(profile.salonId);
    }
    
    return {
      user,
      profile,
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
    if (!user) {
      return null;
    }
    
    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    // Return merged data
    return {
      ...user,
      salonId: profile?.salonId,
      onboardingComplete: profile?.onboardingComplete || false,
    };
  },
});