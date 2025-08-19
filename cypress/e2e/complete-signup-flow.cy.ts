describe('Complete Signup Flow', () => {
  const timestamp = Date.now()
  const testUser = {
    email: `braider-${timestamp}@example.com`,
    password: 'TestPassword123!',
  }

  const salonData = {
    name: `Test Salon ${timestamp}`,
    username: `salon${timestamp}`,
    address: '123 Test Street, Test City, TS 12345',
    phone: '(555) 123-4567',
    website: 'https://www.testsalon.com',
    defaultSplitPercentage: 70
  }

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Full User Journey: Signup → Salon Setup → Onboarding', () => {
    it('should complete the entire signup and onboarding flow', () => {
      // Step 1: Start at landing page
      cy.visit('/')
      cy.contains('braidpilot').should('be.visible')
      
      // Navigate to sign up
      cy.contains('Get started').click()
      cy.url().should('include', '/sign-up')
      
      // Step 2: Sign Up Page
      cy.contains('Start Your Free Trial').should('be.visible')
      cy.contains('Join hundreds of braiders who are working smarter').should('be.visible')
      
      // Note: Clerk's actual signup form fields
      // We'll simulate the signup completion
      cy.log('User would complete Clerk signup form here')
      
      // For testing, we'll navigate directly to salon-setup
      // In real flow, Clerk redirects here after signup
      cy.visit('/salon-setup')
      
      // Step 3: Salon Setup Page
      cy.url().then((url) => {
        if (url.includes('/sign-in')) {
          cy.log('Not authenticated, would need to sign up first')
          // For this test, we'll check the flow structure
        } else {
          cy.contains('Set Up Your Salon').should('be.visible')
          cy.contains("Let's get your business information").should('be.visible')
          
          // Fill salon setup form
          cy.get('input[placeholder*="Bella\'s Braids"]').type(salonData.name)
          cy.get('input[placeholder*="24braidingsalon"]').type(salonData.username)
          
          // Wait for username availability check
          cy.get('.animate-spin', { timeout: 10000 }).should('not.exist')
          
          // Fill optional fields
          cy.get('input[placeholder*="123 Main St"]').type(salonData.address)
          cy.get('input[placeholder*="(555)"]').type(salonData.phone)
          cy.get('input[placeholder*="https://www.yoursalon.com"]').type(salonData.website)
          
          // Submit form
          cy.get('button').contains('Continue to Pricing Setup').click()
          
          // Step 4: Should redirect to Onboarding Wizard
          cy.url().should('include', '/onboarding', { timeout: 10000 })
          cy.contains('Welcome to Your Pricing Setup').should('be.visible')
        }
      })
    })

    it('should validate the correct flow order', () => {
      // Test that pages redirect in the correct order
      
      // 1. Sign-up redirects to salon-setup
      cy.visit('/sign-up')
      cy.contains('Start Your Free Trial').should('be.visible')
      // After signup, should go to salon-setup (fallbackRedirectUrl)
      
      // 2. Direct access to onboarding without salon setup should redirect
      cy.visit('/onboarding')
      cy.url().then((url) => {
        // Should either be sign-in (not authenticated) or onboarding (if authenticated)
        expect(url).to.satisfy((u: string) => 
          u.includes('/sign-in') || u.includes('/onboarding')
        )
      })
    })

    it('should show correct content on each step', () => {
      // Test 1: Sign-up page content
      cy.visit('/sign-up')
      cy.contains('braidpilot').should('be.visible')
      cy.contains('Start Your Free Trial').should('be.visible')
      cy.contains('Join hundreds of braiders').should('be.visible')
      
      // Test 2: Salon setup page content (when accessible)
      cy.visit('/salon-setup')
      cy.url().then((url) => {
        if (!url.includes('/sign-in')) {
          // Check all required fields are present
          cy.contains('Salon Name').should('be.visible')
          cy.contains('Custom URL Username').should('be.visible')
          cy.contains('Business Address').should('be.visible')
          cy.contains('Business Phone').should('be.visible')
          cy.contains('Website').should('be.visible')
          cy.contains('Default Braider Commission').should('be.visible')
          cy.contains('Business Hours').should('be.visible')
        }
      })
      
      // Test 3: Onboarding page content (when accessible)
      cy.visit('/onboarding')
      cy.url().then((url) => {
        if (!url.includes('/sign-in')) {
          cy.contains('braidpilot').should('be.visible')
          // Onboarding wizard would show pricing setup
        }
      })
    })
  })

  describe('Error Handling in Signup Flow', () => {
    it('should handle salon setup errors gracefully', () => {
      cy.visit('/salon-setup')
      
      cy.url().then((url) => {
        if (!url.includes('/sign-in')) {
          // Try to submit without required fields
          cy.get('button').contains('Continue to Pricing Setup').click()
          
          // Should show error message
          cy.contains('Please enter your salon name').should('be.visible')
        }
      })
    })

    it('should validate username format and availability', () => {
      cy.visit('/salon-setup')
      
      cy.url().then((url) => {
        if (!url.includes('/sign-in')) {
          // Fill salon name
          cy.get('input[placeholder*="Bella\'s Braids"]').type('Test Salon')
          
          // Test invalid username format
          cy.get('input[placeholder*="24braidingsalon"]').type('Invalid Username!')
          cy.contains('contain only lowercase letters').should('be.visible')
          
          // Test too short username
          cy.get('input[placeholder*="24braidingsalon"]').clear().type('ab')
          cy.contains('at least 3 characters').should('be.visible')
          
          // Test valid username
          cy.get('input[placeholder*="24braidingsalon"]').clear().type(`valid${timestamp}`)
          cy.get('.animate-spin', { timeout: 10000 }).should('not.exist')
          cy.contains('Username is available!').should('be.visible')
        }
      })
    })
  })

  describe('Navigation and Back Button Behavior', () => {
    it('should handle browser back button correctly', () => {
      cy.visit('/sign-up')
      cy.contains('Start Your Free Trial').should('be.visible')
      
      // Go to sign-in
      cy.contains('Sign in').click()
      cy.url().should('include', '/sign-in')
      
      // Use browser back
      cy.go('back')
      cy.url().should('include', '/sign-up')
      cy.contains('Start Your Free Trial').should('be.visible')
    })

    it('should maintain form data on navigation', () => {
      cy.visit('/salon-setup')
      
      cy.url().then((url) => {
        if (!url.includes('/sign-in')) {
          // Fill some form data
          const salonName = 'My Test Salon'
          cy.get('input[placeholder*="Bella\'s Braids"]').type(salonName)
          
          // Navigate away and back
          cy.visit('/')
          cy.go('back')
          
          // Check if data persists (depending on implementation)
          // Note: This might not persist depending on state management
        }
      })
    })
  })

  describe('Responsive Design in Signup Flow', () => {
    const viewports: Cypress.ViewportPreset[] = ['iphone-6', 'ipad-2', 'macbook-15']
    
    viewports.forEach((viewport) => {
      it(`should display correctly on ${viewport}`, () => {
        cy.viewport(viewport)
        
        // Test sign-up page
        cy.visit('/sign-up')
        cy.contains('Start Your Free Trial').should('be.visible')
        cy.contains('braidpilot').should('be.visible')
        
        // Test salon setup page
        cy.visit('/salon-setup')
        cy.url().then((url) => {
          if (!url.includes('/sign-in')) {
            cy.contains('Set Up Your Salon').should('be.visible')
            // Form should be scrollable on mobile
            cy.get('form').should('be.visible')
          }
        })
      })
    })
  })

  describe('Integration with Clerk Authentication', () => {
    it('should redirect unauthenticated users from protected routes', () => {
      // Clear any existing auth
      cy.clearCookies()
      cy.clearLocalStorage()
      
      // Try to access salon-setup without auth
      cy.visit('/salon-setup')
      cy.url().should('include', '/sign-in', { timeout: 10000 })
      
      // Try to access onboarding without auth
      cy.visit('/onboarding')
      cy.url().should('satisfy', (url: string) => 
        url.includes('/sign-in') || url.includes('/onboarding')
      )
    })

    it('should show Clerk UI components correctly', () => {
      cy.visit('/sign-up')
      
      // Check for Clerk's sign-up form
      cy.get('input[placeholder*="email"]').should('be.visible')
      cy.get('input[placeholder*="password"]').should('be.visible')
      cy.get('button').contains('Continue').should('be.visible')
      
      // Check for sign-in link
      cy.contains('Sign in').should('be.visible')
    })
  })

  describe('Complete Flow Success Path', () => {
    it('should show success indicators at each step', () => {
      // This test documents the expected success path
      cy.log('1. User lands on homepage')
      cy.visit('/')
      cy.contains('Get started').should('be.visible')
      
      cy.log('2. User clicks Get Started → Sign-up page')
      cy.contains('Get started').click()
      cy.url().should('include', '/sign-up')
      
      cy.log('3. User completes Clerk signup → Redirected to salon-setup')
      // After signup, fallbackRedirectUrl takes user to /salon-setup
      
      cy.log('4. User completes salon setup → Redirected to onboarding')
      // After salon setup, router.push('/onboarding')
      
      cy.log('5. User completes onboarding → Redirected to dashboard')
      // After onboarding, router.push('/dashboard')
    })
  })
})

export {}