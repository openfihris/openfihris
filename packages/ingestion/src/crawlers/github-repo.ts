/**
 * Crawls a single GitHub repo for agent metadata.
 *
 * Looks for:
 * - SKILL.md files (Claude Code skills)
 * - agent-card.json / .well-known/agent.json (A2A Agent Cards)
 * - agent.json / lobechat-agents.json (LobeChat format)
 *
 * Each discovered file is parsed with the parsers from ../parsers/.
 * Returns an array of ParseResult with the agent card filled in plus repo
 * provenance (stars, license, homepage) copied in where useful.
 */
import type { GitHubAuth } from "../github.js";
import { findFiles, getFileContent, getRepo, parseRepo } from "../github.js";
import type { ParseResult } from "../parsers/types.js";
import { parseAny } from "../parsers/index.js";

export type CrawlOptions = {
  auth?: GitHubAuth;
  /** Skip archived repos. Default true. */
  skipArchived?: boolean;
  /** Skip forks. Default true. */
  skipForks?: boolean;
};

const MATCHERS: RegExp[] = [
  /(^|\/)SKILL\.md$/i,
  /(^|\/)\.well-known\/agent\.json$/i,
  /(^|\/)agent[_-]?card\.json$/i,
  /(^|\/)lobechat[^/]*\.json$/i,
  /(^|\/)agent\.json$/i,
];

export type CrawlResult = {
  repo: {
    owner: string;
    name: string;
    stars: number;
    license: string | null;
    homepage: string | null;
    archived: boolean;
    fork: boolean;
  };
  results: ParseResult[];
  errors: { path: string; error: string }[];
};

export async function crawlRepo(
  spec: string,
  opts: CrawlOptions = {},
): Promise<CrawlResult> {
  const { skipArchived = true, skipForks = true, auth = {} } = opts;
  const { owner, repo } = parseRepo(spec);
  const repoInfo = await getRepo(owner, repo, auth);

  const base: CrawlResult = {
    repo: {
      owner: repoInfo.owner.login,
      name: repoInfo.full_name.split("/")[1],
      stars: repoInfo.stargazers_count,
      license: repoInfo.license?.spdx_id ?? null,
      homepage: repoInfo.homepage || repoInfo.html_url,
      archived: repoInfo.archived,
      fork: repoInfo.fork,
    },
    results: [],
    errors: [],
  };

  if (skipArchived && repoInfo.archived) return base;
  if (skipForks && repoInfo.fork) return base;

  const paths = await findFiles(
    owner,
    repo,
    repoInfo.default_branch,
    MATCHERS,
    auth,
  );

  for (const path of paths) {
    try {
      const content = await getFileContent(
        owner,
        repo,
        repoInfo.default_branch,
        path,
      );
      if (!content) continue;
      const result = parseAny(content, path, `github:${owner}/${repo}/${path}`);
      if (!result) continue;

      // Enrich with repo metadata where the parsed card doesn't already have it
      if (!result.card.homepage && repoInfo.homepage) {
        result.card.homepage = repoInfo.homepage;
      }
      if (!result.card.githubUrl) {
        result.card.githubUrl = repoInfo.html_url;
      }
      if (!result.card.license && repoInfo.license?.spdx_id) {
        result.card.license = repoInfo.license.spdx_id;
      }

      base.results.push(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      base.errors.push({ path, error: message });
    }
  }

  return base;
}
