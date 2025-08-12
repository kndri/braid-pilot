# 🚨 URGENT: Clerk JWT Template Setup Required

## The Error
You're seeing: **"Error: No JWT template exists with name: convex"**

This error occurs because Convex needs a specific JWT template configuration in your Clerk Dashboard to authenticate users.

## How to Fix (5 minutes)

### Step 1: Access Clerk Dashboard
1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign in with your account
3. Select your application (should be "worthy-grackle-1" based on your keys)

### Step 2: Create JWT Template
1. In the left sidebar, navigate to **JWT Templates**
2. Click **"+ New template"** button
3. Configure the template with these EXACT settings:

   **Template Name:** `convex` (MUST be exactly "convex" in lowercase)
   
   **Claims:** Add the following custom claims:
   ```json
   {
     "aud": "convex"
   }
   ```

   **Lifetime:** Leave as default (usually 60 seconds)
   
   **Allowed Clock Skew:** Leave as default

4. Click **"Save"** to create the template

### Step 3: Verify Configuration
1. After saving, you should see "convex" in your JWT templates list
2. The template should show status as "Active"

### Step 4: Test the Application
1. Go back to your application at http://localhost:3001
2. Try signing up or signing in
3. The JWT error should now be resolved

## Alternative: Quick Test Without JWT Template

If you want to test the app quickly without setting up the JWT template, you can temporarily disable Convex authentication:

1. Update `/components/Providers.tsx` to use basic ConvexProvider:
```typescript
import { ConvexProvider } from "convex/react";
// Instead of ConvexProviderWithClerk
```

However, this will disable user-specific features that require authentication.

## Why This Is Required

- Clerk needs to generate JWTs that Convex can verify
- The JWT template tells Clerk how to format tokens for Convex
- The "aud" (audience) claim identifies tokens meant for Convex
- This ensures secure communication between Clerk and Convex

## Still Having Issues?

If the error persists after creating the template:

1. **Check the template name:** It MUST be exactly "convex" (lowercase)
2. **Check your Clerk instance:** Make sure you're in the right Clerk application
3. **Clear browser cache:** Sometimes cached tokens cause issues
4. **Check console for other errors:** There might be additional configuration needed

## Need More Help?

- [Clerk JWT Templates Documentation](https://clerk.com/docs/backend-requests/making/jwt-templates)
- [Convex + Clerk Integration Guide](https://docs.convex.dev/auth/clerk)
- [Clerk Support](https://clerk.com/support)