import { eq, and, sql, gte } from "drizzle-orm";
import { DEFAULTS } from "@openfihris/shared";
import type { Database } from "../db/index.js";
import { reports, agents } from "../db/schema.js";

/**
 * Report an agent for review.
 * If the agent receives enough reports within the threshold window,
 * it gets automatically hidden from search results.
 */
export async function reportAgent(
  db: Database,
  reporterId: string,
  agentId: string,
  reason: string,
  detail?: string,
): Promise<{ reported: boolean; autoHidden: boolean }> {
  try {
    // Check if user already reported this agent
    const existing = await db
      .select()
      .from(reports)
      .where(
        and(eq(reports.reporterId, reporterId), eq(reports.agentId, agentId)),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("You have already reported this agent");
    }

    // Insert the report
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(reports).values({
      agentId,
      reporterId,
      reason,
      detail,
    } as any);

    // Check if auto-hide threshold is reached
    const windowStart = new Date();
    windowStart.setDate(
      windowStart.getDate() - DEFAULTS.autoHideReportWindowDays,
    );

    const [countResult] = await db
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
      await db
        .update(agents)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .set({ status: "flagged", isActive: false } as any)
        .where(eq(agents.id, agentId));
      autoHidden = true;
    }

    return { reported: true, autoHidden };
  } catch (err) {
    if (err instanceof Error && err.message.includes("already reported")) {
      throw err;
    }
    console.error("Report error:", err);
    throw new Error("Failed to submit report. Please try again.");
  }
}
