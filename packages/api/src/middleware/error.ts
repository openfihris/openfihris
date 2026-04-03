import type { Context } from "hono";
import type { ApiError } from "@openfihris/shared";

const ERROR_STATUS_MAP: Record<string, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export function errorResponse(
  c: Context,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  const status = ERROR_STATUS_MAP[code] ?? 500;
  const body: ApiError = {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  return c.json(body, status as any);
}

export function notFoundHandler(c: Context) {
  return errorResponse(c, "NOT_FOUND", "The requested resource was not found");
}

export function globalErrorHandler(err: Error, c: Context) {
  console.error("Unhandled error:", err);
  return errorResponse(c, "INTERNAL_ERROR", "An unexpected error occurred");
}
