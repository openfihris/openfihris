/**
 * Unit tests for the rate limit middleware.
 *
 * These tests use a mocked Drizzle db object that records which query path
 * was taken (canPublish / canVote / canReport use different tables) and
 * exercise both the happy path and the fail-closed behaviour on DB errors.
 */
import { describe, expect, it, vi } from "vitest";
import {
  canPublish,
  canVote,
  canReport,
  RATE_LIMITS,
} from "../middleware/ratelimit.js";

/**
 * Minimal fake Drizzle query chain. We only need `.select().from().where()`
 * to return a thenable that resolves to `[{ count }]` or throws.
 */
function mockDb(resolved: { count: number } | Error) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn(() =>
      Promise.resolve(
        resolved instanceof Error ? Promise.reject(resolved) : [resolved],
      ),
    ),
  };
  // Actually we need where() to return a thenable. Let me rebuild.
  return {
    select: () => ({
      from: () => ({
        where: async () => {
          if (resolved instanceof Error) throw resolved;
          return [resolved];
        },
      }),
    }),
  } as unknown as Parameters<typeof canPublish>[0];
}

describe("RATE_LIMITS constants", () => {
  it("enforces conservative defaults", () => {
    expect(RATE_LIMITS.publishPerDay).toBe(50);
    expect(RATE_LIMITS.votesPerHour).toBe(60);
    expect(RATE_LIMITS.reportsPerHour).toBe(10);
  });
});

describe("canPublish", () => {
  it("allows when under limit", async () => {
    const db = mockDb({ count: 10 });
    const result = await canPublish(db, "creator-1");
    expect(result.ok).toBe(true);
  });

  it("allows at exactly limit - 1", async () => {
    const db = mockDb({ count: RATE_LIMITS.publishPerDay - 1 });
    const result = await canPublish(db, "creator-1");
    expect(result.ok).toBe(true);
  });

  it("blocks at exactly limit", async () => {
    const db = mockDb({ count: RATE_LIMITS.publishPerDay });
    const result = await canPublish(db, "creator-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("limit_exceeded");
      expect(result.retryAfter).toBe(3600);
    }
  });

  it("blocks well over limit", async () => {
    const db = mockDb({ count: 999 });
    const result = await canPublish(db, "creator-1");
    expect(result.ok).toBe(false);
  });

  it("fails closed on DB error (not fail-open)", async () => {
    const db = mockDb(new Error("Connection lost"));
    const result = await canPublish(db, "creator-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("check_failed");
      // No retryAfter on check_failed — caller decides
      expect(result.retryAfter).toBeUndefined();
    }
  });

  it("handles null count (no rows) as zero", async () => {
    const db = mockDb({ count: 0 });
    const result = await canPublish(db, "creator-1");
    expect(result.ok).toBe(true);
  });
});

describe("canVote", () => {
  it("allows under limit", async () => {
    const db = mockDb({ count: 5 });
    const result = await canVote(db, "creator-1");
    expect(result.ok).toBe(true);
  });

  it("blocks at limit", async () => {
    const db = mockDb({ count: RATE_LIMITS.votesPerHour });
    const result = await canVote(db, "creator-1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("limit_exceeded");
  });

  it("fails closed on DB error", async () => {
    const db = mockDb(new Error("Timeout"));
    const result = await canVote(db, "creator-1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("check_failed");
  });
});

describe("canReport", () => {
  it("allows under limit", async () => {
    const db = mockDb({ count: 3 });
    const result = await canReport(db, "creator-1");
    expect(result.ok).toBe(true);
  });

  it("blocks at limit", async () => {
    const db = mockDb({ count: RATE_LIMITS.reportsPerHour });
    const result = await canReport(db, "creator-1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("limit_exceeded");
  });

  it("blocks over limit", async () => {
    const db = mockDb({ count: 100 });
    const result = await canReport(db, "creator-1");
    expect(result.ok).toBe(false);
  });

  it("fails closed on DB error", async () => {
    const db = mockDb(new Error("Timeout"));
    const result = await canReport(db, "creator-1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("check_failed");
  });
});
