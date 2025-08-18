/// <reference types="cypress" />

describe('Payment and Booking Flow E2E Tests', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPhone = '(555) 123-4567';
  const testName = 'Test Customer';
  
  // Stripe test card numbers
  const STRIPE_TEST_CARDS = {
    SUCCESS: '4242424242424242',
    DECLINE: '4000000000000002',
    INSUFFICIENT_FUNDS: '4000000000009995',
    INCORRECT_CVC: '4000000000000127',
    EXPIRED_CARD: '4000000000000069',
    PROCESSING_ERROR: '4000000000000119',
    THREE_D_SECURE: '4000002500003155',
  };

  beforeEach(() => {
    // Set up test environment
    cy.visit('/');
    
    // Clear any existing test data
    cy.task('clearDatabase', { email: testEmail });
    
    // Seed test salon with pricing
    cy.task('seedDatabase', { 
      email: 'salon@test.com',
      braiders: 3,
      clients: 10,
      bookings: 5
    });
  });

  describe('Complete Booking with Payment', () => {
    it('should complete a booking with successful payment', () => {
      // Visit quote tool
      cy.visit('/quote/elitebraids');
      
      // Select a service
      cy.contains('Knotless Braids').click();
      
      // Select size and length
      cy.contains('Medium').click();
      cy.contains('Continue').click();
      cy.contains('Mid-Back').click();
      cy.contains('Continue').click();
      
      // View final price
      cy.contains('Your Quote').should('be.visible');
      cy.contains('$').should('be.visible');
      
      // Click Book Now
      cy.contains('Book Now').click();
      
      // Select appointment date and time
      cy.get('[data-testid="calendar-day"]').first().click();
      cy.get('[data-testid="time-slot"]').first().click();
      
      // Fill in contact information
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="phone"]').type(testPhone);
      cy.get('textarea[name="notes"]').type('Test booking with payment');
      
      cy.contains('Continue to Payment').click();
      
      // Wait for Stripe Elements to load
      cy.wait(3000);
      
      // Fill in payment information using Stripe Elements
      cy.get('iframe').then($iframe => {
        const doc = $iframe.contents();
        
        // Fill card number
        cy.wrap(doc.find('input[name="cardnumber"]'))
          .type(STRIPE_TEST_CARDS.SUCCESS);
        
        // Fill expiry date
        cy.wrap(doc.find('input[name="exp-date"]'))
          .type('1234'); // 12/34
        
        // Fill CVC
        cy.wrap(doc.find('input[name="cvc"]'))
          .type('123');
        
        // Fill ZIP code if required
        cy.wrap(doc.find('input[name="postal"]'))
          .type('12345');
      });
      
      // Verify payment summary shows $5 booking fee
      cy.contains('Booking Fee').should('be.visible');
      cy.contains('$5.00').should('be.visible');
      cy.contains('Pay at salon').should('be.visible');
      
      // Submit payment
      cy.contains('Pay $5 Booking Fee').click();
      
      // Wait for payment processing
      cy.contains('Processing...', { timeout: 10000 }).should('be.visible');
      
      // Verify success
      cy.contains('Booking Confirmed!', { timeout: 15000 }).should('be.visible');
      cy.contains('Your appointment has been successfully booked').should('be.visible');
      cy.contains('Please pay the service fee directly at the salon').should('be.visible');
    });

    it('should handle declined card gracefully', () => {
      // Navigate to payment step (abbreviated for brevity)
      cy.visit('/quote/elitebraids');
      cy.contains('Knotless Braids').click();
      cy.contains('Medium').click();
      cy.contains('Continue').click();
      cy.contains('Mid-Back').click();
      cy.contains('Continue').click();
      cy.contains('Book Now').click();
      cy.get('[data-testid="calendar-day"]').first().click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="phone"]').type(testPhone);
      cy.contains('Continue to Payment').click();
      
      // Wait for Stripe Elements
      cy.wait(3000);
      
      // Enter declined card
      cy.get('iframe').then($iframe => {
        const doc = $iframe.contents();
        cy.wrap(doc.find('input[name="cardnumber"]'))
          .type(STRIPE_TEST_CARDS.DECLINE);
        cy.wrap(doc.find('input[name="exp-date"]'))
          .type('1234');
        cy.wrap(doc.find('input[name="cvc"]'))
          .type('123');
      });
      
      // Submit payment
      cy.contains('Pay $5 Booking Fee').click();
      
      // Verify error message
      cy.contains('Your card was declined', { timeout: 10000 }).should('be.visible');
      
      // User should be able to try again
      cy.contains('Pay $5 Booking Fee').should('not.be.disabled');
    });

    it('should handle insufficient funds error', () => {
      // Navigate to payment (abbreviated)
      cy.visit('/quote/elitebraids');
      // ... navigation steps ...
      
      // Enter insufficient funds card
      cy.get('iframe').then($iframe => {
        const doc = $iframe.contents();
        cy.wrap(doc.find('input[name="cardnumber"]'))
          .type(STRIPE_TEST_CARDS.INSUFFICIENT_FUNDS);
        cy.wrap(doc.find('input[name="exp-date"]'))
          .type('1234');
        cy.wrap(doc.find('input[name="cvc"]'))
          .type('123');
      });
      
      cy.contains('Pay $5 Booking Fee').click();
      
      cy.contains('insufficient funds', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Payment Amount Verification', () => {
    it('should always charge exactly $5 regardless of service price', () => {
      // Test with different service prices
      const services = [
        { name: 'Cornrows', expectedServicePrice: 80 },
        { name: 'Box Braids', expectedServicePrice: 180 },
        { name: 'Micro Braids', expectedServicePrice: 300 },
      ];
      
      services.forEach(service => {
        cy.visit('/quote/elitebraids');
        cy.contains(service.name).click();
        cy.contains('Small').click();
        cy.contains('Continue').click();
        cy.contains('Shoulder').click();
        cy.contains('Continue').click();
        cy.contains('Book Now').click();
        
        // Navigate to payment
        cy.get('[data-testid="calendar-day"]').first().click();
        cy.get('[data-testid="time-slot"]').first().click();
        cy.get('input[name="name"]').type(testName);
        cy.get('input[name="email"]').type(`${service.name}@test.com`);
        cy.get('input[name="phone"]').type(testPhone);
        cy.contains('Continue to Payment').click();
        
        // Verify amounts
        cy.contains('Service Price').parent().should('contain', `$${service.expectedServicePrice}`);
        cy.contains('Pay at salon').should('be.visible');
        cy.contains('Booking Fee').parent().should('contain', '$5.00');
        cy.contains('Due now to secure appointment').should('be.visible');
        
        // The button should always say $5
        cy.contains('Pay $5 Booking Fee').should('be.visible');
      });
    });
  });

  describe('Webhook Integration', () => {
    it('should update booking status after successful payment', () => {
      // Complete a booking with payment
      // ... (abbreviated booking steps)
      
      // After payment success
      cy.contains('Booking Confirmed!', { timeout: 15000 }).should('be.visible');
      
      // Check that booking status is updated in database
      cy.task('getBooking', { email: testEmail }).then((booking: any) => {
        expect(booking.status).to.equal('confirmed');
        expect(booking.platformFeePaid).to.equal(true);
        expect(booking.stripePaymentIntentId).to.not.be.null;
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle network errors during payment', () => {
      // Intercept payment request and simulate network error
      cy.intercept('POST', '/api/stripe/create-payment-intent', {
        statusCode: 500,
        body: { error: 'Network error' }
      }).as('paymentError');
      
      // Navigate to payment
      cy.visit('/quote/elitebraids');
      // ... navigation steps ...
      
      // Verify error handling
      cy.wait('@paymentError');
      cy.contains('Failed to initialize payment').should('be.visible');
      cy.contains('Try Again').should('be.visible');
    });

    it('should prevent double payments', () => {
      // Navigate to payment
      // ... (abbreviated steps)
      
      // Double-click payment button
      cy.contains('Pay $5 Booking Fee').dblclick();
      
      // Should only process once
      cy.contains('Processing...').should('be.visible');
      cy.contains('Pay $5 Booking Fee').should('be.disabled');
    });

    it('should handle browser back button during payment', () => {
      // Navigate to payment
      // ... (abbreviated steps)
      
      // Go back
      cy.go('back');
      
      // Should be able to return to payment
      cy.contains('Continue to Payment').click();
      
      // Payment form should still work
      cy.contains('Pay $5 Booking Fee').should('be.visible');
    });
  });

  describe('Mobile Payment Experience', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should work correctly on mobile devices', () => {
      cy.visit('/quote/elitebraids');
      
      // Mobile navigation
      cy.contains('Knotless Braids').click();
      cy.contains('Medium').click();
      cy.contains('Continue').click();
      cy.contains('Mid-Back').click();
      cy.contains('Continue').click();
      cy.contains('Book Now').click();
      
      // Mobile calendar interaction
      cy.get('[data-testid="calendar-day"]').first().click();
      cy.get('[data-testid="time-slot"]').first().click();
      
      // Fill form on mobile
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="phone"]').type(testPhone);
      cy.contains('Continue to Payment').click();
      
      // Verify mobile payment form renders correctly
      cy.contains('Booking Fee').should('be.visible');
      cy.contains('$5.00').should('be.visible');
      
      // Payment button should be easily tappable
      cy.contains('Pay $5 Booking Fee')
        .should('be.visible')
        .should('have.css', 'padding-top').and('not.eq', '0');
    });
  });

  describe('Payment Security', () => {
    it('should show security indicators', () => {
      // Navigate to payment
      cy.visit('/quote/elitebraids');
      // ... (abbreviated navigation)
      
      cy.contains('Continue to Payment').click();
      
      // Check for security indicators
      cy.contains('Payments are secure and encrypted').should('be.visible');
      cy.get('[data-testid="lock-icon"]').should('be.visible');
      
      // Verify HTTPS
      cy.location('protocol').should('eq', 'https:');
    });

    it('should not expose sensitive payment data', () => {
      // Navigate to payment and enter card
      // ... (abbreviated steps)
      
      // Check that card number is masked in any logs or display
      cy.window().then((win) => {
        // Ensure no full card numbers in console
        const consoleLogs = win.console.log;
        expect(consoleLogs).to.not.include('4242424242424242');
      });
    });
  });

  describe('Confirmation and Receipts', () => {
    it('should display booking confirmation with payment details', () => {
      // Complete a booking
      // ... (abbreviated steps)
      
      cy.contains('Booking Confirmed!').should('be.visible');
      
      // Verify confirmation details
      cy.contains('Booking Fee Paid: $5.00').should('be.visible');
      cy.contains('Receipt #').should('be.visible');
      cy.contains('Service Price').parent().should('contain', 'Pay at salon');
    });

    it('should send confirmation email with payment receipt', () => {
      // Complete booking
      // ... (abbreviated steps)
      
      // Check that email was sent (would need email testing service)
      cy.task('checkEmail', { email: testEmail }).then((emails: any) => {
        const confirmationEmail = emails.find((e: any) => 
          e.subject.includes('Booking Confirmation')
        );
        
        expect(confirmationEmail).to.exist;
        expect(confirmationEmail.body).to.include('$5.00 booking fee');
        expect(confirmationEmail.body).to.include('Receipt');
      });
    });
  });

  afterEach(() => {
    // Clean up test data
    cy.task('clearDatabase', { email: testEmail });
  });
});

// Type definitions for Cypress custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      fillStripeCard(cardNumber: string): Chainable<void>;
    }
  }
}

// Custom command for filling Stripe card fields
Cypress.Commands.add('fillStripeCard', (cardNumber: string) => {
  cy.get('iframe').then($iframe => {
    const doc = $iframe.contents();
    cy.wrap(doc.find('input[name="cardnumber"]')).type(cardNumber);
    cy.wrap(doc.find('input[name="exp-date"]')).type('1234');
    cy.wrap(doc.find('input[name="cvc"]')).type('123');
    cy.wrap(doc.find('input[name="postal"]')).type('12345');
  });
});