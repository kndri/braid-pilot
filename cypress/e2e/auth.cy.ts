describe('Authentication Flow', () => {
  const timestamp = Date.now()
  const testUser = {
    email: `test${timestamp}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User'
  }

  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Sign Up', () => {
    it('should create a new account successfully', () => {
      cy.visit('/sign-up')
      
      // Verify we're on the sign-up page
      cy.contains('h1', 'Start Your Free Trial').should('be.visible')
      
      // Fill in the sign-up form
      cy.get('input[name="name"]').type(testUser.name)
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('input[name="confirmPassword"]').type(testUser.password)
      cy.get('input[name="terms"]').check()
      
      // Submit the form
      cy.get('button[type="submit"]').click()
      
      // Wait for the mutation to complete
      cy.wait(3000)
      
      // Should redirect to onboarding or dashboard
      cy.url().should('satisfy', (url: string) => {
        return url.includes('/onboarding') || url.includes('/dashboard')
      })
    })

    it('should show error for mismatched passwords', () => {
      cy.visit('/sign-up')
      
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('Password123!')
      cy.get('input[name="confirmPassword"]').type('DifferentPassword123!')
      cy.get('input[name="terms"]').check()
      
      cy.get('button[type="submit"]').click()
      
      // Should show error message
      cy.contains('Passwords do not match').should('be.visible')
    })

    it('should show error for short password', () => {
      cy.visit('/sign-up')
      
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('Pass1!')
      cy.get('input[name="confirmPassword"]').type('Pass1!')
      cy.get('input[name="terms"]').check()
      
      cy.get('button[type="submit"]').click()
      
      // Should show error message
      cy.contains('Password must be at least 8 characters').should('be.visible')
    })
  })

  describe('Sign In', () => {
    // Create a user first
    before(() => {
      cy.signUp(testUser.email, testUser.password, testUser.name)
      cy.wait(3000)
      cy.signOut()
    })

    it('should sign in with valid credentials', () => {
      cy.visit('/sign-in')
      
      // Verify we're on the sign-in page
      cy.contains('h1', 'Welcome Back').should('be.visible')
      
      // Fill in the sign-in form
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      
      // Submit the form
      cy.get('button[type="submit"]').click()
      
      // Wait for the mutation to complete
      cy.wait(3000)
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/sign-in')
      
      cy.get('input[name="email"]').type('wrong@example.com')
      cy.get('input[name="password"]').type('WrongPassword123!')
      
      cy.get('button[type="submit"]').click()
      
      // Wait for error
      cy.wait(2000)
      
      // Should show error message
      cy.contains('Invalid email or password').should('be.visible')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect to sign-in when accessing dashboard without auth', () => {
      cy.visit('/dashboard')
      
      // Should redirect to sign-in
      cy.url().should('include', '/sign-in')
    })

    it('should access dashboard when authenticated', () => {
      // Sign in first
      cy.signIn(testUser.email, testUser.password)
      cy.wait(3000)
      
      // Visit dashboard
      cy.visit('/dashboard')
      
      // Should stay on dashboard
      cy.url().should('include', '/dashboard')
      cy.contains('Welcome back').should('be.visible')
    })
  })

  describe('Sign Out', () => {
    it('should sign out successfully', () => {
      // Sign in first
      cy.signIn(testUser.email, testUser.password)
      cy.wait(3000)
      
      // Verify we're logged in
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      
      // Sign out
      cy.signOut()
      cy.wait(1000)
      
      // Try to access dashboard
      cy.visit('/dashboard')
      
      // Should redirect to sign-in
      cy.url().should('include', '/sign-in')
    })
  })
})