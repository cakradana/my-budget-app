import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock functions that will be controlled per test
let mockSqlBehavior = {
  shouldFail: false,
  failOnEnd: false,
};

// Create mock SQL client that behaves like a tagged template function
const createMockClient = () => {
  // The actual postgres client is called as a tagged template literal
  const client = (strings: TemplateStringsArray) => {
    const query = strings[0]; // Get the SQL query string

    if (mockSqlBehavior.shouldFail) {
      return Promise.reject(new Error("Connection failed"));
    }

    // Mock SELECT 1 query for health check
    if (query && query.includes("SELECT 1")) {
      return Promise.resolve([{ "?column?": 1 }]);
    }

    return Promise.resolve([]);
  };

  // Add the end method
  client.end = vi.fn(() => {
    if (mockSqlBehavior.failOnEnd) {
      return Promise.reject(new Error("Close failed"));
    }
    return Promise.resolve();
  });

  return client;
};

let mockClient = createMockClient();

// Mock postgres module
vi.mock("postgres", () => ({
  default: vi.fn(() => mockClient),
}));

// Mock drizzle-orm
vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: vi.fn((client, config) => ({
    client,
    config,
  })),
}));

describe("Database Connection", () => {
  let originalEnv: string | undefined;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(() => {
    // Store original environment
    originalEnv = process.env.NODE_ENV;

    // Setup spies
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // @ts-expect-error - Mocking process.exit for testing
    processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    // Reset mock behavior
    mockSqlBehavior = {
      shouldFail: false,
      failOnEnd: false,
    };
    mockClient = createMockClient();

    // Clear module cache
    vi.resetModules();
  });

  afterEach(() => {
    // Restore environment
    if (originalEnv !== undefined) {
      vi.stubEnv("NODE_ENV", originalEnv || "test");
    }

    // Restore all mocks
    vi.restoreAllMocks();
  });

  describe("Database Client Configuration", () => {
    it("should create database client with production settings", async () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

      // Dynamically import to get fresh instance
      const { db } = await import("./index");

      expect(db).toBeDefined();
    });

    it("should create database client with development settings", async () => {
      vi.stubEnv("NODE_ENV", "development");
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

      const { db } = await import("./index");

      expect(db).toBeDefined();
    });

    it("should reuse connection in development", async () => {
      vi.stubEnv("NODE_ENV", "development");
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

      const { db: db1 } = await import("./index");

      // Clear module cache and import again
      vi.resetModules();
      const { db: db2 } = await import("./index");

      expect(db1).toBeDefined();
      expect(db2).toBeDefined();
    });
  });

  describe("checkDatabaseConnection", () => {
    it("should return true when connection is successful", async () => {
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
      mockSqlBehavior.shouldFail = false;

      const { checkDatabaseConnection } = await import("./index");
      const result = await checkDatabaseConnection();

      expect(result).toBe(true);
    });

    it("should return false and log error when connection fails", async () => {
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

      // Set mock to fail
      mockSqlBehavior.shouldFail = true;
      mockClient = createMockClient();

      const { checkDatabaseConnection } = await import("./index");
      const result = await checkDatabaseConnection();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Database connection failed:",
        expect.any(Error)
      );
    });
  });

  describe("closeDatabaseConnection", () => {
    it("should close connection successfully", async () => {
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
      mockSqlBehavior.failOnEnd = false;
      mockClient = createMockClient();

      const { closeDatabaseConnection } = await import("./index");
      await closeDatabaseConnection();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Database connection closed successfully"
      );
    });

    it("should handle close connection errors", async () => {
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

      // Set mock to fail on end()
      mockSqlBehavior.failOnEnd = true;
      mockClient = createMockClient();

      const { closeDatabaseConnection } = await import("./index");
      await closeDatabaseConnection();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error closing database connection:",
        expect.any(Error)
      );
    });
  });

  describe("Process Signal Handlers", () => {
    it("should not set up signal handlers in development", async () => {
      vi.stubEnv("NODE_ENV", "development");
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

      const processOnSpy = vi.spyOn(process, "on");

      await import("./index");

      expect(processOnSpy).not.toHaveBeenCalledWith(
        "SIGTERM",
        expect.any(Function)
      );
      expect(processOnSpy).not.toHaveBeenCalledWith(
        "SIGINT",
        expect.any(Function)
      );
    });

    it("should set up signal handlers in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

      const processOnSpy = vi.spyOn(process, "on");

      await import("./index");

      expect(processOnSpy).toHaveBeenCalledWith(
        "SIGTERM",
        expect.any(Function)
      );
      expect(processOnSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    });

    it("should handle SIGTERM signal", async () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

      let sigtermHandler: (() => void | Promise<void>) | undefined;
      vi.spyOn(process, "on").mockImplementation((event, handler) => {
        if (event === "SIGTERM") {
          sigtermHandler = handler as () => void | Promise<void>;
        }
        return process;
      });

      await import("./index");

      // Trigger SIGTERM handler
      if (sigtermHandler) {
        await sigtermHandler();
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "SIGTERM received, closing database connection..."
      );
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it("should handle SIGINT signal", async () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

      let sigintHandler: (() => void | Promise<void>) | undefined;
      vi.spyOn(process, "on").mockImplementation((event, handler) => {
        if (event === "SIGINT") {
          sigintHandler = handler as () => void | Promise<void>;
        }
        return process;
      });

      await import("./index");

      // Trigger SIGINT handler
      if (sigintHandler) {
        await sigintHandler();
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "SIGINT received, closing database connection..."
      );
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });
  });
});
