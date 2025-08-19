import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get current user by Clerk ID
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const clerkId = identity.subject;
    
    // Find user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
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

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.clerkId) {
      return null;
    }
    
    // Find user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    if (!user) {
      return null;
    }
    
    return {
      ...user,
      salonId: user.salonId,
    };
  },
});

// Create initial salon record for new user
export const createInitialSalonRecord = mutation({
  args: {
    salonData: v.object({
      name: v.string(),
      username: v.optional(v.string()),
      email: v.string(),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
      hours: v.optional(v.string()),
      defaultSplitPercentage: v.optional(v.number()),
      splitType: v.optional(v.union(v.literal("percentage"), v.literal("fixed"))),
    })
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const clerkId = identity.subject;
    const email = identity.email;
    const name = identity.name || "Salon Owner";
    
    // Check if user already exists
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (!user) {
      // Create user record
      const userId = await ctx.db.insert("users", {
        clerkId,
        email: email || args.salonData.email,
        name: name || "User",
        onboardingComplete: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      user = await ctx.db.get(userId);
    }
    
    if (!user) {
      throw new Error("Failed to create user record");
    }
    
    // Check if user already has a salon
    if (user.salonId) {
      return user.salonId;
    }
    
    // If username is provided, check if it's still available (race condition check)
    if (args.salonData.username) {
      const existingSalon = await ctx.db
        .query("salons")
        .withIndex("by_username", (q) => q.eq("username", args.salonData.username!))
        .first();
      
      if (existingSalon) {
        throw new Error("Username is already taken");
      }
    }
    
    // Create salon record
    const salonId = await ctx.db.insert("salons", {
      ...args.salonData,
      ownerId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update user with salon ID
    await ctx.db.patch(user._id, {
      salonId,
      updatedAt: Date.now(),
    });
    
    return salonId;
  },
});

// Check onboarding status
export const checkOnboardingStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const clerkId = identity.subject;
    
    // Find user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (!user) {
      return { hasRecord: false, onboardingComplete: false };
    }
    
    if (user.salonId) {
      const pricingConfigs = await ctx.db
        .query("pricingConfigs")
        .withIndex("by_salonId", (q) => q.eq("salonId", user.salonId!))
        .collect();
      
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

// Complete onboarding
export const completeOnboarding = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const clerkId = identity.subject;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    await ctx.db.patch(user._id, {
      onboardingComplete: true,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Get user profile data
export const viewer = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log("[viewer] No identity found");
      return null;
    }
    
    const clerkId = identity.subject;
    console.log("[viewer] Looking for user with clerkId:", clerkId);
    
    // Find user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (!user) {
      console.log("[viewer] No user found for clerkId:", clerkId);
      // Try to find by email as fallback
      if (identity.email) {
        const userByEmail = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", identity.email!))
          .first();
        if (userByEmail) {
          console.log("[viewer] Found user by email, will return with updated info");
          // Return the user with updated info (can't patch in a query)
          return {
            ...userByEmail,
            clerkId: clerkId,
            email: identity.email || userByEmail.email,
            name: identity.name || userByEmail.name,
          };
        }
      }
      return null;
    }
    
    console.log("[viewer] Found user:", user._id);
    return {
      ...user,
      email: identity.email || user.email,
      name: identity.name || user.name,
    };
  },
});

// Webhook handler to sync Clerk user data
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[syncUser] Starting sync for:", args.clerkId, args.email);
    
    // Check if user exists by clerkId first (most reliable)
    let existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    // If not found by clerkId, try email
    if (!existingUser) {
      existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
        
      // If found by email but no clerkId, update it
      if (existingUser && !existingUser.clerkId) {
        console.log("[syncUser] Found user by email, updating clerkId");
        await ctx.db.patch(existingUser._id, {
          clerkId: args.clerkId,
          name: args.name,
          updatedAt: Date.now(),
        });
        return { success: true, action: "updated_clerkId" };
      }
    }
    
    if (existingUser) {
      console.log("[syncUser] Updating existing user");
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        clerkId: args.clerkId, // Ensure clerkId is always set
        updatedAt: Date.now(),
      });
      return { success: true, action: "updated" };
    } else {
      console.log("[syncUser] Creating new user");
      // Create new user
      await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        onboardingComplete: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { success: true, action: "created" };
    }
  },
});

// Migration function to handle existing data
export const migrateExistingUsers = mutation({
  handler: async (ctx) => {
    // Get all users without clerkId
    const users = await ctx.db.query("users").collect();
    let migratedCount = 0;
    
    for (const user of users) {
      if (!user.clerkId) {
        // For existing users, we'll need to handle them differently
        // For now, mark them as needing migration
        await ctx.db.patch(user._id, {
          clerkId: `migrated_${user._id}`, // Temporary ID for migration
          updatedAt: Date.now(),
        });
        migratedCount++;
      }
    }
    
    return { migratedCount, totalUsers: users.length };
  },
});

// Function to link existing user by email to Clerk ID
export const linkUserByEmail = mutation({
  args: {
    email: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (!user) {
      throw new Error("User not found with that email");
    }
    
    // Update user with Clerk ID
    await ctx.db.patch(user._id, {
      clerkId: args.clerkId,
      updatedAt: Date.now(),
    });
    
    return { success: true, userId: user._id };
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Delete user (for Clerk webhook)
export const deleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by clerkId
    const users = await ctx.db.query("users").collect();
    const user = users.find((u: any) => u.clerkId === args.clerkId);
    
    if (user) {
      // Delete associated salon if exists
      if (user.salonId) {
        const salon = await ctx.db.get(user.salonId);
        if (salon) {
          // Delete pricing configs
          const pricingConfigs = await ctx.db
            .query("pricingConfigs")
            .withIndex("by_salonId", (q) => q.eq("salonId", user.salonId!))
            .collect();
          
          for (const config of pricingConfigs) {
            await ctx.db.delete(config._id);
          }
          
          // Delete salon
          await ctx.db.delete(salon._id);
        }
      }
      
      // Delete user
      await ctx.db.delete(user._id);
    }
    
    return { success: true };
  },
});