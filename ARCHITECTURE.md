# Architecture

> Technical overview for contributors. For the full design document, see the project wiki.

## Core Principle

**OpenFihris never runs agent code.** It stores metadata, indexes capabilities, and routes callers to the agent's own endpoint. This is what keeps costs near zero.

```
What OpenFihris hosts:          What OpenFihris does NOT host:
─────────────────────           ──────────────────────────────
Agent Cards (JSON metadata)     Agent code execution
Search index (pgvector)         LLM inference
Creator profiles                User data
Ratings, downloads, upvotes     File storage for large assets
Health check results            Actual agent traffic
```

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     OpenFihris Platform                       │
│                                                              │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────────┐  │
│  │  Website   │  │ REST API  │  │  A2A Discovery Endpoint │  │
│  │ (VitePress │  │ (Hono /   │  │  /.well-known/          │  │
│  │  + GH Pages│  │  CF Workers│  │  agent.json             │  │
│  └─────┬─────┘  └─────┬─────┘  └────────────┬────────────┘  │
│        │               │                     │               │
│        └───────────────┼─────────────────────┘               │
│                        v                                     │
│               ┌────────────────┐                             │
│               │  Search Engine │                             │
│               │  pgvector +    │                             │
│               │  keyword       │                             │
│               └───────┬────────┘                             │
│                       v                                      │
│               ┌────────────────┐    ┌───────────────┐        │
│               │  PostgreSQL    │    │ Health Check   │        │
│               │  + pgvector    │    │ Worker (cron)  │        │
│               └────────────────┘    └───────────────┘        │
└──────────────────────────────────────────────────────────────┘
        ^                   ^                   ^
        |                   |                   |
   ┌────┴─────┐      ┌─────┴──────┐     ┌──────┴──────┐
   │ fihris   │      │ Framework  │     │ Any A2A     │
   │ CLI      │      │ Plugins    │     │ Client      │
   └──────────┘      └────────────┘     └─────────────┘
```

## Tech Stack

| Component | Technology | Reason |
|-----------|-----------|--------|
| API Server | [Hono](https://hono.dev/) on Cloudflare Workers | Fast, lightweight, free tier handles 100K req/day |
| Database | PostgreSQL + [pgvector](https://github.com/pgvector/pgvector) on [Neon.tech](https://neon.tech) | Semantic search without a separate vector DB |
| ORM | [Drizzle](https://orm.drizzle.team/) | TypeScript-native, zero runtime overhead, works with Neon serverless |
| CLI | Node.js + TypeScript | Universal, npm-installable |
| Auth | GitHub OAuth | No passwords, minimal PII, trust signals from GitHub profile |
| Search | pgvector (semantic) + ts_vector (keyword) | Combined ranking for intent + exact matches |
| Docs | [VitePress](https://vitepress.dev/) on GitHub Pages | Free, markdown-based |
| Testing | [Vitest](https://vitest.dev/) | Fast, TypeScript-native |
| Monorepo | pnpm workspaces | Simple, fast, industry standard |

## Package Layout

```
packages/
├── shared/       Shared types, Zod validation, constants
│                 Every other package imports from here
│
├── api/          Hono REST API server
│   └── src/
│       ├── routes/       Route handlers
│       ├── services/     Business logic
│       ├── db/           Drizzle schema + migrations
│       ├── a2a/          A2A protocol handler
│       └── middleware/   Auth, errors, logging
│
├── cli/          fihris CLI tool
│   └── src/
│       ├── commands/     One file per command
│       └── utils/        Framework detection, config, formatting
│
└── ingestion/    Auto-ingestion pipeline
    └── src/
        ├── crawlers/     One per source (ClawHub, awesome-lists, etc.)
        └── parsers/      Format parsers (SKILL.md, prompt, JSON, Agent Card)
```

## Database Schema (Key Tables)

- **creators** — GitHub identity, reputation signals (account age, repos, followers)
- **agents** — Name, description, type, category, tags, Agent Card JSON, pgvector embedding
- **agent_capabilities** — Individual capabilities with their own embeddings for granular search
- **teams** — Agent bundles with pipeline type (sequential/parallel)
- **votes** — One vote per user per agent
- **health_checks** — Periodic ping results for remote agents
- **reports** — Community flags (malware, spam, broken)

## Search Ranking

```
final_score = (0.50 x semantic_similarity)     # pgvector cosine distance
            + (0.20 x keyword_relevance)       # PostgreSQL ts_vector
            + (0.15 x community_score)         # upvotes, downloads
            + (0.10 x health_score)            # uptime, latency
            + (0.05 x recency)                 # newer = slight boost
```

## Auth Flow

All identity is GitHub OAuth. OpenFihris never stores passwords.

1. User runs `fihris login` or clicks "Login with GitHub"
2. GitHub OAuth (device flow for CLI, redirect for web)
3. OpenFihris stores: GitHub ID, username, avatar, bio, account age, repos, followers
4. Returns a JWT (7-day expiry)
5. All publish/vote/report endpoints require this JWT

## Trust Scoring

Every agent gets a trust score (0-100) based on:

| Factor | Weight | Source |
|--------|--------|--------|
| GitHub account age | 15% | GitHub API |
| GitHub public repos | 10% | GitHub API |
| Repo stars (if open source) | 15% | GitHub API |
| Open source code available | 10% | GitHub |
| Community votes | 15% | OpenFihris |
| Health uptime | 15% | Health checks |
| A2A conformance | 10% | Health checks |
| Report history | 5% (negative) | OpenFihris |

## Cost Model

| Scale | Monthly Cost |
|-------|-------------|
| Launch (1K agents, 1K daily users) | ~$1 |
| Growth (10K agents, 10K daily users) | ~$37 |
| Scale (100K agents, 100K daily users) | ~$160 |

The "never run code" constraint is why this stays cheap at any scale.

## Key Design Decisions

1. **Metadata only** — Never execute agent code. Never proxy traffic.
2. **GitHub as identity** — No custom auth system. Trust GitHub's infrastructure.
3. **pgvector for search** — One database for everything. No separate vector DB.
4. **Framework-agnostic** — Agent Card format works across all frameworks.
5. **Auto-ingestion** — Don't start empty. Index existing ecosystem on day one.
6. **A2A-compatible** — Follow the emerging standard, don't invent a new one.
