# Braid Pilot - Professional Braiding Salon Management Platform

Braid Pilot is a comprehensive salon management platform that connects clients with braiding salons through instant pricing quotes and seamless appointment booking.

## 🚀 Key Features

- **Price My Style Tool**: Instant pricing quotes for various braiding styles
- **Booking Pro System**: Complete appointment booking with $5 platform fee
- **Salon Dashboard**: Comprehensive business management interface
- **CRM System**: Client relationship management
- **AI Communication Agent**: 24/7 automated client communication
- **Reputation Management**: Automated review collection system

## 📚 Documentation

### For Developers
- [API Reference](./docs/api/booking-api-reference.md) - Complete API documentation
- [Architecture Guide](./docs/architecture/booking-pro-architecture.md) - System architecture overview
- [Quick Reference](./docs/guides/booking-pro-quick-reference.md) - Developer quick start guide

### For Testing
- [Testing Guide](./docs/testing/booking-pro-testing-guide.md) - Comprehensive testing instructions
- [Test Checklist](./docs/testing/booking-pro-test-checklist.md) - Complete testing checklist

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Convex account (for backend)
- Clerk account (for authentication)
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/braid-pilot.git
cd braid-pilot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` with:
```
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
```

5. Run the development servers:

```bash
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - Convex
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 💰 Platform Economics

- **Booking Fee**: $5 per appointment (platform revenue)
- **Service Payment**: 100% goes to salon (paid at appointment)
- **No Hidden Fees**: Transparent pricing for both clients and salons

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npx convex typecheck
```

### Test Credit Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient: `4000 0000 0000 9995`

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Convex (serverless database & functions)
- **Authentication**: Clerk
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Testing**: Jest, Cypress

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
