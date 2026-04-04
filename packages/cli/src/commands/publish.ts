import chalk from "chalk";
import ora from "ora";
import { readFile, access } from "fs/promises";
import { resolve } from "path";
import { getToken } from "../utils/config.js";
import { apiJson } from "../utils/api.js";
import { error, success, info, header, keyValue } from "../utils/format.js";

interface PublishResponse {
  agent: {
    id: string;
    name: string;
    slug: string;
    description: string;
    type: string;
    category: string;
  };
}

/**
 * fihris publish — Publish an agent to the OpenFihris registry.
 *
 * Reads agent-card.json from the current directory (or specified path)
 * and publishes it to the registry. Requires authentication.
 */
export async function publishCommand(options: {
  file?: string;
}): Promise<void> {
  // Check auth
  const token = getToken();
  if (!token) {
    error("Not logged in. Run 'fihris login' first.");
    return;
  }

  // Find the agent card file
  const filePath = resolve(options.file ?? "agent-card.json");

  try {
    await access(filePath);
  } catch {
    error(`Agent card not found at: ${filePath}`);
    info("Create an agent-card.json file in your project directory.");
    info("See: https://github.com/openfihris/openfihris#publishing");
    return;
  }

  const spinner = ora("Reading agent card...").start();

  try {
    // Read and parse the agent card
    const raw = await readFile(filePath, "utf-8");
    let agentCard: Record<string, unknown>;
    try {
      agentCard = JSON.parse(raw);
    } catch {
      spinner.stop();
      error("Invalid JSON in agent card file.");
      return;
    }

    // Publish to the registry
    spinner.text = "Publishing to OpenFihris...";

    const data = await apiJson<PublishResponse>("/api/v1/agents", {
      method: "POST",
      body: JSON.stringify({ agentCard }),
    });

    spinner.stop();

    const agent = data.agent;
    console.log();
    header("Published successfully!");
    keyValue("Name", agent.name);
    keyValue("Slug", agent.slug);
    keyValue("Type", agent.type);
    keyValue("Category", agent.category);
    console.log();
    success(`Your agent is now live at ${chalk.cyan(agent.slug)}`);
    info(
      "Others can now find it with: fihris search " +
        chalk.dim(`"${agent.name}"`),
    );
  } catch (err) {
    spinner.stop();
    error(err instanceof Error ? err.message : "Publish failed");
  }
}
