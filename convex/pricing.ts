import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Save selected styles for a salon
export const saveSelectedStyles = mutation({
  args: {
    salonId: v.id("salons"),
    styles: v.array(v.object({
      styleName: v.string(),
      isCustom: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing styles
    const existingStyles = await ctx.db
      .query("salonStyles")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();
    
    for (const style of existingStyles) {
      await ctx.db.delete(style._id);
    }
    
    // Insert new styles
    for (let i = 0; i < args.styles.length; i++) {
      await ctx.db.insert("salonStyles", {
        salonId: args.salonId,
        styleName: args.styles[i].styleName,
        isCustom: args.styles[i].isCustom,
        displayOrder: i,
        createdAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

// Save pricing configuration for a style
export const savePricingConfig = mutation({
  args: {
    salonId: v.id("salons"),
    styleName: v.string(),
    adjustmentType: v.union(
      v.literal("base_price"),
      v.literal("length_adj"),
      v.literal("size_adj"),
      v.literal("hair_type_adj"),
      v.literal("curly_hair_adj")
    ),
    adjustmentLabel: v.string(),
    adjustmentValue: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if this config already exists
    const existing = await ctx.db
      .query("pricingConfigs")
      .withIndex("by_salonId_and_style", (q) => 
        q.eq("salonId", args.salonId).eq("styleName", args.styleName)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("adjustmentType"), args.adjustmentType),
          q.eq(q.field("adjustmentLabel"), args.adjustmentLabel)
        )
      )
      .first();
    
    if (existing) {
      // Update existing config
      await ctx.db.patch(existing._id, {
        adjustmentValue: args.adjustmentValue,
        metadata: args.metadata,
        updatedAt: Date.now(),
      });
    } else {
      // Create new config
      await ctx.db.insert("pricingConfigs", {
        salonId: args.salonId,
        styleName: args.styleName,
        adjustmentType: args.adjustmentType,
        adjustmentLabel: args.adjustmentLabel,
        adjustmentValue: args.adjustmentValue,
        isActive: true,
        metadata: args.metadata,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

// Save multiple pricing configs at once
export const saveBulkPricingConfigs = mutation({
  args: {
    salonId: v.id("salons"),
    configs: v.array(v.object({
      styleName: v.string(),
      adjustmentType: v.union(
        v.literal("base_price"),
        v.literal("length_adj"),
        v.literal("size_adj"),
        v.literal("hair_type_adj"),
        v.literal("curly_hair_adj")
      ),
      adjustmentLabel: v.string(),
      adjustmentValue: v.number(),
      metadata: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    for (const config of args.configs) {
      const existing = await ctx.db
        .query("pricingConfigs")
        .withIndex("by_salonId_and_style", (q) => 
          q.eq("salonId", args.salonId).eq("styleName", config.styleName)
        )
        .filter((q) => 
          q.and(
            q.eq(q.field("adjustmentType"), config.adjustmentType),
            q.eq(q.field("adjustmentLabel"), config.adjustmentLabel)
          )
        )
        .first();
      
      if (existing) {
        await ctx.db.patch(existing._id, {
          adjustmentValue: config.adjustmentValue,
          metadata: config.metadata,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("pricingConfigs", {
          salonId: args.salonId,
          styleName: config.styleName,
          adjustmentType: config.adjustmentType,
          adjustmentLabel: config.adjustmentLabel,
          adjustmentValue: config.adjustmentValue,
          isActive: true,
          metadata: config.metadata,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
    
    return { success: true };
  },
});

// Get all pricing configs for a salon
export const getSalonPricingConfigs = query({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const configs = await ctx.db
      .query("pricingConfigs")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();
    
    return configs;
  },
});

// Get selected styles for a salon
export const getSalonStyles = query({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const styles = await ctx.db
      .query("salonStyles")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();
    
    return styles.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

// Update salon standard hair type
export const updateSalonStandardHairType = mutation({
  args: {
    salonId: v.id("salons"),
    standardHairType: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, {
      standardHairType: args.standardHairType,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Generate unique quote tool URL
export const generateQuoteToolUrl = mutation({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) {
      throw new Error("Salon not found");
    }
    
    // If token already exists, return it
    if (salon.onboardingToken) {
      return { 
        success: true, 
        quoteToolUrl: salon.quoteToolUrl || `/quote/${salon.onboardingToken}`,
        token: salon.onboardingToken,
      };
    }
    
    // Generate a unique token for the quote tool
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    await ctx.db.patch(args.salonId, {
      onboardingToken: token,
      quoteToolUrl: `/quote/${token}`,
      updatedAt: Date.now(),
    });
    
    return { 
      success: true, 
      quoteToolUrl: `/quote/${token}`,
      token: token,
    };
  },
});

// Ensure salon has a quote tool URL (for existing salons)
export const ensureQuoteToolUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Don't throw during auth loading
      return { success: false, error: "Not authenticated" };
    }
    
    const clerkId = identity.subject;
    
    // Get user and salon
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (!user || !user.salonId) {
      return { success: false, error: "User or salon not found" };
    }
    
    const salon = await ctx.db.get(user.salonId);
    if (!salon) {
      return { success: false, error: "Salon not found" };
    }
    
    // If token already exists, return it
    if (salon.onboardingToken) {
      const baseUrl = 'http://localhost:3002';
      const quoteToolPath = salon.quoteToolUrl || `/quote/${salon.onboardingToken}`;
      const fullUrl = quoteToolPath.startsWith('http') ? quoteToolPath : `${baseUrl}${quoteToolPath}`;
      
      return { 
        success: true, 
        quoteToolUrl: fullUrl,
        token: salon.onboardingToken,
      };
    }
    
    // Generate a unique token
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    await ctx.db.patch(user.salonId, {
      onboardingToken: token,
      quoteToolUrl: `/quote/${token}`,
      updatedAt: Date.now(),
    });
    
    const baseUrl = 'http://localhost:3002';
    const fullUrl = `${baseUrl}/quote/${token}`;
    
    return { 
      success: true, 
      quoteToolUrl: fullUrl,
      token: token,
    };
  },
});