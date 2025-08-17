describe('Virtual Receptionist Flow', () => {
  beforeEach(() => {
    // Login as salon owner
    cy.login('salon-owner@example.com', 'password123');
    
    // Navigate to AI & Reputation page
    cy.visit('/dashboard/ai-reputation');
    
    // Wait for page to load
    cy.contains('Virtual Receptionist & Reputation').should('be.visible');
  });

  describe('Initial Setup', () => {
    it('should display inactive state for new users', () => {
      // Mock API to return inactive state
      cy.intercept('POST', '**/convex/query', (req) => {
        if (req.body.path === 'vapiConfiguration:getVapiConfiguration') {
          req.reply({
            body: {
              isActive: false,
            },
          });
        }
      });

      cy.contains('Virtual Receptionist not yet configured').should('be.visible');
      cy.get('button').contains('Activate Virtual Receptionist').should('be.visible');
    });

    it('should provision phone number when activated', () => {
      // Mock provisioning API
      cy.intercept('POST', '**/convex/action', (req) => {
        if (req.body.path === 'vapiConfiguration:provisionVapiPhoneNumber') {
          req.reply({
            body: {
              success: true,
              phoneNumber: '+14155551234',
              phoneNumberId: 'phone_123',
              assistantId: 'assistant_123',
            },
          });
        }
      }).as('provisionNumber');

      // Click activate button
      cy.get('button').contains('Activate Virtual Receptionist').click();
      
      // Wait for provisioning
      cy.wait('@provisionNumber');
      
      // Verify success message
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Virtual Receptionist activated!');
        expect(text).to.contains('+14155551234');
      });
    });
  });

  describe('Active Virtual Receptionist', () => {
    beforeEach(() => {
      // Mock active configuration
      cy.intercept('POST', '**/convex/query', (req) => {
        if (req.body.path === 'vapiConfiguration:getVapiConfiguration') {
          req.reply({
            body: {
              isActive: true,
              phoneNumber: '+14155551234',
              phoneNumberId: 'phone_123',
              assistantId: 'assistant_123',
              voiceProvider: 'elevenlabs',
              voiceId: '21m00Tcm4TlvDq8ikWAM',
              voiceSettings: {
                speed: 1.0,
                pitch: 0,
                temperature: 0.7,
                stability: 0.5,
              },
            },
          });
        }
      });

      cy.reload();
    });

    it('should display active status with phone number', () => {
      cy.contains('✅ Virtual Receptionist is Active').should('be.visible');
      cy.contains('Phone: +14155551234').should('be.visible');
      cy.get('button').contains('Test Configuration').should('be.visible');
      cy.get('button').contains('Deactivate').should('be.visible');
    });

    it('should allow testing configuration', () => {
      // Mock test API
      cy.intercept('POST', '**/convex/action', (req) => {
        if (req.body.path === 'vapiConfiguration:testVapiConfiguration') {
          req.reply({
            body: {
              success: true,
              assistant: {
                id: 'assistant_123',
                name: 'Salon Assistant',
              },
              phoneNumber: '+14155551234',
            },
          });
        }
      }).as('testConfig');

      // Click test button
      cy.get('button').contains('Test Configuration').click();
      
      // Wait for test
      cy.wait('@testConfig');
      
      // Verify success message
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Test successful!');
      });
    });

    it('should update voice settings', () => {
      // Expand voice settings
      cy.contains('Voice Settings').click();
      
      // Change voice provider
      cy.get('select[value="elevenlabs"]').select('playht');
      
      // Adjust speed slider
      cy.get('input[type="range"][min="0.5"][max="2.0"]').invoke('val', 1.5).trigger('change');
      
      // Mock update API
      cy.intercept('POST', '**/convex/mutation', (req) => {
        if (req.body.path === 'vapiConfiguration:updateVoiceConfiguration') {
          req.reply({
            body: { success: true },
          });
        }
      }).as('updateVoice');
      
      // Save changes
      cy.get('button').contains('Update Voice Settings').click();
      
      // Wait for update
      cy.wait('@updateVoice');
      
      // Verify success message
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Voice settings updated successfully!');
      });
    });

    it('should update business context', () => {
      // Expand business context
      cy.contains('Business Context').click();
      
      // Update business hours
      cy.get('input[type="checkbox"]').first().check();
      
      // Update cancellation policy
      cy.get('input[value="24 hours notice required for cancellation"]')
        .clear()
        .type('48 hours notice required for cancellation');
      
      // Mock update API
      cy.intercept('POST', '**/convex/mutation', (req) => {
        if (req.body.path === 'vapiConfiguration:updateBusinessContext') {
          req.reply({
            body: { success: true },
          });
        }
      }).as('updateContext');
      
      // Save changes
      cy.get('button').contains('Update Business Context').click();
      
      // Wait for update
      cy.wait('@updateContext');
      
      // Verify success message
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Business context updated successfully!');
      });
    });
  });

  describe('Call Analytics', () => {
    beforeEach(() => {
      // Mock analytics data
      cy.intercept('POST', '**/convex/query', (req) => {
        if (req.body.path === 'vapiConfiguration:getCallAnalytics') {
          req.reply({
            body: {
              totalCalls: 45,
              completedCalls: 42,
              averageDuration: 180000,
              bookingOutcomes: 12,
              transferOutcomes: 3,
              conversionRate: 26.7,
            },
          });
        }
        if (req.body.path === 'vapiWebhook:getRecentCalls') {
          req.reply({
            body: [
              {
                _id: 'call1',
                phoneNumber: '+14155559999',
                startTime: Date.now() - 3600000,
                status: 'completed',
                duration: 120000,
              },
              {
                _id: 'call2',
                phoneNumber: '+14155558888',
                startTime: Date.now() - 7200000,
                status: 'completed',
                duration: 240000,
              },
            ],
          });
        }
      });
    });

    it('should display call analytics', () => {
      cy.contains('Call Analytics').should('be.visible');
      
      // Verify metrics
      cy.contains('Total Calls').parent().contains('45').should('be.visible');
      cy.contains('Completed').parent().contains('42').should('be.visible');
      cy.contains('Avg Duration').parent().contains('3m').should('be.visible');
      cy.contains('Conversion Rate').parent().contains('26.7%').should('be.visible');
    });

    it('should display recent calls', () => {
      cy.contains('Recent Calls').should('be.visible');
      cy.contains('+14155559999').should('be.visible');
      cy.contains('+14155558888').should('be.visible');
      cy.contains('completed').should('be.visible');
    });
  });

  describe('Reputation Management Tab', () => {
    beforeEach(() => {
      // Switch to Reputation Management tab
      cy.get('button').contains('Reputation Management').click();
    });

    it('should display reputation settings', () => {
      cy.contains('Reputation Management Settings').should('be.visible');
      cy.get('input[placeholder*="google-review-link"]').should('be.visible');
      cy.get('input[placeholder*="yelp.com"]').should('be.visible');
    });

    it('should save reputation settings', () => {
      // Enter Google review URL
      cy.get('input[placeholder*="google-review-link"]')
        .clear()
        .type('https://g.page/r/test-salon-review');
      
      // Enter Yelp review URL
      cy.get('input[placeholder*="yelp.com"]')
        .clear()
        .type('https://www.yelp.com/writeareview/biz/test-salon');
      
      // Set review delay
      cy.get('input[type="number"][min="0"]').clear().type('30');
      
      // Mock save API
      cy.intercept('POST', '**/convex/mutation', (req) => {
        if (req.body.path === 'reputation:updateReputationSettings') {
          req.reply({
            body: { success: true },
          });
        }
      }).as('saveReputation');
      
      // Save settings
      cy.get('button').contains('Save Settings').click();
      
      // Wait for save
      cy.wait('@saveReputation');
      
      // Verify success message
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Reputation settings saved successfully!');
      });
    });

    it('should show review request preview', () => {
      // Add review URLs
      cy.get('input[placeholder*="google-review-link"]')
        .type('https://g.page/r/test-salon-review');
      
      // Review preview should appear
      cy.contains('Review Request Preview').should('be.visible');
      cy.contains('SMS Message:').should('be.visible');
      cy.contains('Email Subject:').should('be.visible');
    });

    it('should allow testing review request', () => {
      // Add review URLs first
      cy.get('input[placeholder*="google-review-link"]')
        .type('https://g.page/r/test-salon-review');
      
      // Test review request section should appear
      cy.contains('Test Review Request').should('be.visible');
      
      // Enter test email
      cy.get('input[placeholder="test@example.com"]').type('test@example.com');
      
      // Enter test phone
      cy.get('input[placeholder="+1234567890"]').type('+14155551234');
      
      // Mock test API
      cy.intercept('POST', '**/convex/action', (req) => {
        if (req.body.path === 'reputation:testReviewRequest') {
          req.reply({
            body: {
              success: true,
              results: [
                { success: true, channel: 'email' },
                { success: true, channel: 'sms' },
              ],
            },
          });
        }
      }).as('testReview');
      
      // Send test request
      cy.get('button').contains('Send Test Request').click();
      
      // Wait for test
      cy.wait('@testReview');
      
      // Verify success message
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Test review request sent!');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle provisioning errors', () => {
      // Mock provisioning error
      cy.intercept('POST', '**/convex/action', (req) => {
        if (req.body.path === 'vapiConfiguration:provisionVapiPhoneNumber') {
          req.reply({
            statusCode: 500,
            body: { error: 'Failed to provision phone number' },
          });
        }
      }).as('provisionError');

      // Click activate button
      cy.get('button').contains('Activate Virtual Receptionist').click();
      
      // Wait for error
      cy.wait('@provisionError');
      
      // Verify error message
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Failed to provision phone number');
      });
    });

    it('should validate URLs in reputation settings', () => {
      // Switch to Reputation Management tab
      cy.get('button').contains('Reputation Management').click();
      
      // Enter invalid URL
      cy.get('input[placeholder*="google-review-link"]')
        .type('not-a-valid-url');
      
      // Error message should appear
      cy.contains('Please enter a valid URL').should('be.visible');
      
      // Save button should be disabled
      cy.get('button').contains('Save Settings').should('be.disabled');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      // Set viewport to mobile size
      cy.viewport('iphone-x');
    });

    it('should display properly on mobile', () => {
      // Check that tabs are visible
      cy.contains('Virtual Receptionist').should('be.visible');
      cy.contains('Reputation Management').should('be.visible');
      
      // Check that content is properly stacked
      cy.contains('Virtual Receptionist Setup').should('be.visible');
      
      // Expandable sections should work
      cy.contains('Voice Settings').click();
      cy.get('select[value="elevenlabs"]').should('be.visible');
    });
  });
});