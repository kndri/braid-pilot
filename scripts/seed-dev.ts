#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}

async function seedDatabase() {
  const client = new ConvexHttpClient(CONVEX_URL as string);
  
  console.log("🌱 Starting database seeding...");
  console.log("📍 Convex URL:", CONVEX_URL);
  
  try {
    // You can change this email to match your test user
    const testEmail = process.env.SEED_USER_EMAIL || "test@elitebraids.com";
    
    const result = await client.mutation(api.seed.seedDevelopmentData, {
      userEmail: testEmail,
      clerkId: process.env.SEED_CLERK_ID, // Optional: provide if you have a specific Clerk ID
    });
    
    console.log("✅ Seeding completed successfully!");
    console.log("📊 Stats:", result.stats);
    console.log("\n🎯 You can now log in with:", testEmail);
    console.log("🔗 Visit http://localhost:3000/dashboard to see the seeded data");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();