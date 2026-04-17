/**
 * OpenFihris ingestion package.
 *
 * Exposes:
 * - Parsers (SKILL.md, A2A Agent Card JSON, LobeChat JSON)
 * - GitHub client (`github.ts`)
 * - Crawlers:
 *     - crawlRepo(spec) — one GitHub repo
 *     - crawlAwesomeList(listSpec) — every repo linked from an awesome-list README
 *
 * Run the CLI for ad-hoc crawls:
 *   pnpm --filter @openfihris/ingestion build
 *   node packages/ingestion/dist/cli.js repo cline/awesome-agents
 *   node packages/ingestion/dist/cli.js awesome cline/awesome-agents --limit=10
 *
 * Designed to run on a weekly cron (GitHub Actions) once hooked up to the API.
 */

export {
  parseAny,
  parsers,
  skillMdParser,
  a2aAgentCardParser,
  lobechatJsonParser,
} from "./parsers/index.js";

export type { ParseResult, Parser } from "./parsers/index.js";

export {
  GitHubError,
  getRepo,
  getTree,
  getFileContent,
  findFiles,
  parseRepo,
} from "./github.js";
export type { GitHubAuth, Repo, TreeItem } from "./github.js";

export { crawlRepo } from "./crawlers/github-repo.js";
export type { CrawlOptions, CrawlResult } from "./crawlers/github-repo.js";

export {
  crawlAwesomeList,
  fetchAwesomeListRepos,
  extractRepoLinks,
} from "./crawlers/awesome-list.js";
export type { AwesomeListOptions } from "./crawlers/awesome-list.js";
