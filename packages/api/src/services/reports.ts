import { eq, and, sql, gte } from "drizzle-orm";
import { DEFAULTS } from "@openfihris/shared";
import type { Database } from "../db/index.js";
import { reports, agents } from "../db/schema.js";

/**
 * Report an agent for review — atomic.
 *
 * Wraps the duplicate-check, insert, count, and auto-hide update in a single
 * transaction so concurrent reports can't double-count toward the auto-hide
 * threshold and can't race past the per-creator uniqueness guard.
 *
 * The unique index `idx_reports_unique (reporterId, agentId)` is the ultimate
 * source of truth — if two parallel reports slip past the SELECT, the second
 * INSERT will fail and the transaction rolls back.
 */
export async function reportAgent(
  db: Database,
  reporterId: string,
  agentId: string,
  reason: string,
  detail?: string,
): Promise<{ reported: boolean; autoHidden: boolean }> {
  try {
    return await db.transaction(async (tx) => {
      // Duplicate guard (fast path; unique index is the backstop)
      const existing = await tx
        .select({ id: reports.id })
        .from(reports)
        .where(
          and(eq(reports.reporterId, reporterId), eq(reports.agentId, agentId)),
        )
        .limit(1);
      if (existing.length > 0) {
        throw new Error("You have already reported this agent");
      }

      await tx
        .insert(reports)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .values({
          agentId,
          reporterId,
          reason,
          detail,
        } as any);

      // Count unresolved reports within the auto-hide window
      const windowStart = new Date();
      windowStart.setDate(
        windowStart.getDate() - DEFAULTS.autoHideReportWindowDays,
      );

      const [countResult] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(reports)
        .where(
          and(
            eq(reports.agentId, agentId),
            eq(reports.resolved, false),
            gte(reports.createdAt, windowStart),
          ),
        );

      const reportCount = Number(countResult?.count ?? 0);
      let autoHidden = false;

      if (reportCount >= DEFAULTS.autoHideReportThreshold) {
        await tx
          .update(agents)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .set({ status: "flagged", isActive: false } as any)
          .where(eq(agents.id, agentId));
        autoHidden = true;
      }

      return { reported: true, autoHidden };
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("already reported")) {
      throw err;
    }
    // Unique-constraint race → DB error surfaces here. Convert to the
    // friendly duplicate message so the client doesn't see a raw DB error.
    const errMessage = err instanceof Error ? err.message : "";
    if (
      errMessage.includes("unique") ||
      errMessage.includes("duplicate") ||
      errMessage.includes("idx_reports_unique")
    ) {
      throw new Error("You have already reported this agent");
    }
    console.error("Report error:", err);
    throw new Error("Failed to submit report. Please try again.");
  }
}
