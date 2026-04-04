import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import type { Env } from "../index.js";
import { createDb } from "../db/index.js";
import { creators, agents } from "../db/schema.js";
import { errorResponse } from "../middleware/error.js";

const creatorsRouter = new Hono<Env>();

/**
 * GET /api/v1/creators/:username — Get creator profile (public)
 */
creatorsRouter.get("/api/v1/creators/:username", async (c) => {
  const username = c.req.param("username");

  try {
    const db = createDb(c.env.DATABASE_URL);
    const results = await db
      .select()
      .from(creators)
      .where(eq(creators.username, username))
      .limit(1);

    if (results.length === 0) {
      return errorResponse(c, "NOT_FOUND", "Creator not found");
    }

    const creator = results[0];

    // Get their published agents count (efficient count query)
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(agents)
      .where(and(eq(agents.creatorId, creator.id), eq(agents.isActive, true)));

    return c.json({
      creator: {
        username: creator.username,
        displayName: creator.displayName,
        avatarUrl: creator.avatarUrl,
        bio: creator.bio,
        githubUrl: creator.githubUrl,
        website: creator.website,
        isVerified: creator.isVerified,
        isOfficial: creator.isOfficial,
        officialOrgName: creator.officialOrgName,
        publicRepos: creator.publicRepos,
        followers: creator.followers,
        agentCount: Number(countResult?.count ?? 0),
        createdAt: creator.createdAt,
      },
    });
  } catch (err) {
    console.error("Error fetching creator:", err);
    return errorResponse(c, "NOT_FOUND", "Creator not found");
  }
});

/**
 * GET /api/v1/creators/:username/agents — List creator's agents (public)
 */
creatorsRouter.get("/api/v1/creators/:username/agents", async (c) => {
  const username = c.req.param("username");

  try {
    const db = createDb(c.env.DATABASE_URL);

    // Find the creator first
    const creatorResults = await db
      .select({ id: creators.id })
      .from(creators)
      .where(eq(creators.username, username))
      .limit(1);

    if (creatorResults.length === 0) {
      return errorResponse(c, "NOT_FOUND", "Creator not found");
    }

    const creatorAgents = await db
      .select()
      .from(agents)
      .where(
        and(
          eq(agents.creatorId, creatorResults[0].id),
          eq(agents.isActive, true),
        ),
      );

    return c.json({ agents: creatorAgents });
  } catch (err) {
    console.error("Error fetching creator agents:", err);
    return errorResponse(c, "NOT_FOUND", "Creator not found");
  }
});

export { creatorsRouter };
