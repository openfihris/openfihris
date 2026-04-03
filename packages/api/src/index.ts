import { Hono } from "hono";
import { cors } from "hono/cors";
import { health } from "./routes/health.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/error.js";

export type Env = {
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
  };
};

const app = new Hono<Env>();

// Global middleware
app.use("*", cors());

// Routes
app.route("/", health);

// Error handling
app.notFound(notFoundHandler);
app.onError(globalErrorHandler);

export default app;
