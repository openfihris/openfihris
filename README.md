# OpenFihris

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Status](https://img.shields.io/badge/API-Live-brightgreen)](https://openfihris-api.vercel.app/health)

**The open registry for AI agents, skills, and prompts.**

OpenFihris is like npm, but for AI agents. Search, install, and publish agents across every framework — Claude Code, LangChain, CrewAI, Google ADK, and more. Fully open source, metadata-only, and framework-agnostic.

## Quick Start

```bash
# Search for agents
npx fihris search "code review"

# Install an agent
npx fihris install @alice/code-reviewer

# Publish your own
npx fihris publish
```

## API

Live at [`https://openfihris-api.vercel.app`](https://openfihris-api.vercel.app)

```bash
# Search agents
curl "https://openfihris-api.vercel.app/api/v1/agents/search?q=code+review"

# Trending agents
curl "https://openfihris-api.vercel.app/api/v1/trending"

# Health check
curl "https://openfihris-api.vercel.app/health"
```

## Supported Frameworks

Claude Code · OpenClaw · LangChain · CrewAI · Google ADK · AutoGen · Cursor

## Project Structure

```
packages/
  api/        — REST API (Hono + Drizzle + Neon PostgreSQL)
  cli/        — Command-line tool
  shared/     — Types, schemas, constants
  ingestion/  — Format parsers and auto-ingestion pipeline
  web/        — Landing page (Next.js)
```

## Development

```bash
git clone https://github.com/openfihris/openfihris.git
cd openfihris
pnpm install
pnpm build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Pick any unchecked item from the [ROADMAP](ROADMAP.md) and open a PR.

## License

[MIT](LICENSE)
