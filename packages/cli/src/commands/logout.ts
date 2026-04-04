import { clearToken } from "../utils/config.js";
import { success } from "../utils/format.js";

/**
 * fihris logout — Clear stored authentication token.
 */
export async function logoutCommand(): Promise<void> {
  clearToken();
  success("Logged out successfully.");
}
