/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>
    loginAsSalonOwner(): Chainable<void>
    signUp(email: string, password: string, name: string): Chainable<void>
    signIn(email: string, password: string): Chainable<void>
    signOut(): Chainable<void>
    setupTestSalon(): Chainable<any>
    fillQuoteForm(data: any): Chainable<void>
    selectAppointmentTime(time: string): Chainable<void>
    fillBookingDetails(data: any): Chainable<void>
    confirmBooking(): Chainable<void>
    createTestBooking(data?: any): Chainable<any>
    createTestBookings(count: number): Chainable<any>
    clearAllTestData(): Chainable<void>
    seedDevelopmentData(): Chainable<void>
  }
}