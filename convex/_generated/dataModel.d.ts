/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { Document, TableNames } from "convex/server"

/**
 * The names of all of your Convex tables.
 */
export type TableNames = "users" | "salons" | "pricingConfigs"

/**
 * The type of a document stored in Convex.
 */
export type Doc<TableName extends TableNames> = Document<TableName>

/**
 * An identifier for a document in Convex.
 *
 * Documents can be loaded using `db.get(id)` in query and mutation functions.
 */
export type Id<TableName extends TableNames = TableNames> = string & { __tableName: TableName }

/**
 * The `users` table document type.
 */
export interface User {
  _id: Id<"users">
  _creationTime: number
  clerkId: string
  salonId: Id<"salons">
  onboardingComplete: boolean
  createdAt: number
  updatedAt: number
}

/**
 * The `salons` table document type.
 */
export interface Salon {
  _id: Id<"salons">
  _creationTime: number
  name: string
  address?: string
  phone?: string
  email: string
  createdAt: number
  updatedAt: number
}

/**
 * The `pricingConfigs` table document type.
 */
export interface PricingConfig {
  _id: Id<"pricingConfigs">
  _creationTime: number
  salonId: Id<"salons">
  serviceName: string
  basePrice: number
  duration: number
  category: string
  description?: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

/**
 * The data model for your Convex project.
 */
export type DataModel = {
  users: User
  salons: Salon
  pricingConfigs: PricingConfig
}