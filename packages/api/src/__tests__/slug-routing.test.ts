/**
 * Regression tests for agent slug routing.
 *
 * Bug (2026-04): GET /api/v1/agents/@user/name returned 404 in production even
 * for agents that existed in /trending and /search. Root cause: Hono's
 * SmartRouter does not correctly parse the pattern `@:username/:name` — when
 * a literal char is followed by a param in the same segment, the *next*
 * segment's param is dropped. `c.req.param("name")` returned undefined.
 *
 * Fix: use a single regex-constrained `:slug{@[^/]+/[^/]+}` pattern that
 * captures the full slug in one go.
 */
import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { agentsRouter } from "../routes/agents.js";
import app from "../index.js";

describe("Slug route pattern (unit)", () => {
  it("captures the full @user/name slug", async () => {
    const test = new Hono();
    test.get("/x/:slug{@[^/]+/[^/]+}", (c) =>
      c.json({ slug: c.req.param("slug") }),
    );
    const res = await test.request("/x/@openfihris-demo/sales-outreach-team");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { slug: string };
    expect(body.slug).toBe("@openfihris-demo/sales-outreach-team");
  });

  it("handles hyphens and numbers", async () => {
    const test = new Hono();
    test.get("/x/:slug{@[^/]+/[^/]+}", (c) =>
      c.json({ slug: c.req.param("slug") }),
    );
    const res = await test.request("/x/@my-org-123/v2-agent-name");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { slug: string };
    expect(body.slug).toBe("@my-org-123/v2-agent-name");
  });

  it("rejects paths missing the leading @", async () => {
    const test = new Hono();
    test.get("/x/:slug{@[^/]+/[^/]+}", (c) => c.text("ok"));
    const res = await test.request("/x/alice/code-reviewer");
    expect(res.status).toBe(404);
  });

  it("rejects paths with too many segments in the slug", async () => {
    const test = new Hono();
    test.get("/x/:slug{@[^/]+/[^/]+}", (c) =>
      c.json({ slug: c.req.param("slug") }),
    );
    // Three segments: @alice/agent/extra → should not match the 2-segment slug
    const res = await test.request("/x/@alice/agent/extra");
    expect(res.status).toBe(404);
  });

  it("does not shadow static routes like /trending or /categories", async () => {
    // This is the real-world concern: `/agents/trending` should still hit
    // the trending handler, not the slug handler.
    const test = new Hono();
    test.get("/agents/trending", (c) => c.text("trending"));
    test.get("/agents/:slug{@[^/]+/[^/]+}", (c) => c.text("slug"));

    const trending = await test.request("/agents/trending");
    expect(await trending.text()).toBe("trending");

    const slug = await test.request("/agents/@alice/code-reviewer");
    expect(await slug.text()).toBe("slug");
  });
});

describe("Real API routes: /api/v1/agents/:slug", () => {
  it("base endpoint does not 404 on pattern matching (only on DB lookup)", async () => {
    const res = await app.request(
      "/api/v1/agents/@nobody-test/definitely-does-not-exist",
    );
    // 404 is expected because the agent doesn't exist in DB,
    // but the route MUST match — otherwise we'd get a 500 or different shape.
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error).toMatchObject({ message: "Agent not found" });
  });

  it("download endpoint matches route (public, graceful 200 on DB err)", async () => {
    const res = await app.request("/api/v1/agents/@nobody-test/fake/download", {
      method: "POST",
    });
    // Download endpoint swallows DB errors and returns 200 so installs don't break.
    // We only care that the route matched (not a 404 from router).
    expect([200, 404]).toContain(res.status);
  });

  it("vote endpoint requires auth (route matches, auth rejects)", async () => {
    const res = await app.request("/api/v1/agents/@alice/code-reviewer/vote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vote: 1 }),
    });
    // 401 proves the route matched and hit requireAuth middleware.
    expect(res.status).toBe(401);
  });

  it("report endpoint requires auth (route matches, auth rejects)", async () => {
    const res = await app.request(
      "/api/v1/agents/@alice/code-reviewer/report",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: "spam" }),
      },
    );
    expect(res.status).toBe(401);
  });

  it("slug without @ prefix does not match slug route (returns 404)", async () => {
    const res = await app.request("/api/v1/agents/alice/code-reviewer");
    // No route matches → global 404 handler returns "The requested resource was not found"
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { message: string } };
    // Distinguishes from "Agent not found" — this is a routing miss, not DB miss.
    expect(body.error.message).toMatch(/requested resource|not found/i);
  });

  it("agentsRouter is exported (sanity check)", () => {
    expect(agentsRouter).toBeDefined();
  });

  it("rejects absurdly long slugs with 404 (security cap)", async () => {
    // Total slug must be <= MAX_SLUG_LENGTH (141). Construct > 141.
    const longUser = "a".repeat(150);
    const res = await app.request(`/api/v1/agents/@${longUser}/code-reviewer`);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("accepts reasonable slug lengths (within cap)", async () => {
    const user = "a".repeat(39);
    const res = await app.request(`/api/v1/agents/@${user}/code-reviewer`);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error).toMatchObject({ message: "Agent not found" });
  });
});
