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

// Global middleware
app.use("*", cors());
app.use("*", bodyLimit({ maxSize: 100 * 1024 })); // 100KB max request body

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
