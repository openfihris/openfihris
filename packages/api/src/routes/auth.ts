import { Hono } from "hono";
import type { Env } from "../index.js";
import { createDb } from "../db/index.js";
import {
  exchangeGitHubCode,
  fetchGitHubUser,
  upsertCreator,
  generateJwt,
} from "../services/auth.js";
import { errorResponse } from "../middleware/error.js";

const auth = new Hono<Env>();

// Safe error messages to return to the client.
// Internal details (stack traces, DB errors) are logged but never exposed.
const SAFE_ERROR_PREFIXES = [
  "GitHub OAuth error:",
  "GitHub access token",
  "GitHub API rate limit",
  "GitHub returned an invalid",
];

function getSafeMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Authentication failed";
  const msg = err.message;
  if (SAFE_ERROR_PREFIXES.some((prefix) => msg.startsWith(prefix))) return msg;
  return "Authentication failed";
}

/**
 * POST /api/v1/auth/github
 * Receives a GitHub OAuth code, exchanges it for an access token,
 * fetches the user profile, creates/updates the creator, and returns a JWT.
 */
auth.post("/api/v1/auth/github", async (c) => {
  let body: { code?: string };
  try {
    body = await c.req.json<{ code?: string }>();
  } catch {
    return errorResponse(c, "VALIDATION_ERROR", "Invalid JSON in request body");
  }

  if (!body.code || typeof body.code !== "string") {
    return errorResponse(
      c,
      "VALIDATION_ERROR",
      "Missing or invalid 'code' in request body",
    );
  }

  try {
    const accessToken = await exchangeGitHubCode(
      body.code,
      c.env.GITHUB_CLIENT_ID,
      c.env.GITHUB_CLIENT_SECRET,
    );

    const githubUser = await fetchGitHubUser(accessToken);

    const db = createDb(c.env.DATABASE_URL);
    const creatorId = await upsertCreator(db, githubUser);

    const token = await generateJwt(
      creatorId,
      githubUser.login,
      c.env.JWT_SECRET,
    );

    return c.json({
      token,
      user: {
        id: creatorId,
        username: githubUser.login,
        displayName: githubUser.name,
        avatarUrl: githubUser.avatar_url,
      },
    });
  } catch (err) {
    console.error("Auth error:", err);
    return errorResponse(c, "UNAUTHORIZED", getSafeMessage(err));
  }
});

export { auth };
