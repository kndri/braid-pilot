/// <reference types="cypress" />

describe('Username-based Quote URL Feature', () => {
  const testUsername = `testbraids${Date.now()}`;
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  beforeEach(() => {
    // Clear any test data
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Onboarding with Username Collection', () => {
    it('should collect username during salon setup', () => {
      // Navigate to salon setup
      cy.visit('/salon-setup');
      
      // Fill in salon details
      cy.get('input[placeholder*="Bella\'s Braids"]').type('Test Salon');
      
      // Username field should be visible
      cy.contains('Custom URL Username').should('be.visible');
      
      // Test username input with real-time validation
      const usernameInput = cy.get('input[placeholder*="24braidingsalon"]');
      
      // Type invalid username (too short)
      usernameInput.type('ab');
      cy.contains('at least 3 characters').should('be.visible');
      
      // Clear and type valid username
      usernameInput.clear().type(testUsername);
      
      // Wait for availability check
      cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
      
      // Should show availability status
      cy.get('svg.text-green-500').should('be.visible');
      cy.contains('Username is available!').should('be.visible');
      
      // URL preview should update
      cy.contains(`braidpilot.com/quote/${testUsername}`).should('be.visible');
    });

    it('should validate username format', () => {
      cy.visit('/salon-setup');
      
      const usernameInput = cy.get('input[placeholder*="24braidingsalon"]');
      
      // Test invalid characters (uppercase)
      usernameInput.type('TestUsername');
      cy.get('input[placeholder*="24braidingsalon"]').should('have.value', 'testusername');
      
      // Test invalid characters (spaces)
      usernameInput.clear().type('test username');
      cy.get('input[placeholder*="24braidingsalon"]').should('have.value', 'testusername');
      
      // Test special characters (only - and _ allowed)
      usernameInput.clear().type('test-user_name123');
      cy.get('input[placeholder*="24braidingsalon"]').should('have.value', 'test-user_name123');
      
      // Test invalid special characters
      usernameInput.clear().type('test@user#name');
      cy.get('input[placeholder*="24braidingsalon"]').should('have.value', 'testusername');
    });

    it('should detect duplicate usernames', () => {
      cy.visit('/salon-setup');
      
      const usernameInput = cy.get('input[placeholder*="24braidingsalon"]');
      
      // Try to use an existing username (from seed data)
      usernameInput.type('elitebraids');
      
      // Wait for availability check
      cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
      
      // Should show unavailable status
      cy.get('svg.text-red-500').should('be.visible');
      cy.contains('Username is already taken').should('be.visible');
    });

    it('should require username before submission', () => {
      cy.visit('/salon-setup');
      
      // Fill required fields except username
      cy.get('input[placeholder*="Bella\'s Braids"]').type('Test Salon');
      
      // Try to submit without username
      cy.get('button[type="submit"]').click();
      
      // Should show validation error
      cy.on('window:alert', (text) => {
        expect(text).to.contain('Please enter a valid username');
      });
    });
  });

  describe('Quote Tool with Username URLs', () => {
    it('should access quote tool using username URL', () => {
      // Visit quote tool with username
      cy.visit('/quote/elitebraids');
      
      // Quote tool should load
      cy.contains('Get Your Custom Quote', { timeout: 10000 }).should('be.visible');
      
      // Salon name should be displayed
      cy.contains('Elite Braids & Beauty').should('be.visible');
    });

    it('should handle non-existent username gracefully', () => {
      // Visit quote tool with invalid username
      cy.visit('/quote/nonexistentsalon');
      
      // Should show appropriate error message
      cy.contains('Salon not found', { timeout: 10000 }).should('be.visible');
    });

    it('should still support legacy token URLs', () => {
      // Create a test salon with token
      cy.task('seedTestSalonWithToken').then((token: string) => {
        // Visit quote tool with token
        cy.visit(`/quote/${token}`);
        
        // Quote tool should load
        cy.contains('Get Your Custom Quote', { timeout: 10000 }).should('be.visible');
      });
    });
  });

  describe('Dashboard Quote URL Display', () => {
    it('should display username-based URL in dashboard', () => {
      // Login as salon owner
      cy.loginAsSalonOwner(testEmail, testPassword);
      
      // Navigate to dashboard
      cy.visit('/dashboard');
      
      // Wait for dashboard to load
      cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
      
      // Check Price My Style card
      cy.contains('Price My Style').should('be.visible');
      
      // URL should use username
      cy.contains(`localhost:3002/quote/${testUsername}`).should('be.visible');
    });

    it('should copy username URL to clipboard', () => {
      cy.loginAsSalonOwner(testEmail, testPassword);
      cy.visit('/dashboard');
      
      // Click copy button
      cy.contains('Copy Link').click();
      
      // Should show success message
      cy.contains('Copied!').should('be.visible');
      
      // Verify clipboard content
      cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
          expect(text).to.contain(`/quote/${testUsername}`);
        });
      });
    });
  });

  describe('Username Update Flow', () => {
    it('should allow username update in settings', () => {
      cy.loginAsSalonOwner(testEmail, testPassword);
      
      // Navigate to settings
      cy.visit('/dashboard/settings');
      
      // Find username field
      cy.contains('Custom URL Username').should('be.visible');
      
      const newUsername = `newusername${Date.now()}`;
      
      // Update username
      cy.get('input[value*="' + testUsername + '"]').clear().type(newUsername);
      
      // Wait for availability check
      cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
      
      // Save changes
      cy.contains('Save Changes').click();
      
      // Should show success message
      cy.contains('Settings updated successfully').should('be.visible');
      
      // Verify URL has been updated
      cy.visit('/dashboard');
      cy.contains(`localhost:3002/quote/${newUsername}`).should('be.visible');
    });

    it('should validate username uniqueness on update', () => {
      cy.loginAsSalonOwner(testEmail, testPassword);
      cy.visit('/dashboard/settings');
      
      // Try to change to existing username
      cy.get('input[value*="' + testUsername + '"]').clear().type('elitebraids');
      
      // Wait for availability check
      cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
      
      // Should show error
      cy.contains('Username is already taken').should('be.visible');
      
      // Save button should be disabled
      cy.contains('Save Changes').should('be.disabled');
    });
  });

  describe('Quote Tracking with Username URLs', () => {
    it('should track quotes created via username URL', () => {
      // Visit quote tool with username
      cy.visit('/quote/elitebraids');
      
      // Complete quote flow
      cy.contains('Get Started').click();
      cy.contains('Box Braids').click();
      cy.contains('Medium').click();
      cy.contains('Shoulder-Length').click();
      cy.contains('Synthetic').click();
      
      // Get quote
      cy.contains('View Your Quote').click();
      
      // Should track the quote
      cy.task('getLatestQuoteTracking').then((quote: any) => {
        expect(quote.source).to.equal('direct_link');
        expect(quote.salonId).to.exist;
      });
    });
  });

  describe('SEO and Social Sharing', () => {
    it('should have proper meta tags for username URLs', () => {
      cy.visit('/quote/elitebraids');
      
      // Check meta tags
      cy.get('head meta[property="og:url"]')
        .should('have.attr', 'content')
        .and('include', '/quote/elitebraids');
      
      cy.get('head meta[property="og:title"]')
        .should('have.attr', 'content')
        .and('include', 'Elite Braids & Beauty');
      
      cy.get('head title').should('contain', 'Get Your Braiding Quote');
    });
  });

  describe('Migration from Token to Username', () => {
    it('should redirect old token URLs to new username URLs', () => {
      cy.task('getSalonWithBothTokenAndUsername').then((salon: any) => {
        // Visit old token URL
        cy.visit(`/quote/${salon.token}`);
        
        // Should redirect to username URL
        cy.url().should('include', `/quote/${salon.username}`);
        
        // Quote tool should still work
        cy.contains('Get Your Custom Quote').should('be.visible');
      });
    });
  });
});

// Add custom commands for reusability
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsSalonOwner(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginAsSalonOwner', (email: string, password: string) => {
  cy.visit('/sign-in');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 10000 }).should('include', '/dashboard');
});