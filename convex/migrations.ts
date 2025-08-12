import { internalMutation } from "./_generated/server";

// Migration to clean up old auth data
export const cleanupOldAuthData = internalMutation({
  handler: async (ctx) => {
    // Delete old users table data that doesn't have clerkId
    const oldUsers = await ctx.db.query("users").collect();
    
    for (const user of oldUsers) {
      // Check if this is an old user record (no clerkId)
      if (!(user as any).clerkId) {
        await ctx.db.delete(user._id);
        console.log(`Deleted old user record: ${user._id}`);
      }
    }
    
    // Clean up any orphaned data
    const salons = await ctx.db.query("salons").collect();
    for (const salon of salons) {
      // Check if owner exists
      const owner = await ctx.db.get(salon.ownerId);
      if (!owner) {
        // Delete orphaned salon
        await ctx.db.delete(salon._id);
        console.log(`Deleted orphaned salon: ${salon._id}`);
        
        // Delete associated pricing configs
        const configs = await ctx.db
          .query("pricingConfigs")
          .withIndex("by_salonId", (q) => q.eq("salonId", salon._id))
          .collect();
        
        for (const config of configs) {
          await ctx.db.delete(config._id);
        }
      }
    }
    
    return { success: true, message: "Old auth data cleaned up" };
  },
});