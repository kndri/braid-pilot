import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get client by ID
export const getClientById = query({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clientId);
  },
});

// Get client by email
export const getClientByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Create new client
export const createClient = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.string(),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    preferredStyles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check if client already exists
    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingClient) {
      return existingClient._id;
    }

    // Create new client
    const clientId = await ctx.db.insert("clients", {
      email: args.email,
      name: args.name,
      phone: args.phone,
      notes: args.notes,
      tags: args.tags,
      preferredStyles: args.preferredStyles,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return clientId;
  },
});

// Update client information
export const updateClient = mutation({
  args: {
    clientId: v.id("clients"),
    updates: v.object({
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      preferredStyles: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    await ctx.db.patch(args.clientId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get or create client by email
export const getOrCreateClient = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // Try to find existing client
    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingClient) {
      // Update client info if provided data is different
      await ctx.db.patch(existingClient._id, {
        name: args.name,
        phone: args.phone,
        updatedAt: Date.now(),
      });
      return existingClient._id;
    }

    // Create new client
    const clientId = await ctx.db.insert("clients", {
      email: args.email,
      name: args.name,
      phone: args.phone,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return clientId;
  },
});

// Search clients by name or email
export const searchClients = query({
  args: {
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const query = args.searchQuery.toLowerCase();

    // Get all clients and filter by search query
    const allClients = await ctx.db.query("clients").take(1000);
    
    const filteredClients = allClients
      .filter(client => 
        client.name.toLowerCase().includes(query) || 
        client.email.toLowerCase().includes(query) ||
        (client.phone && client.phone.includes(query))
      )
      .slice(0, limit);

    return filteredClients;
  },
});

// Get client statistics
export const getClientStats = query({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    // Get all bookings for this client
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === "completed").length;
    const cancelledBookings = bookings.filter(b => b.status === "cancelled").length;
    
    const totalSpent = bookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + b.serviceDetails.finalPrice, 0);

    const averageSpend = completedBookings > 0 ? totalSpent / completedBookings : 0;

    // Get preferred styles
    const preferredStyles = bookings
      .filter(b => b.status === "completed")
      .map(b => b.serviceDetails.style);
    
    const uniqueStyles = [...new Set(preferredStyles)];

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalSpent,
      averageSpend,
      preferredStyles: uniqueStyles,
    };
  },
});