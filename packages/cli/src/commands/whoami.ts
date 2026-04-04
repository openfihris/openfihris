import chalk from "chalk";
import { getToken, getUsername } from "../utils/config.js";
import { error, info } from "../utils/format.js";

/**
 * fihris whoami — Show the currently logged-in user.
 */
export async function whoamiCommand(): Promise<void> {
  const token = getToken();
  if (!token) {
    error("Not logged in. Run 'fihris login' to authenticate.");
    return;
  }

  const username = getUsername();
  if (username) {
    console.log(chalk.bold(`Logged in as ${chalk.green(`@${username}`)}`));
  } else {
    info("Logged in but username is unknown. Try logging in again.");
  }
}
