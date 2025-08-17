import { v } from "convex/values";
import { mutation, query, internalMutation, internalAction, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Real-time Sync Manager for Vapi Assistant Updates
 * 
 * This module handles automatic synchronization between your salon data
 * and Vapi assistants. It uses a smart batching system to avoid excessive
 * API calls while ensuring assistants stay up-to-date.
 */

// Trigger prompt update when salon data changes
export const triggerSalonUpdate = internalMutation({
  args: {
    salonId: v.id("salons"),
    changeType: v.union(
      v.literal("pricing"),
      v.literal("hours"),
      v.literal("policies"),
      v.literal("promotions"),
      v.literal("services"),
      v.literal("general")
    ),
    immediate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if Vapi is active for this salon
    const salon = await ctx.db.get(args.salonId);
    if (!salon || !salon.vapiIsActive || !salon.vapiAssistantId) {
      return; // No need to update if Vapi isn't active
    }

    // Determine update priority based on change type
    const updateDelay = args.immediate ? 0 : getUpdateDelay(args.changeType);
    
    // Schedule the update
    await ctx.scheduler.runAfter(
      updateDelay,
      internal.vapiSyncManager.executeUpdate,
      {
        salonId: args.salonId,
        changeType: args.changeType,
      }
    );

    // Log the scheduled update
    await ctx.db.insert("vapiSyncLogs", {
      salonId: args.salonId,
      changeType: args.changeType,
      scheduledAt: Date.now(),
      executeAt: Date.now() + updateDelay,
      status: "scheduled",
    });
  },
});

// Execute the actual update
export const executeUpdate = internalAction({
  args: {
    salonId: v.id("salons"),
    changeType: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Update the Vapi assistant with the latest data
      const result = await ctx.runAction(api.vapiPromptGenerator.updateVapiAssistant, {
        salonId: args.salonId,
        forceUpdate: false,
      });

      // Log successful update
      await ctx.runMutation(internal.vapiSyncManager.logUpdateResult, {
        salonId: args.salonId,
        changeType: args.changeType as any,
        success: true,
        result,
      });
    } catch (error) {
      console.error("Failed to sync Vapi assistant:", error);
      
      // Log failed update
      await ctx.runMutation(internal.vapiSyncManager.logUpdateResult, {
        salonId: args.salonId,
        changeType: args.changeType as any,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Retry logic for critical updates
      if (isCriticalChange(args.changeType)) {
        await ctx.scheduler.runAfter(
          60000, // Retry after 1 minute
          internal.vapiSyncManager.executeUpdate,
          args
        );
      }
    }
  },
});

// Log update results
export const logUpdateResult = internalMutation({
  args: {
    salonId: v.id("salons"),
    changeType: v.string(),
    success: v.boolean(),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the most recent scheduled log for this update
    const scheduledLog = await ctx.db
      .query("vapiSyncLogs")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) => 
        q.and(
          q.eq(q.field("changeType"), args.changeType),
          q.eq(q.field("status"), "scheduled")
        )
      )
      .order("desc")
      .first();

    if (scheduledLog) {
      await ctx.db.patch(scheduledLog._id, {
        status: args.success ? "completed" : "failed",
        completedAt: Date.now(),
        error: args.error,
      });
    }

    // Track metrics
    await updateSyncMetrics(ctx, args.salonId, args.success);
  },
});

// Hook into salon update mutations
export const onSalonUpdate = internalMutation({
  args: {
    salonId: v.id("salons"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    // Determine what type of change occurred
    const changeType = determineChangeType(args.updates);
    
    // Trigger the sync
    await ctx.runMutation(internal.vapiSyncManager.triggerSalonUpdate, {
      salonId: args.salonId,
      changeType,
      immediate: false,
    });
  },
});

// Hook into pricing configuration updates
export const onPricingUpdate = internalMutation({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.vapiSyncManager.triggerSalonUpdate, {
      salonId: args.salonId,
      changeType: "pricing",
      immediate: false,
    });
  },
});

// Hook into business context updates
export const onBusinessContextUpdate = internalMutation({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.vapiSyncManager.triggerSalonUpdate, {
      salonId: args.salonId,
      changeType: "policies",
      immediate: false,
    });
  },
});

// Batch multiple updates together
export const batchUpdates = internalMutation({
  args: {
    salonId: v.id("salons"),
    changeTypes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if there's already a batch in progress
    const existingBatch = await ctx.db
      .query("vapiUpdateBatches")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingBatch) {
      // Add to existing batch
      const combinedChanges = [...new Set([...existingBatch.changeTypes, ...args.changeTypes])];
      await ctx.db.patch(existingBatch._id, {
        changeTypes: combinedChanges,
        updatedAt: Date.now(),
      });
    } else {
      // Create new batch
      const batchId = await ctx.db.insert("vapiUpdateBatches", {
        salonId: args.salonId,
        changeTypes: args.changeTypes,
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Schedule batch execution
      await ctx.scheduler.runAfter(
        5000, // Execute batch after 5 seconds
        internal.vapiSyncManager.executeBatch,
        { batchId }
      );
    }
  },
});

// Execute batched updates
export const executeBatch = internalAction({
  args: {
    batchId: v.id("vapiUpdateBatches"),
  },
  handler: async (ctx, args) => {
    const batch = await ctx.runQuery(internal.vapiSyncManager.getBatch, { batchId: args.batchId });
    
    if (!batch || batch.status !== "pending") {
      return;
    }

    // Mark batch as processing
    await ctx.runMutation(internal.vapiSyncManager.updateBatchStatus, {
      batchId: args.batchId,
      status: "processing",
    });

    try {
      // Execute the update once for all changes
      await ctx.runAction(api.vapiPromptGenerator.updateVapiAssistant, {
        salonId: batch.salonId,
        forceUpdate: true,
      });

      // Mark batch as completed
      await ctx.runMutation(internal.vapiSyncManager.updateBatchStatus, {
        batchId: args.batchId,
        status: "completed",
      });
    } catch (error) {
      // Mark batch as failed
      await ctx.runMutation(internal.vapiSyncManager.updateBatchStatus, {
        batchId: args.batchId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

// Get batch details - internal query
export const getBatch = internalQuery({
  args: {
    batchId: v.id("vapiUpdateBatches"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.batchId);
  },
});

// Update batch status
export const updateBatchStatus = internalMutation({
  args: {
    batchId: v.id("vapiUpdateBatches"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.batchId, {
      status: args.status,
      error: args.error,
      completedAt: args.status === "completed" || args.status === "failed" ? Date.now() : undefined,
    });
  },
});

// Helper functions
function getUpdateDelay(changeType: string): number {
  switch (changeType) {
    case "pricing":
      return 10000; // 10 seconds - pricing is critical
    case "hours":
      return 15000; // 15 seconds - hours are important
    case "policies":
      return 30000; // 30 seconds - policies can wait a bit
    case "promotions":
      return 20000; // 20 seconds - promotions are semi-urgent
    case "services":
      return 10000; // 10 seconds - services are critical
    default:
      return 60000; // 1 minute for general updates
  }
}

function isCriticalChange(changeType: string): boolean {
  return ["pricing", "hours", "services"].includes(changeType);
}

function determineChangeType(updates: any): "pricing" | "hours" | "policies" | "promotions" | "services" | "general" {
  if (updates.basePrice || updates.sizeMultipliers || updates.lengthMultipliers) {
    return "pricing";
  }
  if (updates.businessHours) {
    return "hours";
  }
  if (updates.cancellationPolicy || updates.depositRequired || updates.latePolicy) {
    return "policies";
  }
  if (updates.promotions) {
    return "promotions";
  }
  if (updates.serviceName || updates.serviceType) {
    return "services";
  }
  return "general";
}

async function updateSyncMetrics(ctx: any, salonId: Id<"salons">, success: boolean) {
  const today = new Date().toISOString().split('T')[0];
  
  const existingMetric = await ctx.db
    .query("vapiSyncMetrics")
    .withIndex("by_salonId_date", (q: any) => 
      q.eq("salonId", salonId).eq("date", today)
    )
    .first();

  if (existingMetric) {
    await ctx.db.patch(existingMetric._id, {
      totalSyncs: existingMetric.totalSyncs + 1,
      successfulSyncs: existingMetric.successfulSyncs + (success ? 1 : 0),
      failedSyncs: existingMetric.failedSyncs + (success ? 0 : 1),
      lastSyncAt: Date.now(),
    });
  } else {
    await ctx.db.insert("vapiSyncMetrics", {
      salonId,
      date: today,
      totalSyncs: 1,
      successfulSyncs: success ? 1 : 0,
      failedSyncs: success ? 0 : 1,
      lastSyncAt: Date.now(),
    });
  }
}

// Monitor sync health
export const getSyncHealth = query({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const recentLogs = await ctx.db
      .query("vapiSyncLogs")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .order("desc")
      .take(100);

    const metrics = await ctx.db
      .query("vapiSyncMetrics")
      .withIndex("by_salonId_date", (q: any) => q.eq("salonId", args.salonId))
      .order("desc")
      .take(7); // Last 7 days

    const totalSyncs = metrics.reduce((sum, m) => sum + m.totalSyncs, 0);
    const successfulSyncs = metrics.reduce((sum, m) => sum + m.successfulSyncs, 0);
    const failedSyncs = metrics.reduce((sum, m) => sum + m.failedSyncs, 0);
    
    const successRate = totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 100;
    
    const pendingSyncs = recentLogs.filter(log => log.status === "scheduled").length;
    const lastSync = recentLogs.find(log => log.status === "completed");

    return {
      successRate,
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      pendingSyncs,
      lastSyncAt: lastSync?.completedAt,
      health: successRate >= 95 ? "excellent" : 
              successRate >= 80 ? "good" : 
              successRate >= 60 ? "fair" : "poor",
      recentLogs: recentLogs.slice(0, 10),
    };
  },
});

// Manual sync trigger for UI
export const manualSync = mutation({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    // Verify user has permission to trigger sync
    const salon = await ctx.db.get(args.salonId);
    if (!salon) {
      throw new Error("Salon not found");
    }

    // Trigger immediate update
    await ctx.runMutation(internal.vapiSyncManager.triggerSalonUpdate, {
      salonId: args.salonId,
      changeType: "general",
      immediate: true,
    });

    return { success: true, message: "Sync triggered successfully" };
  },
});