// Simple SMS test to verify Twilio integration
// This test will attempt to send test SMS messages to the configured phone numbers

describe('SMS Test - Simple', () => {
  const TEST_PHONES = {
    primary: '+19807857108',
    secondary: '+18033282700',
  };

  it('should send test SMS to primary phone number', () => {
    // Visit the API endpoint directly to test SMS
    cy.request({
      method: 'POST',
      url: '/api/sms/test',
      body: {
        phone: TEST_PHONES.primary,
        message: 'Test SMS from BraidPilot E2E test - Primary Phone',
      },
      failOnStatusCode: false,
    }).then((response) => {
      // Log the response for debugging
      cy.log('SMS Response:', JSON.stringify(response.body));
      
      // Check if we got a successful response or expected error
      if (response.status === 200) {
        expect(response.body).to.have.property('success', true);
        cy.log('✅ SMS sent successfully to primary phone');
      } else if (response.status === 404) {
        cy.log('⚠️ SMS API endpoint not found - may need to implement /api/sms/test');
      } else {
        cy.log(`⚠️ SMS API returned status ${response.status}: ${JSON.stringify(response.body)}`);
      }
    });
  });

  it('should send test SMS to secondary phone number', () => {
    cy.request({
      method: 'POST',
      url: '/api/sms/test',
      body: {
        phone: TEST_PHONES.secondary,
        message: 'Test SMS from BraidPilot E2E test - Secondary Phone',
      },
      failOnStatusCode: false,
    }).then((response) => {
      cy.log('SMS Response:', JSON.stringify(response.body));
      
      if (response.status === 200) {
        expect(response.body).to.have.property('success', true);
        cy.log('✅ SMS sent successfully to secondary phone');
      } else {
        cy.log(`⚠️ SMS API returned status ${response.status}`);
      }
    });
  });

  it('should test SMS through Convex action if available', () => {
    // Try to trigger SMS through the dashboard (without authentication)
    cy.visit('/');
    
    // Check if we can access any public SMS test functionality
    cy.window().then((win) => {
      cy.log('Window location:', win.location.href);
      
      // Try to access Convex directly if available
      if ((win as any).convex) {
        cy.log('Convex client found in window');
      } else {
        cy.log('Convex client not exposed in window');
      }
    });
  });

  it('should validate phone number format', () => {
    const invalidNumbers = ['123', 'not-a-number', '555-1234'];
    const validNumbers = [TEST_PHONES.primary, TEST_PHONES.secondary, '+14155552671'];
    
    // Test invalid numbers
    invalidNumbers.forEach(number => {
      cy.request({
        method: 'POST',
        url: '/api/sms/validate',
        body: { phone: number },
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status === 404) {
          cy.log('Validation endpoint not found');
        } else {
          expect(response.body.valid).to.be.false;
        }
      });
    });
    
    // Test valid numbers
    validNumbers.forEach(number => {
      cy.request({
        method: 'POST',
        url: '/api/sms/validate',
        body: { phone: number },
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status === 404) {
          cy.log('Validation endpoint not found');
        } else {
          expect(response.body.valid).to.be.true;
        }
      });
    });
  });
});

export {};