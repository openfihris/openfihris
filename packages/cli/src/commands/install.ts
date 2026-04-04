import { error } from "../utils/format.js";

/**
 * fihris install <slug> — Download and install an agent skill/prompt.
 * Detects the local framework (Claude Code, Cursor, etc.) and
 * places the files in the right location.
 */
export async function installCommand(slug: string): Promise<void> {
  // TODO: Implement in PR feat/cli-install
  error(
    `Install not yet implemented. Agent: ${slug}. Coming in the next release.`,
  );
}
