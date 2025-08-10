/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

// Placeholder implementation until Convex generates the real file
import * as users from "../users"
import * as auth from "../auth"

export const api = {
  auth: {
    signIn: auth.signIn,
    signOut: auth.signOut,
    store: auth.store,
  },
  users: {
    createInitialSalonRecord: users.createInitialSalonRecord,
    checkOnboardingStatus: users.checkOnboardingStatus,
    completeOnboarding: users.completeOnboarding,
    getCurrentUser: users.getCurrentUser,
    viewer: users.viewer,
  }
}

export const internal = {}