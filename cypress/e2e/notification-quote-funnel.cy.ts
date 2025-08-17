/**
 * E2E Tests for Notification System and Quote-to-Booking Funnel
 * 
 * This test suite validates:
 * 1. Quote creation and tracking
 * 2. Notification preferences management
 * 3. Email notifications for bookings
 * 4. Funnel analytics tracking
 * 5. Complete quote-to-booking conversion flow
 */

describe('Notification System and Quote Funnel', () => {
  // Test data
  const testSalon = {
    name: 'Test Salon',
    email: 'test@salon.com',
    phone: '(555) 123-4567',
  };

  const testClient = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '(555) 987-6543',
  };

  const testQuote = {
    serviceType: 'Box Braids',
    size: 'medium',
    length: 'mid-back',
    addOns: ['Hair included'],
    expectedPrice: 216, // $180 base * 1.2 for mid-back
  };

  beforeEach(() => {
    // Reset database state
    cy.task('resetDatabase');
    
    // Login as salon owner
    cy.loginAsSalonOwner();
    
    // Visit dashboard
    cy.visit('/dashboard');
    cy.wait(2000);
  });

  describe('Quote Creation and Tracking', () => {
    it('should create and track a new quote', () => {
      // Navigate to quote tool
      cy.visit('/quote/test-token');
      
      // Fill out quote form
      cy.get('[data-cy=service-select]').select(testQuote.serviceType);
      cy.get('[data-cy=size-select]').select(testQuote.size);
      cy.get('[data-cy=length-select]').select(testQuote.length);
      
      // Add optional details
      cy.get('[data-cy=client-name]').type(testClient.name);
      cy.get('[data-cy=client-email]').type(testClient.email);
      cy.get('[data-cy=client-phone]').type(testClient.phone);
      
      // Submit quote
      cy.get('[data-cy=get-quote-btn]').click();
      
      // Verify quote display
      cy.get('[data-cy=quote-price]').should('contain', testQuote.expectedPrice);
      
      // Verify quote was tracked
      cy.visit('/dashboard/analytics');
      cy.get('[data-cy=quotes-created-today]').should('contain', '1');
    });

    it('should track quote views and conversions', () => {
      // Create a quote
      cy.createQuote(testQuote);
      
      // Get quote URL and simulate viewing the quote multiple times
      cy.get('[data-cy=quote-share-link]').invoke('text').then((quoteUrl) => {
        cy.visit(quoteUrl);
        cy.wait(1000);
        cy.visit(quoteUrl);
        cy.wait(1000);
        
        // Check view count
        cy.visit('/dashboard/analytics');
        cy.get('[data-cy=quote-views]').should('contain', '3'); // Initial + 2 views
        
        // Convert quote to booking
        cy.visit(quoteUrl);
        cy.get('[data-cy=book-now-btn]').click();
      });
      
      // Fill booking details
      cy.get('[data-cy=appointment-date]').type('2025-02-01');
      cy.get('[data-cy=appointment-time]').type('10:00');
      cy.get('[data-cy=confirm-booking-btn]').click();
      
      // Verify conversion
      cy.visit('/dashboard/analytics');
      cy.get('[data-cy=conversion-rate]').should('exist');
      cy.get('[data-cy=converted-quotes]').should('contain', '1');
    });

    it('should track quotes by source', () => {
      // Create quotes from different sources
      const sources = [
        { url: '/quote/test?source=website', expected: 'Website' },
        { url: '/quote/test?source=social_media', expected: 'Social Media' },
        { url: '/quote/test?source=qr_code', expected: 'QR Code' },
      ];
      
      sources.forEach(source => {
        cy.visit(source.url);
        cy.createQuote(testQuote);
      });
      
      // Check source breakdown
      cy.visit('/dashboard/analytics');
      cy.get('[data-cy=source-breakdown]').within(() => {
        cy.contains('Website: 1');
        cy.contains('Social Media: 1');
        cy.contains('QR Code: 1');
      });
    });
  });

  describe('Notification Preferences', () => {
    it('should initialize default notification preferences', () => {
      cy.visit('/dashboard/settings/notifications');
      
      // Check default email preferences
      cy.get('[data-cy=email-new-booking]').should('be.checked');
      cy.get('[data-cy=email-booking-cancellation]').should('be.checked');
      cy.get('[data-cy=email-quote-created]').should('be.checked');
      cy.get('[data-cy=email-weekly-report]').should('be.checked');
      
      // Check default SMS preferences
      cy.get('[data-cy=sms-new-booking]').should('be.checked');
      cy.get('[data-cy=sms-urgent-alerts]').should('be.checked');
    });

    it('should update notification preferences', () => {
      cy.visit('/dashboard/settings/notifications');
      
      // Disable some notifications
      cy.get('[data-cy=email-daily-summary]').check();
      cy.get('[data-cy=email-quote-created]').uncheck();
      
      // Enable quiet hours
      cy.get('[data-cy=quiet-hours-toggle]').click();
      cy.get('[data-cy=quiet-hours-start]').clear().type('23');
      cy.get('[data-cy=quiet-hours-end]').clear().type('7');
      
      // Save preferences
      cy.get('[data-cy=save-preferences-btn]').click();
      
      // Verify success message
      cy.get('[data-cy=success-message]').should('contain', 'Preferences updated');
      
      // Reload and verify persistence
      cy.reload();
      cy.get('[data-cy=email-daily-summary]').should('be.checked');
      cy.get('[data-cy=email-quote-created]').should('not.be.checked');
      cy.get('[data-cy=quiet-hours-toggle]').should('be.checked');
    });
  });

  describe('Booking Notifications', () => {
    it('should send email notification for new booking', () => {
      // Create a booking
      const booking = {
        clientName: testClient.name,
        clientEmail: testClient.email,
        clientPhone: testClient.phone,
        serviceType: 'Box Braids',
        appointmentDate: '2025-02-15',
        appointmentTime: '14:00',
        totalPrice: 180,
      };
      
      cy.createBooking(booking);
      
      // Check notification was logged
      cy.visit('/dashboard/notifications');
      cy.get('[data-cy=notification-list]').within(() => {
        cy.contains('New Booking').should('exist');
        cy.contains(testClient.name).should('exist');
        cy.contains('Email sent').should('exist');
      });
      
      // Verify email content (mock check)
      cy.task('getLastEmail').then((email: any) => {
        expect(email.subject).to.contain('New Booking');
        expect(email.to).to.equal(testSalon.email);
        expect(email.html).to.contain(testClient.name);
        expect(email.html).to.contain('Box Braids');
        expect(email.html).to.contain('$180');
      });
    });

    it('should send notification for booking cancellation', () => {
      // Create and then cancel a booking
      const bookingId = cy.createBooking({
        clientName: testClient.name,
        serviceType: 'Knotless Braids',
        appointmentDate: '2025-02-20',
        appointmentTime: '10:00',
      });
      
      // Cancel the booking
      cy.visit('/dashboard/bookings');
      cy.get(`[data-cy=booking-${bookingId}]`).within(() => {
        cy.get('[data-cy=cancel-booking-btn]').click();
      });
      cy.get('[data-cy=confirm-cancel-btn]').click();
      
      // Check cancellation notification
      cy.visit('/dashboard/notifications');
      cy.get('[data-cy=notification-list]').within(() => {
        cy.contains('Booking Cancelled').should('exist');
        cy.contains(testClient.name).should('exist');
      });
    });

    it('should respect quiet hours', () => {
      // Set quiet hours (10 PM - 8 AM)
      cy.setQuietHours(22, 8);
      
      // Create a booking during quiet hours
      cy.clock(new Date('2025-01-15 23:00:00').getTime());
      
      const booking = {
        clientName: 'Night Client',
        appointmentDate: '2025-02-25',
        appointmentTime: '11:00',
      };
      
      cy.createBooking(booking);
      
      // Check notification is scheduled, not sent
      cy.visit('/dashboard/notifications');
      cy.get('[data-cy=notification-list]').within(() => {
        cy.contains('Scheduled for 8:00 AM').should('exist');
      });
      
      // Advance time to after quiet hours
      cy.clock(new Date('2025-01-16 08:01:00').getTime());
      cy.wait(2000);
      
      // Check notification was sent
      cy.reload();
      cy.get('[data-cy=notification-list]').within(() => {
        cy.contains('Email sent').should('exist');
      });
    });
  });

  describe('Funnel Analytics', () => {
    it('should display comprehensive funnel metrics', () => {
      // Create test data for funnel
      cy.task('seedFunnelData', {
        quotes: 50,
        conversions: 15,
        bookings: 20,
        completed: 18,
      });
      
      cy.visit('/dashboard/analytics/funnel');
      
      // Check funnel visualization
      cy.get('[data-cy=funnel-chart]').should('exist');
      
      // Verify metrics
      cy.get('[data-cy=total-quotes]').should('contain', '50');
      cy.get('[data-cy=converted-quotes]').should('contain', '15');
      cy.get('[data-cy=conversion-rate]').should('contain', '30%');
      cy.get('[data-cy=avg-conversion-time]').should('exist');
      
      // Check top services
      cy.get('[data-cy=top-services]').within(() => {
        cy.get('[data-cy=service-item]').should('have.length.at.least', 3);
      });
      
      // Check source breakdown
      cy.get('[data-cy=source-chart]').should('exist');
    });

    it('should track quote-to-booking conversion time', () => {
      // Create a quote and convert it
      cy.createQuote(testQuote).then((quoteToken) => {
        // Wait 2 minutes
        cy.wait(120000, { log: false });
        
        // Convert to booking
        cy.convertQuoteToBooking(quoteToken);
        
        // Check conversion time metric
        cy.visit('/dashboard/analytics/funnel');
        cy.get('[data-cy=avg-conversion-time]').then($el => {
          const time = $el.text();
          expect(time).to.contain('2 minutes');
        });
      });
    });

    it('should update analytics in real-time', () => {
      cy.visit('/dashboard/analytics/funnel');
      
      // Get initial quote count
      cy.get('[data-cy=total-quotes]').invoke('text').then(initialCount => {
        const initial = parseInt(initialCount);
        
        // Create a new quote in another tab
        cy.window().then(win => {
          win.open('/quote/test', '_blank');
        });
        
        // Wait for real-time update
        cy.wait(3000);
        
        // Check count increased
        cy.get('[data-cy=total-quotes]').should('contain', (initial + 1).toString());
      });
    });
  });

  describe('Complete Quote-to-Booking Flow', () => {
    it('should track entire customer journey', () => {
      // Step 1: Customer creates quote
      cy.visit('/quote/salon-test-token');
      
      cy.get('[data-cy=service-select]').select('Goddess Locs');
      cy.get('[data-cy=size-select]').select('small');
      cy.get('[data-cy=length-select]').select('waist');
      cy.get('[data-cy=client-email]').type(testClient.email);
      cy.get('[data-cy=get-quote-btn]').click();
      
      const quoteToken = cy.get('[data-cy=quote-token]').invoke('text');
      
      // Admin receives quote notification
      cy.loginAsSalonOwner();
      cy.visit('/dashboard/notifications');
      cy.contains('New Quote Request').should('exist');
      
      // Step 2: Customer views quote multiple times
      cy.visit(`/quote/${quoteToken}`);
      cy.wait(1000);
      cy.visit(`/quote/${quoteToken}`);
      
      // Step 3: Customer books appointment
      cy.get('[data-cy=book-now-btn]').click();
      cy.get('[data-cy=appointment-date]').type('2025-03-01');
      cy.get('[data-cy=appointment-time]').select('10:00 AM');
      cy.get('[data-cy=confirm-booking-btn]').click();
      
      // Step 4: Admin receives booking notification
      cy.loginAsSalonOwner();
      cy.visit('/dashboard/notifications');
      cy.contains('New Booking Confirmed').should('exist');
      
      // Step 5: Verify funnel tracking
      cy.visit('/dashboard/analytics/funnel');
      
      // Check quote was tracked
      cy.get('[data-cy=quotes-created]').should('contain', '1');
      cy.get('[data-cy=quotes-viewed]').should('contain', '1');
      
      // Check conversion
      cy.get('[data-cy=converted-quotes]').should('contain', '1');
      cy.get('[data-cy=conversion-rate]').should('exist');
      
      // Check booking
      cy.get('[data-cy=bookings-created]').should('contain', '1');
      
      // Verify notification history
      cy.visit('/dashboard/notifications');
      cy.get('[data-cy=notification-list]').within(() => {
        cy.contains('Quote Created').should('exist');
        cy.contains('Booking Confirmation').should('exist');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle notification failures gracefully', () => {
      // Simulate email service failure
      cy.intercept('POST', '/api/send-email', { statusCode: 500 });
      
      // Create a booking
      cy.createBooking({
        clientName: 'Test Client',
        appointmentDate: '2025-03-10',
      });
      
      // Check failure is logged
      cy.visit('/dashboard/notifications');
      cy.get('[data-cy=notification-list]').within(() => {
        cy.contains('Failed').should('exist');
        cy.get('[data-cy=retry-btn]').should('exist');
      });
      
      // Retry notification
      cy.intercept('POST', '/api/send-email', { statusCode: 200 });
      cy.get('[data-cy=retry-btn]').first().click();
      
      // Verify retry success
      cy.contains('Email sent').should('exist');
    });

    it('should handle abandoned quotes', () => {
      // Create a quote
      const quoteToken = cy.createQuote(testQuote);
      
      // Advance time by 8 days
      cy.clock(Date.now() + 8 * 24 * 60 * 60 * 1000);
      
      // Run cleanup job
      cy.task('runCleanupJob');
      
      // Check quote marked as abandoned
      cy.visit('/dashboard/analytics/funnel');
      cy.get('[data-cy=abandoned-quotes]').should('contain', '1');
    });

    it('should handle duplicate quote submissions', () => {
      // Submit same quote twice quickly
      cy.visit('/quote/test');
      cy.fillQuoteForm(testQuote);
      
      // Double-click submit
      cy.get('[data-cy=get-quote-btn]').dblclick();
      
      // Should only create one quote
      cy.visit('/dashboard/analytics');
      cy.get('[data-cy=quotes-created-today]').should('contain', '1');
    });
  });
});

// Custom Commands
declare global {
  namespace Cypress {
    interface Chainable {
      // loginAsSalonOwner is already defined in support/commands.ts
      createQuote(quote: any): Chainable<string>;
      createBooking(booking: any): Chainable<string>;
      convertQuoteToBooking(quoteToken: string): Chainable<void>;
      setQuietHours(start: number, end: number): Chainable<void>;
      fillQuoteForm(quote: any): Chainable<void>;
    }
  }
}

// loginAsSalonOwner command is already defined in support/commands.ts

Cypress.Commands.add('createQuote', (quote: any) => {
  cy.request('POST', '/api/quotes', quote).then(response => {
    return response.body.quoteToken;
  });
});

Cypress.Commands.add('createBooking', (booking: any) => {
  cy.request('POST', '/api/bookings', booking).then(response => {
    return response.body.bookingId;
  });
});

Cypress.Commands.add('convertQuoteToBooking', (quoteToken: string) => {
  cy.visit(`/quote/${quoteToken}`);
  cy.get('[data-cy=book-now-btn]').click();
  cy.get('[data-cy=appointment-date]').type('2025-03-15');
  cy.get('[data-cy=appointment-time]').select('2:00 PM');
  cy.get('[data-cy=confirm-booking-btn]').click();
});

Cypress.Commands.add('setQuietHours', (start: number, end: number) => {
  cy.visit('/dashboard/settings/notifications');
  cy.get('[data-cy=quiet-hours-toggle]').check();
  cy.get('[data-cy=quiet-hours-start]').clear().type(start.toString());
  cy.get('[data-cy=quiet-hours-end]').clear().type(end.toString());
  cy.get('[data-cy=save-preferences-btn]').click();
});

Cypress.Commands.add('fillQuoteForm', (quote: any) => {
  cy.get('[data-cy=service-select]').select(quote.serviceType);
  cy.get('[data-cy=size-select]').select(quote.size);
  cy.get('[data-cy=length-select]').select(quote.length);
  if (quote.clientEmail) {
    cy.get('[data-cy=client-email]').type(quote.clientEmail);
  }
});

export {}; // Make this file a module