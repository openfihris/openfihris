import { eq, and } from "drizzle-orm";
import { AgentCardSchema } from "@openfihris/shared";
import type { Database } from "../db/index.js";
import { agents } from "../db/schema.js";

/**
 * Generate a URL-safe slug from creator username and agent name.
 * Format: @username/agent-name
 */
export function generateSlug(username: string, name: string): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!normalized) {
    throw new Error(
      "Agent name must contain at least one alphanumeric character",
    );
  }

  return `@${username.toLowerCase()}/${normalized}`;
}

/**
 * Check if a slug is already taken.
 */
export async function slugExists(db: Database, slug: string): Promise<boolean> {
  const existing = await db
    .select({ id: agents.id })
    .from(agents)
    .where(eq(agents.slug, slug))
    .limit(1);
  return existing.length > 0;
}

/**
 * Publish a new agent to the registry.
 * Validates the agent card, generates a slug, and inserts into the database.
 */
export async function publishAgent(
  db: Database,
  creatorId: string,
  username: string,
  input: {
    agentCard: unknown;
    githubPath?: string;
    promptContent?: string;
  },
) {
  // Validate the agent card
  const parseResult = AgentCardSchema.safeParse(input.agentCard);
  if (!parseResult.success) {
    return {
      ok: false as const,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid agent card",
        details: {
          issues: parseResult.error.issues.map(
            (i: { path: (string | number)[]; message: string }) => ({
              path: i.path.join("."),
              message: i.message,
            }),
          ),
        },
      },
    };
  }

  const card = parseResult.data;

  // Remote agents must have an endpoint
  if (card.type === "remote" && !card.endpoint) {
    return {
      ok: false as const,
      error: {
        code: "VALIDATION_ERROR",
        message: "Remote agents must provide an endpoint URL",
        details: { field: "endpoint" },
      },
    };
  }

  // Generate slug
  let slug: string;
  try {
    slug = generateSlug(username, card.name);
  } catch (err) {
    return {
      ok: false as const,
      error: {
        code: "VALIDATION_ERROR",
        message:
          err instanceof Error
            ? err.message
            : "Invalid agent name for slug generation",
        details: { field: "name" },
      },
    };
  }

  // Check for duplicates
  try {
    if (await slugExists(db, slug)) {
      return {
        ok: false as const,
        error: {
          code: "CONFLICT",
          message: `An agent with the slug '${slug}' already exists`,
          details: { slug },
        },
      };
    }
  } catch (err) {
    console.error("Database error checking slug:", err);
    return {
      ok: false as const,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to check agent availability. Please try again.",
      },
    };
  }

  // Insert into database
  try {
    const [created] = await db
      .insert(agents)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .values({
        creatorId,
        name: card.name,
        slug,
        description: card.description,
        version: card.version ?? "0.1.0",
        type: card.type,
        category: card.category,
        tags: card.tags,
        license: card.license,
        endpoint: card.endpoint,
        protocols: card.protocols,
        authType: card.auth?.type,
        githubUrl: card.githubUrl,
        homepage: card.homepage,
        agentCard: { ...card, verifiedAuthor: false },
        frameworks: card.frameworks,
        verified: false,
      } as any)
      .returning();

    return { ok: true as const, agent: created };
  } catch (err) {
    console.error("Database error publishing agent:", err);

    // Handle unique constraint violation (race condition on slug)
    const message = err instanceof Error ? err.message : "";
    if (message.includes("unique") || message.includes("duplicate")) {
      return {
        ok: false as const,
        error: {
          code: "CONFLICT",
          message: `An agent with the slug '${slug}' already exists`,
          details: { slug },
        },
      };
    }

    return {
      ok: false as const,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to publish agent. Please try again.",
      },
    };
  }
}

/**
 * Get an agent by slug.
 */
export async function getAgentBySlug(db: Database, slug: string) {
  try {
    const results = await db
      .select()
      .from(agents)
      .where(and(eq(agents.slug, slug), eq(agents.isActive, true)))
      .limit(1);
    return results[0] ?? null;
  } catch (err) {
    console.error("Database error fetching agent:", err);
    return null;
  }
}
