import { eq, desc, sql } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { agents, creators } from "../db/schema.js";

/**
 * Get trending agents ranked by downloads + upvotes.
 */
export async function getTrendingAgents(db: Database, limit: number) {
  try {
    const results = await db
      .select({
        agent: agents,
        creator: {
          username: creators.username,
          avatarUrl: creators.avatarUrl,
          isVerified: creators.isVerified,
          isOfficial: creators.isOfficial,
        },
      })
      .from(agents)
      .leftJoin(creators, eq(agents.creatorId, creators.id))
      .where(eq(agents.isActive, true))
      .orderBy(
        desc(sql`${agents.downloads} + ${agents.upvotes} * 5`),
        desc(agents.createdAt),
      )
      .limit(limit);

    return results.map((row) => ({
      agent: row.agent,
      creator: {
        username: row.creator?.username ?? "unknown",
        avatarUrl: row.creator?.avatarUrl ?? null,
        isVerified: row.creator?.isVerified ?? false,
        isOfficial: row.creator?.isOfficial ?? false,
      },
    }));
  } catch (err) {
    console.error("Trending query error:", err);
    return [];
  }
}
