import { z } from "zod";
import {
  AGENT_TYPES,
  AUTH_TYPES,
  CATEGORIES,
  DEFAULTS,
  FRAMEWORKS,
  REPORT_REASONS,
  VOTE_VALUES,
} from "./constants.js";

/** Schema for a single agent capability. */
export const CapabilitySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  inputSchema: z.record(z.unknown()).optional(),
  outputSchema: z.record(z.unknown()).optional(),
  avgLatencyMs: z.number().int().positive().optional(),
  costPerCall: z.number().nonnegative().optional(),
});

/** Schema for agent auth configuration. */
export const AgentAuthSchema = z.object({
  type: z.enum(AUTH_TYPES),
  header: z.string().optional(),
});

/** Schema for a full Agent Card. */
export const AgentCardSchema = z.object({
  schemaVersion: z.string().default("1.0"),
  name: z.string().min(1).max(DEFAULTS.maxNameLength),
  description: z
    .string()
    .min(DEFAULTS.minDescriptionLength, {
      message: `Description must be at least ${DEFAULTS.minDescriptionLength} characters. Describe what it does, what inputs it takes, and what it returns.`,
    })
    .max(DEFAULTS.maxDescriptionLength),
  version: z.string().optional(),
  author: z.string().min(1),
  homepage: z.string().url().optional(),
  license: z.string().optional(),
  category: z.enum(CATEGORIES),
  tags: z
    .array(z.string().max(DEFAULTS.maxTagLength))
    .max(DEFAULTS.maxTagsPerAgent)
    .default([]),
  type: z.enum(AGENT_TYPES),
  capabilities: z.array(CapabilitySchema).optional(),
  endpoint: z.string().url().optional(),
  protocols: z.array(z.string()).optional(),
  auth: AgentAuthSchema.optional(),
  frameworks: z.array(z.enum(FRAMEWORKS)).default(["any"]),
  githubUrl: z.string().url().optional(),
  verifiedAuthor: z.boolean().default(false),
  openSourceUrl: z.string().url().optional(),
});

/** Schema for the publish request body. */
export const PublishRequestSchema = z
  .object({
    agentCard: AgentCardSchema,
    githubPath: z.string().optional(),
    promptContent: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.agentCard.type === "remote" && !data.agentCard.endpoint) {
        return false;
      }
      return true;
    },
    { message: "Remote agents must provide an endpoint URL" },
  );

/** Schema for search query parameters. */
export const SearchQuerySchema = z.object({
  q: z.string().min(1),
  category: z.enum(CATEGORIES).optional(),
  framework: z.enum(FRAMEWORKS).optional(),
  type: z.enum(AGENT_TYPES).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(DEFAULTS.searchLimit),
  cursor: z.string().optional(),
});

/** Schema for voting on an agent. */
export const VoteSchema = z.object({
  vote: z.union([z.literal(-1), z.literal(1)]),
});

/** Schema for reporting an agent. */
export const ReportSchema = z.object({
  reason: z.enum(REPORT_REASONS),
  detail: z.string().max(1000).optional(),
});

/** Inferred types from schemas. */
export type AgentCardInput = z.input<typeof AgentCardSchema>;
export type AgentCardOutput = z.output<typeof AgentCardSchema>;
export type PublishRequest = z.infer<typeof PublishRequestSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type VoteInput = z.infer<typeof VoteSchema>;
export type ReportInput = z.infer<typeof ReportSchema>;
