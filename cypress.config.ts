import { defineConfig } from 'cypress'
import { ConvexClient } from 'convex/browser'
import { api } from './convex/_generated/api'

// Initialize Convex client for test tasks
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://your-convex-url.convex.cloud'
let convexClient: ConvexClient | null = null

function getConvexClient() {
  if (!convexClient) {
    convexClient = new ConvexClient(convexUrl)
  }
  return convexClient
}

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Test database tasks
      on('task', {
        // Reset test database
        async resetTestDatabase() {
          const client = getConvexClient()
          // Clear all test data
          await client.mutation(api.testing.resetDatabase, {})
          return null
        },

        // Seed test salon
        async seedTestSalon() {
          const client = getConvexClient()
          const salon = await client.mutation(api.testing.createTestSalon, {
            name: 'Test Salon',
            email: 'test@salon.com',
            settings: {
              maxConcurrentBookings: 3,
              bufferTimeMinutes: 30
            }
          })
          return salon
        },

        // Create test braiders
        async createTestBraiders() {
          const client = getConvexClient()
          const braiders = await client.mutation(api.testing.createTestBraiders, {})
          return braiders
        },

        // Create braider
        async createBraider(braiderData: any) {
          const client = getConvexClient()
          const braider = await client.mutation(api.braiders.createBraider, braiderData)
          return braider
        },

        // Create booking
        async createBooking(bookingData: any) {
          const client = getConvexClient()
          const booking = await client.mutation(api.booking.createBooking, bookingData)
          return booking
        },

        // Create full booking with braider assignment
        async createFullBooking(bookingData: any) {
          const client = getConvexClient()
          // const booking = await client.mutation(api.booking.createBookingWithAssignment, bookingData)
          // return booking
          console.log('createBookingWithAssignment not implemented')
          return null
        },

        // Create booking for specific braider
        async createBookingForBraider(data: any) {
          const client = getConvexClient()
          // const booking = await client.mutation(api.booking.assignBookingToBraider, data)
          // return booking
          console.log('assignBookingToBraider not implemented')
          return null
        },

        // Setup capacity settings
        async setupCapacitySettings(settings: any) {
          const client = getConvexClient()
          const result = await client.mutation(api.emergencyCapacity.updateCapacitySettings, settings)
          return result
        },

        // Update capacity settings
        async updateCapacitySettings(settings: any) {
          const client = getConvexClient()
          const result = await client.mutation(api.emergencyCapacity.updateCapacitySettings, settings)
          return result
        },

        // Login as salon owner
        async loginAsSalonOwner(data: { salonId: string }) {
          // Mock authentication for testing
          return { token: 'test-owner-token', salonId: data.salonId }
        },

        // Update braider status
        async updateBraiderStatus(data: any) {
          const client = getConvexClient()
          const result = await client.mutation(api.braiders.updateBraider, data)
          return result
        },

        // Get booking
        async getBooking(data: { bookingId: any }) {
          const client = getConvexClient()
          const booking = await client.query(api.booking.getBookingById, data)
          return booking
        },

        // Check notifications
        async checkNotifications(data: { clientEmail: string }) {
          const client = getConvexClient()
          // const notifications = await client.query(api.notifications.getClientNotifications, data)
          // return notifications
          console.log('getClientNotifications not implemented')
          return []
        },

        // Get client bookings
        async getClientBookings(data: { clientEmail: string }) {
          const client = getConvexClient()
          // const bookings = await client.query(api.booking.getClientBookings, data)
          // return bookings
          console.log('getClientBookings not implemented')
          return []
        },

        // Attempt concurrent booking
        async attemptConcurrentBooking(data: any) {
          const client = getConvexClient()
          try {
            const booking = await client.mutation(api.booking.createBooking, data)
            return { success: true, booking }
          } catch (error: any) {
            return { success: false, error: error.message }
          }
        },

        // Enable slow mode for testing
        async enableSlowMode(data: { delayMs: number }) {
          // This would be implemented in your backend
          return null
        },

        // Disable slow mode
        async disableSlowMode() {
          // This would be implemented in your backend
          return null
        },

        // Cleanup test data
        async cleanupTestData(data: {
          bookingIds: string[]
          braiderIds: string[]
          clientIds: string[]
          salonId?: string
        }) {
          const client = getConvexClient()
          
          // Delete bookings
          for (const id of data.bookingIds) {
            try {
              // await client.mutation(api.booking.deleteBooking, { bookingId: id })
              console.log(`Would delete booking ${id} - not implemented`)
            } catch (e) {
              console.log(`Failed to delete booking ${id}`)
            }
          }

          // Delete braiders
          for (const id of data.braiderIds) {
            try {
              // await client.mutation(api.braiders.deleteBraider, { braiderId: id })
              console.log(`Would delete braider ${id} - not implemented`)
            } catch (e) {
              console.log(`Failed to delete braider ${id}`)
            }
          }

          // Delete clients
          for (const id of data.clientIds) {
            try {
              // await client.mutation(api.clients.deleteClient, { clientId: id })
              console.log(`Would delete client ${id} - not implemented`)
            } catch (e) {
              console.log(`Failed to delete client ${id}`)
            }
          }

          // Delete salon if provided
          if (data.salonId) {
            try {
              // await client.mutation(api.salons.deleteSalon, { salonId: data.salonId })
              console.log(`Would delete salon ${data.salonId} - not implemented`)
            } catch (e) {
              console.log(`Failed to delete salon ${data.salonId}`)
            }
          }

          return null
        },

        // Perform full cleanup
        async performFullCleanup() {
          const client = getConvexClient()
          await client.mutation(api.testing.cleanupAllTestData, {})
          return null
        },

        // Seed database with test data
        async seedDatabase(data: { email: string, braiders?: number, clients?: number, bookings?: number }) {
          const client = getConvexClient()
          await client.mutation(api.seed.seedDevelopmentData, {
            userEmail: data.email,
          })
          return null
        },
        
        // Clear all test data for an email
        async clearDatabase(data: { email: string }) {
          const client = getConvexClient()
          await client.mutation(api.seed.cleanupTestData, {
            userEmail: data.email,
          })
          return null
        },

        // Username feature specific tasks
        async seedTestSalonWithToken() {
          const client = getConvexClient()
          // Create a test salon with only token (no username)
          const token = `test_token_${Date.now()}`
          // This would need to be implemented in your testing API
          // For now, return a mock token
          return token
        },

        async getLatestQuoteTracking() {
          const client = getConvexClient()
          // Get the most recent quote tracking entry
          // This would need to be implemented in your API
          return {
            source: 'direct_link',
            salonId: 'test_salon_id'
          }
        },

        async getSalonWithBothTokenAndUsername() {
          const client = getConvexClient()
          // Get a salon that has both token and username for migration testing
          // This would need to be implemented in your API
          return {
            token: 'test_token',
            username: 'testusername'
          }
        }
      })
    },
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      // Set environment variables for testing
      CYPRESS_TESTING: true,
      
      // Twilio Configuration for Testing
      TWILIO_ACCOUNT_SID: 'ACeee62849bc1baa32f347eb3e40a3f3a5',
      TWILIO_AUTH_TOKEN: 'becae1760a4d511b4dd2a3f1eeb4da06',
      TWILIO_PHONE_NUMBER: '+19804277268',
      TWILIO_MESSAGING_SERVICE_SID: 'MGb1b8f35fb9ec2ad2eb6974539b7e9bd3',
      
      // Test Phone Numbers
      TEST_PHONE_1: '+19807857108',
      TEST_PHONE_2: '+18033282700',
      
      // Platform Configuration
      PLATFORM_NAME: 'BraidPilot',
      PLATFORM_WEBSITE: 'https://braidpilot.com',
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
})