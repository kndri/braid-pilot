/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as users from "../users"

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server"

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  users: typeof users
}>
export type Mounts = {
  users: {
    createInitialSalonRecord: FunctionReference<"mutation", "public", { salonData: { name: string; email: string; address?: string; phone?: string } }, any>
    checkOnboardingStatus: FunctionReference<"query", "public", {}, any>
    completeOnboarding: FunctionReference<"mutation", "public", {}, any>
    getCurrentUser: FunctionReference<"query", "public", {}, any>
  }
}

// For now, export a placeholder until Convex generates the real file
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>