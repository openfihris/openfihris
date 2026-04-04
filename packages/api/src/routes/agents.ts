import { Hono } from "hono";
import type { Env } from "../index.js";
import { createDb } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { errorResponse } from "../middleware/error.js";
import { publishAgent, getAgentBySlug } from "../services/agents.js";
import { searchAgents } from "../services/search.js";
import {
  SearchQuerySchema,
  VoteSchema,
  ReportSchema,
  CATEGORIES,
} from "@openfihris/shared";
import { getTrendingAgents } from "../services/trending.js";
import { castVote } from "../services/votes.js";
import { reportAgent } from "../services/reports.js";
import { trackDownload } from "../services/downloads.js";
import { canPublish } from "../middleware/ratelimit.js";

const agentsRouter = new Hono<Env>();

/**
 * GET /api/v1/agents/search — Search for agents (public)
 */
agentsRouter.get("/api/v1/agents/search", async (c) => {
  const rawQuery = {
    q: c.req.query("q"),
    category: c.req.query("category"),
    framework: c.req.query("framework"),
    type: c.req.query("type"),
    limit: c.req.query("limit"),
    cursor: c.req.query("cursor"),
  };

  const parseResult = SearchQuerySchema.safeParse(rawQuery);
  if (!parseResult.success) {
    return errorResponse(c, "VALIDATION_ERROR", "Invalid search parameters", {
      issues: parseResult.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  try {
    const db = createDb(c.env.DATABASE_URL);
    const results = await searchAgents(db, parseResult.data);
    return c.json(results);
  } catch (err) {
    console.error("Search endpoint error:", err);
    return c.json({ results: [], cursor: null, total: 0 });
  }
});

/**
 * POST /api/v1/agents — Publish a new agent (authenticated)
 */
agentsRouter.post("/api/v1/agents", requireAuth, async (c) => {
  let body: {
    agentCard?: unknown;
    githubPath?: string;
    promptContent?: string;
  };
  try {
    body = await c.req.json();
  } catch {
    return errorResponse(c, "VALIDATION_ERROR", "Invalid JSON in request body");
  }

  if (!body.agentCard) {
    return errorResponse(
      c,
      "VALIDATION_ERROR",
      "Missing 'agentCard' in request body",
    );
  }

  const db = createDb(c.env.DATABASE_URL);
  const creatorId = c.get("creatorId");
  const username = c.get("username");

  // Rate limit: max 50 agents per day per user
  if (!(await canPublish(db, creatorId))) {
    return errorResponse(
      c,
      "RATE_LIMITED",
      "You have reached the daily publish limit (50 agents per day)",
    );
  }

  const result = await publishAgent(db, creatorId, username, {
    agentCard: body.agentCard,
    githubPath: body.githubPath,
    promptContent: body.promptContent,
  });

  if (!result.ok) {
    return errorResponse(
      c,
      result.error.code,
      result.error.message,
      result.error.details,
    );
  }

  return c.json({ agent: result.agent }, 201);
});

/**
 * GET /api/v1/agents/@:username/:name — Get agent details (public)
 * Slug format: @username/agent-name
 */
agentsRouter.get("/api/v1/agents/@:username/:name", async (c) => {
  const username = c.req.param("username");
  const name = c.req.param("name");
  const slug = `@${username}/${name}`;

  try {
    const db = createDb(c.env.DATABASE_URL);
    const agent = await getAgentBySlug(db, slug);

    if (!agent) {
      return errorResponse(c, "NOT_FOUND", "Agent not found");
    }

    return c.json({ agent });
  } catch (err) {
    console.error("Error fetching agent:", err);
    return errorResponse(c, "NOT_FOUND", "Agent not found");
  }
});

/**
 * POST /api/v1/agents/@:username/:name/download — Track a download (public, no auth)
 * Called by the CLI when someone installs an agent.
 * Rate limited per IP to prevent abuse.
 */
agentsRouter.post("/api/v1/agents/@:username/:name/download", async (c) => {
  const username = c.req.param("username");
  const name = c.req.param("name");
  const slug = `@${username}/${name}`;

  try {
    const db = createDb(c.env.DATABASE_URL);
    const agent = await getAgentBySlug(db, slug);
    if (!agent) {
      return errorResponse(c, "NOT_FOUND", "Agent not found");
    }

    const result = await trackDownload(db, agent.id);
    return c.json({
      message: "Download tracked",
      downloads: result.downloads,
    });
  } catch (err) {
    console.error("Download tracking error:", err);
    // Return 200 anyway — don't break installs over analytics
    return c.json({ message: "Download tracked", downloads: 0 });
  }
});

/**
 * GET /api/v1/categories — List all agent categories (public)
 */
agentsRouter.get("/api/v1/categories", (c) => {
  return c.json({ categories: CATEGORIES });
});

/**
 * GET /api/v1/trending — Top agents by recent downloads and upvotes (public)
 */
agentsRouter.get("/api/v1/trending", async (c) => {
  const rawLimit = Number(c.req.query("limit") ?? 20);
  const limit = Math.min(Number.isNaN(rawLimit) ? 20 : rawLimit, 100);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const results = await getTrendingAgents(db, limit);
    return c.json({ agents: results });
  } catch (err) {
    console.error("Trending endpoint error:", err);
    return c.json({ agents: [] });
  }
});

/**
 * POST /api/v1/agents/@:username/:name/vote — Vote on an agent (authenticated)
 */
agentsRouter.post(
  "/api/v1/agents/@:username/:name/vote",
  requireAuth,
  async (c) => {
    const username = c.req.param("username");
    const name = c.req.param("name");
    const slug = `@${username}/${name}`;

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return errorResponse(
        c,
        "VALIDATION_ERROR",
        "Invalid JSON in request body",
      );
    }

    const parseResult = VoteSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(c, "VALIDATION_ERROR", "Vote must be 1 or -1");
    }

    try {
      const db = createDb(c.env.DATABASE_URL);
      const agent = await getAgentBySlug(db, slug);
      if (!agent) {
        return errorResponse(c, "NOT_FOUND", "Agent not found");
      }

      const creatorId = c.get("creatorId");
      const result = await castVote(
        db,
        creatorId,
        agent.id,
        parseResult.data.vote,
      );
      return c.json(result);
    } catch (err) {
      console.error("Vote endpoint error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to cast vote";
      return errorResponse(c, "INTERNAL_ERROR", message);
    }
  },
);

/**
 * POST /api/v1/agents/@:username/:name/report — Report an agent (authenticated)
 */
agentsRouter.post(
  "/api/v1/agents/@:username/:name/report",
  requireAuth,
  async (c) => {
    const username = c.req.param("username");
    const name = c.req.param("name");
    const slug = `@${username}/${name}`;

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return errorResponse(
        c,
        "VALIDATION_ERROR",
        "Invalid JSON in request body",
      );
    }

    const parseResult = ReportSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        c,
        "VALIDATION_ERROR",
        "Invalid report. Provide a valid reason.",
        {
          issues: parseResult.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
      );
    }

    try {
      const db = createDb(c.env.DATABASE_URL);
      const agent = await getAgentBySlug(db, slug);
      if (!agent) {
        return errorResponse(c, "NOT_FOUND", "Agent not found");
      }

      const creatorId = c.get("creatorId");
      const result = await reportAgent(
        db,
        creatorId,
        agent.id,
        parseResult.data.reason,
        parseResult.data.detail,
      );
      return c.json(result);
    } catch (err) {
      console.error("Report endpoint error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to submit report";
      if (message.includes("already reported")) {
        return errorResponse(c, "CONFLICT", message);
      }
      return errorResponse(c, "INTERNAL_ERROR", message);
    }
  },
);

export { agentsRouter };
