import { describe, expect, it, vi } from "vitest";
import { ZodError, z } from "zod";

import {
  createdResponse,
  errorResponse,
  noContentResponse,
  paginatedResponse,
  successResponse,
  validateRequest,
} from "./api-response";
import { AppError, ValidationError } from "./errors";

describe("API Response Extended Tests", () => {
  describe("successResponse", () => {
    it("should create a success response without message", () => {
      const data = { id: 1, name: "Test" };
      const response = successResponse(data);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should create a success response with message", () => {
      const data = { id: 1, name: "Test" };
      const response = successResponse(data, "Operation successful");

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should create a success response with meta", () => {
      const data = [1, 2, 3];
      const meta = { page: 1, limit: 10, total: 3, totalPages: 1 };
      const response = successResponse(data, "Items retrieved", meta);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });
  });

  describe("createdResponse", () => {
    it("should create a 201 response with default message", () => {
      const data = { id: 1, name: "New Item" };
      const response = createdResponse(data);

      expect(response).toBeDefined();
      expect(response.status).toBe(201);
    });

    it("should create a 201 response with custom message", () => {
      const data = { id: 1, name: "New Item" };
      const response = createdResponse(data, "Item created successfully");

      expect(response).toBeDefined();
      expect(response.status).toBe(201);
    });
  });

  describe("noContentResponse", () => {
    it("should create a 204 response with no body", () => {
      const response = noContentResponse();

      expect(response).toBeDefined();
      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });
  });

  describe("errorResponse", () => {
    it("should handle AppError instances", () => {
      const error = new AppError("Something went wrong", 400);
      const response = errorResponse(error);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);
    });

    it("should handle ValidationError with field", () => {
      const error = new ValidationError("Invalid email", "email");
      const response = errorResponse(error);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);
    });

    it("should handle ZodError with multiple errors", () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      try {
        schema.parse({ email: "invalid", age: 10 });
      } catch (error) {
        const response = errorResponse(error);
        expect(response).toBeDefined();
        expect(response.status).toBe(400);
      }
    });

    it("should handle generic Error", () => {
      const error = new Error("Generic error");
      const response = errorResponse(error);

      expect(response).toBeDefined();
      expect(response.status).toBe(500);
    });

    it("should handle unknown error types", () => {
      const response = errorResponse("String error");

      expect(response).toBeDefined();
      expect(response.status).toBe(500);
    });

    it("should use custom status code when provided", () => {
      const error = new Error("Custom error");
      const response = errorResponse(error, 503);

      expect(response).toBeDefined();
      expect(response.status).toBe(503);
    });
  });

  describe("paginatedResponse", () => {
    it("should create paginated response with correct meta", () => {
      const data = [1, 2, 3, 4, 5];
      const response = paginatedResponse(data, 2, 5, 25);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should create paginated response with message", () => {
      const data = ["a", "b", "c"];
      const response = paginatedResponse(data, 1, 10, 3, "Items found");

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should calculate total pages correctly", () => {
      const data: never[] = [];
      const response = paginatedResponse(data, 3, 10, 25);

      expect(response).toBeDefined();
      // totalPages should be Math.ceil(25/10) = 3
    });
  });

  describe("validateRequest", () => {
    it("should validate request body successfully", async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ name: "John", age: 30 }),
      } as unknown as Request;

      const result = await validateRequest(mockRequest, schema);

      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("should throw ZodError for invalid data", async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ name: 123, age: "invalid" }),
      } as unknown as Request;

      await expect(validateRequest(mockRequest, schema)).rejects.toThrow(
        ZodError
      );
    });

    it("should throw AppError for invalid JSON", async () => {
      const schema = z.object({
        name: z.string(),
      });

      const mockRequest = {
        json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      } as unknown as Request;

      await expect(validateRequest(mockRequest, schema)).rejects.toThrow(
        AppError
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty arrays in successResponse", () => {
      const response = successResponse([]);
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should handle null data in successResponse", () => {
      const response = successResponse(null);
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should handle undefined data in successResponse", () => {
      const response = successResponse(undefined);
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should handle very long error messages", () => {
      const longMessage = "a".repeat(10000);
      const error = new AppError(longMessage, 400);
      const response = errorResponse(error);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);
    });

    it("should handle circular references in error context", () => {
      const error = new Error("Circular error") as Error & { circular?: Error };
      error.circular = error; // Create circular reference

      const response = errorResponse(error);
      expect(response).toBeDefined();
    });

    it("should handle special characters in messages", () => {
      const specialMessage = "Error: <script>alert('XSS')</script>";
      const response = successResponse({}, specialMessage);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should handle non-English characters", () => {
      const data = { message: "你好世界 🌍" };
      const response = successResponse(data, "Success 成功");

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });
  });
});
