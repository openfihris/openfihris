# Roadmap

> OpenFihris development roadmap. Updated as phases are completed.

## Vision

OpenFihris becomes the default place developers go to find AI agents — the way npm is for packages, or Docker Hub is for containers. Any framework, any protocol, one search.

## Current Status: Phase 1

---

### Phase 1 — Registry Core + Auto-Ingestion `IN PROGRESS`

The foundation: a searchable API backed by PostgreSQL + pgvector, pre-populated with 18,000+ agents from existing open-source registries.

- [ ] PostgreSQL + pgvector database on Neon.tech
- [ ] REST API: register, search, get agent (Hono on Cloudflare Workers)
- [ ] Format parsers: SKILL.md, prompt markdown, LobeChat JSON, A2A Agent Card
- [ ] GitHub crawler for awesome-* repos
- [ ] Semantic + keyword combined search
- [ ] GitHub OAuth login
- [ ] Initial ingestion: 18,000+ agents from existing sources

**Goal:** A working search API with real data. Not an empty registry.

---

### Phase 2 — CLI Tool `PLANNED`

The primary interface for developers.

- [ ] `fihris login` — GitHub OAuth device flow
- [ ] `fihris search` — formatted terminal output with semantic matching
- [ ] `fihris install` — download skills to local framework (auto-detect Claude Code, OpenClaw, etc.)
- [ ] `fihris publish` — publish from GitHub repo or inline
- [ ] `fihris validate` — check agent card locally before publishing
- [ ] Publish to npm as `fihris`

**Goal:** Developers can search, install, and publish from the terminal.

---

### Phase 3 — Documentation & Website `PLANNED`

- [ ] VitePress docs site: getting started, publishing guide, API reference, CLI reference
- [ ] Landing page explaining OpenFihris
- [ ] Deploy to GitHub Pages (free)

**Goal:** Anyone can learn how to use OpenFihris without reading source code.

---

### Phase 4 — Community Features `PLANNED`

Trust and quality signals.

- [ ] Upvote/downvote system
- [ ] Download counter
- [ ] Health check worker (ping remote agents every 24h)
- [ ] Report/flag system with auto-hide threshold
- [ ] Trust score calculation (GitHub reputation + community votes + uptime)
- [ ] Verified Publisher and Official badges

**Goal:** Community can curate quality. Bad agents get flagged, good agents rise.

---

### Phase 5 — A2A Discovery Endpoint `PLANNED`

OpenFihris becomes an A2A agent itself.

- [ ] Expose `/.well-known/agent.json` for OpenFihris
- [ ] Implement `message/send` handler that runs search and returns Agent Cards
- [ ] A2A conformance validation in health checks
- [ ] Test with A2A Python SDK and Google ADK

**Goal:** Any A2A agent from any framework can discover agents via standard protocol. No custom SDK needed.

---

### Phase 6 — Framework Plugins `PLANNED`

Integrations so frameworks can search OpenFihris natively.

- [ ] OpenClaw plugin (TypeScript — registers `fihris_search` + `fihris_call` tools)
- [ ] Claude Code skill (SKILL.md)
- [ ] Python SDK (`pip install openfihris`) — works with LangChain, CrewAI, Google ADK

**Goal:** OpenClaw, Claude Code, and Python frameworks can search the registry without the CLI.

---

### Phase 7 — Public Launch `PLANNED`

- [ ] Seed with 20-30 high-quality agents
- [ ] Record demo video showing real usage
- [ ] Post to HackerNews, Reddit (r/LocalLLaMA, r/artificial), and framework-specific communities
- [ ] Submit to A2A project as a community registry implementation

**Goal:** First public users. Feedback loop begins.

---

## Beyond v1

Ideas being considered (not committed):

- Web-based search interface
- JavaScript SDK
- Cursor / Windsurf integrations
- Agent marketplace with paid agents
- Organization accounts and team management
- Webhook notifications for publishers

---

## Want to Help?

Pick any unchecked item above and open a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started.
