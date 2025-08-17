/// <reference types="cypress" />

// Custom commands for comprehensive testing

Cypress.Commands.add('signUp', (email: string, password: string, name: string) => {
  cy.visit('/sign-up')
  cy.get('input[name="name"]').type(name)
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('input[name="confirmPassword"]').type(password)
  cy.get('input[name="terms"]').check()
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('signIn', (email: string, password: string) => {
  cy.visit('/sign-in')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('signOut', () => {
  cy.request('POST', '/api/auth/signout')
})

// Enhanced login command for authenticated flows
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/sign-in')
    cy.get('input[name="emailAddress"]', { timeout: 10000 }).should('be.visible')
    cy.get('input[name="emailAddress"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    
    // Wait for successful login
    cy.url().should('not.include', '/sign-in', { timeout: 15000 })
    cy.url().should('include', '/dashboard')
  })
})

// Login as salon owner command
Cypress.Commands.add('loginAsSalonOwner', () => {
  cy.login('owner@testsalon.com', 'TestPassword123!')
})

// Setup test salon with quote tool
Cypress.Commands.add('setupTestSalon', () => {
  return cy.request({
    method: 'POST',
    url: '/api/test/setup-salon',
    body: {
      salonName: 'Test Salon',
      salonEmail: 'testsalon@example.com',
      salonPhone: '+1234567890',
    }
  }).then((response) => {
    return response.body
  })
})

// Create test booking
Cypress.Commands.add('createTestBooking', (bookingData) => {
  return cy.request({
    method: 'POST',
    url: '/api/test/create-booking',
    body: bookingData
  }).then((response) => {
    return response.body
  })
})

// Wait for element with custom timeout
Cypress.Commands.add('waitForElement', (selector: string, timeout = 10000) => {
  return cy.get(selector, { timeout }).should('be.visible')
})

// Fill quote tool form
Cypress.Commands.add('fillQuoteForm', (selections: {
  style: string
  size: string
  length: string
  hairType: string
  includeCurlyHair?: boolean
}) => {
  cy.get('select[data-testid="style-select"]').select(selections.style)
  cy.wait(500)
  
  cy.get('select[data-testid="size-select"]').should('be.visible')
  cy.get('select[data-testid="size-select"]').select(selections.size)
  cy.wait(500)

  cy.get('select[data-testid="length-select"]').should('be.visible')
  cy.get('select[data-testid="length-select"]').select(selections.length)
  cy.wait(500)

  cy.get('select[data-testid="hair-type-select"]').should('be.visible')
  cy.get('select[data-testid="hair-type-select"]').select(selections.hairType)
  
  if (selections.includeCurlyHair && selections.style === 'Boho Knotless') {
    cy.get('input[type="checkbox"][data-testid="curly-hair-option"]').check()
  }
  
  cy.wait(1000) // Wait for price calculation
})

// Fill booking form
Cypress.Commands.add('fillBookingForm', (clientDetails: {
  name: string
  email: string
  phone: string
  notes?: string
}) => {
  cy.get('input[name="name"]').type(clientDetails.name)
  cy.get('input[name="email"]').type(clientDetails.email)
  cy.get('input[name="phone"]').type(clientDetails.phone)
  
  if (clientDetails.notes) {
    cy.get('textarea[name="notes"]').type(clientDetails.notes)
  }
})

// Mock Stripe payment success
Cypress.Commands.add('mockStripePayment', () => {
  cy.window().then((win) => {
    // Mock Stripe payment success
    Object.defineProperty(win, 'Stripe', {
      value: {
        confirmCardPayment: () => Promise.resolve({
          paymentIntent: {
            id: 'pi_test_payment_success',
            status: 'succeeded'
          }
        })
      }
    })
  })
})

// Extend Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      signUp(email: string, password: string, name: string): Chainable<void>
      signIn(email: string, password: string): Chainable<void>
      signOut(): Chainable<void>
      login(email: string, password: string): Chainable<void>
      loginAsSalonOwner(): Chainable<void>
      setupTestSalon(): Chainable<{quoteToken: string}>
      createTestBooking(bookingData: any): Chainable<void>
      waitForElement(selector: string, timeout?: number): Chainable<JQuery<HTMLElement>>
      fillQuoteForm(selections: {
        style: string
        size: string
        length: string
        hairType: string
        includeCurlyHair?: boolean
      }): Chainable<void>
      fillBookingForm(clientDetails: {
        name: string
        email: string
        phone: string
        notes?: string
      }): Chainable<void>
      mockStripePayment(): Chainable<void>
    }
  }
}

export {}