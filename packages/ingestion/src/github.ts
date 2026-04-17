/**
 * Minimal GitHub REST API client used by the ingestion crawlers.
 * - Uses the public API with optional token for higher rate limits.
 * - Handles the 60 req/h unauth / 5000 req/h authed rate limits with clear errors.
 * - Returns typed results with narrow fields — we don't need the whole response.
 */

export type GitHubAuth = { token?: string };

const UA = "openfihris-ingestion/0.1";
const API = "https://api.github.com";

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

function authHeaders(auth: GitHubAuth): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": UA,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  return headers;
}

async function ghFetch<T>(url: string, auth: GitHubAuth): Promise<T> {
  const res = await fetch(url, { headers: authHeaders(auth) });
  if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
    const reset = res.headers.get("x-ratelimit-reset");
    throw new GitHubError(
      `GitHub rate limit exhausted. Reset at ${reset ? new Date(Number(reset) * 1000).toISOString() : "unknown"}`,
      res.status,
      url,
    );
  }
  if (!res.ok) {
    throw new GitHubError(
      `GitHub API ${res.status}: ${await res.text().catch(() => "")}`,
      res.status,
      url,
    );
  }
  return (await res.json()) as T;
}

/** Parse a "owner/repo" string. Throws on invalid input. */
export function parseRepo(spec: string): { owner: string; repo: string } {
  // Accept "owner/repo", "https://github.com/owner/repo", with optional trailing slashes
  const m = spec
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "")
    .match(/^([^/\s]+)\/([^/\s]+)$/);
  if (!m) throw new Error(`Invalid GitHub repo spec: "${spec}"`);
  return { owner: m[1], repo: m[2] };
}

export type Repo = {
  full_name: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  default_branch: string;
  topics: string[];
  license: { spdx_id: string | null } | null;
  html_url: string;
  owner: { login: string };
  archived: boolean;
  fork: boolean;
};

export async function getRepo(
  owner: string,
  repo: string,
  auth: GitHubAuth = {},
): Promise<Repo> {
  return ghFetch<Repo>(`${API}/repos/${owner}/${repo}`, auth);
}

export type TreeItem = { path: string; type: "blob" | "tree"; size?: number };

/** Get the full file tree of a repo's default branch (or specified sha). */
export async function getTree(
  owner: string,
  repo: string,
  sha: string,
  auth: GitHubAuth = {},
): Promise<TreeItem[]> {
  const data = await ghFetch<{ tree: TreeItem[]; truncated: boolean }>(
    `${API}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`,
    auth,
  );
  if (data.truncated) {
    // For huge repos, GitHub truncates. We don't handle that yet — log a warning.
    console.warn(`Tree truncated for ${owner}/${repo}`);
  }
  return data.tree;
}

/**
 * Fetch raw file content. We use raw.githubusercontent.com which is CDN-
 * backed and doesn't count against the API rate limit.
 */
export async function getFileContent(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GitHubError(`Raw fetch ${res.status}`, res.status, url);
  }
  return await res.text();
}

/**
 * Find files in a repo matching one of the given predicates.
 * Returns just the paths; call getFileContent for each to fetch text.
 */
export async function findFiles(
  owner: string,
  repo: string,
  branch: string,
  matchers: RegExp[],
  auth: GitHubAuth = {},
): Promise<string[]> {
  const tree = await getTree(owner, repo, branch, auth);
  return tree
    .filter((t) => t.type === "blob")
    .map((t) => t.path)
    .filter((p) => matchers.some((m) => m.test(p)));
}
