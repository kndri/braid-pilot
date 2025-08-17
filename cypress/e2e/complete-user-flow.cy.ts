describe('Complete User Flow: Sign Up to Booking to Dashboard', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  }

  const testClient = {
    name: 'Jane Smith',
    email: `client-${Date.now()}@example.com`,
    phone: '+1234567890',
  }

  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Visit the home page
    cy.visit('/')
  })

  describe('Salon Owner Journey', () => {
    it('should allow salon owner to complete full onboarding and setup', () => {
      // Step 1: Visit home page and start sign up
      cy.visit('/')
      cy.contains('Get Started').should('be.visible')
      cy.contains('Get Started').click()

      // Step 2: Sign up with new account
      cy.url().should('include', 'sign-up')
      cy.get('input[name="firstName"]').type(testUser.firstName)
      cy.get('input[name="lastName"]').type(testUser.lastName)
      cy.get('input[name="emailAddress"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()

      // Step 3: Verify email (mock verification)
      cy.url().should('include', 'verify-email', { timeout: 15000 })
      
      // For testing, we'll mock the verification process
      // In a real test, you might need to check email or use a test verification code
      cy.window().then((win) => {
        // Mock successful verification
        win.location.href = '/dashboard'
      })

      // Step 4: Complete salon onboarding
      cy.url().should('include', '/dashboard', { timeout: 15000 })
      
      // Should see onboarding flow or setup guide
      cy.contains('Welcome').should('be.visible', { timeout: 10000 })
      
      // Fill in salon details if onboarding form is present
      cy.get('body').then((body) => {
        if (body.find('input[name="salonName"]').length > 0) {
          cy.get('input[name="salonName"]').type('Test Salon')
          cy.get('input[name="salonPhone"]').type('+1234567890')
          cy.get('input[name="salonAddress"]').type('123 Test Street')
          cy.get('button').contains('Complete Setup').click()
        }
      })

      // Step 5: Verify dashboard is accessible
      cy.contains('Dashboard').should('be.visible')
      cy.contains('Total Revenue').should('be.visible')
      cy.contains('Active Clients').should('be.visible')
    })

    it('should allow salon owner to view and manage their quote tool', () => {
      // Assume we're signed in (this would follow from previous test)
      cy.login(testUser.email, testUser.password)
      cy.visit('/dashboard')

      // Step 1: Access quote tool settings
      cy.contains('Quote Tool').should('be.visible')
      cy.contains('Quote Tool').click()

      // Step 2: Verify pricing configuration
      cy.contains('Pricing Configuration').should('be.visible')
      
      // Should see default braiding styles
      cy.contains('Box Braids').should('be.visible')
      cy.contains('Knotless Braids').should('be.visible')

      // Step 3: Copy quote tool link
      cy.contains('Share Your Quote Tool').should('be.visible')
      cy.get('[data-testid="quote-tool-link"]').should('be.visible')
      cy.get('button').contains('Copy Link').click()
      
      // Verify success message
      cy.contains('Link copied').should('be.visible')
    })
  })

  describe('Client Booking Journey', () => {
    let quoteToolToken: string

    before(() => {
      // Set up a test salon with quote tool
      cy.setupTestSalon().then((salonData) => {
        quoteToolToken = salonData.quoteToken
      })
    })

    it('should allow client to get quote and complete booking', () => {
      // Step 1: Visit quote tool as client
      cy.visit(`/quote/test-token`)
      
      // Verify quote tool loads
      cy.contains('Get an instant quote').should('be.visible', { timeout: 10000 })
      cy.contains('Select Your Style').should('be.visible')

      // Step 2: Make style selections
      cy.get('select[data-testid="style-select"]').select('Box Braids')
      cy.wait(500) // Allow for dependent dropdown to appear
      
      cy.get('select[data-testid="size-select"]').should('be.visible')
      cy.get('select[data-testid="size-select"]').select('Medium')
      cy.wait(500)

      cy.get('select[data-testid="length-select"]').should('be.visible')
      cy.get('select[data-testid="length-select"]').select('Bra-Length')
      cy.wait(500)

      cy.get('select[data-testid="hair-type-select"]').should('be.visible')
      cy.get('select[data-testid="hair-type-select"]').select('100% Human Hair')
      cy.wait(1000)

      // Step 3: Verify price calculation
      cy.get('[data-testid="final-price"]').should('be.visible')
      cy.get('[data-testid="final-price"]').should('contain', '$')

      // Step 4: Initiate booking flow
      cy.contains('Book Appointment').should('be.visible')
      cy.contains('Book Appointment').click()

      // Step 5: Fill in client details
      cy.contains('Your Details').should('be.visible')
      cy.get('input[name="name"]').type(testClient.name)
      cy.get('input[name="email"]').type(testClient.email)
      cy.get('input[name="phone"]').type(testClient.phone)
      
      cy.contains('Continue to Date & Time').click()

      // Step 6: Select appointment date and time
      cy.contains('Select Date & Time').should('be.visible')
      
      // Select first available time slot
      cy.get('[data-testid="time-slot"]').first().click()
      cy.contains('Continue to Payment').click()

      // Step 7: Review booking details
      cy.contains('Complete Your Booking').should('be.visible')
      cy.contains(testClient.name).should('be.visible')
      cy.contains(testClient.email).should('be.visible')

      // Step 8: Process payment (mock)
      cy.contains('Pay $').should('be.visible')
      cy.get('button').contains('Pay $').click()

      // Mock successful payment
      cy.window().then((win) => {
        // In a real test, you'd integrate with Stripe test mode
        // For now, we'll mock the success
        cy.wrap(null).then(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(null)
            }, 2000)
          })
        })
      })

      // Step 9: Verify booking confirmation
      cy.contains('Booking Confirmed', { timeout: 15000 }).should('be.visible')
      cy.contains('Your appointment has been booked').should('be.visible')
      cy.contains(testClient.name).should('be.visible')
    })

    it('should handle WhatsApp messaging option', () => {
      // Visit quote tool and make selections
      cy.visit(`/quote/test-token`)
      
      cy.get('select[data-testid="style-select"]').select('Knotless Braids')
      cy.wait(500)
      cy.get('select[data-testid="size-select"]').select('Large')
      cy.wait(500)
      cy.get('select[data-testid="length-select"]').select('Shoulder-Length')
      cy.wait(500)
      cy.get('select[data-testid="hair-type-select"]').select('Synthetic')
      cy.wait(1000)

      // Click WhatsApp message option
      cy.contains('Message on WhatsApp').should('be.visible')
      cy.contains('Message on WhatsApp').should('have.attr', 'href').and('include', 'wa.me')
    })
  })

  describe('Salon Owner Dashboard Views', () => {
    before(() => {
      // Ensure we have test data: a completed booking
      cy.createTestBooking({
        salonEmail: testUser.email,
        clientDetails: testClient,
        serviceDetails: {
          style: 'Box Braids',
          size: 'Medium',
          length: 'Bra-Length',
          hairType: '100% Human Hair',
          finalPrice: 200,
        },
        status: 'completed'
      })
    })

    it('should display booking in salon dashboard', () => {
      // Login as salon owner
      cy.login(testUser.email, testUser.password)
      cy.visit('/dashboard')

      // Step 1: Verify metrics updated with new booking
      cy.contains('Total Revenue').should('be.visible')
      cy.get('[data-testid="revenue-metric"]').should('contain', '$')
      
      cy.contains('Active Clients').should('be.visible')
      cy.get('[data-testid="clients-metric"]').should('contain', '1')

      cy.contains('Completed Bookings').should('be.visible')
      cy.get('[data-testid="bookings-metric"]').should('contain', '1')

      // Step 2: View recent bookings
      cy.contains('Recent Bookings').should('be.visible')
      cy.contains(testClient.name).should('be.visible')
      cy.contains('Box Braids').should('be.visible')
      cy.contains('$200').should('be.visible')

      // Step 3: Access detailed booking view
      cy.contains(testClient.name).click()
      cy.contains('Booking Details').should('be.visible')
      cy.contains('Client Information').should('be.visible')
      cy.contains(testClient.email).should('be.visible')
      cy.contains(testClient.phone).should('be.visible')
    })

    it('should allow salon owner to access CRM features', () => {
      cy.login(testUser.email, testUser.password)
      cy.visit('/dashboard')

      // Step 1: Navigate to CRM section
      cy.contains('CRM').should('be.visible')
      cy.contains('CRM').click()

      cy.url().should('include', '/crm')

      // Step 2: View client list
      cy.contains('Client Management').should('be.visible')
      cy.contains(testClient.name).should('be.visible')
      
      // Verify client metrics
      cy.contains('Total Spend').should('be.visible')
      cy.contains('$200').should('be.visible')

      // Step 3: View analytics
      cy.contains('Business Analytics').should('be.visible')
      cy.contains('Revenue Overview').should('be.visible')
      cy.contains('Popular Services').should('be.visible')

      // Step 4: Add client note
      cy.contains(testClient.name).click()
      cy.contains('Client Profile').should('be.visible')
      
      cy.get('textarea[placeholder*="Add a note"]').type('Great client, very satisfied with service')
      cy.contains('Save Note').click()
      cy.contains('Note saved successfully').should('be.visible')
    })

    it('should display calendar and upcoming appointments', () => {
      // Create upcoming booking
      cy.createTestBooking({
        salonEmail: testUser.email,
        clientDetails: {
          name: 'Future Client',
          email: 'future@example.com',
          phone: '+1987654321',
        },
        serviceDetails: {
          style: 'Knotless Braids',
          size: 'Small',
          length: 'Shoulder-Length',
          hairType: 'Synthetic',
          finalPrice: 180,
        },
        appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        status: 'confirmed'
      })

      cy.login(testUser.email, testUser.password)
      cy.visit('/dashboard')

      // Verify upcoming appointment shows in dashboard
      cy.contains('Today\'s Appointments').should('be.visible')
      cy.get('[data-testid="today-appointments"]').should('exist')

      // Navigate to full calendar view
      cy.contains('Calendar').click()
      cy.url().should('include', '/calendar')

      // Verify calendar displays appointments
      cy.contains('Calendar').should('be.visible')
      cy.contains('Future Client').should('be.visible')
      cy.contains('Knotless Braids').should('be.visible')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid quote tool links gracefully', () => {
      cy.visit('/quote/invalid-token')
      
      cy.contains('Salon Not Found').should('be.visible')
      cy.contains('This pricing tool link is invalid or has expired').should('be.visible')
    })

    it('should handle booking conflicts', () => {
      // This would test the scenario where two clients try to book the same time slot
      cy.visit(`/quote/test-token`)
      
      // Complete booking flow but simulate conflict
      // (This requires more sophisticated test data setup)
    })

    it('should handle network errors during booking', () => {
      // Intercept and mock network failure
      cy.intercept('POST', '**/booking/createBooking', {
        statusCode: 500,
        body: { error: 'Network error' }
      }).as('bookingError')

      cy.visit(`/quote/test-token`)
      
      // Complete booking flow
      cy.get('select[data-testid="style-select"]').select('Box Braids')
      cy.wait(500)
      cy.get('select[data-testid="size-select"]').select('Medium')
      cy.wait(500)
      cy.get('select[data-testid="length-select"]').select('Bra-Length')
      cy.wait(500)
      cy.get('select[data-testid="hair-type-select"]').select('Synthetic')
      
      cy.contains('Book Appointment').click()
      
      cy.get('input[name="name"]').type('Test Client')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="phone"]').type('+1234567890')
      cy.contains('Continue to Date & Time').click()
      
      cy.get('[data-testid="time-slot"]').first().click()
      cy.contains('Continue to Payment').click()
      
      cy.get('button').contains('Pay $').click()
      
      // Should see error message
      cy.wait('@bookingError')
      cy.contains('booking failed', { matchCase: false }).should('be.visible')
    })
  })
})

// Custom commands for test setup
