/// <reference types="cypress" />

import { ConvexClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'

// Type for created data
type CreatedData = {
  bookings: Set<string>;
  braiders: Set<string>;
  clients: Set<string>;
  salons: Set<string>;
  capacitySettings: Set<string>;
};

// Test data cleanup utilities
export const testDataManager = {
  // Track all created test data
  createdData: {
    bookings: new Set<string>(),
    braiders: new Set<string>(),
    clients: new Set<string>(),
    salons: new Set<string>(),
    capacitySettings: new Set<string>(),
  } as CreatedData,

  // Add data to tracking
  track(type: keyof CreatedData, id: string) {
    this.createdData[type].add(id)
  },

  // Clean up all tracked data
  async cleanupAll(convexClient: ConvexClient) {
    const cleanupPromises: Promise<void>[] = []

    // Delete bookings first (they reference other entities)
    // Note: These delete mutations need to be implemented in Convex
    for (const bookingId of this.createdData.bookings) {
      // TODO: Implement deleteBooking mutation
      console.log(`Would delete booking ${bookingId}`)
    }
    await Promise.all(cleanupPromises)
    cleanupPromises.length = 0

    // Delete braiders
    for (const braiderId of this.createdData.braiders) {
      // TODO: Implement deleteBraider mutation
      console.log(`Would delete braider ${braiderId}`)
    }
    await Promise.all(cleanupPromises)
    cleanupPromises.length = 0

    // Delete clients
    for (const clientId of this.createdData.clients) {
      // TODO: Implement deleteClient mutation
      console.log(`Would delete client ${clientId}`)
    }
    await Promise.all(cleanupPromises)
    cleanupPromises.length = 0

    // Delete capacity settings
    for (const settingId of this.createdData.capacitySettings) {
      // TODO: Implement deleteCapacitySetting mutation
      console.log(`Would delete capacity setting ${settingId}`)
    }
    await Promise.all(cleanupPromises)
    cleanupPromises.length = 0

    // Delete salons last
    for (const salonId of this.createdData.salons) {
      // TODO: Implement deleteSalon mutation
      console.log(`Would delete salon ${salonId}`)
    }
    await Promise.all(cleanupPromises)

    // Clear tracking
    Object.keys(this.createdData).forEach(key => {
      this.createdData[key as keyof CreatedData].clear()
    })
  },

  // Reset specific data type
  async resetType(type: keyof CreatedData, convexClient: ConvexClient) {
    const items = Array.from(this.createdData[type])
    
    // TODO: Implement delete mutations in Convex
    for (const id of items) {
      console.log(`Would delete ${type} item: ${id}`)
    }
    
    this.createdData[type].clear()
  }
}

// Test data factory functions
export const testDataFactory = {
  // Create test salon with default settings
  createTestSalon(overrides = {}) {
    return {
      name: 'Test Salon',
      email: 'test@salon.com',
      phone: '555-0000',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345',
      settings: {
        maxConcurrentBookings: 3,
        bufferTimeMinutes: 30,
        workingHours: {
          monday: { start: '09:00', end: '18:00', closed: false },
          tuesday: { start: '09:00', end: '18:00', closed: false },
          wednesday: { start: '09:00', end: '18:00', closed: false },
          thursday: { start: '09:00', end: '18:00', closed: false },
          friday: { start: '09:00', end: '18:00', closed: false },
          saturday: { start: '10:00', end: '16:00', closed: false },
          sunday: { start: '00:00', end: '00:00', closed: true }
        }
      },
      ...overrides
    }
  },

  // Create test braider
  createTestBraider(overrides = {}) {
    return {
      name: 'Test Braider',
      email: 'braider@test.com',
      phone: '555-1111',
      skillLevel: 'senior',
      hourlyRate: 60,
      maxConcurrentClients: 2,
      maxDailyHours: 8,
      maxWeeklyHours: 40,
      specialties: ['Box Braids', 'Knotless Braids'],
      availability: {
        monday: { available: true, start: '09:00', end: '18:00' },
        tuesday: { available: true, start: '09:00', end: '18:00' },
        wednesday: { available: true, start: '09:00', end: '18:00' },
        thursday: { available: true, start: '09:00', end: '18:00' },
        friday: { available: true, start: '09:00', end: '18:00' },
        saturday: { available: false },
        sunday: { available: false }
      },
      status: 'active',
      ...overrides
    }
  },

  // Create test booking
  createTestBooking(overrides = {}) {
    const appointmentTime = new Date()
    appointmentTime.setDate(appointmentTime.getDate() + 1) // Tomorrow
    appointmentTime.setHours(10, 0, 0, 0)

    return {
      style: 'Box Braids',
      size: 'Medium',
      length: 'Shoulder Length',
      hairType: 'Type 4A',
      appointmentTime: appointmentTime.toISOString(),
      duration: 240, // 4 hours
      price: 250,
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientPhone: '555-2222',
      status: 'confirmed',
      notes: '',
      ...overrides
    }
  },

  // Create test client
  createTestClient(overrides = {}) {
    return {
      name: 'Test Client',
      email: 'client@test.com',
      phone: '555-3333',
      preferredBraiderId: null,
      notes: '',
      bookingHistory: [],
      ...overrides
    }
  },

  // Generate multiple test bookings for capacity testing
  generateBookingsForCapacityTest(count: number, baseTime: Date) {
    const bookings = []
    const styles = ['Box Braids', 'Knotless Braids', 'Cornrows', 'Micro Braids']
    const sizes = ['Small', 'Medium', 'Large']
    const lengths = ['Shoulder Length', 'Mid-Back Length', 'Waist Length']

    for (let i = 0; i < count; i++) {
      const appointmentTime = new Date(baseTime)
      appointmentTime.setHours(9 + Math.floor(i / 2), (i % 2) * 30, 0, 0)

      bookings.push(this.createTestBooking({
        style: styles[i % styles.length],
        size: sizes[i % sizes.length],
        length: lengths[i % lengths.length],
        appointmentTime: appointmentTime.toISOString(),
        clientName: `Client ${i + 1}`,
        clientEmail: `client${i + 1}@test.com`,
        clientPhone: `555-${String(4000 + i).padStart(4, '0')}`
      }))
    }

    return bookings
  }
}

// Validation utilities
export const testValidation = {
  // Validate booking doesn't conflict with existing bookings
  async validateNoConflicts(
    convexClient: ConvexClient,
    appointmentTime: Date,
    duration: number,
    braiderId?: string
  ) {
    const endTime = new Date(appointmentTime.getTime() + duration * 60000)
    
    const existingBookings = await convexClient.query(api.booking.getBookingsByTimeRange, {
      startTime: appointmentTime.toISOString(),
      endTime: endTime.toISOString(),
      braiderId
    })

    return existingBookings.length === 0
  },

  // Check if braider has capacity
  async checkBraiderCapacity(
    convexClient: ConvexClient,
    braiderId: string,
    appointmentTime: Date,
    duration: number
  ) {
    const braider = await convexClient.query(api.braiders.getBraider, { braiderId })
    if (!braider) return false

    const dayStart = new Date(appointmentTime)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(appointmentTime)
    dayEnd.setHours(23, 59, 59, 999)

    const dayBookings = await convexClient.query(api.booking.getBraiderBookings, {
      braiderId,
      startTime: dayStart.toISOString(),
      endTime: dayEnd.toISOString()
    })

    const totalMinutes = dayBookings.reduce((sum, b) => sum + b.duration, 0) + duration
    const totalHours = totalMinutes / 60

    return totalHours <= braider.maxDailyHours
  },

  // Validate salon capacity limits
  async validateSalonCapacity(
    convexClient: ConvexClient,
    salonId: string,
    appointmentTime: Date,
    duration: number
  ) {
    const endTime = new Date(appointmentTime.getTime() + duration * 60000)
    
    const capacitySettings = await convexClient.query(api.emergencyCapacity.getCapacitySettings, {
      salonId
    })

    if (!capacitySettings) return true // No limits set

    const overlappingBookings = await convexClient.query(api.booking.getOverlappingBookings, {
      salonId,
      startTime: appointmentTime.toISOString(),
      endTime: endTime.toISOString()
    })

    return overlappingBookings.length < capacitySettings.maxConcurrentBookings
  }
}

// Mock data generators for testing
export const mockDataGenerators = {
  // Generate realistic client names
  generateClientName() {
    const firstNames = ['Sarah', 'Maria', 'Jessica', 'Emily', 'Ashley', 'Brittany', 'Samantha', 'Nicole', 'Jennifer', 'Michelle']
    const lastNames = ['Johnson', 'Garcia', 'Smith', 'Davis', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore']
    
    const first = firstNames[Math.floor(Math.random() * firstNames.length)]
    const last = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    return `${first} ${last}`
  },

  // Generate phone number
  generatePhoneNumber() {
    const areaCode = Math.floor(Math.random() * 900) + 100
    const prefix = Math.floor(Math.random() * 900) + 100
    const lineNumber = Math.floor(Math.random() * 9000) + 1000
    
    return `${areaCode}-${prefix}-${lineNumber}`
  },

  // Generate email from name
  generateEmail(name: string) {
    const clean = name.toLowerCase().replace(/\s+/g, '.')
    const random = Math.floor(Math.random() * 1000)
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'test.com']
    const domain = domains[Math.floor(Math.random() * domains.length)]
    
    return `${clean}${random}@${domain}`
  }
}

// Performance testing utilities
export const performanceUtils = {
  // Measure operation time
  async measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    const result = await operation()
    const duration = performance.now() - start
    
    return { result, duration }
  },

  // Simulate concurrent operations
  async simulateConcurrentOperations<T>(
    operations: Array<() => Promise<T>>,
    maxConcurrent = 5
  ): Promise<Array<{ result?: T; error?: any; duration: number }>> {
    const results: Array<{ result?: T; error?: any; duration: number }> = []
    const executing: Promise<void>[] = []

    for (const operation of operations) {
      const promise = this.measureTime(operation)
        .then(({ result, duration }) => {
          results.push({ result, duration })
        })
        .catch(error => {
          results.push({ error, duration: 0 })
        })

      executing.push(promise)

      if (executing.length >= maxConcurrent) {
        await Promise.race(executing)
        executing.splice(executing.findIndex(p => p), 1)
      }
    }

    await Promise.all(executing)
    return results
  },

  // Generate load test scenarios
  generateLoadTestScenario(config: {
    bookingsPerHour: number
    testDurationHours: number
    braiderCount: number
  }) {
    const scenarios = []
    const baseTime = new Date()
    baseTime.setHours(9, 0, 0, 0)

    for (let hour = 0; hour < config.testDurationHours; hour++) {
      for (let booking = 0; booking < config.bookingsPerHour; booking++) {
        const appointmentTime = new Date(baseTime)
        appointmentTime.setHours(appointmentTime.getHours() + hour)
        appointmentTime.setMinutes(Math.floor(60 * booking / config.bookingsPerHour))

        scenarios.push({
          appointmentTime,
          braiderId: `braider-${(booking % config.braiderCount) + 1}`,
          clientName: mockDataGenerators.generateClientName(),
          duration: 120 + Math.floor(Math.random() * 240) // 2-6 hours
        })
      }
    }

    return scenarios
  }
}

// Export as namespace for Cypress
declare global {
  namespace Cypress {
    interface Chainable {
      cleanupTestData(): Chainable<void>
      validateBookingCapacity(bookingData: any): Chainable<boolean>
      generateTestScenario(config: any): Chainable<any[]>
    }
  }
}

// Register commands
Cypress.Commands.add('cleanupTestData', () => {
  cy.window().then(async (win) => {
    const convexClient = (win as any).convexClient as ConvexClient
    if (convexClient) {
      await testDataManager.cleanupAll(convexClient)
    }
  })
})

Cypress.Commands.add('validateBookingCapacity', (bookingData) => {
  return cy.window().then(async (win) => {
    const convexClient = (win as any).convexClient as ConvexClient
    if (!convexClient) return false

    const isValid = await testValidation.validateSalonCapacity(
      convexClient,
      bookingData.salonId,
      new Date(bookingData.appointmentTime),
      bookingData.duration
    )

    return isValid
  })
})

Cypress.Commands.add('generateTestScenario', (config) => {
  return cy.wrap(performanceUtils.generateLoadTestScenario(config))
})