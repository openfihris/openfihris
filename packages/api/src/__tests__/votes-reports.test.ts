import { describe, it, expect } from "vitest";
import app from "../index.js";

describe("POST /api/v1/agents/@:username/:name/vote", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await app.request("/api/v1/agents/@alice/test-agent/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote: 1 }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects invalid vote value", async () => {
    const res = await app.request("/api/v1/agents/@alice/test-agent/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer fake-token",
      },
      body: JSON.stringify({ vote: 5 }),
    });
    // 401 (bad token) — auth runs before validation
    expect(res.status).toBe(401);
  });

  it("rejects missing vote field", async () => {
    const res = await app.request("/api/v1/agents/@alice/test-agent/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer fake-token",
      },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/agents/@:username/:name/report", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await app.request("/api/v1/agents/@alice/test-agent/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "spam" }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects invalid report reason", async () => {
    const res = await app.request("/api/v1/agents/@alice/test-agent/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer fake-token",
      },
      body: JSON.stringify({ reason: "i-dont-like-it" }),
    });
    // 401 (bad token) — auth runs before validation
    expect(res.status).toBe(401);
  });

  it("rejects missing reason", async () => {
    const res = await app.request("/api/v1/agents/@alice/test-agent/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer fake-token",
      },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });
});
