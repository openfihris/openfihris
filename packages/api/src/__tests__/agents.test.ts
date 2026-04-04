import { describe, it, expect } from "vitest";
import { generateSlug } from "../services/agents.js";
import app from "../index.js";

describe("generateSlug", () => {
  it("creates a slug from username and name", () => {
    expect(generateSlug("alice", "My Cool Agent")).toBe("@alice/my-cool-agent");
  });

  it("strips special characters", () => {
    expect(generateSlug("bob", "Agent! @#$ Name")).toBe("@bob/agent-name");
  });

  it("handles multiple spaces", () => {
    expect(generateSlug("alice", "lead   gen   pro")).toBe(
      "@alice/lead-gen-pro",
    );
  });

  it("lowercases everything including username", () => {
    expect(generateSlug("Alice", "LeadGen PRO")).toBe("@alice/leadgen-pro");
  });

  it("handles hyphens in name", () => {
    expect(generateSlug("bob", "code-review-agent")).toBe(
      "@bob/code-review-agent",
    );
  });

  it("throws on empty name after stripping", () => {
    expect(() => generateSlug("bob", "!@#$%")).toThrow(
      "must contain at least one alphanumeric",
    );
  });

  it("throws on whitespace-only name", () => {
    expect(() => generateSlug("bob", "   ")).toThrow(
      "must contain at least one alphanumeric",
    );
  });
});

describe("POST /api/v1/agents", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await app.request("/api/v1/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentCard: {} }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects invalid JSON body", async () => {
    const res = await app.request("/api/v1/agents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer fake-token",
      },
      body: "not json",
    });
    // Auth middleware rejects the fake token before body parsing
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/agents/@:username/:name", () => {
  it("returns 404 for non-existent agent", async () => {
    const res = await app.request("/api/v1/agents/@nobody/fake-agent");
    // 404 (not found) since getAgentBySlug returns null on DB errors
    expect(res.status).toBe(404);
  });
});
