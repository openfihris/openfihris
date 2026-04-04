import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { votes, agents } from "../db/schema.js";

/**
 * Cast a vote on an agent. Handles:
 * - New vote: inserts and updates agent vote counts
 * - Same vote: removes the vote (toggle off)
 * - Changed vote: updates the vote and adjusts counts
 */
export async function castVote(
  db: Database,
  creatorId: string,
  agentId: string,
  voteValue: -1 | 1,
): Promise<{ action: "added" | "removed" | "changed"; vote: number }> {
  try {
    // Check for existing vote
    const existing = await db
      .select()
      .from(votes)
      .where(and(eq(votes.creatorId, creatorId), eq(votes.agentId, agentId)))
      .limit(1);

    if (existing.length > 0) {
      const currentVote = existing[0].vote;

      if (currentVote === voteValue) {
        // Same vote — toggle off (remove)
        await db
          .delete(votes)
          .where(
            and(eq(votes.creatorId, creatorId), eq(votes.agentId, agentId)),
          );

        // Update agent counts
        if (voteValue === 1) {
          await db
            .update(agents)
            .set({ upvotes: sql`GREATEST(${agents.upvotes} - 1, 0)` })
            .where(eq(agents.id, agentId));
        } else {
          await db
            .update(agents)
            .set({ downvotes: sql`GREATEST(${agents.downvotes} - 1, 0)` })
            .where(eq(agents.id, agentId));
        }

        return { action: "removed", vote: 0 };
      } else {
        // Different vote — change it
        await db
          .update(votes)
          .set({ vote: voteValue })
          .where(
            and(eq(votes.creatorId, creatorId), eq(votes.agentId, agentId)),
          );

        // Swap counts: remove old, add new
        if (voteValue === 1) {
          await db
            .update(agents)
            .set({
              upvotes: sql`${agents.upvotes} + 1`,
              downvotes: sql`GREATEST(${agents.downvotes} - 1, 0)`,
            })
            .where(eq(agents.id, agentId));
        } else {
          await db
            .update(agents)
            .set({
              upvotes: sql`GREATEST(${agents.upvotes} - 1, 0)`,
              downvotes: sql`${agents.downvotes} + 1`,
            })
            .where(eq(agents.id, agentId));
        }

        return { action: "changed", vote: voteValue };
      }
    }

    // New vote
    await db.insert(votes).values({
      creatorId,
      agentId,
      vote: voteValue,
    });

    if (voteValue === 1) {
      await db
        .update(agents)
        .set({ upvotes: sql`${agents.upvotes} + 1` })
        .where(eq(agents.id, agentId));
    } else {
      await db
        .update(agents)
        .set({ downvotes: sql`${agents.downvotes} + 1` })
        .where(eq(agents.id, agentId));
    }

    return { action: "added", vote: voteValue };
  } catch (err) {
    console.error("Vote error:", err);
    throw new Error("Failed to cast vote. Please try again.");
  }
}
