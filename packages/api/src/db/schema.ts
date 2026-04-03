import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  smallint,
  numeric,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Creators ────────────────────────────────────────────────────────────────

export const creators = pgTable(
  "creators",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    githubId: integer("github_id").unique().notNull(),
    username: text("username").unique().notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    githubCreatedAt: timestamp("github_created_at", { withTimezone: true }),
    publicRepos: integer("public_repos").default(0),
    followers: integer("followers").default(0),
    githubUrl: text("github_url"),
    website: text("website"),
    isVerified: boolean("is_verified").default(false),
    isOfficial: boolean("is_official").default(false),
    officialOrgName: text("official_org_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_creators_github_id").on(table.githubId),
    uniqueIndex("idx_creators_username").on(table.username),
  ],
);

// ─── Agents ──────────────────────────────────────────────────────────────────

export const agents = pgTable(
  "agents",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .references(() => creators.id)
      .notNull(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description").notNull(),
    version: text("version").default("0.1.0"),
    type: text("type").notNull(),
    category: text("category").notNull(),
    tags: text("tags")
      .array()
      .default(sql`'{}'::text[]`),
    license: text("license"),
    endpoint: text("endpoint"),
    protocols: text("protocols")
      .array()
      .default(sql`'{}'::text[]`),
    authType: text("auth_type"),
    githubUrl: text("github_url"),
    homepage: text("homepage"),
    agentCard: jsonb("agent_card").notNull(),
    upvotes: integer("upvotes").default(0),
    downvotes: integer("downvotes").default(0),
    downloads: integer("downloads").default(0),
    frameworks: text("frameworks")
      .array()
      .default(sql`'{any}'::text[]`),
    status: text("status").default("active"),
    verified: boolean("verified").default(false),
    isActive: boolean("is_active").default(true),
    lastHealth: timestamp("last_health", { withTimezone: true }),
    healthStatus: text("health_status").default("unknown"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_agents_slug").on(table.slug),
    index("idx_agents_category").on(table.category),
    index("idx_agents_type").on(table.type),
    index("idx_agents_status").on(table.status),
    index("idx_agents_creator").on(table.creatorId),
  ],
);

// ─── Agent Capabilities ─────────────────────────────────────────────────────

export const agentCapabilities = pgTable(
  "agent_capabilities",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    agentId: uuid("agent_id")
      .references(() => agents.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    inputSchema: jsonb("input_schema"),
    outputSchema: jsonb("output_schema"),
    avgLatencyMs: integer("avg_latency_ms"),
    costPerCall: numeric("cost_per_call", { precision: 10, scale: 6 }).default(
      "0",
    ),
  },
  (table) => [index("idx_capabilities_agent").on(table.agentId)],
);

// ─── Teams ───────────────────────────────────────────────────────────────────

export const teams = pgTable(
  "teams",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id").references(() => creators.id),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description").notNull(),
    pipelineType: text("pipeline_type").default("sequential"),
    upvotes: integer("upvotes").default(0),
    downloads: integer("downloads").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [uniqueIndex("idx_teams_slug").on(table.slug)],
);

// ─── Team Members ────────────────────────────────────────────────────────────

export const teamMembers = pgTable(
  "team_members",
  {
    teamId: uuid("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    agentId: uuid("agent_id")
      .references(() => agents.id)
      .notNull(),
    role: text("role"),
    position: integer("position").notNull(),
  },
  (table) => [primaryKey({ columns: [table.teamId, table.agentId] })],
);

// ─── Votes ───────────────────────────────────────────────────────────────────

export const votes = pgTable(
  "votes",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .references(() => creators.id)
      .notNull(),
    agentId: uuid("agent_id")
      .references(() => agents.id)
      .notNull(),
    vote: smallint("vote").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_votes_unique").on(table.creatorId, table.agentId),
  ],
);

// ─── Health Checks ───────────────────────────────────────────────────────────

export const healthChecks = pgTable(
  "health_checks",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    agentId: uuid("agent_id")
      .references(() => agents.id, { onDelete: "cascade" })
      .notNull(),
    status: text("status").notNull(),
    latencyMs: integer("latency_ms"),
    conformance: jsonb("conformance"),
    checkedAt: timestamp("checked_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_health_checks_agent").on(table.agentId)],
);

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reports = pgTable(
  "reports",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    agentId: uuid("agent_id")
      .references(() => agents.id)
      .notNull(),
    reporterId: uuid("reporter_id")
      .references(() => creators.id)
      .notNull(),
    reason: text("reason").notNull(),
    detail: text("detail"),
    resolved: boolean("resolved").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_reports_agent").on(table.agentId)],
);
