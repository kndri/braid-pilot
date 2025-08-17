import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Testing utilities - only available in development/test environments
const isTestEnvironment = () => {
  return process.env.NODE_ENV === 'test' || process.env.CYPRESS_TESTING === 'true'
}

// Reset entire test database
export const resetDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    if (!isTestEnvironment()) {
      throw new Error('This operation is only available in test environment')
    }

    // Delete all bookings
    const bookings = await ctx.db.query('bookings').collect()
    for (const booking of bookings) {
      await ctx.db.delete(booking._id)
    }

    // Delete all braiders
    const braiders = await ctx.db.query('braiders').collect()
    for (const braider of braiders) {
      await ctx.db.delete(braider._id)
    }

    // Delete all clients
    const clients = await ctx.db.query('clients').collect()
    for (const client of clients) {
      await ctx.db.delete(client._id)
    }

    // Delete all salons
    const salons = await ctx.db.query('salons').collect()
    for (const salon of salons) {
      await ctx.db.delete(salon._id)
    }

    // Delete all users
    const users = await ctx.db.query('users').collect()
    for (const user of users) {
      await ctx.db.delete(user._id)
    }

    return { success: true }
  }
})

// Create test salon with default settings
export const createTestSalon = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    settings: v.optional(v.object({
      maxConcurrentBookings: v.number(),
      bufferTimeMinutes: v.number()
    }))
  },
  handler: async (ctx, args) => {
    if (!isTestEnvironment()) {
      throw new Error('This operation is only available in test environment')
    }

    // First create a test user (owner)
    const ownerId = await ctx.db.insert('users', {
      email: `owner-${args.email}`,
      name: 'Test Owner',
      onboardingComplete: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    const salonId = await ctx.db.insert('salons', {
      name: args.name,
      email: args.email,
      phone: '555-TEST',
      address: '123 Test Street',
      ownerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      maxConcurrentBookings: args.settings?.maxConcurrentBookings || 3,
      bufferMinutes: args.settings?.bufferTimeMinutes || 30,
      emergencyCapacityEnabled: true,
      businessContext: {
        businessHours: {
          monday: { open: 9, close: 18, isOpen: true },
          tuesday: { open: 9, close: 18, isOpen: true },
          wednesday: { open: 9, close: 18, isOpen: true },
          thursday: { open: 9, close: 18, isOpen: true },
          friday: { open: 9, close: 18, isOpen: true },
          saturday: { open: 10, close: 16, isOpen: true },
          sunday: { open: 0, close: 0, isOpen: false }
        },
        policies: {
          cancellationPolicy: '24 hours notice required',
          depositRequired: true,
          depositAmount: 50,
          latePolicy: '15 minute grace period',
          refundPolicy: 'No refunds after service starts'
        }
      }
    })

    // Update user with salon ID
    await ctx.db.patch(ownerId, { salonId })

    return { id: salonId, name: args.name, ownerId }
  }
})

// Create test braiders with different skill levels
export const createTestBraiders = mutation({
  args: {},
  handler: async (ctx) => {
    if (!isTestEnvironment()) {
      throw new Error('This operation is only available in test environment')
    }

    // Get first salon or create one
    const salons = await ctx.db.query('salons').collect()
    let salonId = salons[0]?._id

    if (!salonId) {
      // Create a test salon if none exists
      const ownerId = await ctx.db.insert('users', {
        email: 'test-braiders-owner@test.com',
        name: 'Test Braiders Owner',
        createdAt: Date.now(),
        updatedAt: Date.now()
      })

      salonId = await ctx.db.insert('salons', {
        name: 'Test Braiders Salon',
        email: 'braiders@test.com',
        ownerId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    }

    const braiders = [
      {
        name: 'Sarah Johnson',
        email: 'sarah@test.com',
        phone: '555-0001',
        splitPercentage: 75,
        specialties: ['Micro Braids', 'Goddess Braids', 'Fulani Braids'],
        maxDailyBookings: 4,
        isActive: true
      },
      {
        name: 'Maria Garcia',
        email: 'maria@test.com',
        phone: '555-0002',
        splitPercentage: 65,
        specialties: ['Box Braids', 'Knotless Braids', 'Passion Twists'],
        maxDailyBookings: 5,
        isActive: true
      },
      {
        name: 'Jessica Smith',
        email: 'jessica@test.com',
        phone: '555-0003',
        splitPercentage: 50,
        specialties: ['Cornrows', 'Two Strand Twists'],
        maxDailyBookings: 3,
        isActive: true
      }
    ]

    const createdBraiders = []
    for (const braider of braiders) {
      const id = await ctx.db.insert('braiders', {
        salonId,
        ...braider,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        defaultStartTime: '09:00',
        defaultEndTime: '18:00',
        workingDays: [1, 2, 3, 4, 5] // Monday through Friday
      })
      createdBraiders.push({ id, name: braider.name })
    }

    return createdBraiders
  }
})

// Seed database with comprehensive test data
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    if (!isTestEnvironment()) {
      throw new Error('This operation is only available in test environment')
    }

    // Create test owner user
    const ownerId = await ctx.db.insert('users', {
      email: 'seed-owner@test.com',
      name: 'Seed Owner',
      onboardingComplete: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    // Create test salon
    const salonId = await ctx.db.insert('salons', {
      name: 'Seeded Test Salon',
      email: 'seeded@salon.com',
      phone: '555-SEED',
      address: '456 Seed Avenue',
      ownerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      maxConcurrentBookings: 3,
      bufferMinutes: 30,
      emergencyCapacityEnabled: true,
      businessContext: {
        businessHours: {
          monday: { open: 9, close: 18, isOpen: true },
          tuesday: { open: 9, close: 18, isOpen: true },
          wednesday: { open: 9, close: 18, isOpen: true },
          thursday: { open: 9, close: 18, isOpen: true },
          friday: { open: 9, close: 18, isOpen: true },
          saturday: { open: 10, close: 16, isOpen: true },
          sunday: { open: 0, close: 0, isOpen: false }
        },
        policies: {
          cancellationPolicy: '24 hours notice required',
          depositRequired: true,
          depositAmount: 50,
          latePolicy: '15 minute grace period',
          refundPolicy: 'No refunds after service starts'
        }
      }
    })

    // Update user with salon ID
    await ctx.db.patch(ownerId, { salonId })

    // Create braiders
    const braiderIds = []
    const braiderData = [
      { name: 'Expert Test', splitPercentage: 75 },
      { name: 'Senior Test', splitPercentage: 65 },
      { name: 'Junior Test', splitPercentage: 50 }
    ]

    for (const data of braiderData) {
      const id = await ctx.db.insert('braiders', {
        salonId,
        name: data.name,
        email: `${data.name.toLowerCase().replace(' ', '.')}@test.com`,
        phone: '555-TEST',
        splitPercentage: data.splitPercentage,
        specialties: ['Box Braids', 'Cornrows'],
        maxDailyBookings: 4,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        defaultStartTime: '09:00',
        defaultEndTime: '18:00',
        workingDays: [1, 2, 3, 4, 5]
      })
      braiderIds.push(id)
    }

    // Create a test client
    const clientId = await ctx.db.insert('clients', {
      name: 'Test Client 1',
      email: 'client1@test.com',
      phone: '555-1111',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    // Create some test bookings
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    await ctx.db.insert('bookings', {
      salonId,
      clientId,
      braiderId: braiderIds[0],
      serviceDetails: {
        style: 'Box Braids',
        size: 'Medium',
        length: 'Shoulder Length',
        hairType: 'Type 4A',
        finalPrice: 250,
        estimatedDuration: 240
      },
      appointmentDate: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD format
      appointmentTime: '10:00',
      status: 'confirmed',
      platformFee: 5,
      payoutAmount: 245,
      serviceDurationMinutes: 240,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    return { 
      success: true, 
      salonId, 
      braiderIds,
      clientId,
      ownerId,
      message: 'Database seeded with test data'
    }
  }
})

// Cleanup all test data
export const cleanupAllTestData = mutation({
  args: {},
  handler: async (ctx) => {
    if (!isTestEnvironment()) {
      throw new Error('This operation is only available in test environment')
    }

    // Get all tables and clear them
    const tables = [
      'bookings',
      'braiders', 
      'clients',
      'salons',
      'users',
      'transactions',
      'clientNotes',
      'communicationLogs'
    ]

    for (const table of tables) {
      try {
        const records = await ctx.db.query(table as any).collect()
        for (const record of records) {
          await ctx.db.delete(record._id)
        }
      } catch (e) {
        // Table might not exist, continue
        console.log(`Could not clear table ${table}:`, e)
      }
    }

    return { success: true, message: 'All test data cleaned up' }
  }
})

// Create booking with automatic braider assignment
export const createBookingWithAssignment = mutation({
  args: {
    salonId: v.id('salons'),
    style: v.string(),
    size: v.optional(v.string()),
    appointmentTime: v.string(),
    duration: v.optional(v.number()),
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (!isTestEnvironment()) {
      throw new Error('This operation is only available in test environment')
    }

    // Find available braider
    const braiders = await ctx.db
      .query('braiders')
      .filter(q => q.eq(q.field('isActive'), true))
      .collect()

    if (braiders.length === 0) {
      throw new Error('No braiders available')
    }

    // Simple assignment - just pick first available
    const selectedBraider = braiders[0]

    // Create or find client
    const existingClients = await ctx.db
      .query('clients')
      .filter(q => q.eq(q.field('email'), args.clientEmail))
      .collect()

    let clientId = existingClients[0]?._id
    if (!clientId) {
      clientId = await ctx.db.insert('clients', {
        name: args.clientName,
        email: args.clientEmail,
        phone: args.clientPhone || '555-0000',
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    }

    // Parse appointment time
    const appointmentDate = new Date(args.appointmentTime)

    // Create booking
    const bookingId = await ctx.db.insert('bookings', {
      salonId: args.salonId,
      clientId,
      braiderId: selectedBraider._id,
      serviceDetails: {
        style: args.style,
        size: args.size || 'Medium',
        length: 'Shoulder Length',
        hairType: 'Type 4A',
        finalPrice: 250,
        estimatedDuration: args.duration || 240
      },
      appointmentDate: appointmentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      appointmentTime: appointmentDate.toTimeString().slice(0, 5),
      status: 'confirmed',
      platformFee: 5,
      payoutAmount: 245,
      serviceDurationMinutes: args.duration || 240,
      assignedBraiderId: selectedBraider._id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    return { 
      id: bookingId, 
      braiderId: selectedBraider._id,
      braiderName: selectedBraider.name,
      clientId
    }
  }
})

// Helper query to get test data status
export const getTestDataStatus = query({
  args: {},
  handler: async (ctx) => {
    if (!isTestEnvironment()) {
      return { error: 'Not in test environment' }
    }

    const bookings = await ctx.db.query('bookings').collect()
    const braiders = await ctx.db.query('braiders').collect()
    const clients = await ctx.db.query('clients').collect()
    const salons = await ctx.db.query('salons').collect()
    const users = await ctx.db.query('users').collect()

    return {
      bookings: bookings.length,
      braiders: braiders.length,
      clients: clients.length,
      salons: salons.length,
      users: users.length,
      total: bookings.length + braiders.length + clients.length + salons.length + users.length
    }
  }
})