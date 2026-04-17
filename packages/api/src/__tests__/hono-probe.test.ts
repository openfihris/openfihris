import { describe, it, expect } from "vitest";
import { Hono } from "hono";

/**
 * Probe tests: validate route patterns for agent slugs.
 * The default Hono SmartRouter cannot handle `/x/@:a/:b` (loses :b),
 * so we need regex-constrained patterns.
 */

describe("Hono route patterns for @user/name slugs", () => {
  it("catches full slug with suffix (e.g. /vote, /download)", async () => {
    const app = new Hono();
    let capturedSlug: string | undefined;
    let capturedRoute: string | undefined;
    app.get("/agents/:slug{@[^/]+/[^/]+}", (c) => {
      capturedSlug = c.req.param("slug");
      capturedRoute = "base";
      return c.text("base");
    });
    app.get("/agents/:slug{@[^/]+/[^/]+}/vote", (c) => {
      capturedSlug = c.req.param("slug");
      capturedRoute = "vote";
      return c.text("vote");
    });
    app.get("/agents/:slug{@[^/]+/[^/]+}/download", (c) => {
      capturedSlug = c.req.param("slug");
      capturedRoute = "download";
      return c.text("download");
    });

    const resBase = await app.request(
      "/agents/@openfihris-demo/sales-outreach-team",
    );
    expect(resBase.status).toBe(200);
    expect(capturedSlug).toBe("@openfihris-demo/sales-outreach-team");
    expect(capturedRoute).toBe("base");

    const resVote = await app.request("/agents/@alice/code-reviewer/vote");
    expect(resVote.status).toBe(200);
    expect(capturedSlug).toBe("@alice/code-reviewer");
    expect(capturedRoute).toBe("vote");

    const resDownload = await app.request("/agents/@bob/pr-helper/download");
    expect(resDownload.status).toBe(200);
    expect(capturedSlug).toBe("@bob/pr-helper");
    expect(capturedRoute).toBe("download");
  });

  it("rejects paths missing the @ prefix", async () => {
    const app = new Hono();
    app.get("/agents/:slug{@[^/]+/[^/]+}", (c) => c.text("ok"));
    const res = await app.request("/agents/alice/code-reviewer");
    expect(res.status).toBe(404);
  });

  it("rejects paths with extra segments after slug+suffix", async () => {
    const app = new Hono();
    app.get("/agents/:slug{@[^/]+/[^/]+}/vote", (c) => c.text("ok"));
    const res = await app.request("/agents/@alice/code-reviewer/vote/extra");
    expect(res.status).toBe(404);
  });

  it("does not conflict with static routes like /trending", async () => {
    const app = new Hono();
    app.get("/agents/trending", (c) => c.text("trending"));
    app.get("/agents/:slug{@[^/]+/[^/]+}", (c) => c.text("slug"));

    const resTrend = await app.request("/agents/trending");
    expect(resTrend.status).toBe(200);
    expect(await resTrend.text()).toBe("trending");

    const resSlug = await app.request("/agents/@alice/code-reviewer");
    expect(resSlug.status).toBe(200);
    expect(await resSlug.text()).toBe("slug");
  });
});
