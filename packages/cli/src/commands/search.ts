import chalk from "chalk";
import ora from "ora";
import { apiJson } from "../utils/api.js";
import {
  error,
  header,
  truncate,
  formatNumber,
  typeBadge,
  categoryLabel,
} from "../utils/format.js";

interface SearchAgent {
  agent: {
    name: string;
    slug: string;
    description: string;
    type: string;
    category: string;
    upvotes: number;
    downloads: number;
    frameworks: string[];
  };
  creator: {
    username: string;
    isVerified: boolean;
  };
  score: number;
}

interface SearchResponse {
  results: SearchAgent[];
  cursor: string | null;
  total: number;
}

interface SearchOptions {
  category?: string;
  type?: string;
  framework?: string;
  limit?: string;
}

/**
 * fihris search <query> — Search the registry for agents.
 */
export async function searchCommand(
  query: string,
  options: SearchOptions,
): Promise<void> {
  const spinner = ora("Searching the registry...").start();

  try {
    const params = new URLSearchParams({ q: query });
    if (options.category) params.set("category", options.category);
    if (options.type) params.set("type", options.type);
    if (options.framework) params.set("framework", options.framework);
    if (options.limit) params.set("limit", options.limit);

    const data = await apiJson<SearchResponse>(
      `/api/v1/agents/search?${params.toString()}`,
    );

    spinner.stop();

    if (data.results.length === 0) {
      console.log(chalk.yellow("No agents found matching your query."));
      return;
    }

    header(`Found ${formatNumber(data.total)} agents`);

    for (const { agent, creator } of data.results) {
      console.log();
      console.log(
        `  ${chalk.bold(agent.slug)} ${typeBadge(agent.type)} ${categoryLabel(agent.category)}`,
      );
      console.log(`  ${chalk.dim(truncate(agent.description, 80))}`);
      console.log(
        `  ${chalk.dim("by")} ${creator.username}${creator.isVerified ? chalk.green(" ✓") : ""}  ${chalk.dim("↑")} ${agent.upvotes}  ${chalk.dim("↓")} ${formatNumber(agent.downloads)}`,
      );
    }

    if (data.cursor) {
      console.log();
      console.log(
        chalk.dim(`  Showing ${data.results.length} of ${data.total} results.`),
      );
    }

    console.log();
  } catch (err) {
    spinner.stop();
    error(err instanceof Error ? err.message : "Search failed");
  }
}
