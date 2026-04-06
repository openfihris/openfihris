import { eq, sql } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { agents } from "../db/schema.js";

/**
 * Increment the download count for an agent.
 * This is a public endpoint — no auth required.
 * Returns the new download count.
 */
export async function trackDownload(
  db: Database,
  agentId: string,
): Promise<{ downloads: number }> {
  try {
    const [updated] = await db
      .update(agents)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set({ downloads: sql`${agents.downloads} + 1` } as any)
      .where(eq(agents.id, agentId))
      .returning({ downloads: agents.downloads });

    return { downloads: updated?.downloads ?? 0 };
  } catch (err) {
    console.error("Error tracking download:", err);
    // Fail silently — don't break the install flow over a counter
    return { downloads: 0 };
  }
}
