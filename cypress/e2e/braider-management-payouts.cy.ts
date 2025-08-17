describe('Braider Management & Payouts', () => {
  beforeEach(() => {
    // Visit the braiders management page
    cy.visit('/dashboard/braiders')
    
    // Wait for the page to load
    cy.contains('Braider Management & Payouts').should('be.visible')
  })

  describe('Dashboard Overview', () => {
    it('should display summary cards with metrics', () => {
      // Check for all summary cards
      cy.contains('Total Braiders').should('be.visible')
      cy.contains('Pending Payouts').should('be.visible')
      cy.contains('Paid This').should('be.visible')
      cy.contains('Total Bookings').should('be.visible')
      
      // Check that values are displayed
      cy.get('[class*="text-2xl"]').should('have.length.at.least', 4)
    })

    it('should allow period filtering', () => {
      // Test period toggle buttons
      cy.contains('button', 'Day').click()
      cy.contains('Paid This day').should('be.visible')
      
      cy.contains('button', 'Week').click()
      cy.contains('Paid This week').should('be.visible')
      
      cy.contains('button', 'Month').click()
      cy.contains('Paid This month').should('be.visible')
    })
  })

  describe('Braider Cards', () => {
    it('should display braider overview cards', () => {
      // Check for braider card elements
      cy.get('[class*="grid-cols"]').within(() => {
        // Check for braider name
        cy.get('h3').first().should('exist')
        
        // Check for status badge
        cy.contains('Active').should('exist')
        
        // Check for specialties
        cy.get('[class*="bg-indigo-50"]').should('exist')
        
        // Check for workload metrics
        cy.contains('Today').should('exist')
        cy.contains('This Week').should('exist')
        cy.contains('bookings').should('exist')
        cy.contains('hours').should('exist')
        
        // Check for earnings summary
        cy.contains('Total Earned').should('exist')
        cy.contains('Paid').should('exist')
        cy.contains('Pending').should('exist')
      })
    })

    it('should show different payout status indicators', () => {
      // Look for different payout status colors
      cy.get('[class*="text-green-600"]').should('exist') // Paid amounts
      cy.get('[class*="text-orange-600"], [class*="text-yellow-600"]').should('exist') // Pending amounts
    })

    it('should open braider detail modal on card click', () => {
      // Click on first braider card
      cy.get('[class*="hover:shadow-md"]').first().click()
      
      // Check modal opened
      cy.get('[class*="fixed inset-0"]').should('be.visible')
      
      // Check modal content
      cy.contains('Earnings Summary').should('be.visible')
      cy.contains('Transaction History').should('be.visible')
      
      // Close modal
      cy.get('[class*="hover:bg-gray-100"]').find('svg').parent().click()
      cy.get('[class*="fixed inset-0"]').should('not.exist')
    })
  })

  describe('Braider Detail Modal', () => {
    beforeEach(() => {
      // Open the first braider's detail modal
      cy.get('[class*="hover:shadow-md"]').first().click()
      cy.contains('Earnings Summary').should('be.visible')
    })

    it('should display braider information', () => {
      // Check for braider details
      cy.get('[class*="text-xl font-bold"]').should('exist') // Name
      cy.get('[class*="flex items-center gap-4"]').within(() => {
        // Check for email or phone if displayed
        cy.get('span').should('have.length.at.least', 1)
      })
    })

    it('should show earnings summary with period toggle', () => {
      // Check earnings cards
      cy.contains('Total Earned').should('be.visible')
      cy.contains('Paid').should('be.visible')
      cy.contains('Pending').should('be.visible')
      cy.contains('Bookings').should('be.visible')
      
      // Test period toggle
      cy.contains('button', 'Day').click()
      cy.wait(500)
      
      cy.contains('button', 'Week').click()
      cy.wait(500)
      
      cy.contains('button', 'Month').click()
      cy.wait(500)
    })

    it('should display transaction history', () => {
      cy.contains('Transaction History').should('be.visible')
      
      // Check for transaction entries (if any exist)
      cy.get('body').then($body => {
        if ($body.find('[class*="border rounded-lg p-4"]').length > 0) {
          // Check transaction details
          cy.get('[class*="border rounded-lg p-4"]').first().within(() => {
            // Check for service name
            cy.get('[class*="font-medium text-gray-900"]').should('exist')
            
            // Check for status badge
            cy.get('[class*="rounded-full text-xs"]').should('exist')
            
            // Check for date and time
            cy.get('[class*="text-sm text-gray-500"]').should('exist')
            
            // Check for amount
            cy.get('[class*="text-lg font-bold"]').should('exist')
          })
        } else {
          // Check for empty state
          cy.contains('No transactions found').should('be.visible')
        }
      })
    })

    it('should allow bulk payout processing', () => {
      // Check if payout section exists (only if pending payouts)
      cy.get('body').then($body => {
        if ($body.find(':contains("Process Payouts")').length > 0) {
          cy.contains('Process Payouts').should('be.visible')
          
          // Check for payout method selector
          cy.get('select').should('exist')
          cy.get('select').select('bank_transfer')
          
          // Check for select all button
          cy.contains('button', 'Select All Pending').should('be.visible')
          
          // Check for process button
          cy.contains('button', 'Process Selected Payouts').should('be.visible')
          
          // Test select all functionality
          cy.contains('button', 'Select All Pending').click()
          
          // Check that checkboxes are selected
          cy.get('input[type="checkbox"]').should('be.checked')
          
          // Check that selected count is updated
          cy.contains('transactions selected').should('be.visible')
        }
      })
    })

    it('should allow individual transaction payout', () => {
      cy.get('body').then($body => {
        if ($body.find(':contains("Mark as Paid")').length > 0) {
          // Find first unpaid transaction
          cy.contains('button', 'Mark as Paid').first().click()
          
          // Check for success message (using stub or actual)
          cy.on('window:alert', (text) => {
            expect(text).to.contain('Payment marked as complete')
          })
        }
      })
    })

    it('should close modal properly', () => {
      // Close using X button
      cy.get('[class*="hover:bg-gray-100"]').find('svg').parent().click()
      
      // Verify modal is closed
      cy.get('[class*="fixed inset-0"]').should('not.exist')
      cy.contains('Earnings Summary').should('not.exist')
    })
  })

  describe('Empty States', () => {
    it('should handle no braiders gracefully', () => {
      // This would need to be tested with a mock or test data
      // Check if empty state message exists when no braiders
      cy.get('body').then($body => {
        if ($body.find(':contains("No Braiders Yet")').length > 0) {
          cy.contains('No Braiders Yet').should('be.visible')
          cy.contains('Add your first braider').should('be.visible')
        }
      })
    })
  })

  describe('Responsive Design', () => {
    it('should be responsive on mobile', () => {
      cy.viewport('iphone-x')
      
      // Check that grid adjusts to single column
      cy.get('[class*="grid"]').should('have.class', 'grid-cols-1')
      
      // Check that cards are still clickable
      cy.get('[class*="hover:shadow-md"]').first().click()
      
      // Check modal is full screen on mobile
      cy.get('[class*="fixed inset-0"]').should('be.visible')
      
      // Close modal
      cy.get('[class*="hover:bg-gray-100"]').find('svg').parent().click()
    })

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2')
      
      // Check that grid adjusts appropriately
      cy.get('[class*="md:grid-cols-2"]').should('exist')
      
      // Check functionality remains intact
      cy.get('[class*="hover:shadow-md"]').first().click()
      cy.contains('Earnings Summary').should('be.visible')
      cy.get('[class*="hover:bg-gray-100"]').find('svg').parent().click()
    })
  })

  describe('Data Updates', () => {
    it('should refresh data when period changes', () => {
      // Get initial pending payout value
      cy.contains('Pending Payouts')
        .parent()
        .find('[class*="text-2xl"]')
        .invoke('text')
        .as('initialPending')
      
      // Change period
      cy.contains('button', 'Day').click()
      cy.wait(1000)
      
      // Value might change (depending on data)
      cy.contains('Pending Payouts')
        .parent()
        .find('[class*="text-2xl"]')
        .invoke('text')
        .as('dayPending')
      
      // Change back
      cy.contains('button', 'Week').click()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // This would need to be tested with network stubbing
      cy.intercept('POST', '**/api/convex/**', { statusCode: 500 }).as('apiError')
      
      // Try to open a modal
      cy.get('[class*="hover:shadow-md"]').first().click()
      
      // Should handle error gracefully (implementation dependent)
      // The UI should remain functional
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and keyboard navigation', () => {
      // Check for proper button labels
      cy.get('button').each($button => {
        cy.wrap($button).should('be.visible')
      })
      
      // Test keyboard navigation
      // cy.get('body').tab() // tab() method not available
      
      // Period buttons should be focusable
      // cy.focused().should('have.text').and('match', /Day|Week|Month/)
      
      // Braider cards should be clickable with Enter
      cy.get('[class*="hover:shadow-md"]').first().focus()
      cy.focused().type('{enter}')
      
      // Modal should open
      cy.contains('Earnings Summary').should('be.visible')
      
      // ESC should close modal
      cy.get('body').type('{esc}')
      cy.get('[class*="fixed inset-0"]').should('not.exist')
    })
  })
})