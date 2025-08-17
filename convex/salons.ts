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