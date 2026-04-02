import type {
  AgentStatus,
  AgentType,
  AuthType,
  Category,
  Framework,
  HealthStatus,
  PipelineType,
  ReportReason,
  VoteValue,
} from "./constants.js";

/** A capability that an agent exposes. */
export interface Capability {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  avgLatencyMs?: number;
  costPerCall?: number;
}

/** Auth configuration for remote agents. */
export interface AgentAuth {
  type: AuthType;
  header?: string;
}

/** The core Agent Card — stored in the registry for every agent. */
export interface AgentCard {
  schemaVersion: string;
  name: string;
  description: string;
  version?: string;
  author: string;
  homepage?: string;
  license?: string;
  category: Category;
  tags: string[];
  type: AgentType;
  capabilities?: Capability[];
  endpoint?: string;
  protocols?: string[];
  auth?: AgentAuth;
  frameworks: Framework[];
  githubUrl?: string;
  verifiedAuthor: boolean;
  openSourceUrl?: string;
}

/** A registered agent in the database. */
export interface Agent {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  type: AgentType;
  category: Category;
  tags: string[];
  license?: string;
  endpoint?: string;
  protocols?: string[];
  authType?: AuthType;
  githubUrl?: string;
  homepage?: string;
  agentCard: AgentCard;
  upvotes: number;
  downvotes: number;
  downloads: number;
  frameworks: Framework[];
  status: AgentStatus;
  verified: boolean;
  isActive: boolean;
  lastHealth?: string;
  healthStatus: HealthStatus;
  createdAt: string;
  updatedAt: string;
}

/** A creator (publisher) profile, backed by GitHub identity. */
export interface Creator {
  id: string;
  githubId: number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  githubCreatedAt?: string;
  publicRepos: number;
  followers: number;
  githubUrl?: string;
  website?: string;
  isVerified: boolean;
  isOfficial: boolean;
  officialOrgName?: string;
  createdAt: string;
  updatedAt: string;
}

/** An agent team — a bundle of agents that work together. */
export interface Team {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  description: string;
  pipelineType: PipelineType;
  upvotes: number;
  downloads: number;
  createdAt: string;
}

/** A member of an agent team. */
export interface TeamMember {
  teamId: string;
  agentId: string;
  role?: string;
  position: number;
}

/** A vote on an agent. */
export interface Vote {
  id: string;
  creatorId: string;
  agentId: string;
  vote: VoteValue;
  createdAt: string;
}

/** A health check result for a remote agent. */
export interface HealthCheck {
  id: string;
  agentId: string;
  status: HealthStatus;
  latencyMs?: number;
  conformance?: Record<string, unknown>;
  checkedAt: string;
}

/** A report/flag on an agent. */
export interface Report {
  id: string;
  agentId: string;
  reporterId: string;
  reason: ReportReason;
  detail?: string;
  resolved: boolean;
  createdAt: string;
}

/** Search result returned by the API. */
export interface SearchResult {
  agent: Agent;
  score: number;
  creator: Pick<
    Creator,
    "username" | "avatarUrl" | "isVerified" | "isOfficial"
  >;
}

/** Paginated response envelope. */
export interface PaginatedResponse<T> {
  results: T[];
  cursor: string | null;
  total?: number;
}

/** Standard API error response. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
