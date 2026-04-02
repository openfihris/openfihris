# @openfihris/api

The OpenFihris REST API server, built with [Hono](https://hono.dev/) and deployed to Cloudflare Workers.

## Endpoints

See the [API Reference](../../docs/api-reference/) for full documentation.

**Public (no auth):**
- `GET /api/v1/agents/search` — semantic + keyword search
- `GET /api/v1/agents/:slug` — agent details
- `GET /api/v1/categories` — list categories
- `GET /api/v1/trending` — top agents

**Authenticated (GitHub OAuth):**
- `POST /api/v1/agents` — publish agent
- `POST /api/v1/agents/:slug/vote` — upvote/downvote
- `POST /api/v1/auth/github` — login

**A2A Discovery:**
- `GET /.well-known/agent.json` — OpenFihris Agent Card
- `POST /a2a` — A2A message handler

## Development

```bash
pnpm --filter @openfihris/api dev
```
