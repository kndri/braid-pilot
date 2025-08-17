/// <reference types="cypress" />

describe('Comprehensive Booking and Capacity Management Flow', () => {
  let testData: {
    salonId?: string
    bookingIds: string[]
    braiderIds: string[]
    clientIds: string[]
  }

  beforeEach(() => {
    // Initialize test data tracking
    testData = {
      bookingIds: [],
      braiderIds: [],
      clientIds: []
    }

    // Setup test environment
    cy.task('resetTestDatabase')
    cy.task('seedTestSalon').then((salon: any) => {
      testData.salonId = salon.id
    })
    
    cy.visit('/')
  })

  afterEach(() => {
    // Cleanup all test data
    cy.task('cleanupTestData', {
      bookingIds: testData.bookingIds,
      braiderIds: testData.braiderIds,
      clientIds: testData.clientIds,
      salonId: testData.salonId
    })
  })

  describe('Complete Booking Flow with Capacity Management', () => {
    it('should create bookings with proper capacity tracking and assignment', () => {
      // Step 1: Setup salon capacity settings
      cy.task('setupCapacitySettings', {
        salonId: testData.salonId,
        maxConcurrentBookings: 3,
        bufferTimeMinutes: 30,
        workingHours: {
          start: '09:00',
          end: '18:00'
        }
      })

      // Step 2: Create test braiders with different skill levels
      const braiders = [
        {
          name: 'Expert Braider',
          skillLevel: 'expert',
          specialties: ['Micro Braids', 'Goddess Braids', 'Fulani Braids'],
          hourlyRate: 75,
          maxConcurrentClients: 2
        },
        {
          name: 'Senior Braider',
          skillLevel: 'senior',
          specialties: ['Box Braids', 'Knotless Braids', 'Passion Twists'],
          hourlyRate: 60,
          maxConcurrentClients: 2
        },
        {
          name: 'Junior Braider',
          skillLevel: 'junior',
          specialties: ['Cornrows', 'Two Strand Twists'],
          hourlyRate: 45,
          maxConcurrentClients: 1
        }
      ]

      braiders.forEach(braider => {
        cy.task('createBraider', {
          ...braider,
          salonId: testData.salonId
        }).then((created: any) => {
          testData.braiderIds.push(created.id)
        })
      })

      // Step 3: Create first booking - Complex style requiring expert
      cy.visit(`/quote/${testData.salonId}`)
      
      cy.fillQuoteForm({
        style: 'Micro Braids',
        size: 'Small',
        length: 'Waist Length',
        hairType: 'Type 4C'
      })

      // Verify price calculation
      cy.contains('Estimated Price:').should('be.visible')
      cy.contains('$450').should('be.visible') // Expected price for complex style
      cy.contains('Estimated Duration: 8 hours').should('be.visible')

      // Select appointment time
      cy.contains('button', 'Book Appointment').click()
      cy.get('[data-testid="date-picker"]').click()
      cy.get('[data-date="tomorrow"]').click() // Select tomorrow
      cy.get('[data-time="09:00"]').click()
      
      // Fill client details
      cy.fillBookingForm({
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '555-0001',
        notes: 'First time client, sensitive scalp'
      })

      // Confirm booking
      cy.contains('button', 'Confirm Booking').click()
      
      // Store booking ID
      cy.get('[data-testid="booking-confirmation"]').should('be.visible')
      cy.get('[data-booking-id]').invoke('attr', 'data-booking-id').then((id) => {
        testData.bookingIds.push(id as string)
      })

      // Verify assignment to expert braider
      cy.contains('Assigned to: Expert Braider').should('be.visible')
      cy.contains('Appointment confirmed for tomorrow at 9:00 AM').should('be.visible')

      // Step 4: Create second overlapping booking - Should assign to different braider
      cy.visit(`/quote/${testData.salonId}`)
      
      cy.fillQuoteForm({
        style: 'Box Braids',
        size: 'Medium',
        length: 'Shoulder Length',
        hairType: 'Type 3C'
      })

      cy.contains('Estimated Duration: 4 hours').should('be.visible')
      
      cy.contains('button', 'Book Appointment').click()
      cy.get('[data-testid="date-picker"]').click()
      cy.get('[data-date="tomorrow"]').click()
      cy.get('[data-time="10:00"]').click() // Overlapping time
      
      cy.fillBookingForm({
        name: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        phone: '555-0002'
      })

      cy.contains('button', 'Confirm Booking').click()
      
      cy.get('[data-booking-id]').invoke('attr', 'data-booking-id').then((id) => {
        testData.bookingIds.push(id as string)
      })

      // Should assign to senior braider (not expert who's busy)
      cy.contains('Assigned to: Senior Braider').should('be.visible')

      // Step 5: Create third booking - Testing capacity limits
      cy.visit(`/quote/${testData.salonId}`)
      
      cy.fillQuoteForm({
        style: 'Cornrows',
        size: 'Large',
        length: 'Shoulder Length',
        hairType: 'Type 4A'
      })

      cy.contains('button', 'Book Appointment').click()
      cy.get('[data-testid="date-picker"]').click()
      cy.get('[data-date="tomorrow"]').click()
      cy.get('[data-time="10:30"]').click()
      
      cy.fillBookingForm({
        name: 'Jessica Smith',
        email: 'jessica.smith@example.com',
        phone: '555-0003'
      })

      cy.contains('button', 'Confirm Booking').click()
      
      cy.get('[data-booking-id]').invoke('attr', 'data-booking-id').then((id) => {
        testData.bookingIds.push(id as string)
      })

      // Should assign to junior braider
      cy.contains('Assigned to: Junior Braider').should('be.visible')

      // Step 6: Try fourth booking - Should hit capacity limit
      cy.visit(`/quote/${testData.salonId}`)
      
      cy.fillQuoteForm({
        style: 'Two Strand Twists',
        size: 'Medium',
        length: 'Mid-Back Length',
        hairType: 'Type 4B'
      })

      cy.contains('button', 'Book Appointment').click()
      cy.get('[data-testid="date-picker"]').click()
      cy.get('[data-date="tomorrow"]').click()
      
      // 10:30 slot should be unavailable (capacity reached)
      cy.get('[data-time="10:30"]').should('have.class', 'unavailable')
      cy.get('[data-time="10:30"]').should('have.attr', 'disabled')
      
      // Should show capacity message
      cy.contains('This time slot is at full capacity').should('be.visible')

      // Try a later time after buffer period
      cy.get('[data-time="14:00"]').click() // After morning bookings complete
      
      cy.fillBookingForm({
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '555-0004'
      })

      cy.contains('button', 'Confirm Booking').click()
      
      cy.get('[data-booking-id]').invoke('attr', 'data-booking-id').then((id) => {
        testData.bookingIds.push(id as string)
      })

      // Should successfully book in afternoon slot
      cy.contains('Appointment confirmed for tomorrow at 2:00 PM').should('be.visible')
    })

    it('should handle booking modifications and reassignments', () => {
      // Create initial booking
      cy.task('createFullBooking', {
        salonId: testData.salonId,
        style: 'Box Braids',
        appointmentTime: '2024-12-20T14:00:00Z',
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        clientPhone: '555-1234'
      }).then((booking: any) => {
        testData.bookingIds.push(booking.id)
        
        // Login as salon owner
        cy.task('loginAsSalonOwner', { salonId: testData.salonId })
        
        // Navigate to booking management
        cy.visit('/dashboard/bookings')
        
        // Find the booking
        cy.contains('Test Client').should('be.visible')
        cy.contains('Test Client')
          .parent()
          .parent()
          .within(() => {
            // Click manage button
            cy.contains('button', 'Manage').click()
          })

        // Modify appointment time
        cy.contains('button', 'Reschedule').click()
        cy.get('[data-testid="new-time-picker"]').click()
        cy.get('[data-time="16:00"]').click()
        cy.contains('button', 'Confirm Reschedule').click()

        // Verify update
        cy.contains('Appointment rescheduled to 4:00 PM').should('be.visible')

        // Reassign braider
        cy.contains('button', 'Reassign Braider').click()
        cy.get('select[name="newBraiderId"]').select('Senior Braider')
        cy.contains('button', 'Confirm Reassignment').click()

        // Verify reassignment
        cy.contains('Braider reassigned successfully').should('be.visible')
        cy.contains('Senior Braider').should('be.visible')

        // Cancel booking
        cy.contains('button', 'Cancel Booking').click()
        cy.contains('button', 'Confirm Cancellation').click()

        // Verify cancellation
        cy.contains('Booking cancelled').should('be.visible')
        cy.contains('Test Client')
          .parent()
          .parent()
          .should('contain', 'Cancelled')
      })
    })

    it('should enforce buffer times between appointments', () => {
      // Set 45 minute buffer time
      cy.task('updateCapacitySettings', {
        salonId: testData.salonId,
        bufferTimeMinutes: 45
      })

      // Create first booking ending at 1PM (4 hour service from 9AM)
      cy.task('createFullBooking', {
        salonId: testData.salonId,
        style: 'Box Braids',
        size: 'Medium',
        appointmentTime: '2024-12-20T09:00:00Z',
        duration: 240, // 4 hours
        clientName: 'Morning Client',
        clientEmail: 'morning@example.com'
      }).then((booking: any) => {
        testData.bookingIds.push(booking.id)

        // Try to book immediately after (should fail due to buffer)
        cy.visit(`/quote/${testData.salonId}`)
        
        cy.fillQuoteForm({
          style: 'Cornrows',
          size: 'Medium',
          length: 'Shoulder Length',
          hairType: 'Type 4A'
        })

        cy.contains('button', 'Book Appointment').click()
        cy.get('[data-testid="date-picker"]').click()
        cy.get('[data-date="2024-12-20"]').click()
        
        // 1:00 PM should be unavailable (within buffer)
        cy.get('[data-time="13:00"]').should('have.class', 'buffer-blocked')
        cy.get('[data-time="13:00"]').trigger('hover')
        cy.contains('Buffer time required').should('be.visible')

        // 1:45 PM should be available (after buffer)
        cy.get('[data-time="13:45"]').should('not.have.class', 'unavailable')
        cy.get('[data-time="13:45"]').click()

        cy.fillBookingForm({
          name: 'Afternoon Client',
          email: 'afternoon@example.com',
          phone: '555-2000'
        })

        cy.contains('button', 'Confirm Booking').click()
        
        cy.get('[data-booking-id]').invoke('attr', 'data-booking-id').then((id) => {
          testData.bookingIds.push(id as string)
        })

        cy.contains('Appointment confirmed for 1:45 PM').should('be.visible')
      })
    })

    it('should track braider workload and prevent overworking', () => {
      // Create braider with workload limits
      cy.task('createBraider', {
        salonId: testData.salonId,
        name: 'Limited Braider',
        maxDailyHours: 8,
        maxWeeklyHours: 40
      }).then((braider: any) => {
        testData.braiderIds.push(braider.id)

        // Create bookings totaling 7 hours
        const bookings = [
          { time: '09:00', duration: 180 }, // 3 hours
          { time: '12:30', duration: 240 }  // 4 hours
        ]

        bookings.forEach(booking => {
          cy.task('createBookingForBraider', {
            braiderId: braider.id,
            appointmentTime: `2024-12-20T${booking.time}:00Z`,
            duration: booking.duration
          }).then((b: any) => {
            testData.bookingIds.push(b.id)
          })
        })

        // Try to add another 2-hour booking (would exceed 8 hour limit)
        cy.visit(`/quote/${testData.salonId}`)
        
        cy.fillQuoteForm({
          style: 'Cornrows',
          size: 'Medium',
          length: 'Shoulder Length',
          hairType: 'Type 4A'
        })

        cy.contains('button', 'Book Appointment').click()
        cy.get('[data-testid="date-picker"]').click()
        cy.get('[data-date="2024-12-20"]').click()
        cy.get('[data-time="17:00"]').click()

        // Should show braider workload warning
        cy.contains('No available braiders due to workload limits').should('be.visible')
        cy.contains('All qualified braiders have reached their daily hour limit').should('be.visible')
      })
    })
  })

  describe('Capacity Dashboard and Monitoring', () => {
    it('should display real-time capacity metrics', () => {
      // Create various bookings
      const bookings = [
        { time: '09:00', status: 'confirmed' },
        { time: '10:00', status: 'confirmed' },
        { time: '11:00', status: 'pending' },
        { time: '14:00', status: 'confirmed' },
        { time: '15:00', status: 'cancelled' }
      ]

      bookings.forEach(booking => {
        cy.task('createBooking', {
          salonId: testData.salonId,
          appointmentTime: `2024-12-20T${booking.time}:00Z`,
          status: booking.status
        }).then((b: any) => {
          testData.bookingIds.push(b.id)
        })
      })

      // Login as salon owner
      cy.task('loginAsSalonOwner', { salonId: testData.salonId })
      
      // Navigate to capacity dashboard
      cy.visit('/dashboard/capacity')

      // Check capacity overview
      cy.contains('Capacity Overview').should('be.visible')
      cy.contains('Today\'s Utilization').should('be.visible')
      
      // Verify metrics
      cy.get('[data-testid="total-bookings"]').should('contain', '3') // Only confirmed
      cy.get('[data-testid="pending-bookings"]').should('contain', '1')
      cy.get('[data-testid="capacity-percentage"]').should('contain', '60%') // 3 out of 5 slots

      // Check hourly breakdown
      cy.contains('Hourly Breakdown').should('be.visible')
      
      // 9 AM slot should show as booked
      cy.get('[data-hour="09:00"]').should('have.class', 'booked')
      cy.get('[data-hour="09:00"]').trigger('hover')
      cy.contains('1 booking').should('be.visible')

      // 11 AM slot should show as pending
      cy.get('[data-hour="11:00"]').should('have.class', 'pending')
      
      // 12 PM slot should show as available
      cy.get('[data-hour="12:00"]').should('have.class', 'available')

      // Check braider utilization
      cy.contains('Braider Utilization').should('be.visible')
      cy.get('[data-testid="braider-cards"]').within(() => {
        cy.contains('Expert Braider').should('be.visible')
        cy.contains('2 bookings').should('be.visible')
        cy.contains('7 hours').should('be.visible')
      })
    })

    it('should allow administrative time blocking', () => {
      cy.task('loginAsSalonOwner', { salonId: testData.salonId })
      cy.visit('/dashboard/capacity')

      // Block lunch hours
      cy.contains('button', 'Manage Blocks').click()
      cy.contains('Block Time Slots').should('be.visible')

      // Select date
      cy.get('[data-testid="block-date-picker"]').click()
      cy.get('[data-date="tomorrow"]').click()

      // Select time range
      cy.get('input[name="blockStartTime"]').type('12:00')
      cy.get('input[name="blockEndTime"]').type('13:00')
      cy.get('input[name="blockReason"]').type('Lunch Break')
      
      // Apply to all braiders
      cy.get('input[name="applyToAll"]').check()
      
      cy.contains('button', 'Block Time').click()
      cy.contains('Time blocked successfully').should('be.visible')

      // Verify block appears in calendar
      cy.get('[data-hour="12:00"]').should('have.class', 'blocked')
      cy.get('[data-hour="12:00"]').trigger('hover')
      cy.contains('Lunch Break').should('be.visible')

      // Try to book during blocked time
      cy.visit(`/quote/${testData.salonId}`)
      
      cy.fillQuoteForm({
        style: 'Cornrows',
        size: 'Medium',
        length: 'Shoulder Length',
        hairType: 'Type 4A'
      })

      cy.contains('button', 'Book Appointment').click()
      cy.get('[data-testid="date-picker"]').click()
      cy.get('[data-date="tomorrow"]').click()
      
      // 12:00 PM should not be available
      cy.get('[data-time="12:00"]').should('not.exist')
      cy.contains('12:00 PM - Blocked').should('be.visible')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent booking attempts gracefully', () => {
      // Simulate multiple users trying to book same slot
      const clientDetails = [
        { name: 'Client A', email: 'clienta@example.com' },
        { name: 'Client B', email: 'clientb@example.com' }
      ]

      // Open multiple tabs/windows
      cy.window().then((win) => {
        // First client starts booking
        cy.visit(`/quote/${testData.salonId}`)
        cy.fillQuoteForm({
          style: 'Box Braids',
          size: 'Medium',
          length: 'Shoulder Length',
          hairType: 'Type 4A'
        })
        cy.contains('button', 'Book Appointment').click()
        cy.get('[data-time="10:00"]').click()

        // Simulate second client trying same slot
        cy.task('attemptConcurrentBooking', {
          salonId: testData.salonId,
          appointmentTime: '2024-12-20T10:00:00Z',
          clientEmail: 'clientb@example.com'
        }).then((result: any) => {
          // Second booking should fail
          expect(result.success).to.be.false
          expect(result.error).to.contain('already booked')
        })

        // First client completes booking
        cy.fillBookingForm({
          name: clientDetails[0].name,
          email: clientDetails[0].email,
          phone: '555-1111'
        })
        cy.contains('button', 'Confirm Booking').click()
        
        cy.get('[data-booking-id]').invoke('attr', 'data-booking-id').then((id) => {
          testData.bookingIds.push(id as string)
        })

        cy.contains('Appointment confirmed').should('be.visible')
      })
    })

    it('should handle braider suddenly becoming unavailable', () => {
      // Create braider and booking
      cy.task('createBraider', {
        salonId: testData.salonId,
        name: 'Emergency Braider',
        status: 'active'
      }).then((braider: any) => {
        testData.braiderIds.push(braider.id)

        // Create booking for this braider
        cy.task('createBookingForBraider', {
          braiderId: braider.id,
          appointmentTime: '2024-12-20T10:00:00Z',
          clientName: 'Affected Client',
          clientEmail: 'affected@example.com'
        }).then((booking: any) => {
          testData.bookingIds.push(booking.id)

          // Braider calls in sick
          cy.task('updateBraiderStatus', {
            braiderId: braider.id,
            status: 'unavailable',
            reason: 'sick'
          })

          // System should automatically reassign
          cy.task('getBooking', { bookingId: booking.id }).then((updated: any) => {
            expect(updated.braiderId).to.not.equal(braider.id)
            expect(updated.reassignmentReason).to.equal('Original braider unavailable')
          })

          // Client should receive notification
          cy.task('checkNotifications', {
            clientEmail: 'affected@example.com'
          }).then((notifications: any) => {
            expect(notifications).to.have.length.greaterThan(0)
            expect(notifications[0].type).to.equal('braider_reassignment')
          })
        })
      })
    })

    it('should prevent double bookings with system lag', () => {
      // Create high load scenario
      cy.task('enableSlowMode', { delayMs: 2000 })

      cy.visit(`/quote/${testData.salonId}`)
      
      cy.fillQuoteForm({
        style: 'Box Braids',
        size: 'Medium',
        length: 'Shoulder Length',
        hairType: 'Type 4A'
      })

      cy.contains('button', 'Book Appointment').click()
      cy.get('[data-time="11:00"]').click()
      
      cy.fillBookingForm({
        name: 'Slow Network Client',
        email: 'slow@example.com',
        phone: '555-9999'
      })

      // Click confirm multiple times (impatient user)
      cy.contains('button', 'Confirm Booking').click()
      cy.contains('button', 'Confirm Booking').click()
      cy.contains('button', 'Confirm Booking').click()

      // Should only create one booking
      cy.wait(3000)
      cy.task('getClientBookings', {
        clientEmail: 'slow@example.com'
      }).then((bookings: any) => {
        expect(bookings).to.have.length(1)
        testData.bookingIds.push(bookings[0].id)
      })

      // Should show appropriate feedback
      cy.contains('Processing your booking...').should('be.visible')
      cy.contains('Appointment confirmed').should('be.visible')

      cy.task('disableSlowMode')
    })
  })
})

// Cleanup helper to ensure all test data is removed
after(() => {
  cy.task('performFullCleanup')
})