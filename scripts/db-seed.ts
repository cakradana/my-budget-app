import bcrypt from "bcryptjs";
import "dotenv/config";
import { eq } from "drizzle-orm";

import { db } from "../src/lib/db/index";
import { budgets, categories, transactions, users } from "../src/lib/db/schema";

async function seed() {
  console.log("🌱 Starting seed process...");

  try {
    // Check if demo user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "demo@example.com"))
      .limit(1);

    let user;
    if (existingUser.length > 0) {
      user = existingUser[0];
      console.log("ℹ️ Demo user already exists, using existing user");
    } else {
      // Create demo user
      const hashedPassword = await bcrypt.hash("demo123", 10);
      [user] = await db
        .insert(users)
        .values({
          name: "Demo User",
          email: "demo@example.com",
          passwordHash: hashedPassword,
        })
        .returning();
      console.log("✅ Created demo user");
    }

    // Check if user-specific categories exist
    const existingUserCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, user.id));

    // Skip creating global categories - we only want user-specific ones
    // This section is removed to prevent duplicate categories

    // Create user-specific categories only if they don't exist
    let userCategories = existingUserCategories;

    if (userCategories.length === 0) {
      userCategories = await db
        .insert(categories)
        .values([
          { name: "Makan", type: "weekly", userId: user.id },
          { name: "Transportasi", type: "weekly", userId: user.id },
          { name: "Kost/Sewa", type: "monthly", userId: user.id },
          { name: "Keluarga", type: "monthly", userId: user.id },
          { name: "Tabungan", type: "monthly", userId: user.id },
          { name: "Hiburan", type: "other", userId: user.id },
          { name: "Gaji", type: "monthly", userId: user.id },
        ])
        .returning();
      console.log("✅ Created user categories");
    } else {
      console.log("ℹ️ User categories already exist, using existing");
    }

    // Find categories by name for easier reference
    const makanCat = userCategories.find(c => c.name === "Makan")!;
    const transportasiCat = userCategories.find(
      c => c.name === "Transportasi"
    )!;
    const kostCat = userCategories.find(c => c.name === "Kost/Sewa")!;
    const keluargaCat = userCategories.find(c => c.name === "Keluarga")!;
    const tabunganCat = userCategories.find(c => c.name === "Tabungan")!;
    const hiburanCat = userCategories.find(c => c.name === "Hiburan")!;
    const gajiCat = userCategories.find(c => c.name === "Gaji")!;

    // Check if transactions already exist for this user
    const existingTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, user.id))
      .limit(1);

    if (existingTransactions.length > 0) {
      console.log(
        "ℹ️ Transactions already exist for user, skipping sample data"
      );
      return;
    }

    // Create sample transactions for current month (August 2025)
    // Pattern: Monthly income (7M at beginning of month)
    const sampleTransactions = [
      // Monthly income
      {
        userId: user.id,
        categoryId: gajiCat.id,
        amount: 12000000,
        date: "2025-08-01",
        note: "Gaji bulan Agustus",
      },

      // Monthly fixed expenses
      {
        userId: user.id,
        categoryId: kostCat.id,
        amount: -1500000,
        date: "2025-08-01",
        note: "Sewa kost bulan Agustus",
      },
      {
        userId: user.id,
        categoryId: keluargaCat.id,
        amount: -700000,
        date: "2025-08-01",
        note: "Kiriman untuk keluarga",
      },
      {
        userId: user.id,
        categoryId: tabunganCat.id,
        amount: -1000000,
        date: "2025-08-01",
        note: "Tabungan rutin bulanan",
      },

      // Weekly expenses spread throughout the month
      // Week 1 (Aug 1-7)
      {
        userId: user.id,
        categoryId: makanCat.id,
        amount: -120000,
        date: "2025-08-02",
        note: "Belanja groceries minggu 1",
      },
      {
        userId: user.id,
        categoryId: transportasiCat.id,
        amount: -50000,
        date: "2025-08-03",
        note: "Ongkos transportasi minggu 1",
      },
      {
        userId: user.id,
        categoryId: makanCat.id,
        amount: -85000,
        date: "2025-08-05",
        note: "Makan di luar",
      },

      // Week 2 (Aug 8-14)
      {
        userId: user.id,
        categoryId: makanCat.id,
        amount: -110000,
        date: "2025-08-09",
        note: "Belanja groceries minggu 2",
      },
      {
        userId: user.id,
        categoryId: transportasiCat.id,
        amount: -45000,
        date: "2025-08-10",
        note: "Ongkos transportasi minggu 2",
      },
      {
        userId: user.id,
        categoryId: hiburanCat.id,
        amount: -150000,
        date: "2025-08-11",
        note: "Nonton bioskop dan makan",
      },
      {
        userId: user.id,
        categoryId: makanCat.id,
        amount: -75000,
        date: "2025-08-13",
        note: "Makan dengan teman",
      },

      // Current week (partial)
      {
        userId: user.id,
        categoryId: makanCat.id,
        amount: -95000,
        date: "2025-08-14",
        note: "Belanja groceries hari ini",
      },
    ];

    await db.insert(transactions).values(sampleTransactions);
    console.log("✅ Created sample transactions");

    // Check if budgets already exist for this user
    const existingBudgets = await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, user.id))
      .limit(1);

    if (existingBudgets.length > 0) {
      console.log("ℹ️ Budgets already exist for user, skipping");
      return;
    }

    // Create budgets
    const sampleBudgets = [
      {
        userId: user.id,
        categoryId: makanCat.id,
        amount: 600000,
        period: "month" as const,
      },
      {
        userId: user.id,
        categoryId: transportasiCat.id,
        amount: 200000,
        period: "month" as const,
      },
      {
        userId: user.id,
        categoryId: kostCat.id,
        amount: 1500000,
        period: "month" as const,
      },
      {
        userId: user.id,
        categoryId: keluargaCat.id,
        amount: 700000,
        period: "month" as const,
      },
      {
        userId: user.id,
        categoryId: tabunganCat.id,
        amount: 1000000,
        period: "month" as const,
      },
      {
        userId: user.id,
        categoryId: hiburanCat.id,
        amount: 300000,
        period: "month" as const,
      },
    ];

    await db.insert(budgets).values(sampleBudgets);
    console.log("✅ Created sample budgets");

    console.log("🎉 Seed completed successfully!");
    console.log("📧 Demo user: demo@example.com");
    console.log("🔑 Password: demo123");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seed };
