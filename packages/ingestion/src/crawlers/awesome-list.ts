/**
 * Crawls an "awesome-list" style markdown file and extracts the GitHub
 * repo links from it. Each link is then passed through crawlRepo.
 *
 * Awesome lists typically look like:
 *
 *     ### Category
 *     - [Name](https://github.com/user/repo) - description
 *
 * We pull out every `github.com/user/repo` URL we find, dedupe, and return.
 */
import { getFileContent, parseRepo, type GitHubAuth } from "../github.js";
import {
  crawlRepo,
  type CrawlOptions,
  type CrawlResult,
} from "./github-repo.js";

/** Match any github.com/owner/repo URL (http or https, optional trailing). */
const REPO_URL_RE = /https?:\/\/github\.com\/([^\s/)"']+)\/([^\s/)"']+)/gi;

export type AwesomeListOptions = CrawlOptions & {
  /**
   * Optional concurrency cap for crawling repos in parallel.
   * Default 4 to be polite to GitHub's rate limiter.
   */
  concurrency?: number;
  /**
   * Optional cap on the number of repos to crawl — useful for dry runs.
   */
  maxRepos?: number;
};

export function extractRepoLinks(
  markdown: string,
): Array<{ owner: string; repo: string }> {
  const seen = new Set<string>();
  const results: Array<{ owner: string; repo: string }> = [];
  for (const match of markdown.matchAll(REPO_URL_RE)) {
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "").replace(/[#?].*$/, "");
    // Skip self-reference and known non-repo paths (/topics, /search, etc.)
    if (
      ["topics", "search", "orgs", "about", "settings"].includes(owner) ||
      !repo
    ) {
      continue;
    }
    const key = `${owner}/${repo}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ owner, repo });
  }
  return results;
}

/**
 * Fetch an awesome-list's README.md and return the repo links it mentions.
 */
export async function fetchAwesomeListRepos(
  listRepoSpec: string,
  auth: GitHubAuth = {},
): Promise<Array<{ owner: string; repo: string }>> {
  const { owner, repo } = parseRepo(listRepoSpec);
  // Try common README locations
  const candidates = ["README.md", "readme.md", "Readme.md"];
  for (const candidate of candidates) {
    const content = await getFileContent(owner, repo, "HEAD", candidate);
    if (content) {
      // Exclude the host list itself from its own link extraction
      return extractRepoLinks(content).filter(
        (r) =>
          !(
            r.owner.toLowerCase() === owner.toLowerCase() &&
            r.repo.toLowerCase() === repo.toLowerCase()
          ),
      );
    }
  }
  return [];
}

/**
 * Crawl every repo listed in an awesome-list. Returns per-repo results.
 * Safely caps concurrency and total repo count.
 */
export async function crawlAwesomeList(
  listRepoSpec: string,
  opts: AwesomeListOptions = {},
): Promise<CrawlResult[]> {
  const { concurrency = 4, maxRepos, auth = {} } = opts;

  let repos = await fetchAwesomeListRepos(listRepoSpec, auth);
  if (maxRepos !== undefined) repos = repos.slice(0, maxRepos);

  const results: CrawlResult[] = [];
  const queue = [...repos];

  async function worker() {
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) break;
      try {
        const result = await crawlRepo(`${next.owner}/${next.repo}`, opts);
        results.push(result);
      } catch (err) {
        // A single failing repo shouldn't stop the whole crawl
        results.push({
          repo: {
            owner: next.owner,
            name: next.repo,
            stars: 0,
            license: null,
            homepage: null,
            archived: false,
            fork: false,
          },
          results: [],
          errors: [
            {
              path: "<repo>",
              error: err instanceof Error ? err.message : String(err),
            },
          ],
        });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}
