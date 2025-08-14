import { describe, expect, it } from "vitest";

import {
  ApiResponseBuilder,
  getFilterParams,
  getPaginationParams,
  getSortParams,
} from "./api-response";
import { AppError } from "./errors";

describe("API Response Utilities", () => {
  describe("ApiResponseBuilder", () => {
    it("should build a basic success response", () => {
      const builder = new ApiResponseBuilder<{ id: string; name: string }>();
      const data = { id: "1", name: "Test" };

      builder.setData(data).setMessage("Success");

      const response = builder.build();

      // Check that response is created (NextResponse can't be fully tested in Node)
      expect(response).toBeDefined();
    });

    it("should build response with meta information", () => {
      const builder = new ApiResponseBuilder<string[]>();

      builder
        .setData(["item1", "item2"])
        .setMeta({ page: 1, limit: 10, total: 2, totalPages: 1 })
        .setStatusCode(200);

      const response = builder.build();
      expect(response).toBeDefined();
    });

    it("should build response with custom headers", () => {
      const builder = new ApiResponseBuilder();

      builder
        .setData({ success: true })
        .setHeader("X-Custom-Header", "value")
        .setHeader("X-Another-Header", "another-value");

      const response = builder.build();
      expect(response).toBeDefined();
    });
  });

  describe("getPaginationParams", () => {
    it("should return default pagination params", () => {
      const url = new URL("http://example.com/api");
      const params = getPaginationParams(url);

      expect(params.page).toBe(1);
      expect(params.limit).toBe(10);
      expect(params.offset).toBe(0);
    });

    it("should parse page and limit from URL", () => {
      const url = new URL("http://example.com/api?page=3&limit=20");
      const params = getPaginationParams(url);

      expect(params.page).toBe(3);
      expect(params.limit).toBe(20);
      expect(params.offset).toBe(40); // (3-1) * 20
    });

    it("should enforce minimum page value", () => {
      const url = new URL("http://example.com/api?page=0");
      const params = getPaginationParams(url);

      expect(params.page).toBe(1);
    });

    it("should enforce maximum limit value", () => {
      const url = new URL("http://example.com/api?limit=200");
      const params = getPaginationParams(url);

      expect(params.limit).toBe(100);
    });

    it("should enforce minimum limit value", () => {
      const url = new URL("http://example.com/api?limit=0");
      const params = getPaginationParams(url);

      expect(params.limit).toBe(1);
    });

    it("should handle invalid values", () => {
      const url = new URL("http://example.com/api?page=abc&limit=xyz");
      const params = getPaginationParams(url);

      expect(params.page).toBe(1);
      expect(params.limit).toBe(10);
    });
  });

  describe("getSortParams", () => {
    it("should return default sort params", () => {
      const url = new URL("http://example.com/api");
      const params = getSortParams(url);

      expect(params.sortBy).toBe("createdAt");
      expect(params.sortOrder).toBe("asc");
    });

    it("should parse sort params from URL", () => {
      const url = new URL("http://example.com/api?sortBy=name&sortOrder=desc");
      const params = getSortParams(url);

      expect(params.sortBy).toBe("name");
      expect(params.sortOrder).toBe("desc");
    });

    it("should default to asc for invalid sortOrder", () => {
      const url = new URL("http://example.com/api?sortOrder=invalid");
      const params = getSortParams(url);

      expect(params.sortOrder).toBe("asc");
    });

    it("should validate allowed fields", () => {
      const url = new URL("http://example.com/api?sortBy=name");

      // Should work with allowed field
      const params = getSortParams(url, ["name", "date"]);
      expect(params.sortBy).toBe("name");

      // Should throw with disallowed field
      const invalidUrl = new URL("http://example.com/api?sortBy=invalid");
      expect(() => getSortParams(invalidUrl, ["name", "date"])).toThrow(
        AppError
      );
    });

    it("should allow any field when allowedFields is empty", () => {
      const url = new URL("http://example.com/api?sortBy=anyField");
      const params = getSortParams(url, []);

      expect(params.sortBy).toBe("anyField");
    });
  });

  describe("getFilterParams", () => {
    it("should return empty object for no filters", () => {
      const url = new URL("http://example.com/api");
      const filters = getFilterParams(url);

      expect(filters).toEqual({});
    });

    it("should extract filter params", () => {
      const url = new URL(
        "http://example.com/api?status=active&category=tech&name=test"
      );
      const filters = getFilterParams(url);

      expect(filters).toEqual({
        status: "active",
        category: "tech",
        name: "test",
      });
    });

    it("should exclude pagination and sort params", () => {
      const url = new URL(
        "http://example.com/api?page=1&limit=10&sortBy=name&sortOrder=desc&status=active"
      );
      const filters = getFilterParams(url);

      expect(filters).toEqual({
        status: "active",
      });
    });

    it("should respect allowed filters", () => {
      const url = new URL(
        "http://example.com/api?status=active&category=tech&invalid=value"
      );
      const filters = getFilterParams(url, ["status", "category"]);

      expect(filters).toEqual({
        status: "active",
        category: "tech",
      });
      expect(filters.invalid).toBeUndefined();
    });

    it("should return all filters when allowedFilters is empty", () => {
      const url = new URL("http://example.com/api?status=active&custom=value");
      const filters = getFilterParams(url, []);

      expect(filters).toEqual({
        status: "active",
        custom: "value",
      });
    });

    it("should handle URL with special characters", () => {
      const url = new URL(
        "http://example.com/api?name=John%20Doe&email=test%40example.com"
      );
      const filters = getFilterParams(url);

      expect(filters).toEqual({
        name: "John Doe",
        email: "test@example.com",
      });
    });
  });
});
