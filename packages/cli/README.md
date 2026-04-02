# fihris

The CLI for [OpenFihris](https://openfihris.dev) — search, install, and publish AI agents from your terminal.

## Install

```bash
npm install -g fihris
```

## Usage

```bash
fihris login                          # GitHub OAuth
fihris search "code review security"  # semantic search
fihris install @user/my-skill         # download to local framework
fihris publish --github user/repo     # publish from GitHub
fihris info my-agent                  # agent details
fihris validate ./agent-card.json     # validate locally
```

## Development

```bash
pnpm --filter fihris build
pnpm --filter fihris link
fihris search "hello"
```
