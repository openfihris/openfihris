import chalk from "chalk";
import ora from "ora";
import { apiJson } from "../utils/api.js";
import {
  error,
  header,
  keyValue,
  typeBadge,
  categoryLabel,
  formatNumber,
} from "../utils/format.js";

interface AgentDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  category: string;
  version: string;
  tags: string[];
  frameworks: string[];
  endpoint: string | null;
  license: string | null;
  githubUrl: string | null;
  homepage: string | null;
  upvotes: number;
  downvotes: number;
  downloads: number;
  healthStatus: string;
  createdAt: string;
}

/**
 * fihris info <slug> — Show detailed information about an agent.
 * Slug format: @username/agent-name
 */
export async function infoCommand(slug: string): Promise<void> {
  // Normalize: allow "username/name" without the @
  if (!slug.startsWith("@")) {
    slug = `@${slug}`;
  }

  const spinner = ora("Fetching agent details...").start();

  try {
    const data = await apiJson<{ agent: AgentDetail }>(
      `/api/v1/agents/${slug}`,
    );
    const agent = data.agent;

    spinner.stop();

    header(agent.name);
    console.log(
      `  ${chalk.dim(agent.slug)} ${typeBadge(agent.type)} ${categoryLabel(agent.category)}`,
    );
    console.log();
    console.log(`  ${agent.description}`);
    console.log();

    keyValue("Version", agent.version ?? "0.1.0");
    keyValue(
      "Frameworks",
      agent.frameworks?.length > 0 ? agent.frameworks.join(", ") : "any",
    );
    keyValue("Tags", agent.tags?.length > 0 ? agent.tags.join(", ") : "none");
    if (agent.license) keyValue("License", agent.license);
    if (agent.endpoint) keyValue("Endpoint", agent.endpoint);
    if (agent.githubUrl) keyValue("GitHub", agent.githubUrl);
    if (agent.homepage) keyValue("Homepage", agent.homepage);

    console.log();
    keyValue("Upvotes", formatNumber(agent.upvotes ?? 0));
    keyValue("Downloads", formatNumber(agent.downloads ?? 0));
    keyValue("Health", agent.healthStatus ?? "unknown");
    keyValue(
      "Published",
      agent.createdAt
        ? new Date(agent.createdAt).toLocaleDateString()
        : "unknown",
    );

    console.log();
  } catch (err) {
    spinner.stop();
    error(err instanceof Error ? err.message : "Failed to fetch agent details");
  }
}
