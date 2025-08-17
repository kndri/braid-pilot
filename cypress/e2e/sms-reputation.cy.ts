// cypress/e2e/sms-reputation.cy.ts
// E2E test for SMS reputation management feature

describe('SMS Reputation Management', () => {
  const TEST_PHONES = {
    primary: Cypress.env('TEST_PHONE_1') || '+19807857108',
    secondary: Cypress.env('TEST_PHONE_2') || '+18033282700',
  };

  const TEST_SALON = {
    name: 'E2E Test Salon',
    googleReviewUrl: 'https://g.page/test-salon-reviews',
    yelpReviewUrl: 'https://www.yelp.com/biz/test-salon',
  };

  beforeEach(() => {
    // Mock authentication
    cy.login();
    
    // Visit reputation management page
    cy.visit('/dashboard/reputation');
    
    // Wait for page to load
    cy.contains('SMS Review Collection').should('be.visible');
  });

  describe('SMS Setup Wizard', () => {
    it('should display SMS-only setup options', () => {
      // Check that email options are not present
      cy.contains('Email').should('not.exist');
      cy.contains('email address').should('not.exist');
      
      // Verify SMS-focused content
      cy.contains('SMS Review Collection').should('be.visible');
      cy.contains('98% open rate').should('be.visible');
      cy.contains('text clients for reviews').should('be.visible');
    });

    it('should configure SMS review settings', () => {
      // Open setup wizard
      cy.contains('button', 'Configure SMS Reviews').click();
      
      // Step 1: Review URLs
      cy.get('input[placeholder*="Google Review URL"]').clear().type(TEST_SALON.googleReviewUrl);
      cy.get('input[placeholder*="Yelp Review URL"]').clear().type(TEST_SALON.yelpReviewUrl);
      cy.contains('button', 'Next').click();
      
      // Step 2: SMS Template
      cy.contains('SMS Message Preview').should('be.visible');
      cy.get('textarea[placeholder*="optional incentive"]').type('Get 10% off your next visit');
      
      // Verify character count
      cy.contains('characters').should('be.visible');
      cy.get('[data-testid="character-count"]').should('exist');
      
      // Step 3: Timing Settings
      cy.contains('button', 'Next').click();
      cy.get('select[name="sendDelay"]').select('2 hours');
      
      // Save settings
      cy.contains('button', 'Save Settings').click();
      cy.contains('SMS reviews configured successfully').should('be.visible');
    });
  });

  describe('Test SMS Functionality', () => {
    it('should send test SMS to primary test number', () => {
      // Open test SMS dialog
      cy.contains('button', 'Send Test SMS').click();
      
      // Enter test phone number
      cy.get('input[placeholder*="phone number"]').clear().type(TEST_PHONES.primary);
      
      // Send test message
      cy.contains('button', 'Send Test').click();
      
      // Wait for success message
      cy.contains('Test SMS sent successfully', { timeout: 10000 }).should('be.visible');
      cy.contains(`Message sent to ${TEST_PHONES.primary}`).should('be.visible');
    });

    it('should send test SMS to secondary test number', () => {
      // Open test SMS dialog
      cy.contains('button', 'Send Test SMS').click();
      
      // Enter test phone number
      cy.get('input[placeholder*="phone number"]').clear().type(TEST_PHONES.secondary);
      
      // Send test message
      cy.contains('button', 'Send Test').click();
      
      // Wait for success message
      cy.contains('Test SMS sent successfully', { timeout: 10000 }).should('be.visible');
      cy.contains(`Message sent to ${TEST_PHONES.secondary}`).should('be.visible');
    });

    it('should validate phone number format', () => {
      cy.contains('button', 'Send Test SMS').click();
      
      // Test invalid formats
      const invalidNumbers = [
        '123',
        'not-a-number',
        '555-1234',
        '1234567890123456',
      ];
      
      invalidNumbers.forEach(number => {
        cy.get('input[placeholder*="phone number"]').clear().type(number);
        cy.contains('button', 'Send Test').click();
        cy.contains('Invalid phone number').should('be.visible');
      });
      
      // Test valid format
      cy.get('input[placeholder*="phone number"]').clear().type(TEST_PHONES.primary);
      cy.contains('button', 'Send Test').click();
      cy.contains('Invalid phone number').should('not.exist');
    });
  });

  describe('SMS Analytics Dashboard', () => {
    it('should display SMS metrics', () => {
      // Check for analytics cards
      cy.contains('Success Rate').should('be.visible');
      cy.contains('SMS Sent').should('be.visible');
      cy.contains('Response Time').should('be.visible');
      cy.contains('SMS Used').should('be.visible');
      
      // Verify percentage displays
      cy.get('[data-testid="success-rate"]').should('contain', '%');
      
      // Check usage quota
      cy.get('[data-testid="sms-usage"]').should('match', /\d+\/\d+|\d+\/∞/);
    });

    it('should show SMS usage progress bar', () => {
      cy.get('[data-testid="usage-progress-bar"]').should('be.visible');
      cy.get('[data-testid="usage-progress-bar"]')
        .should('have.css', 'width')
        .and('match', /\d+(\.\d+)?%/);
    });
  });

  describe('Automated SMS Workflow', () => {
    it('should trigger SMS after appointment completion', () => {
      // Navigate to bookings
      cy.visit('/dashboard/bookings');
      
      // Find and complete a test appointment
      cy.contains('button', 'Mark Complete').first().click();
      cy.contains('Appointment completed').should('be.visible');
      
      // Navigate back to reputation page
      cy.visit('/dashboard/reputation');
      
      // Check that SMS was scheduled
      cy.contains('Recent SMS Activity').click();
      cy.contains('SMS scheduled').should('be.visible');
    });

    it('should respect SMS delay settings', () => {
      // Update delay setting
      cy.contains('button', 'Settings').click();
      cy.get('select[name="sendDelay"]').select('4 hours');
      cy.contains('button', 'Save').click();
      
      // Complete an appointment
      cy.visit('/dashboard/bookings');
      cy.contains('button', 'Mark Complete').first().click();
      
      // Check scheduled time
      cy.visit('/dashboard/reputation');
      cy.contains('Recent SMS Activity').click();
      cy.contains('Scheduled for').should('contain', '4 hours');
    });
  });

  describe('SMS Compliance', () => {
    it('should include opt-out instructions in messages', () => {
      cy.contains('button', 'Preview SMS').click();
      cy.get('[data-testid="sms-preview"]').should('contain', 'Reply STOP to opt-out');
    });

    it('should handle opt-out requests', () => {
      // Simulate opt-out
      cy.contains('button', 'Manage Opt-outs').click();
      cy.get('input[placeholder*="phone number"]').type(TEST_PHONES.primary);
      cy.contains('button', 'Add to Opt-out List').click();
      
      // Verify opt-out is recorded
      cy.contains(`${TEST_PHONES.primary} added to opt-out list`).should('be.visible');
      
      // Verify SMS cannot be sent to opted-out number
      cy.contains('button', 'Send Test SMS').click();
      cy.get('input[placeholder*="phone number"]').clear().type(TEST_PHONES.primary);
      cy.contains('button', 'Send Test').click();
      cy.contains('This number has opted out').should('be.visible');
    });
  });

  describe('SMS Template Customization', () => {
    it('should allow customizing SMS message template', () => {
      cy.contains('button', 'Edit Template').click();
      
      // Modify template
      cy.get('textarea[name="smsTemplate"]').clear().type(
        'Hi {name}! Thanks for choosing {salon}. Share your experience: {url}'
      );
      
      // Check character count
      cy.get('[data-testid="character-count"]').should('contain', '65 / 160');
      
      // Save template
      cy.contains('button', 'Save Template').click();
      cy.contains('Template updated').should('be.visible');
    });

    it('should validate template variables', () => {
      cy.contains('button', 'Edit Template').click();
      
      // Try invalid template
      cy.get('textarea[name="smsTemplate"]').clear().type(
        'Invalid template without required variables'
      );
      
      cy.contains('button', 'Save Template').click();
      cy.contains('Template must include {name} and {url}').should('be.visible');
    });

    it('should warn about message length', () => {
      cy.contains('button', 'Edit Template').click();
      
      // Enter long message
      const longMessage = 'A'.repeat(161);
      cy.get('textarea[name="smsTemplate"]').clear().type(longMessage);
      
      // Should show warning
      cy.contains('Message will be sent as 2 SMS segments').should('be.visible');
      cy.get('[data-testid="character-count"]').should('have.class', 'text-yellow-600');
    });
  });

  describe('Integration with Twilio', () => {
    it('should verify Twilio configuration', () => {
      cy.contains('button', 'Test Twilio Connection').click();
      
      // Should show connection status
      cy.contains('Checking Twilio connection...').should('be.visible');
      cy.contains('Twilio connected successfully', { timeout: 10000 }).should('be.visible');
      
      // Display account info
      cy.contains('Phone Number: +1 (980) 427-7268').should('be.visible');
      cy.contains('Messaging Service: Active').should('be.visible');
    });

    it('should handle Twilio errors gracefully', () => {
      // Temporarily break Twilio config
      cy.window().then((win) => {
        win.localStorage.setItem('twilio_test_mode', 'error');
      });
      
      cy.contains('button', 'Send Test SMS').click();
      cy.get('input[placeholder*="phone number"]').type(TEST_PHONES.primary);
      cy.contains('button', 'Send Test').click();
      
      // Should show error message
      cy.contains('Failed to send SMS').should('be.visible');
      cy.contains('Please check your Twilio configuration').should('be.visible');
      
      // Restore config
      cy.window().then((win) => {
        win.localStorage.removeItem('twilio_test_mode');
      });
    });
  });

  describe('SMS Pricing and Quotas', () => {
    it('should display current plan and usage', () => {
      cy.get('[data-testid="pricing-tier"]').should('be.visible');
      cy.get('[data-testid="sms-quota"]').should('contain.text', 'SMS/month');
      cy.get('[data-testid="usage-percentage"]').should('exist');
    });

    it('should show upgrade prompt when approaching limit', () => {
      // Simulate high usage
      cy.window().then((win) => {
        win.localStorage.setItem('sms_usage_mock', '90');
      });
      
      cy.reload();
      
      // Should show warning
      cy.contains('90% of monthly SMS quota used').should('be.visible');
      cy.contains('button', 'Upgrade Plan').should('be.visible');
      
      // Clean up
      cy.window().then((win) => {
        win.localStorage.removeItem('sms_usage_mock');
      });
    });

    it('should prevent sending when quota exceeded', () => {
      // Simulate quota exceeded
      cy.window().then((win) => {
        win.localStorage.setItem('sms_usage_mock', '100');
      });
      
      cy.reload();
      
      cy.contains('button', 'Send Test SMS').click();
      cy.get('input[placeholder*="phone number"]').type(TEST_PHONES.primary);
      cy.contains('button', 'Send Test').click();
      
      // Should show quota exceeded message
      cy.contains('Monthly SMS quota exceeded').should('be.visible');
      cy.contains('Please upgrade your plan').should('be.visible');
      
      // Clean up
      cy.window().then((win) => {
        win.localStorage.removeItem('sms_usage_mock');
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should work on mobile devices', () => {
      // Set mobile viewport
      cy.viewport('iphone-x');
      
      // Check mobile menu
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.contains('SMS Reviews').click();
      
      // Verify mobile layout
      cy.contains('SMS Review Collection').should('be.visible');
      cy.get('[data-testid="analytics-cards"]').should('have.class', 'grid-cols-1');
      
      // Test SMS sending on mobile
      cy.contains('button', 'Send Test').click();
      cy.get('input[type="tel"]').type(TEST_PHONES.primary);
      cy.contains('button', 'Send').click();
      cy.contains('Test SMS sent').should('be.visible');
    });
  });
});

// Helper command for login
Cypress.Commands.add('login', () => {
  cy.session('test-user', () => {
    cy.visit('/sign-in');
    cy.get('input[name="email"]').type('test@braidpilot.com');
    cy.get('input[name="password"]').type('TestPassword123!');
    cy.contains('button', 'Sign In').click();
    cy.url().should('include', '/dashboard');
  });
});

// Type declaration for custom command
declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
    }
  }
}

export {};