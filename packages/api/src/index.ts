import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { health } from "./routes/health.js";
import { auth } from "./routes/auth.js";
import { agentsRouter } from "./routes/agents.js";
import { creatorsRouter } from "./routes/creators.js";
import { meRouter } from "./routes/me.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/error.js";

export type Env = {
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
  };
  Variables: {
    creatorId: string;
    username: string;
  };
};

const app = new Hono<Env>();

// Populate env bindings from process.env (for Vercel/Node environments)
// On Cloudflare Workers, c.env is already populated by the runtime.
app.use("*", async (c, next) => {
  if (!c.env?.DATABASE_URL && typeof process !== "undefined") {
    c.env = {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      JWT_SECRET: process.env.JWT_SECRET ?? "",
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? "",
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? "",
    };
  }
  await next();
});

// Global middleware
app.use("*", cors());
app.use("*", bodyLimit({ maxSize: 100 * 1024 })); // 100KB max request body

// Root route – API directory
app.get("/", (c) =>
  c.json({
    name: "OpenFihris API",
    version: "0.1.0",
    description: "Open registry for AI agents, skills, and prompts",
    docs: "https://github.com/openfihris/openfihris",
    endpoints: {
      health: "/health",
      search: "/api/v1/agents/search?q=<query>",
      trending: "/api/v1/trending",
      categories: "/api/v1/categories",
      agent: "/api/v1/agents/@:username/:name",
      auth: "/api/v1/auth/github",
    },
  }),
);

// Routes
app.route("/", health);
app.route("/", auth);
app.route("/", agentsRouter);
app.route("/", creatorsRouter);
app.route("/", meRouter);

// Error handling
app.notFound(notFoundHandler);
app.onError(globalErrorHandler);

export default app;
