import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Create a singleton instance for database connection
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Connection configuration with pooling
const client =
  globalForDb.conn ??
  postgres(connectionString, {
    // Connection pool settings
    max: process.env.NODE_ENV === "production" ? 10 : 5, // Maximum connections
    idle_timeout: process.env.NODE_ENV === "production" ? 30 : 60, // Seconds
    connect_timeout: 10, // Seconds

    // SSL configuration for production
    ssl: process.env.NODE_ENV === "production" ? "require" : false,

    // Disable prefetch for transaction pool mode
    prepare: false,

    // Connection lifecycle hooks
    onnotice:
      process.env.NODE_ENV === "development"
        ? notice => console.log("Database notice:", notice)
        : undefined,

    // Transform configuration
    transform: {
      undefined: null, // Transform undefined to null
    },
  });

// Prevent multiple connections in development
if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

// Create drizzle instance with schema
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

// Export types
export type DB = typeof db;

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown function
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await client.end();
    console.log("Database connection closed successfully");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
}

// Handle process termination
if (process.env.NODE_ENV === "production") {
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, closing database connection...");
    await closeDatabaseConnection();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received, closing database connection...");
    await closeDatabaseConnection();
    process.exit(0);
  });
}
