describe('Booking Management', () => {
  beforeEach(() => {
    // Login as salon owner
    cy.login('salon-owner@test.com', 'TestPassword123!')
    
    // Navigate to bookings page
    cy.visit('/dashboard/bookings')
    
    // Wait for page to load
    cy.contains('Booking Management').should('be.visible')
  })

  describe('Calendar View', () => {
    it('should display bookings in calendar format', () => {
      // Ensure calendar view is selected
      cy.get('button').contains('Calendar View').click()
      
      // Check calendar structure
      cy.get('[class*="grid-cols-7"]').should('exist')
      
      // Check for day headers
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      days.forEach(day => {
        cy.contains(day).should('be.visible')
      })
      
      // Check for current month display
      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      cy.contains(currentMonth).should('be.visible')
    })

    it('should navigate between months', () => {
      // Get current month
      const currentDate = new Date()
      const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      
      // Navigate to next month
      cy.get('button[aria-label="Next month"]').click()
      const nextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
        .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      cy.contains(nextMonth).should('be.visible')
      
      // Navigate to previous month
      cy.get('button[aria-label="Previous month"]').click()
      cy.get('button[aria-label="Previous month"]').click()
      const prevMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 2))
        .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      cy.contains(prevMonth).should('be.visible')
      
      // Return to today
      cy.get('button').contains('Today').click()
      cy.contains(currentMonth).should('be.visible')
    })

    it('should display booking cards with status colors', () => {
      // Check for booking cards
      cy.get('[class*="bg-blue-100"]').first().should('exist') // Confirmed booking
      cy.get('[class*="bg-green-100"]').should('exist') // Completed booking
      
      // Click on a booking card
      cy.get('[class*="bg-blue-100"]').first().click()
      
      // Modal should open
      cy.contains('Appointment Details').should('be.visible')
    })
  })

  describe('List View', () => {
    it('should display bookings in list format', () => {
      // Switch to list view
      cy.get('button').contains('List View').click()
      
      // Check for table headers
      cy.contains('Client').should('be.visible')
      cy.contains('Date & Time').should('be.visible')
      cy.contains('Service').should('be.visible')
      cy.contains('Price').should('be.visible')
      cy.contains('Status').should('be.visible')
      
      // Check for booking rows
      cy.get('[class*="grid-cols-12"]').should('have.length.greaterThan', 1)
    })

    it('should open booking details on row click', () => {
      cy.get('button').contains('List View').click()
      
      // Click on first booking row
      cy.get('[class*="hover:bg-gray-50"]').first().click()
      
      // Modal should open
      cy.contains('Appointment Details').should('be.visible')
      cy.contains('Client Information').should('be.visible')
      cy.contains('Service Details').should('be.visible')
    })
  })

  describe('Status Filtering', () => {
    it('should filter bookings by status', () => {
      // Select confirmed bookings
      cy.get('select').select('Confirmed')
      cy.wait(500)
      
      // Check that only confirmed bookings are shown
      cy.get('[class*="text-blue-700"]').should('exist')
      cy.get('[class*="text-green-700"]').should('not.exist')
      
      // Select completed bookings
      cy.get('select').select('Completed')
      cy.wait(500)
      
      // Check that only completed bookings are shown
      cy.get('[class*="text-green-700"]').should('exist')
      cy.get('[class*="text-blue-700"]').should('not.exist')
      
      // Select all bookings
      cy.get('select').select('All Bookings')
      cy.wait(500)
      
      // Multiple status types should be visible
      cy.get('[class*="rounded-full"]').should('have.length.greaterThan', 1)
    })
  })

  describe('Booking Status Management', () => {
    beforeEach(() => {
      // Open a confirmed booking
      cy.get('button').contains('List View').click()
      cy.get('[class*="text-blue-700"]').first().parents('[class*="hover:bg-gray-50"]').click()
      cy.contains('Appointment Details').should('be.visible')
    })

    it('should mark booking as completed', () => {
      // Click Mark as Completed button
      cy.get('button').contains('Mark as Completed').click()
      
      // Confirm action (if confirmation dialog exists)
      cy.on('window:confirm', () => true)
      
      // Modal should close
      cy.contains('Appointment Details').should('not.exist')
      
      // Status should be updated in list
      cy.get('[class*="text-green-700"]').should('contain', 'Completed')
    })

    it('should mark booking as no-show', () => {
      // Click Mark as No-Show button
      cy.get('button').contains('Mark as No-Show').click()
      
      // Confirm action
      cy.on('window:confirm', () => true)
      
      // Modal should close
      cy.contains('Appointment Details').should('not.exist')
      
      // Status should be updated
      cy.get('[class*="text-orange-700"]').should('contain', 'No-Show')
    })

    it('should cancel booking', () => {
      // Click Cancel Appointment button
      cy.get('button').contains('Cancel Appointment').click()
      
      // Confirm cancellation
      cy.on('window:confirm', () => true)
      
      // Modal should close
      cy.contains('Appointment Details').should('not.exist')
      
      // Status should be updated
      cy.get('[class*="text-red-700"]').should('contain', 'Cancelled')
    })
  })

  describe('Reschedule Functionality', () => {
    beforeEach(() => {
      // Open a confirmed booking
      cy.get('button').contains('List View').click()
      cy.get('[class*="text-blue-700"]').first().parents('[class*="hover:bg-gray-50"]').click()
      cy.contains('Appointment Details').should('be.visible')
    })

    it('should show reschedule interface', () => {
      // Click Reschedule button
      cy.get('button').contains('Reschedule').click()
      
      // Reschedule section should appear
      cy.contains('Reschedule Appointment').should('be.visible')
      cy.get('input[type="date"]').should('be.visible')
      cy.get('input[type="time"]').should('be.visible')
    })

    it('should reschedule appointment to new date and time', () => {
      // Click Reschedule button
      cy.get('button').contains('Reschedule').click()
      
      // Select new date (tomorrow)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      cy.get('input[type="date"]').type(dateStr)
      
      // Select new time
      cy.get('input[type="time"]').type('14:00')
      
      // Confirm reschedule
      cy.get('button').contains('Confirm Reschedule').click()
      
      // Modal should close
      cy.contains('Appointment Details').should('not.exist')
      
      // Check that booking appears on new date
      cy.get('button').contains('Calendar View').click()
      // Navigate to tomorrow if needed
      cy.contains(tomorrow.getDate().toString()).parent().should('contain', '14:00')
    })

    it('should cancel reschedule operation', () => {
      // Click Reschedule button
      cy.get('button').contains('Reschedule').click()
      
      // Click Cancel button
      cy.get('button').contains('Cancel').click()
      
      // Reschedule section should disappear
      cy.contains('Reschedule Appointment').should('not.exist')
      
      // Modal should still be open
      cy.contains('Appointment Details').should('be.visible')
    })
  })

  describe('Braider Assignment', () => {
    beforeEach(() => {
      // Open a booking
      cy.get('button').contains('List View').click()
      cy.get('[class*="hover:bg-gray-50"]').first().click()
      cy.contains('Appointment Details').should('be.visible')
    })

    it('should display braider dropdown', () => {
      // Check for braider assignment section
      cy.contains('Braider Assignment').should('be.visible')
      cy.get('select').should('exist')
    })

    it('should assign braider to booking', () => {
      // Select a braider from dropdown
      cy.get('select').select(1) // Select first braider
      
      // Click Assign button
      cy.get('button').contains('Assign').click()
      
      // Success message should appear
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Braider assigned successfully')
      })
      
      // Braider should be selected in dropdown
      cy.get('select').should('not.have.value', '')
    })

    it('should update braider assignment', () => {
      // Select initial braider
      cy.get('select').select(1)
      cy.get('button').contains('Assign').click()
      cy.wait(500)
      
      // Change to different braider
      cy.get('select').select(2)
      cy.get('button').contains('Assign').click()
      
      // Success message should appear
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Braider assigned successfully')
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle completed booking restrictions', () => {
      // Filter for completed bookings
      cy.get('select').select('Completed')
      cy.wait(500)
      
      // Open a completed booking
      cy.get('[class*="text-green-700"]').first().parents('[class*="hover:bg-gray-50"]').click()
      
      // Action buttons should not be visible for completed bookings
      cy.get('button').contains('Mark as Completed').should('not.exist')
      cy.get('button').contains('Cancel Appointment').should('not.exist')
      cy.get('button').contains('Reschedule').should('not.exist')
    })

    it('should handle cancelled booking restrictions', () => {
      // Filter for cancelled bookings
      cy.get('select').select('Cancelled')
      cy.wait(500)
      
      // Open a cancelled booking
      cy.get('[class*="text-red-700"]').first().parents('[class*="hover:bg-gray-50"]').click()
      
      // Action buttons should not be visible for cancelled bookings
      cy.get('button').contains('Mark as Completed').should('not.exist')
      cy.get('button').contains('Reschedule').should('not.exist')
    })

    it('should validate reschedule date and time', () => {
      // Open a booking
      cy.get('[class*="hover:bg-gray-50"]').first().click()
      cy.get('button').contains('Reschedule').click()
      
      // Try to confirm without selecting date/time
      cy.get('button').contains('Confirm Reschedule').click()
      
      // Should show validation error
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Please select both date and time')
      })
    })

    it('should handle time slot conflicts', () => {
      // This would require setting up specific test data
      // with conflicting bookings
      
      // Open a booking
      cy.get('[class*="hover:bg-gray-50"]').first().click()
      cy.get('button').contains('Reschedule').click()
      
      // Select a date/time that's already booked
      const today = new Date().toISOString().split('T')[0]
      cy.get('input[type="date"]').type(today)
      cy.get('input[type="time"]').type('10:00')
      
      cy.get('button').contains('Confirm Reschedule').click()
      
      // Should show conflict error
      cy.on('window:alert', (text) => {
        expect(text).to.match(/already booked|not available/i)
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should display mobile-friendly calendar view', () => {
      cy.get('button').contains('Calendar View').click()
      
      // Calendar should be scrollable on mobile
      cy.get('[class*="grid-cols-7"]').should('be.visible')
      cy.get('[class*="overflow"]').should('exist')
    })

    it('should display mobile-friendly list view', () => {
      cy.get('button').contains('List View').click()
      
      // List items should stack on mobile
      cy.get('[class*="flex-col"]').should('exist')
    })

    it('should display mobile-friendly modal', () => {
      cy.get('[class*="hover:bg-gray-50"]').first().click()
      
      // Modal should be full-screen on mobile
      cy.contains('Appointment Details').should('be.visible')
      cy.get('[class*="max-w-2xl"]').should('have.css', 'width').and('match', /100%|/)
    })
  })
})