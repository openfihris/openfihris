import type { Context, Next } from "hono";
import { verifyJwt } from "../services/auth.js";
import { errorResponse } from "./error.js";

/**
 * Middleware that requires a valid JWT.
 * Sets c.set("creatorId") and c.set("username") on success.
 */
export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return errorResponse(
      c,
      "UNAUTHORIZED",
      "Missing or invalid Authorization header",
    );
  }

  const token = header.slice(7);
  try {
    const payload = await verifyJwt(token, c.env.JWT_SECRET);
    c.set("creatorId", payload.sub);
    c.set("username", payload.username);
    await next();
  } catch {
    return errorResponse(c, "UNAUTHORIZED", "Invalid or expired token");
  }
}
