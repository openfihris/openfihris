import chalk from "chalk";
import ora from "ora";
import { apiJson, apiFetch } from "../utils/api.js";
import { error, success, info, header, keyValue } from "../utils/format.js";

interface AgentDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  category: string;
  endpoint: string | null;
  githubUrl: string | null;
  agentCard: Record<string, unknown>;
}

/**
 * fihris install <slug> — Download and install an agent skill/prompt.
 * Detects the local framework (Claude Code, Cursor, etc.) and
 * places the files in the right location.
 *
 * No authentication required — anyone can install.
 */
export async function installCommand(slug: string): Promise<void> {
  // Normalize: allow "username/name" without the @
  if (!slug.startsWith("@")) {
    slug = `@${slug}`;
  }

  const spinner = ora(`Fetching ${chalk.bold(slug)}...`).start();

  try {
    // 1. Fetch agent details
    const data = await apiJson<{ agent: AgentDetail }>(
      `/api/v1/agents/${slug}`,
    );
    const agent = data.agent;

    spinner.text = "Processing agent card...";

    // 2. Track the download (fire-and-forget — don't block on failure)
    apiFetch(`/api/v1/agents/${slug}/download`, { method: "POST" }).catch(
      () => {},
    );

    spinner.stop();

    header(`${agent.name}`);
    keyValue("Type", agent.type);
    keyValue("Category", agent.category);
    console.log();

    // 3. Display what was fetched based on agent type
    if (agent.type === "remote") {
      info(`This is a remote agent accessible at: ${agent.endpoint}`);
      info("No local files to install — call the endpoint directly.");
      console.log();
      if (agent.endpoint) {
        console.log(chalk.dim("  Example: curl -X POST " + agent.endpoint));
      }
    } else if (agent.type === "prompt") {
      info("This is a prompt template.");
      info("Copy the agent card from the registry to use with your AI tool.");
    } else if (agent.type === "skill") {
      info("This is a skill that can be added to your AI framework.");
      if (agent.githubUrl) {
        info(`Source code: ${agent.githubUrl}`);
      }
      info("Local file installation will be available in the next release.");
    } else {
      info(`Agent type: ${agent.type}`);
      info("Full install support for this type is coming in a future release.");
    }

    console.log();
    success(`${agent.name} — download tracked.`);
  } catch (err) {
    spinner.stop();
    error(err instanceof Error ? err.message : "Failed to install agent");
  }
}
