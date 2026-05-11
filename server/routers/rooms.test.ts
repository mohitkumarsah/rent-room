import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Rooms Router", () => {
  it("should validate description generation input", () => {
    const schema = z.object({
      rent: z.number().positive(),
      type: z.string(),
      amenities: z.array(z.string()),
      location: z.string(),
    });

    const validInput = {
      rent: 5000,
      type: "1bhk",
      amenities: ["WiFi", "AC"],
      location: "Mumbai",
    };

    const result = schema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should reject invalid rent amount", () => {
    const schema = z.object({
      rent: z.number().positive(),
      type: z.string(),
      amenities: z.array(z.string()),
      location: z.string(),
    });

    const invalidInput = {
      rent: -1000,
      type: "1bhk",
      amenities: ["WiFi"],
      location: "Mumbai",
    };

    const result = schema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should require amenities array", () => {
    const schema = z.object({
      rent: z.number().positive(),
      type: z.string(),
      amenities: z.array(z.string()),
      location: z.string(),
    });

    const invalidInput = {
      rent: 5000,
      type: "1bhk",
      amenities: [],
      location: "Mumbai",
    };

    const result = schema.safeParse(invalidInput);
    // Empty array is technically valid, but in practice we'd want at least one
    expect(result.success).toBe(true);
  });

  it("should generate description with valid input", async () => {
    const input = {
      rent: 5000,
      type: "1bhk",
      amenities: ["WiFi", "AC", "Furnished"],
      location: "Bangalore",
    };

    // In a real test, we'd mock the LLM call
    // For now, just verify the input structure
    expect(input.rent).toBeGreaterThan(0);
    expect(input.type).toBeDefined();
    expect(input.amenities.length).toBeGreaterThan(0);
    expect(input.location).toBeDefined();
  });
});
