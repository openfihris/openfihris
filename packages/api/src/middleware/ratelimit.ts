import { eq, and, gte, sql } from "drizzle-orm";
import { DEFAULTS } from "@openfihris/shared";
import type { Database } from "../db/index.js";
import { agents } from "../db/schema.js";

/**
 * Check if a creator has exceeded the daily publish limit.
 * Returns true if they can publish, false if rate limited.
 */
export async function canPublish(
  db: Database,
  creatorId: string,
): Promise<boolean> {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(agents)
      .where(
        and(
          eq(agents.creatorId, creatorId),
          gte(agents.createdAt, twentyFourHoursAgo),
        ),
      );

    const count = Number(result?.count ?? 0);
    return count < DEFAULTS.publishRateLimitPerDay;
  } catch (err) {
    console.error("Rate limit check error:", err);
    // On error, allow the publish (fail open) — better than blocking legitimate users
    return true;
  }
}
