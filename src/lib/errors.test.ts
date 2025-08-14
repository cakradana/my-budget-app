import { describe, expect, it, vi } from "vitest";

import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  handleError,
  isOperationalError,
  logError,
} from "./errors";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should create an AppError with default values", () => {
      const error = new AppError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.timestamp).toBeDefined();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it("should create an AppError with custom values", () => {
      const error = new AppError("Custom error", 400, false);

      expect(error.message).toBe("Custom error");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
    });
  });

  describe("ValidationError", () => {
    it("should create a ValidationError", () => {
      const error = new ValidationError("Invalid input");

      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(AppError);
    });

    it("should include field information", () => {
      const error = new ValidationError("Invalid email", "email");

      expect(error.field).toBe("email");
    });
  });

  describe("AuthenticationError", () => {
    it("should create an AuthenticationError with default message", () => {
      const error = new AuthenticationError();

      expect(error.message).toBe("Authentication failed");
      expect(error.statusCode).toBe(401);
      expect(error).toBeInstanceOf(AuthenticationError);
    });

    it("should create an AuthenticationError with custom message", () => {
      const error = new AuthenticationError("Invalid token");

      expect(error.message).toBe("Invalid token");
    });
  });

  describe("AuthorizationError", () => {
    it("should create an AuthorizationError", () => {
      const error = new AuthorizationError();

      expect(error.message).toBe("Access denied");
      expect(error.statusCode).toBe(403);
      expect(error).toBeInstanceOf(AuthorizationError);
    });
  });

  describe("NotFoundError", () => {
    it("should create a NotFoundError without resource", () => {
      const error = new NotFoundError();

      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
      expect(error.resource).toBeUndefined();
    });

    it("should create a NotFoundError with resource", () => {
      const error = new NotFoundError("User");

      expect(error.message).toBe("User not found");
      expect(error.resource).toBe("User");
    });
  });

  describe("ConflictError", () => {
    it("should create a ConflictError", () => {
      const error = new ConflictError("Email already exists");

      expect(error.message).toBe("Email already exists");
      expect(error.statusCode).toBe(409);
    });
  });

  describe("RateLimitError", () => {
    it("should create a RateLimitError with default message", () => {
      const error = new RateLimitError();

      expect(error.message).toBe("Too many requests");
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBeUndefined();
    });

    it("should include retry after information", () => {
      const error = new RateLimitError("Rate limit exceeded", 60);

      expect(error.message).toBe("Rate limit exceeded");
      expect(error.retryAfter).toBe(60);
    });
  });

  describe("DatabaseError", () => {
    it("should create a DatabaseError", () => {
      const error = new DatabaseError();

      expect(error.message).toBe("Database operation failed");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });
  });

  describe("ExternalServiceError", () => {
    it("should create an ExternalServiceError", () => {
      const error = new ExternalServiceError("PaymentAPI");

      expect(error.message).toBe("External service PaymentAPI failed");
      expect(error.statusCode).toBe(502);
      expect(error.service).toBe("PaymentAPI");
      expect(error.isOperational).toBe(false);
    });

    it("should accept custom message", () => {
      const error = new ExternalServiceError(
        "PaymentAPI",
        "Connection timeout"
      );

      expect(error.message).toBe("Connection timeout");
    });
  });
});

describe("Error Utilities", () => {
  describe("isOperationalError", () => {
    it("should return true for operational errors", () => {
      const error = new AppError("Test", 400, true);
      expect(isOperationalError(error)).toBe(true);
    });

    it("should return false for non-operational errors", () => {
      const error = new AppError("Test", 500, false);
      expect(isOperationalError(error)).toBe(false);
    });

    it("should return false for non-AppError instances", () => {
      const error = new Error("Regular error");
      expect(isOperationalError(error)).toBe(false);
    });

    it("should return false for non-error values", () => {
      expect(isOperationalError("string")).toBe(false);
      expect(isOperationalError(null)).toBe(false);
      expect(isOperationalError(undefined)).toBe(false);
    });
  });

  describe("handleError", () => {
    it("should handle AppError instances", () => {
      const error = new ValidationError("Invalid input", "email");
      const result = handleError(error);

      expect(result.success).toBe(false);
      expect(result.error.message).toBe("Invalid input");
      expect(result.error.statusCode).toBe(400);
      expect(result.error.field).toBe("email");
    });

    it("should handle RateLimitError with retryAfter", () => {
      const error = new RateLimitError("Too many requests", 60);
      const result = handleError(error);

      expect(result.error.retryAfter).toBe(60);
    });

    it("should handle ZodError", () => {
      const zodError = { name: "ZodError" };
      const result = handleError(zodError);

      expect(result.error.message).toBe("Validation failed");
      expect(result.error.statusCode).toBe(400);
    });

    it("should handle generic JavaScript errors", () => {
      const originalEnv = process.env.NODE_ENV;

      // Test in development
      vi.stubEnv("NODE_ENV", "development");
      const error = new Error("Generic error");
      const result = handleError(error);

      expect(result.error.message).toBe("Generic error");
      expect(result.error.statusCode).toBe(500);

      // Test in production
      vi.stubEnv("NODE_ENV", "production");
      const prodResult = handleError(error);

      expect(prodResult.error.message).toBe("Internal server error");

      vi.stubEnv("NODE_ENV", originalEnv || "test");
    });

    it("should handle unknown errors", () => {
      const result = handleError("Unknown error string");

      expect(result.error.message).toBe("An unexpected error occurred");
      expect(result.error.statusCode).toBe(500);
    });
  });

  describe("logError", () => {
    it("should log errors in development", () => {
      const originalEnv = process.env.NODE_ENV;
      vi.stubEnv("NODE_ENV", "development");

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Test error");
      const context = { userId: "123" };

      logError(error, context);

      expect(consoleSpy).toHaveBeenCalledWith("Error:", error);
      expect(consoleSpy).toHaveBeenCalledWith("Context:", context);

      consoleSpy.mockRestore();
      vi.stubEnv("NODE_ENV", originalEnv || "test");
    });

    it("should not log in production (placeholder for production logging)", () => {
      const originalEnv = process.env.NODE_ENV;
      vi.stubEnv("NODE_ENV", "production");

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Test error");

      logError(error);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      vi.stubEnv("NODE_ENV", originalEnv || "test");
    });
  });
});
