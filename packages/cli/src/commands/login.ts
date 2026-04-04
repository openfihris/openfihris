import { error, info, success } from "../utils/format.js";
import { getToken } from "../utils/config.js";

/**
 * fihris login — Authenticate with GitHub via device flow.
 * Opens a browser for GitHub OAuth and stores the JWT token.
 */
export async function loginCommand(): Promise<void> {
  const existing = getToken();
  if (existing) {
    info("You are already logged in. Use 'fihris logout' to sign out first.");
    return;
  }

  // TODO: Implement GitHub device flow in PR feat/cli-auth
  error("Login not yet implemented. Coming in the next release.");
}
