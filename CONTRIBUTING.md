# Contributing to OpenFihris

Thanks for your interest in contributing! There are two ways to help: **submit agents and skills** to the registry, or **improve the platform** itself.

---

## Submit an Agent, Skill, or Prompt

You don't need to write platform code to contribute. If you've built a useful AI agent, skill, or prompt — share it.

### Quality Guidelines

OpenFihris uses **semantic search**, which means your description is how people find you. Write it for humans and for search.

**Do this:**
> "Generates cold outreach emails for B2B SaaS companies. Takes a company name, target role, and value proposition as input. Outputs a personalized email sequence in a professional but conversational tone."

**Not this:**
> "Email agent"

### Before You Submit

1. **Search first** — check if a similar agent already exists. If it does, ask yourself: does yours serve a different use case, language, tone, or audience? If yes, submit it. If not, consider improving the existing one instead.
2. **Write a clear description** (minimum 50 characters) — explain what it does, what inputs it takes, what it returns, and what makes it different.
3. **Pick the right category** — choose from: Development, Security, Sales & Marketing, Research, Data, Customer Support, Productivity, DevOps, Finance, Writing, Design, Education, Communication, Infrastructure.
4. **Add relevant tags** — be specific. `b2b`, `cold-email`, `saas`, `outreach` is better than just `email`.
5. **Include examples** — show a real input and what the output looks like. This helps users decide and improves search ranking.
6. **Test it** — make sure your agent actually works before publishing.

### How to Submit

```bash
# Via CLI (once available)
fihris login
fihris publish --github your-username/your-repo/your-skill

# Or open a PR adding your agent card to the registry
```

---

## Improve the Platform

Want to work on the OpenFihris codebase? Here's how.

### Development Setup

1. **Fork** the repo on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/openfihris.git
   cd openfihris
   ```
3. **Install dependencies:**
   ```bash
   pnpm install
   ```
4. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```
5. **Create a branch:**
   ```bash
   git checkout -b feat/my-feature
   ```
6. **Make your changes**
7. **Run checks:**
   ```bash
   pnpm build
   pnpm test
   pnpm format:check
   ```
8. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add semantic search filtering"
   ```
9. **Push and open a PR**

### What We're Looking For

- Bug fixes and code improvements
- New format parsers for auto-ingestion (SKILL.md, Agent Cards, LobeChat JSON, etc.)
- Framework integration plugins (OpenClaw, Claude Code, LangChain, Cursor)
- Documentation improvements
- Test coverage for critical paths
- Performance improvements

### Code Style

- **TypeScript** for all code
- **Prettier** for formatting (`pnpm format`)
- **ESM** modules (no CommonJS)
- Keep functions small and focused
- Write tests for new features

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add semantic search filtering
fix: handle empty description in publish validation
docs: add quick start guide to README
chore: update dependencies
refactor: extract agent card parser
test: add search endpoint tests
```

### Pull Request Process

1. Keep PRs small and focused — one feature or fix per PR
2. Update `CHANGELOG.md` with your changes under `[Unreleased]`
3. Make sure all checks pass (build, test, format)
4. Write a clear PR description explaining **what** and **why**
5. Link any related issues

---

## Reporting Bugs

Use the [Bug Report template](https://github.com/openfihris/openfihris/issues/new?template=bug_report.md).

## Suggesting Features

Use the [Feature Request template](https://github.com/openfihris/openfihris/issues/new?template=feature_request.md) or start a [Discussion](https://github.com/openfihris/openfihris/discussions).

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be kind and respectful.

## Questions?

Open a [Discussion](https://github.com/openfihris/openfihris/discussions) — we're happy to help.
