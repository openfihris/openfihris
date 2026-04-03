import { describe, it, expect } from "vitest";
import app from "../index.js";

describe("API Server", () => {
  it("GET /health returns 200 with status ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe("ok");
    expect(body.service).toBe("openfihris-api");
    expect(body.version).toBe("0.1.0");
    expect(body.timestamp).toBeDefined();
  });

  it("GET /unknown returns 404", async () => {
    const res = await app.request("/this-does-not-exist");
    expect(res.status).toBe(404);
    const body = (await res.json()) as Record<string, unknown>;
    const error = body.error as Record<string, unknown>;
    expect(error.code).toBe("NOT_FOUND");
  });

  it("includes CORS headers", async () => {
    const res = await app.request("/health", {
      headers: { Origin: "http://localhost:3000" },
    });
    expect(res.headers.get("access-control-allow-origin")).toBeDefined();
  });
});
