import "dotenv/config";

import { db } from "./index";
import { budgets, categories, transactions, users } from "./schema";

async function clearAllData() {
  console.log("🧹 Starting complete database cleanup...");

  try {
    // Delete in order (to respect foreign key constraints)
    console.log("🗑️ Deleting all budgets...");
    await db.delete(budgets);

    console.log("🗑️ Deleting all transactions...");
    await db.delete(transactions);

    console.log("🗑️ Deleting all categories...");
    await db.delete(categories);

    console.log("🗑️ Deleting all users...");
    await db.delete(users);

    console.log("✅ All data cleared successfully!");
  } catch (error) {
    console.error("❌ Clear failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

clearAllData();
