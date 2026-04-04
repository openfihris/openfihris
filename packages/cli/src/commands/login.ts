import chalk from "chalk";
import ora from "ora";
import { getToken, setToken, setUsername, getApiUrl } from "../utils/config.js";
import { error, success, info } from "../utils/format.js";
import { apiJson } from "../utils/api.js";

// GitHub OAuth App Client ID for the CLI (device flow)
// This is NOT secret — it's embedded in every CLI install, same as GitHub CLI does.
const GITHUB_CLIENT_ID = "Ov23liMdFfhJlBVNxVPn";

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface TokenPollResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
}

/**
 * fihris login — Authenticate with GitHub using device flow.
 *
 * 1. Request a device code from GitHub
 * 2. User opens browser and enters the code
 * 3. CLI polls GitHub until approved
 * 4. Exchange GitHub access token for an OpenFihris JWT
 */
export async function loginCommand(): Promise<void> {
  const existing = getToken();
  if (existing) {
    info("You are already logged in. Use 'fihris logout' to sign out first.");
    return;
  }

  try {
    // Step 1: Request device code
    const deviceRes = await fetch("https://github.com/login/device/code", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        scope: "read:user",
      }),
    });

    if (!deviceRes.ok) {
      error("Failed to start GitHub authentication. Please try again.");
      return;
    }

    const device = (await deviceRes.json()) as DeviceCodeResponse;

    // Step 2: Show the code and open browser
    console.log();
    console.log(chalk.bold("  Open this URL in your browser:"));
    console.log(`  ${chalk.cyan(device.verification_uri)}`);
    console.log();
    console.log(
      chalk.bold("  Enter this code:"),
      chalk.bgWhite.black.bold(` ${device.user_code} `),
    );
    console.log();

    // Try to open the browser automatically
    try {
      const { exec } = await import("child_process");
      const cmd =
        process.platform === "win32"
          ? `start ${device.verification_uri}`
          : process.platform === "darwin"
            ? `open ${device.verification_uri}`
            : `xdg-open ${device.verification_uri}`;
      exec(cmd);
    } catch {
      // If browser open fails, the user can open it manually
    }

    // Step 3: Poll GitHub for approval
    const spinner = ora(
      "Waiting for you to authorize in the browser...",
    ).start();
    const interval = (device.interval || 5) * 1000;
    const deadline = Date.now() + device.expires_in * 1000;

    let accessToken: string | null = null;

    while (Date.now() < deadline) {
      await sleep(interval);

      const pollRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            device_code: device.device_code,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          }),
        },
      );

      const poll = (await pollRes.json()) as TokenPollResponse;

      if (poll.access_token) {
        accessToken = poll.access_token;
        break;
      }

      if (poll.error === "authorization_pending") {
        continue; // Keep polling
      }

      if (poll.error === "slow_down") {
        await sleep(5000); // Back off
        continue;
      }

      if (poll.error === "expired_token") {
        spinner.stop();
        error("Authentication timed out. Please try again.");
        return;
      }

      if (poll.error === "access_denied") {
        spinner.stop();
        error("Authentication was denied. Please try again.");
        return;
      }

      // Unknown error
      spinner.stop();
      error(`GitHub error: ${poll.error_description || poll.error}`);
      return;
    }

    if (!accessToken) {
      spinner.stop();
      error("Authentication timed out. Please try again.");
      return;
    }

    // Step 4: Exchange GitHub token for OpenFihris JWT
    spinner.text = "Authenticating with OpenFihris...";

    const authData = await apiJson<AuthResponse>("/api/v1/auth/github/token", {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    });

    // Store the JWT and username
    setToken(authData.token);
    setUsername(authData.user.username);

    spinner.stop();
    console.log();
    success(
      `Logged in as ${chalk.bold(chalk.green(`@${authData.user.username}`))}`,
    );
  } catch (err) {
    error(err instanceof Error ? err.message : "Login failed");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
