import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all braiders for a salon
export const getBySalonId = query({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const braiders = await ctx.db
      .query("braiders")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();
    
    return braiders;
  },
});

// Create a new braider
export const createBraider = mutation({
  args: {
    salonId: v.id("salons"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    splitPercentage: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    maxDailyBookings: v.optional(v.number()),
    defaultStartTime: v.optional(v.string()),
    defaultEndTime: v.optional(v.string()),
    workingDays: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    // Get salon's default split percentage if not provided
    const salon = await ctx.db.get(args.salonId);
    const defaultSplit = salon?.defaultSplitPercentage || 60; // Default 60% to braider
    
    const braiderId = await ctx.db.insert("braiders", {
      salonId: args.salonId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      specialties: args.specialties || [],
      splitPercentage: args.splitPercentage ?? defaultSplit,
      isActive: args.isActive !== false,
      maxDailyBookings: args.maxDailyBookings,
      defaultStartTime: args.defaultStartTime || "09:00",
      defaultEndTime: args.defaultEndTime || "18:00",
      workingDays: args.workingDays || [1, 2, 3, 4, 5, 6], // Mon-Sat
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return braiderId;
  },
});

// Update braider details
export const updateBraider = mutation({
  args: {
    braiderId: v.id("braiders"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    splitPercentage: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    maxDailyBookings: v.optional(v.number()),
    defaultStartTime: v.optional(v.string()),
    defaultEndTime: v.optional(v.string()),
    workingDays: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const { braiderId, ...updates } = args;
    
    await ctx.db.patch(braiderId, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Delete braider
export const deleteBraider = mutation({
  args: {
    braiderId: v.id("braiders"),
  },
  handler: async (ctx, args) => {
    // Check if braider has any active bookings
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_braiderId", (q) => q.eq("braiderId", args.braiderId))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .collect();
    
    if (activeBookings.length > 0) {
      throw new Error("Cannot delete braider with active bookings");
    }
    
    await ctx.db.delete(args.braiderId);
    
    return { success: true };
  },
});

// Get braider by ID
export const getBraiderById = query({
  args: {
    braiderId: v.id("braiders"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.braiderId);
  },
});

// Get all braiders for a salon (alias for getBySalonId)
export const getSalonBraiders = query({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const braiders = await ctx.db
      .query("braiders")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();
    
    return braiders;
  },
});