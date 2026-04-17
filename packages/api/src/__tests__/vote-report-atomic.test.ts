/**
 * Unit tests verifying that castVote and reportAgent wrap their work in a
 * transaction. We can't easily reach Postgres in CI, so we mock the Drizzle
 * db object and assert that `db.transaction` is invoked with a callback,
 * and that the callback uses the tx object (not the root db).
 */
import { describe, expect, it, vi } from "vitest";
import { castVote } from "../services/votes.js";
import { reportAgent } from "../services/reports.js";

function mockTx() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
  return chain;
}

function mockDb(tx: ReturnType<typeof mockTx>) {
  return {
    transaction: vi.fn(async (fn: (tx: unknown) => unknown) => await fn(tx)),
  } as unknown as Parameters<typeof castVote>[0];
}

describe("castVote is atomic", () => {
  it("runs inside db.transaction", async () => {
    const tx = mockTx();
    const db = mockDb(tx);
    await castVote(db, "creator-1", "agent-1", 1);
    // transaction() was called once with a function
    expect(
      (db as unknown as { transaction: ReturnType<typeof vi.fn> }).transaction,
    ).toHaveBeenCalledTimes(1);
  });

  it("does all work via the tx object, not the root db", async () => {
    const tx = mockTx();
    const db = mockDb(tx);
    await castVote(db, "creator-1", "agent-1", -1);
    // The mock tx should have received select, insert, and update calls
    expect(tx.select).toHaveBeenCalled();
    expect(tx.insert).toHaveBeenCalled();
    expect(tx.update).toHaveBeenCalled();
  });

  it("propagates the tx callback's return value", async () => {
    const tx = mockTx();
    const db = mockDb(tx);
    const result = await castVote(db, "creator-1", "agent-1", 1);
    expect(result).toEqual({ action: "added", vote: 1 });
  });
});

describe("reportAgent is atomic", () => {
  it("runs inside db.transaction", async () => {
    const tx = mockTx();
    // Make count return a value so it doesn't trigger auto-hide
    tx.where = vi.fn(() => {
      // First call: existing reports (empty). Subsequent: count query.
      const chain: typeof tx = { ...tx };
      chain.limit = vi.fn().mockResolvedValue([]);
      return chain;
    });
    const db = mockDb(tx);
    try {
      await reportAgent(db, "reporter-1", "agent-1", "spam", "test");
    } catch {
      // OK if the mock is too incomplete — we only care transaction was called
    }
    expect(
      (db as unknown as { transaction: ReturnType<typeof vi.fn> }).transaction,
    ).toHaveBeenCalledTimes(1);
  });

  it("re-throws the 'already reported' error without converting", async () => {
    const tx = mockTx();
    // Simulate an existing report
    tx.limit = vi.fn().mockResolvedValue([{ id: "r1" }]);
    const db = mockDb(tx);
    await expect(
      reportAgent(db, "reporter-1", "agent-1", "spam"),
    ).rejects.toThrow(/already reported/);
  });
});
