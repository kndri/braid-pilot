import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Mutation: Update payout status for a transaction
export const updatePayoutStatus = mutation({
  args: {
    transactionId: v.id("transactions"),
    newStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
    payoutMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Update transaction payout status
    await ctx.db.patch(args.transactionId, {
      payoutStatus: args.newStatus,
      payoutDate: args.newStatus === "paid" ? Date.now() : undefined,
      payoutMethod: args.payoutMethod,
      updatedAt: Date.now(),
    });

    // If transaction has a booking, update the booking's payment status
    const booking = await ctx.db.get(transaction.bookingId);
    if (booking) {
      await ctx.db.patch(transaction.bookingId, {
        paymentStatus: args.newStatus === "paid" ? "paid" : 
                      args.newStatus === "pending" ? "pending_payout" : "pending",
        payoutDate: args.newStatus === "paid" ? Date.now() : undefined,
        updatedAt: Date.now(),
      });
    }

    return { success: true, message: `Payout status updated to ${args.newStatus}` };
  },
});

// Mutation: Process bulk payouts for a braider
export const processBulkPayout = mutation({
  args: {
    braiderId: v.id("braiders"),
    transactionIds: v.array(v.id("transactions")),
    payoutMethod: v.string(),
  },
  handler: async (ctx, args) => {
    let processedCount = 0;
    let totalAmount = 0;

    for (const transactionId of args.transactionIds) {
      const transaction = await ctx.db.get(transactionId);
      if (transaction && transaction.payoutStatus !== "paid") {
        await ctx.db.patch(transactionId, {
          payoutStatus: "paid",
          payoutDate: Date.now(),
          payoutMethod: args.payoutMethod,
          updatedAt: Date.now(),
        });
        
        totalAmount += transaction.braiderPayout || 0;
        processedCount++;

        // Update associated booking
        const booking = await ctx.db.get(transaction.bookingId);
        if (booking) {
          await ctx.db.patch(transaction.bookingId, {
            paymentStatus: "paid",
            payoutDate: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }
    }

    return { 
      success: true, 
      processedCount, 
      totalAmount,
      message: `Processed ${processedCount} payouts totaling $${totalAmount.toFixed(2)}` 
    };
  },
});

// Query: Get braider payouts with filtering
export const getBraiderPayouts = query({
  args: {
    braiderId: v.id("braiders"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    let transactionsQuery = ctx.db
      .query("transactions")
      .withIndex("by_braiderId", (q) => q.eq("braiderId", args.braiderId));

    const transactions = await transactionsQuery.collect();

    // Filter by date range if provided
    let filteredTransactions = transactions;
    if (args.startDate || args.endDate) {
      filteredTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const booking = await ctx.db.get(transaction.bookingId);
          if (!booking) return null;

          const bookingDate = new Date(booking.appointmentDate);
          const start = args.startDate ? new Date(args.startDate) : new Date(0);
          const end = args.endDate ? new Date(args.endDate) : new Date();

          if (bookingDate >= start && bookingDate <= end) {
            return { ...transaction, booking };
          }
          return null;
        })
      ).then(results => results.filter(Boolean) as any[]);
    } else {
      // Add booking data to all transactions
      filteredTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const booking = await ctx.db.get(transaction.bookingId);
          return { ...transaction, booking };
        })
      );
    }

    // Filter by status if provided
    if (args.status) {
      filteredTransactions = filteredTransactions.filter(
        t => t.payoutStatus === args.status
      );
    }

    // Calculate totals
    const totalPending = filteredTransactions
      .filter(t => t.payoutStatus === "pending" || !t.payoutStatus)
      .reduce((sum, t) => sum + (t.braiderPayout || 0), 0);

    const totalPaid = filteredTransactions
      .filter(t => t.payoutStatus === "paid")
      .reduce((sum, t) => sum + (t.braiderPayout || 0), 0);

    return {
      transactions: filteredTransactions,
      summary: {
        totalPending,
        totalPaid,
        totalEarnings: totalPending + totalPaid,
        transactionCount: filteredTransactions.length,
      },
    };
  },
});

// Internal helper function for earnings summary
async function getBraiderEarningsSummaryInternal(ctx: any, args: { braiderId: Id<"braiders">, period?: "day" | "week" | "month" | "year" }) {
  const now = new Date();
  let startDate: Date;

  switch (args.period) {
    case "day":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(0); // All time
  }

  const transactions = await ctx.db
    .query("transactions")
    .withIndex("by_braiderId", (q: any) => q.eq("braiderId", args.braiderId))
    .collect();

  // Get bookings to filter by date
  const relevantTransactions = await Promise.all(
    transactions.map(async (transaction: any) => {
      const booking = await ctx.db.get(transaction.bookingId);
      if (!booking) return null;

      const bookingDate = new Date(booking.appointmentDate);
      if (bookingDate >= startDate) {
        return { transaction, booking };
      }
      return null;
    })
  ).then(results => results.filter(Boolean) as any[]);

  // Calculate earnings by status
  const earnings = {
    completed: 0,
    pending: 0,
    paid: 0,
  };

  relevantTransactions.forEach(({ transaction, booking }) => {
    const amount = transaction.braiderPayout || 0;
    
    if (transaction.payoutStatus === "paid") {
      earnings.paid += amount;
    } else if (booking.status === "completed") {
      earnings.pending += amount;
    }
    earnings.completed += booking.status === "completed" ? amount : 0;
  });

  // Get braider details
  const braider = await ctx.db.get(args.braiderId);

  return {
    braiderId: args.braiderId,
    braiderName: braider?.name || "Unknown",
    period: args.period || "all_time",
    startDate: startDate.toISOString(),
    earnings,
    totalEarnings: earnings.completed,
    totalPaid: earnings.paid,
    totalPending: earnings.pending,
    bookingCount: relevantTransactions.filter(({ booking }) => booking.status === "completed").length,
  };
}

// Query: Get braider earnings summary
export const getBraiderEarningsSummary = query({
  args: {
    braiderId: v.id("braiders"),
    period: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"), v.literal("year"))),
  },
  handler: async (ctx, args) => {
    return await getBraiderEarningsSummaryInternal(ctx, args);
  },
});

// Query: Get all braiders with payout summary for a salon
export const getSalonBraidersPayoutSummary = query({
  args: {
    salonId: v.id("salons"),
    period: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    // Get all braiders for the salon
    const braiders = await ctx.db
      .query("braiders")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();

    // Get summary for each braider
    const braiderSummaries = await Promise.all(
      braiders.map(async (braider) => {
        // Call the earnings summary function directly instead of using runQuery
        const summary = await getBraiderEarningsSummaryInternal(ctx, {
          braiderId: braider._id,
          period: args.period,
        });

        // Get recent bookings for workload calculation
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const bookings = await ctx.db
          .query("bookings")
          .withIndex("by_braiderId", (q) => q.eq("braiderId", braider._id))
          .collect();

        const todaysBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.appointmentDate);
          return bookingDate >= today && booking.status !== "cancelled";
        });

        const weeklyBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.appointmentDate);
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return bookingDate >= weekAgo && booking.status === "completed";
        });

        return {
          ...braider,
          ...summary,
          workload: {
            todayBookings: todaysBookings.length,
            todayHours: todaysBookings.reduce((sum, b) => 
              sum + (b.serviceDetails?.estimatedDuration || 240) / 60, 0
            ),
            weeklyBookings: weeklyBookings.length,
            weeklyHours: weeklyBookings.reduce((sum, b) => 
              sum + (b.serviceDetails?.estimatedDuration || 240) / 60, 0
            ),
          },
        };
      })
    );

    // Calculate salon totals
    const salonTotals = {
      totalPending: braiderSummaries.reduce((sum, b) => sum + b.totalPending, 0),
      totalPaid: braiderSummaries.reduce((sum, b) => sum + b.totalPaid, 0),
      totalEarnings: braiderSummaries.reduce((sum, b) => sum + b.totalEarnings, 0),
      totalBookings: braiderSummaries.reduce((sum, b) => sum + b.bookingCount, 0),
    };

    return {
      braiders: braiderSummaries,
      salonTotals,
      period: args.period || "all_time",
    };
  },
});