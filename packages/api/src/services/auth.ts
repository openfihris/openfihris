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
 * Exchange a GitHub OAuth code for an access token.
 */
export async function exchangeGitHubCode(
  code: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
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
  });

  const data = (await res.json()) as Record<string, string>;
  if (data.error) {
    throw new Error(
      `GitHub OAuth error: ${data.error_description || data.error}`,
    );
  }
  return data.access_token;
}

/**
 * Fetch the authenticated user's profile from GitHub.
 */
export async function fetchGitHubUser(
  accessToken: string,
): Promise<GitHubUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "OpenFihris",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return (await res.json()) as GitHubUser;
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
  const [result] = await db
    .insert(creators)
    .values({
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
    })
    .onConflictDoUpdate({
      target: creators.githubId,
      set: {
        username: sql`excluded.username`,
        displayName: sql`excluded.display_name`,
        avatarUrl: sql`excluded.avatar_url`,
        bio: sql`excluded.bio`,
        publicRepos: sql`excluded.public_repos`,
        followers: sql`excluded.followers`,
        githubUrl: sql`excluded.github_url`,
        website: sql`excluded.website`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: creators.id });

  return result.id;
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
  return {
    sub: payload.sub as string,
    username: payload.username as string,
  };
}
