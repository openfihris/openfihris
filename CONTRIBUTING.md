# Contributing to OpenFihris

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

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
   pnpm lint
   ```
8. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add semantic search filtering"
   ```
9. **Push and open a PR**

## What We're Looking For

- Bug fixes
- New format parsers for auto-ingestion (SKILL.md, Agent Cards, etc.)
- Framework integration plugins (OpenClaw, Claude Code, LangChain)
- Documentation improvements
- Test coverage for critical paths
- Performance improvements

## Code Style

- **TypeScript** for all code
- **Prettier** for formatting (runs via `pnpm format`)
- **ESM** modules (no CommonJS)
- Keep functions small and focused
- Write tests for new features

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add semantic search filtering
fix: handle empty description in publish validation
docs: add quick start guide to README
chore: update dependencies
refactor: extract agent card parser
test: add search endpoint tests
```

## Pull Request Process

1. Keep PRs small and focused — one feature or fix per PR
2. Update `CHANGELOG.md` with your changes under `[Unreleased]`
3. Make sure all checks pass (build, test, lint)
4. Write a clear PR description explaining **what** and **why**
5. Link any related issues

## Reporting Bugs

Use the [Bug Report template](https://github.com/openfihris/openfihris/issues/new?template=bug_report.md).

## Suggesting Features

Use the [Feature Request template](https://github.com/openfihris/openfihris/issues/new?template=feature_request.md) or start a [Discussion](https://github.com/openfihris/openfihris/discussions).

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be kind and respectful.

## Questions?

Open a [Discussion](https://github.com/openfihris/openfihris/discussions) — we're happy to help.
