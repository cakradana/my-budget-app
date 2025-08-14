import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatNumber,
  getCurrentMonthRange,
  getCurrentWeekRange,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("formatCurrency", () => {
    it("should format positive numbers as Indonesian currency", () => {
      expect(formatCurrency(1000000)).toContain("1.000.000");
      expect(formatCurrency(500)).toContain("500");
    });

    it("should format negative numbers as Indonesian currency", () => {
      expect(formatCurrency(-1000000)).toContain("1.000.000");
      expect(formatCurrency(-500)).toContain("500");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toContain("0");
    });
  });

  describe("formatNumber", () => {
    it("should format numbers with Indonesian locale", () => {
      expect(formatNumber(1000000)).toBe("1.000.000");
      expect(formatNumber(500)).toBe("500");
    });
  });

  describe("getCurrentMonthRange", () => {
    it("should return start and end dates of current month", () => {
      const range = getCurrentMonthRange();
      expect(range.start).toMatch(/^\d{4}-\d{2}-01$/);
      expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("getCurrentWeekRange", () => {
    it("should return start and end dates of current week", () => {
      const range = getCurrentWeekRange();
      expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
