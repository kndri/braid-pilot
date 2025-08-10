# Authentication Setup Guide

## Overview
Braid Pilot uses Clerk for authentication and Convex for backend data storage. This guide will help you set up the authentication system.

## Prerequisites
- Node.js installed
- A Clerk account (free tier available)
- A Convex account (free tier available)

## Setup Instructions

### 1. Clerk Setup

1. **Create a Clerk Application**
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Create a new application
   - Choose "Next.js" as your framework
   - Select Email/Password authentication

2. **Get Your API Keys**
   - In Clerk Dashboard, go to "API Keys"
   - Copy your Publishable Key and Secret Key

3. **Configure Clerk Settings**
   - In Clerk Dashboard, go to "User & Authentication" → "Email, Phone, Username"
   - Enable "Email address" as identifier
   - Enable "Password" as authentication factor
   - Set up your application name and branding

### 2. Convex Setup

1. **Install Convex CLI**
   ```bash
   npm install -g convex
   ```

2. **Initialize Convex**
   ```bash
   npx convex dev
   ```
   - Follow the prompts to create a new project
   - This will generate your Convex URL and deploy key

3. **Connect Clerk with Convex**
   - In Clerk Dashboard, get your Issuer URL from "JWT Templates" → "Convex"
   - If no Convex template exists, create one with:
     - Name: `convex`
     - Lifetime: 60 seconds

### 3. Environment Variables

1. **Copy the example file**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in your credentials**
   ```env
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
   CLERK_SECRET_KEY=sk_test_YOUR_KEY
   
   # Convex
   NEXT_PUBLIC_CONVEX_URL=https://YOUR_PROJECT.convex.cloud
   CONVEX_DEPLOY_KEY=YOUR_DEPLOY_KEY
   
   # Clerk Issuer URL
   CLERK_ISSUER_URL=https://YOUR_DOMAIN.clerk.accounts.dev
   ```

### 4. Run the Application

1. **Start Convex**
   ```bash
   npx convex dev
   ```
   This will sync your schema and functions with Convex cloud.

2. **Start Next.js**
   ```bash
   npm run dev
   ```

3. **Visit the application**
   - Go to http://localhost:3000
   - Click "Get Started for Free" to sign up
   - Complete the onboarding flow

## Authentication Flow

### New User Flow
1. User clicks "Get Started for Free" → redirected to `/sign-up`
2. User creates account with Clerk
3. After sign-up → redirected to `/onboarding`
4. Salon record created in Convex database
5. User completes onboarding steps
6. After onboarding → redirected to `/dashboard`

### Returning User Flow
1. User clicks "Sign In" → redirected to `/sign-in`
2. User authenticates with Clerk
3. System checks onboarding status:
   - If incomplete → redirected to `/onboarding`
   - If complete → redirected to `/dashboard`

### Protected Routes
The middleware automatically protects these routes:
- `/dashboard/*` - Requires authentication
- `/settings/*` - Requires authentication
- `/clients/*` - Requires authentication
- `/bookings/*` - Requires authentication
- `/onboarding` - Requires authentication

Public routes:
- `/` - Landing page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/pricing` - Public pricing page
- `/features` - Public features page

## Database Schema

### Users Table
- `clerkId` - Unique identifier from Clerk
- `salonId` - Reference to salon record
- `onboardingComplete` - Boolean flag
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Salons Table
- `name` - Salon business name
- `email` - Contact email
- `address` - Business address (optional)
- `phone` - Contact phone (optional)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### PricingConfigs Table
- `salonId` - Reference to salon
- `serviceName` - Name of the service
- `basePrice` - Service price
- `duration` - Service duration in minutes
- `category` - Service category
- `description` - Service description (optional)
- `isActive` - Active/inactive flag
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Troubleshooting

### "Not authenticated" error
- Ensure your Clerk keys are correct in `.env.local`
- Check that cookies are enabled in your browser
- Try clearing browser cache and cookies

### "Convex connection failed"
- Verify your Convex URL in `.env.local`
- Ensure `npx convex dev` is running
- Check your internet connection

### Redirect loops
- Clear browser cookies
- Check that middleware.ts is properly configured
- Verify onboarding status in Convex dashboard

### Styling issues with Clerk components
- Clerk components use the theme defined in `components/Providers.tsx`
- Customize appearance using Clerk's appearance prop
- Ensure Tailwind CSS is properly configured

## Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different keys for development and production
   - Rotate keys regularly

2. **Authentication**
   - Clerk handles all password security
   - JWTs expire after 60 seconds
   - Sessions are managed server-side

3. **Database Access**
   - All Convex queries require authentication
   - Data is isolated per salon
   - No direct database access from client

## Next Steps

After authentication is set up:
1. Implement the full onboarding wizard (Task 2.1)
2. Build the pricing configuration system
3. Add booking functionality
4. Implement client management

## Support

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)

---

*Last Updated: December 2024*