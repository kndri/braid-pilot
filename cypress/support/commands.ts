/// <reference types="cypress" />

// Custom commands for authentication tests

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

// Extend Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      signUp(email: string, password: string, name: string): Chainable<void>
      signIn(email: string, password: string): Chainable<void>
      signOut(): Chainable<void>
    }
  }
}

export {}