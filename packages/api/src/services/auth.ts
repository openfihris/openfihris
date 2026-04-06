import { SignJWT, jwtVerify } from "jose";
import { sql } from "drizzle-orm";
import { DEFAULTS } from "@openfihris/shared";
import type { Database } from "../db/index.js";
import { creators } from "../db/schema.js";

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  blog: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
}

/**
 * Fetch with retry logic for transient network failures.
 * Retries up to `maxRetries` times with exponential backoff.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 2,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10_000),
      });
      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      }
    }
  }

  throw new Error(
    `Network request failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
  );
}

/**
 * Exchange a GitHub OAuth code for an access token.
 */
export async function exchangeGitHubCode(
  code: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const res = await fetchWithRetry(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`GitHub OAuth request failed with status ${res.status}`);
  }

  const data = (await res.json()) as Record<string, string>;
  if (data.error) {
    throw new Error(
      `GitHub OAuth error: ${data.error_description || data.error}`,
    );
  }

  if (!data.access_token) {
    throw new Error("GitHub OAuth response missing access_token");
  }

  return data.access_token;
}

/**
 * Fetch the authenticated user's profile from GitHub.
 */
export async function fetchGitHubUser(
  accessToken: string,
): Promise<GitHubUser> {
  const res = await fetchWithRetry("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "OpenFihris",
    },
  });

  if (res.status === 401) {
    throw new Error("GitHub access token is invalid or expired");
  }

  if (res.status === 403) {
    throw new Error("GitHub API rate limit exceeded. Try again later.");
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const user = (await res.json()) as GitHubUser;

  if (!user.id || !user.login) {
    throw new Error("GitHub returned an invalid user profile");
  }

  return user;
}

/**
 * Create or update a creator record from GitHub profile data.
 * Uses ON CONFLICT to avoid race conditions with concurrent logins.
 * Returns the creator's internal UUID.
 */
export async function upsertCreator(
  db: Database,
  user: GitHubUser,
): Promise<string> {
  try {
    // Drizzle's insert type inference breaks in some TS/build configurations,
    // so we explicitly type the values and conflict-update set.
    const insertValues = {
      githubId: user.id,
      username: user.login,
      displayName: user.name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      githubCreatedAt: new Date(user.created_at),
      publicRepos: user.public_repos,
      followers: user.followers,
      githubUrl: user.html_url,
      website: user.blog,
    };

    const conflictSet = {
      username: sql`excluded.username`,
      displayName: sql`excluded.display_name`,
      avatarUrl: sql`excluded.avatar_url`,
      bio: sql`excluded.bio`,
      publicRepos: sql`excluded.public_repos`,
      followers: sql`excluded.followers`,
      githubUrl: sql`excluded.github_url`,
      website: sql`excluded.website`,
      updatedAt: sql`now()`,
    };

    const [result] = await db
      .insert(creators)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .values(insertValues as any)
      .onConflictDoUpdate({
        target: creators.githubId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: conflictSet as any,
      })
      .returning({ id: creators.id });

    return result.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to save creator profile: ${message}`);
  }
}

/**
 * Generate a JWT session token for a creator.
 */
export async function generateJwt(
  creatorId: string,
  username: string,
  jwtSecret: string,
): Promise<string> {
  const secret = new TextEncoder().encode(jwtSecret);
  return new SignJWT({ sub: creatorId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DEFAULTS.jwtExpiryDays}d`)
    .sign(secret);
}

/**
 * Verify and decode a JWT session token.
 * Returns the payload with sub (creatorId) and username.
 */
export async function verifyJwt(
  token: string,
  jwtSecret: string,
): Promise<{ sub: string; username: string }> {
  const secret = new TextEncoder().encode(jwtSecret);
  const { payload } = await jwtVerify(token, secret);

  if (!payload.sub || !payload.username) {
    throw new Error("Token is missing required claims");
  }

  return {
    sub: payload.sub as string,
    username: payload.username as string,
  };
}
