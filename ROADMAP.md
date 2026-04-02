# Roadmap

This is the public development roadmap for OpenFihris.

## Phase 1 — Registry Core + Auto-Ingestion

- [ ] PostgreSQL + pgvector database on Neon.tech
- [ ] REST API: register, search, get agent (Hono on Cloudflare Workers)
- [ ] Format parsers: SKILL.md, prompt markdown, LobeChat JSON, A2A Agent Card
- [ ] GitHub crawler for awesome-* repos
- [ ] Semantic + keyword combined search
- [ ] GitHub OAuth login
- [ ] Initial ingestion: 18,000+ agents from existing sources

## Phase 2 — CLI Tool

- [ ] `fihris login` (GitHub OAuth device flow)
- [ ] `fihris publish` (fetch card, validate, register)
- [ ] `fihris search` (formatted terminal output)
- [ ] `fihris install` (download skills to local framework)
- [ ] Publish to npm as `fihris`

## Phase 3 — Documentation & Website

- [ ] VitePress docs site: getting started, publishing guide, API reference
- [ ] Landing page
- [ ] Deploy to GitHub Pages

## Phase 4 — Community Features

- [ ] Upvote/downvote system
- [ ] Download counter
- [ ] Health check worker
- [ ] Report/flag system
- [ ] Trust score calculation

## Phase 5 — A2A Discovery Endpoint

- [ ] Expose OpenFihris as an A2A agent
- [ ] Implement `message/send` handler for search
- [ ] A2A conformance validation in health checks

## Phase 6 — Framework Plugins

- [ ] OpenClaw plugin
- [ ] Claude Code skill
- [ ] Python SDK (LangChain, CrewAI, Google ADK)

## Phase 7 — Launch

- [ ] Seed with quality agents
- [ ] Demo video
- [ ] Post to HackerNews, Reddit, Discord communities
