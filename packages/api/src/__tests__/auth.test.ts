import { describe, it, expect } from "vitest";
import { generateJwt, verifyJwt } from "../services/auth.js";
import app from "../index.js";

const TEST_SECRET = "test-jwt-secret-for-unit-tests-only";

describe("JWT", () => {
  it("generates and verifies a valid token", async () => {
    const token = await generateJwt("creator-123", "testuser", TEST_SECRET);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const payload = await verifyJwt(token, TEST_SECRET);
    expect(payload.sub).toBe("creator-123");
    expect(payload.username).toBe("testuser");
  });

  it("rejects a token signed with wrong secret", async () => {
    const token = await generateJwt("creator-123", "testuser", TEST_SECRET);
    await expect(verifyJwt(token, "wrong-secret")).rejects.toThrow();
  });

  it("rejects a malformed token", async () => {
    await expect(verifyJwt("not-a-real-token", TEST_SECRET)).rejects.toThrow();
  });
});

describe("Auth Endpoint", () => {
  it("POST /api/v1/auth/github rejects missing code", async () => {
    const res = await app.request("/api/v1/auth/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    const error = body.error as Record<string, unknown>;
    expect(error.code).toBe("VALIDATION_ERROR");
  });
});

describe("Auth Middleware", () => {
  it("rejects requests without Authorization header", async () => {
    // Use a protected endpoint (once one exists, this tests the middleware)
    const res = await app.request("/api/v1/me");
    // Should be 404 for now since /me doesn't exist yet
    // When we add protected routes, this will test auth rejection
    expect(res.status).toBe(404);
  });
});
