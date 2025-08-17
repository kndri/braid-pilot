/// <reference types="cypress" />

describe('Full Salon Owner Experience', () => {
  const testEmail = `test.${Date.now()}@braidpilot.com`;
  const salonName = 'Cypress Test Salon';
  
  before(() => {
    // Clear any existing test data
    cy.clearAllTestData();
  });
  
  after(() => {
    // Clean up all test data after tests
    cy.clearAllTestData();
  });
  
  describe('1. Initial Setup & Onboarding', () => {
    it('should complete full salon setup flow', () => {
      cy.visit('/');
      
      // Click Get Started
      cy.contains('Get free demo').click();
      
      // Complete salon setup
      cy.url().should('include', '/salon-setup');
      
      // Fill salon information
      cy.get('input[placeholder*="salon name"]').type(salonName);
      cy.get('input[placeholder*="Main St"]').type('123 Test Street, Atlanta, GA 30301');
      cy.get('input[placeholder*="555"]').type('(404) 555-0123');
      cy.get('input[placeholder*="yoursalon.com"]').type('https://cypresstest.com');
      
      // Set commission split to 65%
      cy.get('input[type="range"]').invoke('val', 65).trigger('input');
      cy.contains('65%').should('be.visible');
      
      // Submit salon setup
      cy.get('button[type="submit"]').contains('Continue').click();
      
      // Should redirect to onboarding
      cy.url().should('include', '/onboarding');
    });
    
    it('should complete pricing configuration', () => {
      // Select styles
      cy.contains('Box Braids').click();
      cy.contains('Knotless Braids').click();
      cy.contains('Goddess Locs').click();
      cy.contains('Next').click();
      
      // Configure base prices
      cy.get('input[placeholder*="Box Braids"]').clear().type('150');
      cy.get('input[placeholder*="Knotless"]').clear().type('200');
      cy.get('input[placeholder*="Goddess"]').clear().type('250');
      cy.contains('Next').click();
      
      // Configure length adjustments
      cy.get('input[placeholder*="Bra-Length"]').clear().type('30');
      cy.get('input[placeholder*="Mid-Back"]').clear().type('50');
      cy.contains('Next').click();
      
      // Configure size adjustments
      cy.get('input[placeholder*="Small"]').clear().type('-20');
      cy.get('input[placeholder*="Medium"]').clear().type('0');
      cy.get('input[placeholder*="Large"]').clear().type('20');
      cy.contains('Next').click();
      
      // Complete onboarding
      cy.contains('Go to Dashboard').click();
      cy.url().should('include', '/dashboard');
    });
  });
  
  describe('2. Braider Management', () => {
    it('should add multiple braiders with different splits', () => {
      cy.visit('/dashboard/capacity');
      
      // Switch to braider management tab
      cy.contains('Braider Management').click();
      
      // Add first braider
      cy.contains('Add Braider').click();
      cy.get('input[placeholder*="name"]').type('Michelle Williams');
      cy.get('input[placeholder*="@example.com"]').type('michelle@cypresstest.com');
      cy.get('input[placeholder*="555"]').type('(404) 555-0001');
      
      // Set commission to 70%
      cy.get('input[type="range"]').invoke('val', 70).trigger('input');
      cy.contains('70%').should('be.visible');
      
      // Select specialties
      cy.contains('Box Braids').click();
      cy.contains('Knotless Braids').click();
      
      // Submit
      cy.contains('button', 'Add Braider').click();
      
      // Verify braider appears
      cy.contains('Michelle Williams').should('be.visible');
      cy.contains('70%').should('be.visible');
      
      // Add second braider with different split
      cy.contains('Add Braider').click();
      cy.get('input[placeholder*="name"]').type('Jasmine Taylor');
      cy.get('input[placeholder*="@example.com"]').type('jasmine@cypresstest.com');
      cy.get('input[placeholder*="555"]').type('(404) 555-0002');
      
      // Set commission to 60%
      cy.get('input[type="range"]').invoke('val', 60).trigger('input');
      
      // Select different specialties
      cy.contains('Goddess Locs').click();
      cy.contains('Passion Twists').click();
      
      cy.contains('button', 'Add Braider').click();
      
      // Verify both braiders appear
      cy.contains('Michelle Williams').should('be.visible');
      cy.contains('Jasmine Taylor').should('be.visible');
      cy.contains('Your Team (2 braiders)').should('be.visible');
    });
    
    it('should manage braider availability', () => {
      // Mark braider as unavailable
      cy.contains('Michelle Williams')
        .parent()
        .contains('Time Off')
        .click();
      
      // Verify status change
      cy.contains('Availability updated successfully').should('be.visible');
      
      // Mark as available again
      cy.contains('Michelle Williams')
        .parent()
        .contains('Available')
        .click();
      
      cy.contains('Availability updated successfully').should('be.visible');
    });
  });
  
  describe('3. Client & Booking Management', () => {
    it('should create bookings with different statuses', () => {
      cy.visit('/dashboard');
      
      // Click on booking management
      cy.contains('Manage Bookings').click();
      
      // Create new booking
      cy.contains('New Booking').click();
      
      // Fill booking details
      cy.get('input[name="clientName"]').type('Sarah Johnson');
      cy.get('input[name="clientEmail"]').type('sarah@example.com');
      cy.get('input[name="clientPhone"]').type('(404) 555-1000');
      
      // Select service
      cy.get('select[name="serviceType"]').select('Box Braids');
      
      // Select braider
      cy.get('select[name="braiderId"]').select('Michelle Williams');
      
      // Set date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      cy.get('input[type="date"]').type(tomorrow.toISOString().split('T')[0]);
      cy.get('input[type="time"]').type('10:00');
      
      // Submit booking
      cy.contains('Create Booking').click();
      
      // Verify booking appears
      cy.contains('Sarah Johnson').should('be.visible');
      cy.contains('Box Braids').should('be.visible');
    });
    
    it('should track different booking statuses', () => {
      // Create confirmed booking
      cy.contains('New Booking').click();
      cy.get('input[name="clientName"]').type('Emma Wilson');
      cy.get('input[name="clientEmail"]').type('emma@example.com');
      cy.get('select[name="serviceType"]').select('Knotless Braids');
      cy.get('select[name="braiderId"]').select('Jasmine Taylor');
      cy.get('select[name="status"]').select('Confirmed');
      cy.contains('Create Booking').click();
      
      // Create pending booking
      cy.contains('New Booking').click();
      cy.get('input[name="clientName"]').type('Olivia Brown');
      cy.get('input[name="clientEmail"]').type('olivia@example.com');
      cy.get('select[name="serviceType"]').select('Goddess Locs');
      cy.get('select[name="status"]').select('Pending');
      cy.contains('Create Booking').click();
      
      // Filter by status
      cy.get('select[name="statusFilter"]').select('Confirmed');
      cy.contains('Emma Wilson').should('be.visible');
      cy.contains('Olivia Brown').should('not.exist');
      
      cy.get('select[name="statusFilter"]').select('All');
      cy.contains('Emma Wilson').should('be.visible');
      cy.contains('Olivia Brown').should('be.visible');
    });
  });
  
  describe('4. Analytics & Reporting', () => {
    it('should display revenue metrics correctly', () => {
      cy.visit('/dashboard');
      
      // Check metrics cards
      cy.contains('Total Revenue').should('be.visible');
      cy.contains('Total Bookings').should('be.visible');
      cy.contains('Active Clients').should('be.visible');
      
      // Revenue should be calculated based on bookings
      cy.get('[data-testid="total-revenue"]').should('contain', '$');
      cy.get('[data-testid="total-bookings"]').should('not.contain', '0');
    });
    
    it('should show commission breakdown', () => {
      // Navigate to a booking detail
      cy.contains('View Details').first().click();
      
      // Should show commission split
      cy.contains('Commission Breakdown').should('be.visible');
      cy.contains('Braider (').should('be.visible');
      cy.contains('Salon (').should('be.visible');
    });
  });
  
  describe('5. Settings Management', () => {
    it('should update salon settings', () => {
      cy.visit('/dashboard/settings');
      
      // Update salon name
      cy.get('input[value*="Cypress"]').clear().type('Updated Test Salon');
      
      // Update default split
      cy.get('input[type="range"]').invoke('val', 55).trigger('input');
      cy.contains('55%').should('be.visible');
      
      // Save changes
      cy.contains('Save Changes').click();
      
      // Verify success message
      cy.contains('Settings updated successfully').should('be.visible');
      
      // Verify changes persist
      cy.reload();
      cy.get('input[value*="Updated"]').should('exist');
      cy.contains('55%').should('be.visible');
    });
  });
  
  describe('6. Capacity Management', () => {
    it('should configure capacity settings', () => {
      cy.visit('/dashboard/capacity');
      
      // Update max concurrent bookings
      cy.get('input[name="maxConcurrentBookings"]').clear().type('5');
      
      // Update buffer time
      cy.get('input[name="bufferMinutes"]').clear().type('45');
      
      // Save settings
      cy.contains('Update Settings').click();
      
      // Verify success
      cy.contains('Capacity settings updated').should('be.visible');
    });
    
    it('should block time slots', () => {
      // Select a date
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      cy.get('input[type="date"]').type(nextWeek.toISOString().split('T')[0]);
      
      // Block time slot
      cy.contains('Block Time Slot').click();
      cy.get('input[name="startTime"]').type('12:00');
      cy.get('input[name="endTime"]').type('14:00');
      cy.get('input[name="reason"]').type('Lunch break');
      cy.contains('Confirm Block').click();
      
      // Verify blocked slot appears
      cy.contains('12:00 - 14:00').should('be.visible');
      cy.contains('Lunch break').should('be.visible');
    });
  });
  
  describe('7. Quote Tool', () => {
    it('should generate customer quotes', () => {
      cy.visit('/dashboard');
      
      // Get quote tool URL
      cy.contains('Price My Style').click();
      cy.get('[data-testid="quote-url"]').then(($el) => {
        const quoteUrl = $el.text();
        
        // Visit quote tool as customer
        cy.visit(quoteUrl);
        
        // Select style
        cy.contains('Box Braids').click();
        
        // Select size
        cy.contains('Medium').click();
        
        // Select length
        cy.contains('Shoulder').click();
        
        // View price
        cy.contains('Your Estimated Price').should('be.visible');
        cy.contains('$').should('be.visible');
        
        // Book now
        cy.contains('Book This Style').click();
        
        // Fill contact info
        cy.get('input[name="name"]').type('Test Customer');
        cy.get('input[name="email"]').type('customer@test.com');
        cy.get('input[name="phone"]').type('(404) 555-9999');
        
        cy.contains('Request Booking').click();
        
        // Verify confirmation
        cy.contains('Booking Request Sent').should('be.visible');
      });
    });
  });
});

// Helper commands
// Type declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      clearAllTestData(): Chainable<void>;
      seedTestData(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('clearAllTestData', () => {
  // This would call your cleanup mutation
  cy.task('clearDatabase', { email: 'test@cypresstest.com' });
});

Cypress.Commands.add('seedTestData', () => {
  // This would call your seed mutation
  cy.task('seedDatabase', { 
    email: 'test@cypresstest.com',
    braiders: 3,
    clients: 20,
    bookings: 30
  });
});

export {}; // Make this file a module