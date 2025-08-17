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

async function cleanupDatabase() {
  const client = new ConvexHttpClient(CONVEX_URL);
  
  console.log("🧹 Starting database cleanup...");
  console.log("📍 Convex URL:", CONVEX_URL);
  
  const testEmail = process.env.SEED_USER_EMAIL || "test@elitebraids.com";
  
  // Confirm before cleanup
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise<string>((resolve) => {
    rl.question(`⚠️  This will delete all data for ${testEmail}. Continue? (y/N): `, resolve);
  });
  
  rl.close();
  
  if (answer.toLowerCase() !== 'y') {
    console.log("❌ Cleanup cancelled");
    process.exit(0);
  }
  
  try {
    const result = await client.mutation(api.seed.cleanupTestData, {
      userEmail: testEmail,
    });
    
    if (result.success) {
      console.log("✅ Cleanup completed successfully!");
      console.log("📊 Message:", result.message);
    } else {
      console.log("⚠️ ", result.message);
    }
    
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  }
}

// Run the cleanup function
cleanupDatabase();