export const API_BASE = "https://openfihris-api.vercel.app";
export const GITHUB_URL = "https://github.com/openfihris/openfihris";

export type Agent = {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  description: string;
  version?: string;
  type: "remote" | "skill" | "prompt" | "team";
  category: string;
  tags: string[];
  license?: string | null;
  endpoint?: string | null;
  protocols?: string[];
  authType?: string | null;
  githubUrl?: string | null;
  homepage?: string | null;
  agentCard?: Record<string, unknown>;
  upvotes: number;
  downvotes: number;
  downloads: number;
  frameworks: string[];
  status?: string;
  verified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Creator = {
  username: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  isOfficial?: boolean;
  displayName?: string;
  bio?: string;
};

export type AgentWithCreator = { agent: Agent; creator?: Creator };

export type SearchResult = {
  results: AgentWithCreator[];
  cursor: string | null;
  total?: number;
};

const defaultRevalidate = 300; // 5 minutes ISR

async function apiFetch<T>(
  path: string,
  opts: { revalidate?: number | false } = {},
): Promise<T | null> {
  try {
    const revalidate = opts.revalidate ?? defaultRevalidate;
    const res = await fetch(`${API_BASE}${path}`, {
      next: revalidate === false ? { revalidate: 0 } : { revalidate },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getTrending(limit = 4): Promise<AgentWithCreator[]> {
  const data = await apiFetch<{ agents?: AgentWithCreator[] }>(
    `/api/v1/trending`,
  );
  return (data?.agents ?? []).slice(0, limit);
}

export async function getCategories(): Promise<string[]> {
  const data = await apiFetch<{ categories?: string[] }>(
    `/api/v1/categories`,
    { revalidate: 3600 },
  );
  return data?.categories ?? [];
}

export async function searchAgents(params: {
  q?: string;
  category?: string;
  framework?: string;
  type?: string;
  limit?: number;
  cursor?: string;
}): Promise<SearchResult> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  if (params.framework) qs.set("framework", params.framework);
  if (params.type) qs.set("type", params.type);
  qs.set("limit", String(params.limit ?? 20));
  if (params.cursor) qs.set("cursor", params.cursor);

  // Empty q means we just browse trending since the API requires q.
  if (!params.q) {
    const trending = await getTrending(params.limit ?? 20);
    return { results: trending, cursor: null, total: trending.length };
  }

  const data = await apiFetch<SearchResult>(
    `/api/v1/agents/search?${qs.toString()}`,
    { revalidate: 60 },
  );
  return data ?? { results: [], cursor: null, total: 0 };
}

export async function getAgent(
  username: string,
  name: string,
): Promise<AgentWithCreator | null> {
  const data = await apiFetch<AgentWithCreator>(
    `/api/v1/agents/@${encodeURIComponent(username)}/${encodeURIComponent(name)}`,
  );
  return data;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function agentIcon(type: string): string {
  switch (type) {
    case "skill":
      return "code_blocks";
    case "remote":
      return "hub";
    case "prompt":
      return "description";
    case "team":
      return "groups";
    default:
      return "bolt";
  }
}

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

export const AGENT_TYPES = ["remote", "skill", "prompt", "team"] as const;

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
