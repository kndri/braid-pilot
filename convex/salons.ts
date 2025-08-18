import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get salon by ID
export const getSalonById = query({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.salonId);
  },
});

// Get salon by owner ID
export const getSalonByOwnerId = query({
  args: {
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("salons")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
      .first();
  },
});

// Update salon information
export const updateSalon = mutation({
  args: {
    salonId: v.id("salons"),
    updates: v.object({
      name: v.optional(v.string()),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      website: v.optional(v.string()),
      hours: v.optional(v.string()),
      businessName: v.optional(v.string()),
      standardHairType: v.optional(v.string()),
      timezone: v.optional(v.string()),
      username: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) {
      throw new Error("Salon not found");
    }

    // If updating username, check uniqueness
    if (args.updates.username) {
      const existingSalon = await ctx.db
        .query("salons")
        .withIndex("by_username", (q) => q.eq("username", args.updates.username))
        .first();
      
      if (existingSalon && existingSalon._id !== args.salonId) {
        throw new Error("Username is already taken");
      }
    }

    await ctx.db.patch(args.salonId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update salon settings including commission structure
export const updateSalonSettings = mutation({
  args: {
    salonId: v.id("salons"),
    updates: v.object({
      name: v.optional(v.string()),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
      defaultSplitPercentage: v.optional(v.number()),
      splitType: v.optional(v.union(v.literal("percentage"), v.literal("fixed"))),
    }),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) {
      throw new Error("Salon not found");
    }

    await ctx.db.patch(args.salonId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get salon with pricing configuration
export const getSalonWithPricing = query({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) {
      return null;
    }

    // Get pricing configurations
    const pricingConfigs = await ctx.db
      .query("pricingConfigs")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();

    // Get selected styles
    const styles = await ctx.db
      .query("salonStyles")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();

    return {
      salon,
      pricingConfigs,
      styles,
    };
  },
});

// Check if username is available
export const isUsernameAvailable = query({
  args: {
    username: v.string(),
    excludeSalonId: v.optional(v.id("salons")),
  },
  handler: async (ctx, args) => {
    // Validate username format
    const usernameRegex = /^[a-z0-9][a-z0-9-_]{2,29}$/;
    if (!usernameRegex.test(args.username)) {
      return {
        available: false,
        error: "Username must be 3-30 characters, start with a letter or number, and contain only lowercase letters, numbers, hyphens, and underscores",
      };
    }

    const existingSalon = await ctx.db
      .query("salons")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (existingSalon && existingSalon._id !== args.excludeSalonId) {
      return {
        available: false,
        error: "Username is already taken",
      };
    }

    return {
      available: true,
      error: null,
    };
  },
});

// Get salon by username (for quote tool)
export const getSalonByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db
      .query("salons")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (!salon) {
      return null;
    }

    // Get pricing configurations
    const pricingConfigs = await ctx.db
      .query("pricingConfigs")
      .withIndex("by_salonId", (q) => q.eq("salonId", salon._id))
      .collect();

    return {
      salon,
      pricingConfigs,
    };
  },
});

// Check if salon exists by owner
export const checkSalonExists = query({
  args: {
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db
      .query("salons")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
      .first();

    return {
      exists: Boolean(salon),
      salon: salon || null,
    };
  },
});