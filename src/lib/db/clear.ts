import "dotenv/config";
import { db } from "./index";
import { users, categories, transactions, budgets } from "./schema";
import { eq } from "drizzle-orm";

async function clearDemoData() {
  console.log("🧹 Starting demo data cleanup...");

  try {
    // Find demo user
    const demoUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "demo@example.com"))
      .limit(1);

    if (demoUser.length === 0) {
      console.log("ℹ️ No demo user found, nothing to clear");
      return;
    }

    const userId = demoUser[0].id;

    // Delete in order (to respect foreign key constraints)
    console.log("🗑️ Deleting user budgets...");
    await db.delete(budgets).where(eq(budgets.userId, userId));

    console.log("🗑️ Deleting user transactions...");
    await db.delete(transactions).where(eq(transactions.userId, userId));

    console.log("🗑️ Deleting user categories...");
    await db.delete(categories).where(eq(categories.userId, userId));

    console.log("🗑️ Deleting demo user...");
    await db.delete(users).where(eq(users.id, userId));

    console.log("✅ Demo data cleared successfully!");
  } catch (error) {
    console.error("❌ Clear failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

clearDemoData();
