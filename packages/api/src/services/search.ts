import { eq, and, ilike, or, sql, desc } from "drizzle-orm";
import type { SearchQuery } from "@openfihris/shared";
import type { Database } from "../db/index.js";
import { agents, creators } from "../db/schema.js";

interface SearchResultItem {
  agent: typeof agents.$inferSelect;
  creator: {
    username: string;
    avatarUrl: string | null;
    isVerified: boolean | null;
    isOfficial: boolean | null;
  };
  score: number;
}

interface SearchResponse {
  results: SearchResultItem[];
  cursor: string | null;
  total: number;
}

/**
 * Search for agents using keyword matching with filters and pagination.
 * Searches across name, description, and tags.
 * Semantic search (pgvector) will be added later.
 */
export async function searchAgents(
  db: Database,
  options: SearchQuery,
): Promise<SearchResponse> {
  const { q: query, category, framework, type, limit, cursor } = options;

  try {
    // Escape SQL ILIKE wildcards in user input to prevent pattern injection
    const escapedQuery = query.replace(/[%_\\]/g, "\\$&");
    const searchPattern = `%${escapedQuery}%`;

    // Build WHERE conditions (without cursor — used for both count and results)
    const baseConditions = [eq(agents.isActive, true)];

    // Keyword search: match against name, description, or tags
    baseConditions.push(
      or(
        ilike(agents.name, searchPattern),
        ilike(agents.description, searchPattern),
        sql`EXISTS (SELECT 1 FROM unnest(${agents.tags}) AS tag WHERE tag ILIKE ${searchPattern})`,
      )!,
    );

    // Optional filters
    if (category) {
      baseConditions.push(eq(agents.category, category));
    }
    if (type) {
      baseConditions.push(eq(agents.type, type));
    }
    if (framework) {
      baseConditions.push(sql`${framework} = ANY(${agents.frameworks})`);
    }

    // Count total matches (without cursor so total stays consistent across pages)
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(agents)
      .where(and(...baseConditions));
    const total = Number(countResult?.count ?? 0);

    // Add cursor for keyset pagination (only affects results, not total count)
    // Cursor encodes the sort key values from the last item on the previous page:
    // "downloads:upvotes:createdAt:id" — this ensures stable pagination matching ORDER BY
    const conditions = [...baseConditions];
    if (cursor) {
      const parts = cursor.split(":");
      if (parts.length === 4) {
        const [curDl, curUp, curTs, curId] = parts;
        conditions.push(
          sql`(
            ${agents.downloads} < ${Number(curDl)}
            OR (${agents.downloads} = ${Number(curDl)} AND ${agents.upvotes} < ${Number(curUp)})
            OR (${agents.downloads} = ${Number(curDl)} AND ${agents.upvotes} = ${Number(curUp)} AND ${agents.createdAt} < ${curTs})
            OR (${agents.downloads} = ${Number(curDl)} AND ${agents.upvotes} = ${Number(curUp)} AND ${agents.createdAt} = ${curTs} AND ${agents.id} < ${curId})
          )`,
        );
      }
    }

    // Fetch results with creator info
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
      .where(and(...conditions))
      .orderBy(
        desc(agents.downloads),
        desc(agents.upvotes),
        desc(agents.createdAt),
        desc(agents.id),
      )
      .limit(limit + 1); // Fetch one extra to check if there are more

    // Determine if there's a next page
    // Cursor encodes "downloads:upvotes:createdAt:id" for keyset pagination
    const hasMore = results.length > limit;
    const pageResults = hasMore ? results.slice(0, limit) : results;
    const lastItem = pageResults[pageResults.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? `${lastItem.agent.downloads ?? 0}:${lastItem.agent.upvotes ?? 0}:${lastItem.agent.createdAt?.toISOString() ?? ""}:${lastItem.agent.id}`
        : null;

    // Build response with scores
    const scored = pageResults.map((row) => ({
      agent: row.agent,
      creator: {
        username: row.creator?.username ?? "unknown",
        avatarUrl: row.creator?.avatarUrl ?? null,
        isVerified: row.creator?.isVerified ?? false,
        isOfficial: row.creator?.isOfficial ?? false,
      },
      score: calculateScore(row.agent, query),
    }));

    return {
      results: scored,
      cursor: nextCursor,
      total,
    };
  } catch (err) {
    console.error("Search error:", err);
    return { results: [], cursor: null, total: 0 };
  }
}

/**
 * Calculate a simple relevance score for ranking.
 * This is a placeholder until semantic search (pgvector) is implemented.
 */
function calculateScore(
  agent: typeof agents.$inferSelect,
  query: string,
): number {
  let score = 0;
  const q = query.toLowerCase();

  // Name match is most valuable
  if (agent.name.toLowerCase().includes(q)) {
    score += 50;
  }

  // Exact name match
  if (agent.name.toLowerCase() === q) {
    score += 30;
  }

  // Description match
  if (agent.description.toLowerCase().includes(q)) {
    score += 20;
  }

  // Community signals
  score += Math.min((agent.upvotes ?? 0) * 2, 15);
  score += Math.min((agent.downloads ?? 0) * 0.1, 10);

  // Health bonus
  if (agent.healthStatus === "up") {
    score += 10;
  }

  return Math.round(score * 100) / 100;
}
