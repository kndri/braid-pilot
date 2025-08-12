# Authentication Flow Documentation

## Overview
This application uses Clerk for authentication with Next.js 15 App Router and Convex for data persistence.

## Architecture Best Practices Implemented

### 1. Simplified Middleware (No Custom Redirects)
```typescript
// middleware.ts
export default clerkMiddleware();
```
- **Why**: Prevents redirect loops by letting Clerk handle all authentication logic
- **Benefit**: No conflicting redirect logic between middleware and page components

### 2. No Server-Side Auth Checks in Auth Pages
- Sign-in and sign-up pages are simple client components
- No `auth()` checks that could conflict with middleware
- **Why**: Prevents race conditions and redirect loops
- **Benefit**: Clean separation of concerns

### 3. Proper Redirect Configuration
```typescript
// Sign-in page
<SignIn fallbackRedirectUrl="/dashboard" />

// Sign-up page  
<SignUp fallbackRedirectUrl="/onboarding" />
```
- **Why**: Uses Clerk's built-in redirect handling
- **Benefit**: Predictable post-authentication routing

### 4. Dashboard-Based Routing Logic
The dashboard component handles onboarding status checks:
- If not onboarded → Redirect to `/onboarding`
- If onboarded → Show dashboard
- **Why**: Centralized business logic in one place
- **Benefit**: Easy to maintain and understand

## Authentication Flow

### New User Flow
1. User visits protected route → Clerk redirects to `/sign-in`
2. User clicks "Sign up" → Goes to `/sign-up`
3. User completes sign-up → Redirected to `/onboarding`
4. User completes onboarding → Redirected to `/dashboard`

### Returning User Flow
1. User visits protected route → Clerk redirects to `/sign-in`
2. User signs in → Redirected to `/dashboard`
3. Dashboard checks onboarding status:
   - If incomplete → Redirects to `/onboarding`
   - If complete → Shows dashboard

### Already Authenticated User
1. User visits `/sign-in` or `/sign-up` → Clerk shows loading state → Redirects to dashboard
2. User visits protected route → Allowed through
3. User visits public route → Allowed through

## Route Protection

### Public Routes
- `/` - Landing page
- `/sign-in/*` - Sign in flow
- `/sign-up/*` - Sign up flow  
- `/pricing` - Pricing page
- `/features` - Features page
- `/contact` - Contact page
- `/api/webhooks/*` - Webhook endpoints

### Protected Routes (Require Authentication)
- `/dashboard` - Main dashboard
- `/onboarding` - Onboarding flow
- `/bookings` - Bookings management
- `/clients` - Client management
- `/settings` - User settings
- All other routes not listed as public

## Key Principles

### 1. Let Clerk Handle Authentication
- Don't implement custom redirect logic in middleware
- Use Clerk's built-in redirect URLs
- Trust Clerk's session management

### 2. Single Source of Truth
- Middleware handles route protection only
- Dashboard handles business logic (onboarding status)
- No duplicate auth checks

### 3. Avoid Redirect Loops
- Never redirect from middleware AND page components
- Use either server-side OR client-side redirects, not both
- Keep redirect logic simple and predictable

### 4. User Experience First
- Show loading states during auth checks
- Provide clear navigation paths
- Handle edge cases gracefully

## Environment Variables Required

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
```

## Troubleshooting

### Redirect Loop
**Symptom**: User bounces between sign-in and another page
**Solution**: Check for conflicting redirect logic in:
- Middleware
- Page components
- Clerk configuration

### Authentication Not Working
**Symptom**: Users can't access protected routes
**Solution**: 
1. Verify Clerk keys are correct
2. Check JWT template is configured in Clerk Dashboard
3. Ensure Convex auth.config.ts has correct domain

### Onboarding Issues
**Symptom**: Users stuck in onboarding or skip it
**Solution**: Check dashboard's `useEffect` for onboarding status logic

## Security Considerations

1. **JWT Security**: Tokens are managed by Clerk with short expiration
2. **HTTPS Only**: Always use HTTPS in production
3. **Environment Variables**: Never commit keys to version control
4. **CORS**: Webhook endpoints should validate Clerk signatures
5. **Rate Limiting**: Implement rate limiting on API routes

## Testing Checklist

- [ ] New user can sign up
- [ ] New user is redirected to onboarding
- [ ] Returning user can sign in
- [ ] Authenticated user can't access auth pages
- [ ] Unauthenticated user can't access protected pages
- [ ] Sign out works correctly
- [ ] Session persists across page refreshes
- [ ] No redirect loops occur