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

/**
 * POST /api/v1/auth/github
 * Receives a GitHub OAuth code, exchanges it for an access token,
 * fetches the user profile, creates/updates the creator, and returns a JWT.
 */
auth.post("/api/v1/auth/github", async (c) => {
  const body = await c.req.json<{ code?: string }>();
  if (!body.code) {
    return errorResponse(
      c,
      "VALIDATION_ERROR",
      "Missing 'code' in request body",
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
    const message =
      err instanceof Error ? err.message : "Authentication failed";
    return errorResponse(c, "UNAUTHORIZED", message);
  }
});

export { auth };
