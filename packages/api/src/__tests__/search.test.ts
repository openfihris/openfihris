import { describe, it, expect } from "vitest";
import app from "../index.js";

describe("GET /api/v1/agents/search", () => {
  it("rejects missing query parameter", async () => {
    const res = await app.request("/api/v1/agents/search");
    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    const error = body.error as Record<string, unknown>;
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects empty query", async () => {
    const res = await app.request("/api/v1/agents/search?q=");
    expect(res.status).toBe(400);
  });

  it("rejects limit over 100", async () => {
    const res = await app.request("/api/v1/agents/search?q=test&limit=500");
    expect(res.status).toBe(400);
  });

  it("accepts valid search with defaults", async () => {
    // Will return empty results (no DB) but should not error
    const res = await app.request("/api/v1/agents/search?q=test");
    const body = (await res.json()) as Record<string, unknown>;
    // Either 200 with empty results or graceful fallback
    expect(res.status).toBe(200);
    expect(body.results).toBeDefined();
    expect(body.cursor).toBeDefined();
  });

  it("accepts valid search with filters", async () => {
    const res = await app.request(
      "/api/v1/agents/search?q=test&category=Development&type=skill&limit=10",
    );
    const body = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.results).toBeDefined();
  });

  it("accepts valid search with framework filter", async () => {
    const res = await app.request(
      "/api/v1/agents/search?q=test&framework=claude-code",
    );
    expect(res.status).toBe(200);
  });

  it("rejects invalid category", async () => {
    const res = await app.request(
      "/api/v1/agents/search?q=test&category=NotACategory",
    );
    expect(res.status).toBe(400);
  });

  it("rejects invalid type", async () => {
    const res = await app.request(
      "/api/v1/agents/search?q=test&type=notavalidtype",
    );
    expect(res.status).toBe(400);
  });
});
