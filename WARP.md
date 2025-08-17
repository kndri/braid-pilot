# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Braid Pilot is a comprehensive salon management platform for hair braiding businesses built with Next.js 15.4.6, React 19, TypeScript, and Convex.dev as the backend. The platform connects clients with braiding salons through instant pricing quotes and seamless appointment booking with a $5 platform fee model.

### Core Components
1. **Landing Page & Quote Tool** - Client-facing price calculator and booking interface
2. **Salon Onboarding** - Multi-step wizard for salon pricing configuration 
3. **Dashboard System** - Comprehensive business management interface
4. **AI Communication Agent** - 24/7 automated client communication via Vapi platform
5. **CRM & Reputation Management** - Client relationship and review collection system

## Development Commands

### Primary Development
```bash
npm run dev                # Start Next.js dev server with Turbopack at http://localhost:3000
npm run dev:backend        # Start Convex dev server
```

**Note**: Run both commands in separate terminals for full-stack development.

### Testing & Quality
```bash
npm test                   # Run Jest unit tests
npm run test:watch         # Run Jest in watch mode
npm run test:coverage      # Generate test coverage report
npm run cypress            # Open Cypress GUI for E2E tests
npm run cypress:headless   # Run Cypress tests headlessly
npm run e2e               # Alias for cypress:headless
npm run lint              # Run ESLint checks
```

### Build & Deploy
```bash
npm run build             # Create production build
npm start                 # Start production server
```

### Convex Backend
```bash
npx convex dev            # Start Convex development server
npx convex typecheck      # Type check Convex functions
npx convex dashboard      # Open Convex dashboard
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.4.6 (App Router) + React 19 + TypeScript
- **Backend**: Convex.dev (real-time serverless database & functions)
- **Authentication**: Clerk (configured with JWT)
- **Payments**: Stripe (Booking Pro system with $5 platform fee)
- **AI Communication**: Vapi platform for voice calls + Google Gemini API
- **Styling**: Tailwind CSS v4
- **Testing**: Jest + Cypress

### Project Structure
```
/app/                 # Next.js App Router pages
  /dashboard/         # Salon management interface
  /onboarding/        # Salon setup wizard
  /salon-setup/       # Additional salon configuration
/components/          # Reusable React components
/convex/              # Convex backend functions and schema
  schema.ts           # Database schema definitions
  auth.config.ts      # Clerk authentication config
  booking.ts          # Core booking system functions
  salons.ts           # Salon management functions
  aiAgent.ts          # AI communication logic
  vapiConfiguration.ts # Vapi voice platform config
/docs/                # Project documentation
```

### Key Architectural Patterns

**Database Schema Design**: Convex schema uses a comprehensive relational model with:
- `users` linked to `salons` (one-to-one)
- `salons` with granular `pricingConfigs` (style-specific pricing)
- `bookings` with emergency capacity management and braider assignment
- `clients` with CRM features and communication logs
- Real-time `vapiCalls` and webhook event tracking

**Payment Flow**: Unique two-stage payment model:
1. Client pays $5 platform fee at booking confirmation
2. Salon receives full service price payment after completion (handled separately)

**Capacity Management**: Emergency booking system prevents salon overbooking with:
- Concurrent booking limits per time slot
- Buffer time management between appointments
- Multi-braider assignment with workload distribution

## Development Workflow

### Setting up Environment
1. Copy `.env.local.example` to `.env.local`
2. Configure required environment variables:
   - `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication
   - `CLERK_SECRET_KEY` - Clerk server-side authentication
   - Additional Stripe, Vapi, and other service keys

### Database Operations
- Use `ctx.db.query()` for reading data with indexes for performance
- Use `ctx.db.insert()`, `ctx.db.patch()`, `ctx.db.delete()` for mutations
- Leverage Convex indexes (e.g., `by_salonId`, `by_email`) for efficient queries
- Always update `updatedAt` timestamps in mutations

### Authentication Patterns
- User authentication handled via Clerk with JWT validation in Convex
- User-salon relationship established during onboarding process
- Protected routes use Clerk's authentication middleware

## Testing Strategy

### Unit Tests (Jest)
- Test React components in isolation
- Mock Convex functions for component testing
- Coverage focused on business logic and user interactions

### E2E Tests (Cypress)
- Full user journey testing from quote generation to booking completion
- Payment flow testing with Stripe test cards:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - Insufficient Funds: `4000 0000 0000 9995`

### Running Single Tests
```bash
npm test -- --testNamePattern="specific test name"
npx cypress run --spec "cypress/e2e/specific-test.cy.ts"
```

## Important Business Logic

### Pricing System
- **Granular Configuration**: Style-specific base prices with length, size, and hair type adjustments
- **Dynamic Calculation**: Real-time price computation based on salon's custom pricing matrix
- **Hair Type Modifiers**: Global adjustments for different hair types (synthetic, human hair, etc.)

### Booking Flow
1. Client generates quote through "Price My Style" tool
2. Selects appointment time (validates capacity and braider availability)
3. Pays $5 platform fee via Stripe
4. Booking confirmed with automatic braider assignment
5. Notifications sent to salon and client
6. Service payment handled separately at appointment completion

### AI Agent Integration
- **Vapi Platform**: Handles inbound/outbound voice calls with custom prompts
- **Webhook Processing**: Real-time call event processing and conversation logging  
- **Business Context**: AI responses informed by salon hours, policies, and current promotions
- **Multi-language Support**: Configurable language and personality settings

### Emergency Capacity Management
- **Concurrent Booking Limits**: Prevents salon overbooking based on service duration
- **Buffer Time Management**: Automatic spacing between appointments
- **Multi-braider Support**: Workload distribution across available staff

## Platform Economics
- **Revenue Model**: $5 platform fee per confirmed booking
- **Salon Payouts**: 100% of service price goes to salon after completion
- **Transparent Pricing**: No hidden fees for clients or salons

## Common Debugging Areas

### Authentication Issues
- Check Clerk configuration in `convex/auth.config.ts`
- Verify JWT validation in Convex functions
- Ensure user-salon relationships are properly established

### Payment Processing
- Verify Stripe webhook configurations
- Check transaction status in both Stripe dashboard and Convex database
- Monitor platform fee vs service payment separation

### Capacity Management
- Review `emergencyCapacity.ts` functions for booking validation
- Check braider assignment logic in `braiderAssignment.ts`
- Verify time slot calculations and availability

### AI Agent Performance
- Monitor `vapiCalls` table for conversation quality
- Review webhook processing in `vapiWebhook.ts`
- Check business context configuration in salon settings
