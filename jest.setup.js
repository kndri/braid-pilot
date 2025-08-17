// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: 'test-user-id',
    isLoaded: true,
    isSignedIn: true,
    signOut: jest.fn(),
  }),
  ClerkProvider: ({ children }) => children,
  SignInButton: ({ children }) => children,
  SignUpButton: ({ children }) => children,
  UserButton: () => <div>User Button</div>,
  RedirectToSignIn: () => <div>Redirect to SignIn</div>,
  RedirectToSignUp: () => <div>Redirect to SignUp</div>,
}))

// Mock Convex
jest.mock('convex/react', () => ({
  useQuery: jest.fn(() => null),
  useMutation: jest.fn(() => jest.fn()),
  ConvexProvider: ({ children }) => children,
}))

// Mock window.navigator.clipboard (only in jsdom environment)
if (typeof navigator !== 'undefined') {
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn(() => Promise.resolve()),
    },
  })
} else {
  // In Node.js environment, create a minimal navigator mock
  global.navigator = {
    clipboard: {
      writeText: jest.fn(() => Promise.resolve()),
    },
  }
}

// Mock Date for consistent testing
const mockDate = new Date('2024-01-15T10:00:00Z')
const OriginalDate = global.Date

global.Date = class MockDate extends OriginalDate {
  constructor(...args) {
    if (args.length === 0) {
      super(mockDate.getTime())
    } else {
      super(...args)
    }
  }
  
  static now() {
    return mockDate.getTime()
  }
}

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Uncomment to ignore console outputs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
}