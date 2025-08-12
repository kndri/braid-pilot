# Understanding "Viewer" and User Synchronization

## What is "Viewer"?

**Viewer** is a Convex query that returns the currently authenticated user's data from the database. The term comes from GraphQL conventions where "viewer" means "the person currently viewing/using the application."

### Why "viewer" instead of "currentUser"?
- **Convention**: Common in GraphQL/modern apps
- **Clarity**: Distinguishes between "any user" and "the current user"
- **Context**: Always means "who is viewing this right now"

## The Two-Database Problem

Your app uses TWO separate systems:

1. **Clerk** - Handles authentication (login/logout)
   - Stores: email, password, authentication tokens
   - Manages: sessions, security, OAuth

2. **Convex** - Handles application data
   - Stores: user profiles, salon data, bookings
   - Manages: business logic, relationships

## The Synchronization Issue

When you sign up:
1. ✅ Clerk creates your authentication account
2. ✅ You're logged in (Clerk knows who you are)
3. ❌ But Convex database has no record of you
4. ❌ `viewer` query returns `null` (you don't exist in Convex)
5. ❌ Onboarding page shows "Loading..." forever

## The Solution: UserSync Component

We created a `UserSync` component that:
1. Runs automatically when you log in
2. Checks if you exist in Convex
3. Creates or updates your user record
4. Ensures Clerk and Convex stay in sync

```typescript
// This runs on every page load for authenticated users
useEffect(() => {
  if (user) {
    syncUser({
      clerkId: user.id,        // Clerk's ID
      email: user.email,        // Your email
      name: user.name,          // Your name
    })
  }
}, [user])
```

## Data Flow

### Sign Up Flow:
```
1. User signs up on /sign-up
   ↓
2. Clerk creates auth account
   ↓
3. UserSync component detects new user
   ↓
4. Creates user record in Convex
   ↓
5. Viewer query now returns user data
   ↓
6. Onboarding page loads properly
```

### Sign In Flow:
```
1. User signs in on /sign-in
   ↓
2. Clerk validates credentials
   ↓
3. UserSync updates last login
   ↓
4. Viewer query returns existing user
   ↓
5. Dashboard checks onboarding status
   ↓
6. Routes to dashboard or onboarding
```

## Understanding the States

### `viewer === undefined`
- **Meaning**: Query is still loading
- **Action**: Show loading spinner
- **Expected**: This is normal for 1-2 seconds

### `viewer === null`
- **Meaning**: Query completed but user doesn't exist in Convex
- **Action**: UserSync should create the user
- **Problem**: If this persists, sync failed

### `viewer === {user object}`
- **Meaning**: User exists and is loaded
- **Action**: Proceed with normal app flow
- **Expected**: This is the success state

## Common Issues and Solutions

### Issue: Stuck on "Loading..."
**Cause**: User not synced to Convex
**Solution**: UserSync component now handles this automatically

### Issue: "Account Setup Required" error
**Cause**: Sync failed or JWT template misconfigured
**Solutions**:
1. Refresh the page (triggers UserSync)
2. Check Clerk JWT template is configured
3. Sign out and back in

### Issue: User exists but viewer is null
**Cause**: ClerkId mismatch
**Solution**: syncUser mutation handles both email and clerkId matching

## Best Practices

1. **Always check for undefined vs null**:
   ```typescript
   if (viewer === undefined) {
     // Still loading
   } else if (viewer === null) {
     // User doesn't exist
   } else {
     // User exists
   }
   ```

2. **Use UserSync at the root level**:
   - Placed in layout.tsx
   - Runs on every page
   - Ensures consistency

3. **Handle edge cases**:
   - User changes email in Clerk
   - User deleted from one system
   - Network failures during sync

## Security Considerations

1. **Never trust client-side user data alone**
   - Always verify with Convex queries
   - UserSync only syncs non-sensitive data

2. **ClerkId is the source of truth**
   - Email can change
   - ClerkId is permanent
   - Always match on ClerkId first

3. **Permissions are in Convex**
   - Clerk: "Who are you?"
   - Convex: "What can you do?"

## Debugging Tips

### Check if user exists in Convex:
1. Open Convex Dashboard
2. Go to Data tab
3. Look in "users" table
4. Find your clerkId

### Check Clerk authentication:
```javascript
// In browser console
console.log(await window.Clerk.user)
```

### Force re-sync:
1. Sign out completely
2. Clear browser cache
3. Sign back in
4. UserSync will create fresh record

## Summary

- **Viewer** = Current logged-in user's data from Convex
- **UserSync** = Keeps Clerk and Convex in sync
- **Two databases** = Clerk (auth) + Convex (data)
- **Solution** = Automatic synchronization on login

The system is now set up to automatically handle user synchronization, preventing the "stuck on loading" issue you experienced.