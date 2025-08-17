// cypress/support/sms-test-helpers.ts
// Helper utilities for testing SMS functionality

export interface TestSMSConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  messagingServiceSid: string;
  testPhones: {
    primary: string;
    secondary: string;
  };
}

export class SMSTestHelper {
  public config: TestSMSConfig;

  constructor() {
    this.config = {
      accountSid: Cypress.env('TWILIO_ACCOUNT_SID') || 'ACeee62849bc1baa32f347eb3e40a3f3a5',
      authToken: Cypress.env('TWILIO_AUTH_TOKEN') || 'becae1760a4d511b4dd2a3f1eeb4da06',
      phoneNumber: Cypress.env('TWILIO_PHONE_NUMBER') || '+19804277268',
      messagingServiceSid: Cypress.env('TWILIO_MESSAGING_SERVICE_SID') || 'MGb1b8f35fb9ec2ad2eb6974539b7e9bd3',
      testPhones: {
        primary: Cypress.env('TEST_PHONE_1') || '+19807857108',
        secondary: Cypress.env('TEST_PHONE_2') || '+18033282700',
      },
    };
  }

  /**
   * Mock successful SMS send
   */
  mockSuccessfulSMS() {
    cy.intercept('POST', '**/api/sms/send', {
      statusCode: 200,
      body: {
        success: true,
        messageId: 'SM' + Math.random().toString(36).substr(2, 9),
        status: 'queued',
        to: this.config.testPhones.primary,
      },
    }).as('sendSMS');
  }

  /**
   * Mock failed SMS send
   */
  mockFailedSMS(errorMessage = 'Invalid phone number') {
    cy.intercept('POST', '**/api/sms/send', {
      statusCode: 400,
      body: {
        success: false,
        error: errorMessage,
      },
    }).as('sendSMSError');
  }

  /**
   * Mock SMS delivery status webhook
   */
  mockDeliveryStatus(status: 'delivered' | 'failed' | 'undelivered') {
    cy.intercept('POST', '**/webhooks/twilio/status', {
      statusCode: 200,
      body: {
        MessageSid: 'SM' + Math.random().toString(36).substr(2, 9),
        MessageStatus: status,
        To: this.config.testPhones.primary,
        From: this.config.phoneNumber,
      },
    }).as('smsStatus');
  }

  /**
   * Mock opt-out webhook
   */
  mockOptOut(phoneNumber: string) {
    cy.intercept('POST', '**/webhooks/twilio/optout', {
      statusCode: 200,
      body: {
        From: phoneNumber,
        Body: 'STOP',
        OptOutType: 'STOP',
      },
    }).as('optOut');
  }

  /**
   * Verify SMS content
   */
  verifySMSContent(expectedContent: {
    recipientName?: string;
    salonName?: string;
    reviewUrl?: string;
    includesOptOut?: boolean;
  }) {
    cy.get('[data-testid="sms-preview"]').within(() => {
      if (expectedContent.recipientName) {
        cy.contains(expectedContent.recipientName).should('be.visible');
      }
      if (expectedContent.salonName) {
        cy.contains(expectedContent.salonName).should('be.visible');
      }
      if (expectedContent.reviewUrl) {
        cy.contains(expectedContent.reviewUrl).should('be.visible');
      }
      if (expectedContent.includesOptOut) {
        cy.contains('Reply STOP to opt-out').should('be.visible');
      }
    });
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  }

  /**
   * Generate random US phone number for testing
   */
  generateTestPhone(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    return `+1${areaCode}${prefix}${lineNumber}`;
  }

  /**
   * Wait for SMS to be processed
   */
  waitForSMSProcessing(timeout = 5000) {
    cy.wait('@sendSMS', { timeout });
  }

  /**
   * Check SMS analytics
   */
  checkAnalytics(expected: {
    sent?: number;
    delivered?: number;
    failed?: number;
    optedOut?: number;
  }) {
    cy.get('[data-testid="sms-analytics"]').within(() => {
      if (expected.sent !== undefined) {
        cy.get('[data-testid="sms-sent"]').should('contain', expected.sent.toString());
      }
      if (expected.delivered !== undefined) {
        cy.get('[data-testid="sms-delivered"]').should('contain', expected.delivered.toString());
      }
      if (expected.failed !== undefined) {
        cy.get('[data-testid="sms-failed"]').should('contain', expected.failed.toString());
      }
      if (expected.optedOut !== undefined) {
        cy.get('[data-testid="sms-opted-out"]').should('contain', expected.optedOut.toString());
      }
    });
  }

  /**
   * Test SMS character counting
   */
  testCharacterCount(message: string) {
    const segments = Math.ceil(message.length / 160);
    const remaining = 160 - (message.length % 160);
    
    cy.get('textarea[data-testid="sms-message"]').clear().type(message);
    cy.get('[data-testid="character-count"]').should('contain', `${message.length}`);
    
    if (segments > 1) {
      cy.get('[data-testid="sms-segments"]').should('contain', `${segments} segments`);
      cy.get('[data-testid="segment-warning"]').should('be.visible');
    } else {
      cy.get('[data-testid="characters-remaining"]').should('contain', `${remaining} characters remaining`);
    }
  }

  /**
   * Mock SMS quota response
   */
  mockQuotaResponse(used: number, limit: number) {
    cy.intercept('GET', '**/api/sms/quota', {
      statusCode: 200,
      body: {
        used,
        limit,
        percentUsed: (used / limit) * 100,
        remaining: limit - used,
        tier: limit === 50 ? 'starter' : limit === 200 ? 'professional' : 'unlimited',
      },
    }).as('smsQuota');
  }

  /**
   * Test phone number validation
   */
  testPhoneValidation(phoneNumber: string, shouldBeValid: boolean) {
    cy.get('input[data-testid="phone-input"]').clear().type(phoneNumber);
    cy.get('button[data-testid="validate-phone"]').click();
    
    if (shouldBeValid) {
      cy.get('[data-testid="phone-valid"]').should('be.visible');
      cy.get('[data-testid="phone-invalid"]').should('not.exist');
    } else {
      cy.get('[data-testid="phone-invalid"]').should('be.visible');
      cy.get('[data-testid="phone-valid"]').should('not.exist');
    }
  }

  /**
   * Setup test data for SMS testing
   */
  setupTestData() {
    // Create test salon
    cy.task('db:seed', {
      salons: [{
        id: 'test-salon-1',
        name: 'Test Salon for SMS',
        googleReviewUrl: 'https://g.page/test-salon',
        yelpReviewUrl: 'https://yelp.com/biz/test-salon',
        smsEnabled: true,
        smsDelay: 7200000, // 2 hours
        smsTemplate: 'Hi {name}! Thanks for visiting {salon}. We\'d love your feedback! Review us here: {url}',
      }],
      clients: [{
        id: 'test-client-1',
        name: 'Test Client',
        phone: this.config.testPhones.primary,
        salonId: 'test-salon-1',
      }],
      bookings: [{
        id: 'test-booking-1',
        clientId: 'test-client-1',
        salonId: 'test-salon-1',
        status: 'completed',
        completedAt: new Date().toISOString(),
      }],
    });
  }

  /**
   * Clean up test data
   */
  cleanupTestData() {
    cy.task('db:cleanup', {
      tables: ['salons', 'clients', 'bookings', 'smsLogs', 'optOutList'],
    });
  }

  /**
   * Monitor Twilio webhook
   */
  monitorWebhook(webhookType: 'status' | 'optout' | 'incoming') {
    const webhookUrl = `**/webhooks/twilio/${webhookType}`;
    cy.intercept('POST', webhookUrl).as(`twilio${webhookType.charAt(0).toUpperCase() + webhookType.slice(1)}`);
  }

  /**
   * Test SMS rate limiting
   */
  testRateLimiting(maxRequests: number, timeWindow: number) {
    // Test rate limiting by making multiple requests sequentially
    let successCount = 0;
    let rateLimitedCount = 0;
    
    for (let i = 0; i < maxRequests + 1; i++) {
      cy.request({
        method: 'POST',
        url: '/api/sms/send',
        body: {
          to: this.generateTestPhone(),
          message: `Test message ${i}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status === 200) {
          successCount++;
        } else if (response.status === 429) {
          rateLimitedCount++;
        }
      });
    }
    
    // Verify after all requests
    cy.wrap(null).then(() => {
      expect(successCount).to.equal(maxRequests);
      expect(rateLimitedCount).to.equal(1);
    });
  }
}

// Export singleton instance
export const smsTestHelper = new SMSTestHelper();

// Cypress command extensions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Send test SMS message
       */
      sendTestSMS(phone?: string): Chainable<void>;
      
      /**
       * Verify SMS delivery
       */
      verifySMSDelivery(messageId: string): Chainable<void>;
      
      /**
       * Add phone to opt-out list
       */
      optOutPhone(phone: string): Chainable<void>;
      
      /**
       * Check SMS quota usage
       */
      checkSMSQuota(): Chainable<{ used: number; limit: number; remaining: number }>;
    }
  }
}

// Implement custom commands
Cypress.Commands.add('sendTestSMS', (phone?: string) => {
  const testPhone = phone || smsTestHelper.config.testPhones.primary;
  
  cy.request({
    method: 'POST',
    url: '/api/sms/test',
    body: {
      to: testPhone,
      salonName: 'Test Salon',
    },
  }).then((response) => {
    expect(response.status).to.equal(200);
    expect(response.body.success).to.be.true;
  });
});

Cypress.Commands.add('verifySMSDelivery', (messageId: string) => {
  cy.request({
    method: 'GET',
    url: `/api/sms/status/${messageId}`,
  }).then((response) => {
    expect(response.status).to.equal(200);
    expect(response.body.status).to.be.oneOf(['delivered', 'sent', 'queued']);
  });
});

Cypress.Commands.add('optOutPhone', (phone: string) => {
  cy.request({
    method: 'POST',
    url: '/api/sms/optout',
    body: { phone },
  }).then((response) => {
    expect(response.status).to.equal(200);
    expect(response.body.success).to.be.true;
  });
});

Cypress.Commands.add('checkSMSQuota', () => {
  cy.request({
    method: 'GET',
    url: '/api/sms/quota',
  }).then((response) => {
    expect(response.status).to.equal(200);
    return response.body;
  });
});