# OpenFihris

> The open index for AI agents. Discover, install, and publish agents, skills, and prompts — like npm, but for AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## What is OpenFihris?

**OpenFihris** (فهرس — Arabic for "index") is a community-driven registry where developers publish, discover, and install AI agents and skills. It works with any framework — OpenClaw, Claude Code, LangChain, CrewAI, Google ADK, or any A2A-compatible agent.

OpenFihris never runs your code. It indexes metadata, ranks by quality, and points callers directly to the agent. Think of it as the yellow pages for AI agents.

## Quick Start

```bash
# Install the CLI
npm install -g fihris

# Search for agents by capability
fihris search "code review security"

# Install a skill into your framework
fihris install @trailofbits/security-audit

# Publish your own agent
fihris login
fihris publish --github your-username/your-repo/my-skill
```

## Why OpenFihris?

- **18,000+ agents indexed** from existing open-source registries on day one
- **Framework-agnostic** — works with OpenClaw, Claude Code, LangChain, CrewAI, and any A2A client
- **Semantic search** — find agents by what they *do*, not just keywords
- **Community-driven** — upvote, review, and curate the best agents
- **A2A-compatible** — agents can discover other agents at runtime via standard protocol
- **Free and open source** — MIT licensed, self-funded, runs at near-zero cost

## How It Works

```
1. BUILD    an agent, skill, or prompt in your own environment
2. PUBLISH  it to OpenFihris with `fihris publish`
3. DISCOVER any agent can search the registry by capability
4. INSTALL  download skills locally or call remote agents directly
```

OpenFihris stores metadata only. Agent code lives on your GitHub, runs on your infrastructure. The registry is just an index.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Developer   │────>│  OpenFihris  │<────│    User      │
│  publishes   │     │  indexes &   │     │  searches &  │
│  agent card  │     │  ranks       │     │  installs    │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    Never runs code
                    Never hosts files
                    Just metadata + search
```

## What You Can Publish

| Type | Description | Example |
|------|-------------|---------|
| **Skills** | SKILL.md files that run locally in your framework | Code review, lead generation, data analysis |
| **Remote Agents** | A2A-compatible agents hosted on your server | API testing service, translation agent |
| **Prompt Agents** | System prompts that any LLM can use as a persona | Security auditor, writing coach |
| **Agent Teams** | Groups of agents that chain together for a workflow | Full sales pipeline, CI/CD automation |

## Project Structure

This is a monorepo managed with pnpm workspaces:

```
packages/
  api/        — Hono REST API (Cloudflare Workers)
  cli/        — fihris CLI tool (npm)
  shared/     — Shared types, validation, and constants
  ingestion/  — Auto-ingestion scripts for crawling existing registries
```

## Development

```bash
# Prerequisites: Node.js 22+, pnpm 9+

# Clone and install
git clone https://github.com/openfihris/openfihris.git
cd openfihris
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your values (see .env.example for details)

# Build all packages
pnpm build

# Run tests
pnpm test

# Format code
pnpm format
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Whether it's bug fixes, new format parsers, framework integrations, or documentation — every contribution helps.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full development plan.

## Community

- [GitHub Issues](https://github.com/openfihris/openfihris/issues) — report bugs, request features
- [GitHub Discussions](https://github.com/openfihris/openfihris/discussions) — ask questions, share ideas

## License

MIT — see [LICENSE](LICENSE)
