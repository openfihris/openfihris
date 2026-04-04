import { describe, it, expect } from "vitest";
import app from "../index.js";

describe("GET /api/v1/categories", () => {
  it("returns the full list of categories", async () => {
    const res = await app.request("/api/v1/categories");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { categories: string[] };
    expect(body.categories).toBeDefined();
    expect(body.categories.length).toBe(15);
    expect(body.categories).toContain("Development");
    expect(body.categories).toContain("Security");
    expect(body.categories).toContain("Sales & Marketing");
    expect(body.categories).toContain("Other");
  });
});

describe("GET /api/v1/trending", () => {
  it("returns 200 with agents array", async () => {
    const res = await app.request("/api/v1/trending");
    const body = (await res.json()) as { agents: unknown[] };
    expect(res.status).toBe(200);
    expect(body.agents).toBeDefined();
    expect(Array.isArray(body.agents)).toBe(true);
  });

  it("respects limit parameter", async () => {
    const res = await app.request("/api/v1/trending?limit=5");
    expect(res.status).toBe(200);
  });
});

describe("GET /api/v1/creators/:username", () => {
  it("returns 404 for non-existent creator", async () => {
    const res = await app.request("/api/v1/creators/nobody-here");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/v1/creators/:username/agents", () => {
  it("returns 404 for non-existent creator", async () => {
    const res = await app.request("/api/v1/creators/nobody-here/agents");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/v1/me", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await app.request("/api/v1/me");
    expect(res.status).toBe(401);
  });

  it("rejects invalid token", async () => {
    const res = await app.request("/api/v1/me", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    expect(res.status).toBe(401);
  });
});
