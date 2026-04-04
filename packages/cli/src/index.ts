import { Command } from "commander";
import { CATEGORIES, AGENT_TYPES, FRAMEWORKS } from "@openfihris/shared";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { whoamiCommand } from "./commands/whoami.js";
import { searchCommand } from "./commands/search.js";
import { infoCommand } from "./commands/info.js";
import { installCommand } from "./commands/install.js";
import { publishCommand } from "./commands/publish.js";

const program = new Command();

program
  .name("fihris")
  .description("CLI for OpenFihris — search, install, and publish AI agents")
  .version("0.1.0");

// ─── Auth ────────────────────────────────────────────────────────────────────

program
  .command("login")
  .description("Authenticate with GitHub")
  .action(loginCommand);

program
  .command("logout")
  .description("Clear stored authentication")
  .action(logoutCommand);

program
  .command("whoami")
  .description("Show the currently logged-in user")
  .action(whoamiCommand);

// ─── Discovery ───────────────────────────────────────────────────────────────

program
  .command("search <query>")
  .description("Search the registry for AI agents")
  .option(
    "-c, --category <category>",
    `Filter by category (${CATEGORIES.slice(0, 3).join(", ")}...)`,
  )
  .option("-t, --type <type>", `Filter by type (${AGENT_TYPES.join(", ")})`)
  .option(
    "-f, --framework <framework>",
    `Filter by framework (${FRAMEWORKS.slice(0, 3).join(", ")}...)`,
  )
  .option("-l, --limit <number>", "Max results to return", "20")
  .action(searchCommand);

program
  .command("info <slug>")
  .description("Show detailed information about an agent (e.g. @user/agent)")
  .action(infoCommand);

// ─── Agent Management ────────────────────────────────────────────────────────

program
  .command("install <slug>")
  .description("Install an agent skill/prompt to your project")
  .action(installCommand);

program
  .command("publish")
  .description("Publish an agent to the OpenFihris registry")
  .action(publishCommand);

export default program;
