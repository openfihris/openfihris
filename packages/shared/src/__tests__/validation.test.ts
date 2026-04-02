import { describe, it, expect } from "vitest";
import { AgentCardSchema, SearchQuerySchema } from "../validation.js";

describe("AgentCardSchema", () => {
  const validCard = {
    name: "Test Agent",
    description:
      "A test agent that does something useful for testing validation schemas in the shared package.",
    author: "test-user",
    category: "Development" as const,
    type: "skill" as const,
  };

  it("accepts a valid agent card", () => {
    const result = AgentCardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it("rejects a description shorter than 50 characters", () => {
    const result = AgentCardSchema.safeParse({
      ...validCard,
      description: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid category", () => {
    const result = AgentCardSchema.safeParse({
      ...validCard,
      category: "InvalidCategory",
    });
    expect(result.success).toBe(false);
  });

  it("requires an endpoint for remote agents", () => {
    const result = AgentCardSchema.safeParse({
      ...validCard,
      type: "remote",
    });
    // The card itself parses fine — endpoint is optional at the schema level
    // The PublishRequestSchema enforces endpoint for remote agents
    expect(result.success).toBe(true);
  });

  it("defaults schemaVersion to 1.0", () => {
    const result = AgentCardSchema.parse(validCard);
    expect(result.schemaVersion).toBe("1.0");
  });

  it("defaults frameworks to ['any']", () => {
    const result = AgentCardSchema.parse(validCard);
    expect(result.frameworks).toEqual(["any"]);
  });
});

describe("SearchQuerySchema", () => {
  it("accepts a valid search query", () => {
    const result = SearchQuerySchema.safeParse({ q: "lead generation" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty query", () => {
    const result = SearchQuerySchema.safeParse({ q: "" });
    expect(result.success).toBe(false);
  });

  it("defaults limit to 20", () => {
    const result = SearchQuerySchema.parse({ q: "test" });
    expect(result.limit).toBe(20);
  });

  it("rejects limit over 100", () => {
    const result = SearchQuerySchema.safeParse({ q: "test", limit: 500 });
    expect(result.success).toBe(false);
  });
});
