/**
 * Fixed list of agent categories.
 * Publishers must choose one when publishing.
 */
export const CATEGORIES = [
  "Development",
  "Security",
  "Sales & Marketing",
  "Research",
  "Data",
  "Customer Support",
  "Productivity",
  "DevOps",
  "Finance",
  "Writing",
  "Design",
  "Education",
  "Communication",
  "Infrastructure",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Types of agents the registry supports. */
export const AGENT_TYPES = ["remote", "skill", "prompt", "team"] as const;

export type AgentType = (typeof AGENT_TYPES)[number];

/** Known frameworks for compatibility tagging. */
export const FRAMEWORKS = [
  "claude-code",
  "openclaw",
  "langchain",
  "crewai",
  "google-adk",
  "autogen",
  "cursor",
  "any",
] as const;

export type Framework = (typeof FRAMEWORKS)[number];

/** Auth types for remote agents. */
export const AUTH_TYPES = ["none", "api_key", "oauth2"] as const;

export type AuthType = (typeof AUTH_TYPES)[number];

/** Agent status in the registry. */
export const AGENT_STATUSES = ["active", "archived", "flagged"] as const;

export type AgentStatus = (typeof AGENT_STATUSES)[number];

/** Health check status for remote agents. */
export const HEALTH_STATUSES = ["up", "down", "timeout", "unknown"] as const;

export type HealthStatus = (typeof HEALTH_STATUSES)[number];

/** Report reasons for flagging agents. */
export const REPORT_REASONS = [
  "malware",
  "prompt_injection",
  "data_exfiltration",
  "spam",
  "broken",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/** Pipeline types for agent teams. */
export const PIPELINE_TYPES = [
  "sequential",
  "parallel",
  "conditional",
] as const;

export type PipelineType = (typeof PIPELINE_TYPES)[number];

/** Vote values. */
export const VOTE_VALUES = [-1, 1] as const;

export type VoteValue = (typeof VOTE_VALUES)[number];

/** Default config values. */
export const DEFAULTS = {
  searchLimit: 20,
  maxTagsPerAgent: 20,
  maxTagLength: 50,
  minDescriptionLength: 50,
  maxDescriptionLength: 5000,
  maxNameLength: 100,
  jwtExpiryDays: 7,
  publishRateLimitPerDay: 50,
  autoHideReportThreshold: 5,
  autoHideReportWindowDays: 7,
  healthCheckIntervalHours: 24,
  embeddingDimensions: 1536,
} as const;
