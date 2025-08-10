# Convex Auth Setup Guide

## Overview
Braid Pilot uses Convex Auth for authentication, providing a unified solution where both authentication and data storage are handled by Convex. This simplifies the architecture and reduces external dependencies.

## Prerequisites
- Node.js installed
- A Convex account (free tier available at [convex.dev](https://convex.dev))

## Setup Instructions

### 1. Convex Setup

1. **Create a Convex Project**
   ```bash
   npx convex dev
   ```
   - Follow the prompts to create a new project or link to existing
   - This will generate your Convex URL

2. **Get Your Convex URL**
   - After running `npx convex dev`, you'll see your project URL
   - It looks like: `https://your-project-name.convex.cloud`

### 2. Environment Variables

1. **Copy the example file**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in your credentials**
   ```env
   # Convex Configuration
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   
   # Auth Secret (generate a random 32+ character string)
   AUTH_SECRET=your-random-secret-at-least-32-characters-long
   ```

3. **Generate AUTH_SECRET**
   ```bash
   # Generate a secure random secret
   openssl rand -base64 32
   ```

### 3. Run the Application

1. **Start Convex Dev Server**
   ```bash
   npx convex dev
   ```
   This syncs your schema and functions with Convex cloud.

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
2. User fills in name, email, and password
3. Account created in Convex with Password provider
4. User record created in database
5. After sign-up → redirected to `/onboarding`
6. Salon record created automatically
7. User completes onboarding steps
8. After onboarding → redirected to `/dashboard`

### Returning User Flow
1. User clicks "Sign In" → redirected to `/sign-in`
2. User enters email and password
3. Credentials verified by Convex Auth
4. System checks onboarding status:
   - If incomplete → redirected to `/onboarding`
   - If complete → redirected to `/dashboard`

### Sign Out Flow
1. User clicks "Sign Out" in dashboard
2. Session cleared by Convex Auth
3. User redirected to landing page

## Database Schema

### Auth Tables (Managed by Convex Auth)
- `authSessions` - User sessions
- `authAccounts` - User accounts
- `authVerificationTokens` - Email verification tokens

### Users Table
- `email` - User's email address
- `name` - User's full name
- `emailVerified` - Email verification status
- `image` - Profile image URL (optional)
- `salonId` - Reference to salon record (optional)
- `onboardingComplete` - Onboarding status flag
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Salons Table
- `name` - Salon business name
- `email` - Contact email
- `address` - Business address (optional)
- `phone` - Contact phone (optional)
- `ownerId` - Reference to user (owner)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### PricingConfigs Table
- `salonId` - Reference to salon
- `serviceName` - Name of the service
- `basePrice` - Service price
- `duration` - Service duration in minutes
- `category` - Service category
- `description` - Service description (optional)
- `isActive` - Active/inactive flag
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Protected Routes

The middleware automatically protects these routes:
- `/dashboard/*` - Requires authentication
- `/settings/*` - Requires authentication
- `/clients/*` - Requires authentication
- `/bookings/*` - Requires authentication
- `/onboarding` - Requires authentication
- `/pricing` - Requires authentication (when managing)

Public routes:
- `/` - Landing page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/pricing` - Public pricing page (viewing)
- `/features` - Public features page
- `/contact` - Contact page

## API Functions

### Authentication Functions
```typescript
// Sign in with email/password
await signIn("password", { 
  email, 
  password, 
  flow: "signIn" 
})

// Sign up with email/password
await signIn("password", { 
  email, 
  password, 
  name,
  flow: "signUp" 
})

// Sign out
await signOut()
```

### User Queries
```typescript
// Get current user
const user = useQuery(api.users.viewer)

// Check onboarding status
const status = useQuery(api.users.checkOnboardingStatus)

// Get full user data with salon
const userData = useQuery(api.users.getCurrentUser)
```

### User Mutations
```typescript
// Create initial salon record
const createSalon = useMutation(api.users.createInitialSalonRecord)

// Complete onboarding
const complete = useMutation(api.users.completeOnboarding)
```

## Troubleshooting

### "Not authenticated" error
- Ensure AUTH_SECRET is set in `.env.local`
- Check that cookies are enabled in your browser
- Try clearing browser cache and cookies

### "Convex connection failed"
- Verify your NEXT_PUBLIC_CONVEX_URL in `.env.local`
- Ensure `npx convex dev` is running
- Check your internet connection

### Sign-up fails
- Email might already be registered
- Password must be at least 8 characters
- Check browser console for specific errors

### Redirect loops
- Clear browser cookies
- Check that middleware.ts is properly configured
- Verify onboarding status in Convex dashboard

## Security Considerations

1. **Password Security**
   - Passwords are hashed using secure algorithms
   - Never stored in plain text
   - Minimum 8 character requirement

2. **Session Management**
   - Sessions expire automatically
   - Secure HTTP-only cookies
   - CSRF protection built-in

3. **Database Access**
   - All queries require authentication
   - Data isolated per user/salon
   - No direct database access from client

## Development Tips

### Testing Authentication
```bash
# Create test user
# Go to /sign-up and create account

# Test sign in
# Go to /sign-in with test credentials

# Check session
# Open browser dev tools → Application → Cookies
```

### Debugging
- Enable debug mode in Convex dashboard
- Check browser console for errors
- View Convex logs for backend errors
- Use React DevTools to inspect auth state

### Custom Authentication UI
The sign-in and sign-up pages are fully customizable:
- `/app/sign-in/page.tsx` - Sign in page
- `/app/sign-up/page.tsx` - Sign up page
- Add social providers in `convex/auth.ts`

## Next Steps

1. **Add Email Verification** (optional)
   - Configure email provider in Convex
   - Add verification flow

2. **Add Social Login** (optional)
   - Add GitHub/Google providers
   - Update auth configuration

3. **Implement Password Reset**
   - Add forgot password flow
   - Configure email sending

4. **Add Two-Factor Authentication** (optional)
   - Implement TOTP support
   - Add backup codes

## Resources

- [Convex Auth Documentation](https://labs.convex.dev/auth)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com) (for form handling)

---

*Last Updated: December 2024*