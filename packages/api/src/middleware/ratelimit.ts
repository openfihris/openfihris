import { eq, and, gte, sql } from "drizzle-orm";
import { DEFAULTS } from "@openfihris/shared";
import type { Database } from "../db/index.js";
import { agents, votes, reports } from "../db/schema.js";

/**
 * Rate limit configuration per action.
 * Votes and reports are tracked via their respective tables (no extra schema).
 */
export const RATE_LIMITS = {
  /** Agents published per creator per 24 hours. Default 50 (see shared). */
  publishPerDay: DEFAULTS.publishRateLimitPerDay,
  /** Votes per creator per hour. */
  votesPerHour: 60,
  /** Reports per creator per hour. */
  reportsPerHour: 10,
} as const;

export type RateLimitResult =
  | { ok: true }
  | {
      ok: false;
      reason: "limit_exceeded" | "check_failed";
      retryAfter?: number;
    };

/**
 * Helper: build a Date N hours in the past.
 */
function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

/**
 * Check if a creator can publish another agent.
 * Fails **closed** on DB errors — better to block briefly than allow abuse.
 * Callers should surface a 503-style response on {reason: "check_failed"} so
 * the user knows it's transient, vs 429 on {reason: "limit_exceeded"}.
 */
export async function canPublish(
  db: Database,
  creatorId: string,
): Promise<RateLimitResult> {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(agents)
      .where(
        and(
          eq(agents.creatorId, creatorId),
          gte(agents.createdAt, hoursAgo(24)),
        ),
      );
    const count = Number(result?.count ?? 0);
    if (count < RATE_LIMITS.publishPerDay) return { ok: true };
    return { ok: false, reason: "limit_exceeded", retryAfter: 3600 };
  } catch (err) {
    console.error("publish rate limit check error:", err);
    return { ok: false, reason: "check_failed" };
  }
}

/**
 * Check if a creator can cast another vote. Counts all votes in the last
 * hour (up or down). Prevents vote-bombing.
 */
export async function canVote(
  db: Database,
  creatorId: string,
): Promise<RateLimitResult> {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(votes)
      .where(
        and(eq(votes.creatorId, creatorId), gte(votes.createdAt, hoursAgo(1))),
      );
    const count = Number(result?.count ?? 0);
    if (count < RATE_LIMITS.votesPerHour) return { ok: true };
    return { ok: false, reason: "limit_exceeded", retryAfter: 3600 };
  } catch (err) {
    console.error("vote rate limit check error:", err);
    return { ok: false, reason: "check_failed" };
  }
}

/**
 * Check if a creator can submit another report.
 */
export async function canReport(
  db: Database,
  creatorId: string,
): Promise<RateLimitResult> {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(
        and(
          eq(reports.reporterId, creatorId),
          gte(reports.createdAt, hoursAgo(1)),
        ),
      );
    const count = Number(result?.count ?? 0);
    if (count < RATE_LIMITS.reportsPerHour) return { ok: true };
    return { ok: false, reason: "limit_exceeded", retryAfter: 3600 };
  } catch (err) {
    console.error("report rate limit check error:", err);
    return { ok: false, reason: "check_failed" };
  }
}
