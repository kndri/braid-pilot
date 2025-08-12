# Clerk Authentication Setup Guide

## Migration Completed ✅

The authentication system has been successfully migrated from Convex Auth to Clerk. The application is now using Clerk for all authentication needs.

## Required Clerk Dashboard Configuration

### 1. JWT Template Configuration
To enable Convex to authenticate users from Clerk, you need to configure a JWT template:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **JWT Templates** in the sidebar
3. Create a new template called "convex"
4. Configure the template with these settings:
   - **Name**: convex
   - **Claims**:
   ```json
   {
     "aud": "convex"
   }
   ```
5. Save the template

### 2. Environment Variables Verification
Ensure these are set in your Clerk Dashboard:
- **Frontend API**: `pk_test_d29ydGh5LWdyYWNrbGUtMS5jbGVyay5hY2NvdW50cy5kZXYk`
- **API Key**: `sk_test_iQgUASZG2X0JViBKqgVEWlZmskOiVGqG0IA3XyscGK`

### 3. Webhook Configuration (Optional)
To sync user data between Clerk and Convex:

1. In Clerk Dashboard, go to **Webhooks**
2. Create a new endpoint:
   - **URL**: `https://your-domain.com/api/webhooks/clerk`
   - **Events**: Select user.created, user.updated, user.deleted
3. Copy the webhook secret and add to your `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   ```

## Current Application URLs

- **Sign In**: `/sign-in`
- **Sign Up**: `/sign-up`
- **After Sign In**: `/dashboard`
- **After Sign Up**: `/onboarding`

## Testing the Authentication Flow

1. **Sign Up Flow**:
   - Visit `/sign-up`
   - Create a new account
   - Should redirect to `/onboarding` after successful signup
   - Complete onboarding with salon details
   - Should redirect to `/dashboard`

2. **Sign In Flow**:
   - Visit `/sign-in`
   - Login with your credentials
   - Should redirect to `/dashboard`

3. **Protected Routes**:
   - Dashboard at `/dashboard` requires authentication
   - Onboarding at `/onboarding` requires authentication
   - Public pages (/, /pricing, /features, /contact) are accessible without auth

## Schema Changes

The Convex schema has been updated to support Clerk:
- Users table now has `clerkId` field for Clerk user identification
- All user-related functions use Clerk identity for authentication
- Existing user data has been preserved with optional fields for migration

## Troubleshooting

If you encounter issues:

1. **"JWT template not found" error**: 
   - Ensure you've created the "convex" JWT template in Clerk Dashboard

2. **Authentication not working**:
   - Verify your Clerk publishable key and secret key are correct
   - Check that the domain in `convex/auth.config.ts` matches your Clerk instance

3. **User data not syncing**:
   - Set up the webhook configuration as described above
   - Check webhook logs in Clerk Dashboard for any errors

## Next Steps

1. Configure JWT template in Clerk Dashboard (required)
2. Test the complete authentication flow
3. Set up webhooks for user data sync (optional but recommended)
4. Consider implementing:
   - Social login providers (Google, GitHub, etc.)
   - Multi-factor authentication
   - Custom email templates in Clerk

## Support

- [Clerk Documentation](https://clerk.com/docs)
- [Convex + Clerk Integration Guide](https://docs.convex.dev/auth/clerk)