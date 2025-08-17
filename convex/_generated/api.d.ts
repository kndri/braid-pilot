/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aiAgent from "../aiAgent.js";
import type * as booking from "../booking.js";
import type * as braiderAssignment from "../braiderAssignment.js";
import type * as braiderPayouts from "../braiderPayouts.js";
import type * as braiders from "../braiders.js";
import type * as clients from "../clients.js";
import type * as crm from "../crm.js";
import type * as dashboard from "../dashboard.js";
import type * as emergencyCapacity from "../emergencyCapacity.js";
import type * as migrations from "../migrations.js";
import type * as notificationSystem from "../notificationSystem.js";
import type * as notifications from "../notifications.js";
import type * as pricing from "../pricing.js";
import type * as quote from "../quote.js";
import type * as quoteTracking from "../quoteTracking.js";
import type * as reputation from "../reputation.js";
import type * as reputationSMS from "../reputationSMS.js";
import type * as salons from "../salons.js";
import type * as seed from "../seed.js";
import type * as testing from "../testing.js";
import type * as users from "../users.js";
import type * as vapiConfiguration from "../vapiConfiguration.js";
import type * as vapiPromptGenerator from "../vapiPromptGenerator.js";
import type * as vapiSyncManager from "../vapiSyncManager.js";
import type * as vapiWebhook from "../vapiWebhook.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiAgent: typeof aiAgent;
  booking: typeof booking;
  braiderAssignment: typeof braiderAssignment;
  braiderPayouts: typeof braiderPayouts;
  braiders: typeof braiders;
  clients: typeof clients;
  crm: typeof crm;
  dashboard: typeof dashboard;
  emergencyCapacity: typeof emergencyCapacity;
  migrations: typeof migrations;
  notificationSystem: typeof notificationSystem;
  notifications: typeof notifications;
  pricing: typeof pricing;
  quote: typeof quote;
  quoteTracking: typeof quoteTracking;
  reputation: typeof reputation;
  reputationSMS: typeof reputationSMS;
  salons: typeof salons;
  seed: typeof seed;
  testing: typeof testing;
  users: typeof users;
  vapiConfiguration: typeof vapiConfiguration;
  vapiPromptGenerator: typeof vapiPromptGenerator;
  vapiSyncManager: typeof vapiSyncManager;
  vapiWebhook: typeof vapiWebhook;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
