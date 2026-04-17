#!/usr/bin/env node
/**
 * Ingestion CLI.
 *
 * Usage:
 *   node dist/cli.js repo <owner>/<repo>                      # crawl one repo
 *   node dist/cli.js awesome <owner>/<repo> [--limit=N]       # crawl an awesome-list
 *
 * Options (after the positional args):
 *   --token=<token>   GitHub token (or set GITHUB_TOKEN env)
 *   --concurrency=N   Default 4
 *   --json            Print results as JSON (default: human-readable summary)
 *
 * This is a dry-run tool — it does NOT write to the database. Results are
 * printed; a later PR will add `--publish` to push them via the API.
 */
import { crawlRepo } from "./crawlers/github-repo.js";
import { crawlAwesomeList } from "./crawlers/awesome-list.js";
import type { CrawlResult } from "./crawlers/github-repo.js";

type ParsedArgs = {
  command: string;
  positional: string[];
  flags: Record<string, string | boolean>;
};

function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[0] ?? "";
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (const arg of argv.slice(1)) {
    if (arg.startsWith("--")) {
      const [k, v] = arg.slice(2).split("=");
      flags[k] = v ?? true;
    } else {
      positional.push(arg);
    }
  }
  return { command, positional, flags };
}

function summarize(results: CrawlResult[]): void {
  let totalAgents = 0;
  let totalErrors = 0;
  for (const r of results) {
    totalAgents += r.results.length;
    totalErrors += r.errors.length;
  }
  console.log(`\n=== Crawl Summary ===`);
  console.log(`Repos scanned:  ${results.length}`);
  console.log(`Agents found:   ${totalAgents}`);
  console.log(`Errors:         ${totalErrors}`);
  if (totalAgents > 0) {
    console.log(`\n=== Agents ===`);
    for (const r of results) {
      for (const parseResult of r.results) {
        const { card } = parseResult;
        console.log(
          `  [${parseResult.sourceFormat}] ${card.name} — ${r.repo.owner}/${r.repo.name}`,
        );
      }
    }
  }
  if (totalErrors > 0) {
    console.log(`\n=== Errors ===`);
    for (const r of results) {
      for (const e of r.errors) {
        console.log(`  ${r.repo.owner}/${r.repo.name}/${e.path}: ${e.error}`);
      }
    }
  }
}

async function main() {
  const { command, positional, flags } = parseArgs(process.argv.slice(2));
  const token =
    (typeof flags.token === "string" ? flags.token : undefined) ??
    process.env.GITHUB_TOKEN;
  const concurrency =
    typeof flags.concurrency === "string"
      ? Math.max(1, Number(flags.concurrency))
      : 4;
  const limit =
    typeof flags.limit === "string" ? Number(flags.limit) : undefined;
  const asJson = flags.json === true;

  if (command === "repo") {
    const spec = positional[0];
    if (!spec) {
      console.error("Usage: ingest repo <owner>/<repo>");
      process.exit(1);
    }
    const result = await crawlRepo(spec, { auth: { token } });
    if (asJson) console.log(JSON.stringify([result], null, 2));
    else summarize([result]);
    return;
  }

  if (command === "awesome") {
    const spec = positional[0];
    if (!spec) {
      console.error("Usage: ingest awesome <owner>/<repo> [--limit=N]");
      process.exit(1);
    }
    const results = await crawlAwesomeList(spec, {
      auth: { token },
      concurrency,
      maxRepos: limit,
    });
    if (asJson) console.log(JSON.stringify(results, null, 2));
    else summarize(results);
    return;
  }

  console.error(
    "Usage:\n" +
      "  ingest repo <owner>/<repo>\n" +
      "  ingest awesome <owner>/<repo> [--limit=N]\n" +
      "\nFlags: --token=<x> --concurrency=N --json",
  );
  process.exit(1);
}

main().catch((err) => {
  console.error("Ingestion error:", err);
  process.exit(1);
});
