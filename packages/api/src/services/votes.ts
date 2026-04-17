import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { votes, agents } from "../db/schema.js";

/**
 * Cast a vote on an agent — atomic.
 * Wraps the check + delete/update/insert sequence in a transaction so
 * concurrent votes from the same creator can't double-increment or leave
 * counters inconsistent with the votes table.
 *
 * Semantics:
 * - No existing vote → insert, increment corresponding column
 * - Same vote exists → delete (toggle off), decrement (bounded at 0)
 * - Opposite vote exists → flip, swap the two counters (bounded at 0)
 */
export async function castVote(
  db: Database,
  creatorId: string,
  agentId: string,
  voteValue: -1 | 1,
): Promise<{ action: "added" | "removed" | "changed"; vote: number }> {
  try {
    return await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(votes)
        .where(and(eq(votes.creatorId, creatorId), eq(votes.agentId, agentId)))
        .limit(1);

      if (existing.length > 0) {
        const currentVote = existing[0].vote;

        if (currentVote === voteValue) {
          // Toggle off
          await tx
            .delete(votes)
            .where(
              and(eq(votes.creatorId, creatorId), eq(votes.agentId, agentId)),
            );

          if (voteValue === 1) {
            await tx
              .update(agents)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .set({ upvotes: sql`GREATEST(${agents.upvotes} - 1, 0)` } as any)
              .where(eq(agents.id, agentId));
          } else {
            await tx
              .update(agents)
              .set({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                downvotes: sql`GREATEST(${agents.downvotes} - 1, 0)`,
              } as any)
              .where(eq(agents.id, agentId));
          }
          return { action: "removed" as const, vote: 0 };
        }

        // Flip
        await tx
          .update(votes)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .set({ vote: voteValue } as any)
          .where(
            and(eq(votes.creatorId, creatorId), eq(votes.agentId, agentId)),
          );

        if (voteValue === 1) {
          await tx
            .update(agents)
            .set({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              upvotes: sql`${agents.upvotes} + 1`,
              downvotes: sql`GREATEST(${agents.downvotes} - 1, 0)`,
            } as any)
            .where(eq(agents.id, agentId));
        } else {
          await tx
            .update(agents)
            .set({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              upvotes: sql`GREATEST(${agents.upvotes} - 1, 0)`,
              downvotes: sql`${agents.downvotes} + 1`,
            } as any)
            .where(eq(agents.id, agentId));
        }
        return { action: "changed" as const, vote: voteValue };
      }

      // New vote
      await tx
        .insert(votes)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .values({
          creatorId,
          agentId,
          vote: voteValue,
        } as any);

      if (voteValue === 1) {
        await tx
          .update(agents)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .set({ upvotes: sql`${agents.upvotes} + 1` } as any)
          .where(eq(agents.id, agentId));
      } else {
        await tx
          .update(agents)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .set({ downvotes: sql`${agents.downvotes} + 1` } as any)
          .where(eq(agents.id, agentId));
      }

      return { action: "added" as const, vote: voteValue };
    });
  } catch (err) {
    // Unique-constraint race: two inserts hit the idx_votes_unique. Surface
    // a generic error — the client can retry and get the correct state.
    console.error("Vote error:", err);
    throw new Error("Failed to cast vote. Please try again.");
  }
}
