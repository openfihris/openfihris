# fihris

[![npm version](https://img.shields.io/npm/v/fihris.svg)](https://www.npmjs.com/package/fihris)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The CLI for [OpenFihris](https://github.com/openfihris/openfihris) — the open registry for AI agents, skills, and prompts.

## Install

```bash
npm install -g fihris
# or
npx fihris <command>
```

Requires Node 18 or newer.

## Quick start

```bash
# Authenticate via GitHub device flow (opens browser)
fihris login

# Search the registry
fihris search "code review"

# See details for an agent
fihris info @alice/code-reviewer

# Install an agent into your current project
fihris install @alice/code-reviewer

# Publish your own agent
fihris publish
```

## Commands

| Command | Description |
|---------|-------------|
| `fihris login` | Authenticate with GitHub via device flow |
| `fihris logout` | Clear stored credentials |
| `fihris whoami` | Show the current user |
| `fihris search <query>` | Search the registry |
| `fihris info <slug>` | Show agent details |
| `fihris install <slug>` | Download an agent into the current project |
| `fihris publish` | Publish an agent from `agent-card.json` |

## Configuration

By default the CLI talks to the live API at `https://openfihris-api.vercel.app`. To use a self-hosted instance or local dev:

```bash
# Currently via direct config edit (~/.config/fihris-nodejs/config.json).
# A `fihris config set api <url>` command is planned.
```

## Links

- 📖 [Documentation](https://github.com/openfihris/openfihris#readme)
- 🗺️ [Roadmap](https://github.com/openfihris/openfihris/blob/main/ROADMAP.md)
- 🐛 [Issues](https://github.com/openfihris/openfihris/issues)
- 💬 [Discussions](https://github.com/openfihris/openfihris/discussions)

## License

MIT — see [LICENSE](../../LICENSE)
