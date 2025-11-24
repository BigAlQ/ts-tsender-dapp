import { describe, test, expect } from "vitest";
import { calculateTotal } from "./calculateTotal";

describe("calculateTotal", () => {
  describe("Basic functionality", () => {
    test("should handle single number", () => {
      expect(calculateTotal("5")).toBe(5);
    });

    test("should handle comma-separated numbers", () => {
      expect(calculateTotal("1,2,3")).toBe(6);
    });

    test("should handle newline-separated numbers", () => {
      expect(calculateTotal("1\n2\n3")).toBe(6);
    });

    test("should handle mixed comma and newline separators", () => {
      expect(calculateTotal("1,2\n3")).toBe(6);
    });
  });

  describe("Whitespace handling", () => {
    test("should trim whitespace around numbers", () => {
      expect(calculateTotal(" 1 , 2 , 3 ")).toBe(6);
    });

    test("should handle numbers with varying whitespace", () => {
      expect(calculateTotal("1 ,  2,  3\n 4 ")).toBe(10);
    });
  });

  describe("Edge cases", () => {
    test("should handle empty string", () => {
      expect(calculateTotal("")).toBe(0);
    });

    test("should handle string with only separators", () => {
      expect(calculateTotal(",,\n,")).toBe(0);
    });

    test("should handle string with whitespace and separators only", () => {
      expect(calculateTotal(" , \n , ")).toBe(0);
    });

    test("should handle multiple consecutive separators", () => {
      expect(calculateTotal("1,,2,\n,3")).toBe(6);
    });

    test("should handle trailing separators", () => {
      expect(calculateTotal("1,2,3,")).toBe(6);
    });

    test("should handle leading separators", () => {
      expect(calculateTotal(",1,2,3")).toBe(6);
    });
  });

  describe("Decimal numbers", () => {
    test("should handle decimal numbers", () => {
      expect(calculateTotal("1.5, 2.5, 3.5")).toBe(7.5);
    });

    test("should handle mixed integers and decimals", () => {
      expect(calculateTotal("1, 2.5, 3, 4.75")).toBe(11.25);
    });

    test("should handle floating point precision correctly", () => {
      expect(calculateTotal("0.1, 0.2")).toBeCloseTo(0.3);
    });
  });

  describe("Invalid input handling", () => {
    test("should return 0 when non-numeric values are present", () => {
      expect(calculateTotal("1, abc, 3")).toBe(0);
    });

    test("should return 0 when special characters are present", () => {
      expect(calculateTotal("1, $2, 3")).toBe(0);
    });

    test("should return 0 with mixed valid and invalid numbers", () => {
      expect(calculateTotal("1, 2.5.5, 3")).toBe(0);
    });

    test("should return 0 with text containing numbers", () => {
      expect(calculateTotal("1, 2 dollars, 3")).toBe(0);
    });
  });

  describe("Number ranges", () => {
    test("should handle large numbers", () => {
      expect(calculateTotal("1000, 2000, 3000")).toBe(6000);
    });

    test("should handle zero values", () => {
      expect(calculateTotal("0, 0, 0")).toBe(0);
    });

    test("should handle negative numbers", () => {
      expect(calculateTotal("-1, 2, -3")).toBe(-2);
    });

    test("should handle mixed positive and negative numbers", () => {
      expect(calculateTotal("10, -2, 3.5, -1.5")).toBe(10);
    });
  });

  describe("Single value cases", () => {
    test("should handle single decimal", () => {
      expect(calculateTotal("3.14")).toBe(3.14);
    });

    test("should handle single negative number", () => {
      expect(calculateTotal("-5")).toBe(-5);
    });

    test("should handle single zero", () => {
      expect(calculateTotal("0")).toBe(0);
    });
  });

  describe("Complex scenarios", () => {
    test("should handle combination of all valid cases", () => {
      expect(calculateTotal("1, 2.5\n-3, 0\n4.75")).toBe(5.25);
    });

    test("should return 0 for any invalid character in entire string", () => {
      expect(calculateTotal("1, 2, 3a")).toBe(0);
    });
  });
});
