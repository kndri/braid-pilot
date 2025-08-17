// ***********************************************************
// This file is processed and loaded automatically before your test files.
//
// You can change the location of this file or turn off processing it by setting the
// supportFile option in cypress.config.ts to false.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import './test-utilities'
import './sms-test-helpers'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global test configuration
beforeEach(() => {
  // Set testing environment flag
  cy.window().then((win) => {
    (win as any).CYPRESS_TESTING = true
  })
})

// Global cleanup after each test
afterEach(() => {
  // Log any test failures for debugging
  cy.on('fail', (error) => {
    console.error('Test failed:', error.message)
    console.error('Stack:', error.stack)
  })
})