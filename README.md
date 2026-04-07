<p align="center">
  <h1 align="center">OpenFihris</h1>
  <p align="center">
    <strong>The open index for AI agents.</strong><br>
    Discover, install, and publish agents, skills, and prompts — like npm, but for AI agents.
  </p>
  <p align="center">
    <em>فهرس (fihris) — Arabic for "index, catalog, directory"</em>
  </p>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://openfihris-api.vercel.app/health"><img src="https://img.shields.io/badge/API-Live-brightgreen.svg" alt="API Status"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-22+-green.svg" alt="Node.js"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
  <a href="https://github.com/openfihris/openfihris/stargazers"><img src="https://img.shields.io/github/stars/openfihris/openfihris?style=social" alt="GitHub Stars"></a>
</p>

---

## The Problem

AI agents are everywhere — but there's no central place to find them. Skills are scattered across GitHub repos, awesome-lists, and framework-specific registries. If you need an agent that reviews code for security vulnerabilities, one that generates B2B leads in Arabic, or one built specifically for the pharmaceutical industry — good luck finding it. OpenFihris is a plug-and-play, community-driven registry for all AI agents, skills, and more.

**OpenFihris fixes this.**

## What is OpenFihris?

OpenFihris is a **community-driven registry** where developers publish, discover, and install AI agents and skills. It works with any framework — Claude Code, OpenClaw, LangChain, CrewAI, Google ADK, or any [A2A](https://github.com/google/A2A)-compatible agent.

> OpenFihris never runs your code. It indexes metadata, ranks by quality, and points callers directly to the agent. Think of it as the **yellow pages for AI agents**.

## Quick Start

```bash
# Search for agents by what they DO, not just keywords
fihris search "code review for security vulnerabilities"

# Install a skill into your local framework
fihris install @trailofbits/security-audit

# Publish your own agent to the registry
fihris login
fihris publish
```

> **Note:** The CLI is built but not yet published to npm. See the [Roadmap](#roadmap) for current status.

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

## Why OpenFihris?

| Feature | Description |
|---------|-------------|
| **Framework-agnostic** | Works with Claude Code, OpenClaw, LangChain, CrewAI, Google ADK, and any A2A client |
| **Semantic search** | Find agents by what they *do* — "handle Stripe billing" finds billing agents even without the word "Stripe" in the name |
| **Community-driven** | Upvote, review, and curate the best agents |
| **A2A-compatible** | Agents can discover other agents at runtime via standard protocol |
| **Near-zero cost** | Runs on free tiers — metadata only, never executes agent code |
| **Open source** | MIT licensed. Free forever. |

## How It Works

```
Developer                    OpenFihris                    User / Agent
─────────                    ──────────                    ────────────
Builds agent            ──>  Indexes metadata         <──  Searches by capability
Publishes Agent Card    ──>  Ranks by quality + trust <──  Installs locally or
Hosts on their server        Routes to agent directly      calls remote agent
                             ────────────────────
                             Never runs code
                             Never hosts files
                             Just metadata + search
```

**The A2A protocol defines how agents talk. OpenFihris defines how they find each other.**

## What You Can Publish

| Type | What it is | Example |
|------|-----------|---------|
| **Skills** | SKILL.md files that run locally in your framework | Code review, lead generation, data analysis |
| **Remote Agents** | A2A-compatible agents hosted on your server | Translation API, email outreach service |
| **Prompt Agents** | System prompts any LLM can use as a persona | Security auditor, Arabic writing coach |
| **Agent Teams** | Bundles of agents that chain together | Full sales pipeline, CI/CD automation |

## Project Structure

```
packages/
  api/        — REST API (Hono + Drizzle + Neon PostgreSQL)
  cli/        — Command-line tool
  shared/     — Types, schemas, constants
  ingestion/  — Format parsers and auto-ingestion pipeline
  web/        — Landing page (Next.js)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full technical design.

## Development

```bash
# Prerequisites: Node.js 22+, pnpm 9+

# Clone and install
git clone https://github.com/openfihris/openfihris.git
cd openfihris
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Format code
pnpm format
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor guide.

## Roadmap

| Phase | What | Status |
|-------|------|--------|
| 1 | Registry Core — API, auth, search, deploy to Vercel | **Done** |
| 2 | CLI tool (`fihris search`, `install`, `publish`, `info`) | **Done** |
| 3 | Community features — votes, downloads, reports | **Done** |
| 4 | Documentation & website | **In Progress** |
| 5 | A2A discovery endpoint + auto-ingestion | Planned |
| 6 | Framework plugins (OpenClaw, Claude Code, Python SDK) | Planned |
| 7 | Public launch | Planned |

See [ROADMAP.md](ROADMAP.md) for details on each phase.

## Contributing

We welcome contributions from everyone. There are two ways to contribute:

### Submit an Agent, Skill, or Prompt

Built something useful? Share it with the community.

1. **Write a clear description** — OpenFihris uses semantic search, so describe what your agent *does* and what *scenarios* it handles, not just what it's called. The more specific, the better it ranks.
2. **Check for duplicates** — search the registry first. If a similar agent exists, consider whether yours serves a different use case, language, tone, or audience.
3. **Include real examples** — show what inputs your agent takes and what it returns. This helps users and improves search accuracy.
4. **Tag it well** — add the category, framework, and relevant tags so people can filter to it.
5. **Publish** — `fihris publish` or open a PR to add it to the registry.

### Improve the Platform

- **Bug fixes** and code improvements
- **New format parsers** for auto-ingestion (SKILL.md, Agent Cards, etc.)
- **Framework integrations** (OpenClaw, Claude Code, LangChain, Cursor)
- **Documentation** improvements
- **Ideas** — open a [Discussion](https://github.com/openfihris/openfihris/discussions)

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

## Community

- [GitHub Issues](https://github.com/openfihris/openfihris/issues) — report bugs, request features
- [GitHub Discussions](https://github.com/openfihris/openfihris/discussions) — ask questions, propose ideas, share what you're building

## License

MIT — see [LICENSE](LICENSE)

---

<p align="center">
  <sub>Built with the belief that AI agents should be easy to find, easy to share, and free for everyone.</sub>
</p>
