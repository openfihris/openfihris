import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { Env } from "../index.js";
import { createDb } from "../db/index.js";
import { creators, agents } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { errorResponse } from "../middleware/error.js";

const meRouter = new Hono<Env>();

/**
 * GET /api/v1/me — Get your own profile and published agents (authenticated)
 */
meRouter.get("/api/v1/me", requireAuth, async (c) => {
  const creatorId = c.get("creatorId");

  try {
    const db = createDb(c.env.DATABASE_URL);

    const creatorResults = await db
      .select()
      .from(creators)
      .where(eq(creators.id, creatorId))
      .limit(1);

    if (creatorResults.length === 0) {
      return errorResponse(c, "NOT_FOUND", "Profile not found");
    }

    const creator = creatorResults[0];

    const myAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.creatorId, creatorId));

    return c.json({
      creator: {
        id: creator.id,
        username: creator.username,
        displayName: creator.displayName,
        avatarUrl: creator.avatarUrl,
        bio: creator.bio,
        githubUrl: creator.githubUrl,
        website: creator.website,
        isVerified: creator.isVerified,
        isOfficial: creator.isOfficial,
        publicRepos: creator.publicRepos,
        followers: creator.followers,
        createdAt: creator.createdAt,
      },
      agents: myAgents,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return errorResponse(
      c,
      "INTERNAL_ERROR",
      "Failed to load profile. Please try again.",
    );
  }
});

export { meRouter };
