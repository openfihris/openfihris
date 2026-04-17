# Publishing to npm

This monorepo publishes two public packages:

- **`fihris`** — the CLI (`packages/cli/`)
- **`@openfihris/shared`** — shared types + schemas (`packages/shared/`), used as a dependency of `fihris`

## One-time setup

1. **Claim the npm name** — check `npm view fihris` and `npm view @openfihris/shared`. Create the `openfihris` org on npm if needed.
2. **Create an npm automation token** — https://www.npmjs.com/settings/YOUR_USER/tokens. Use "Automation" type (bypasses 2FA in CI).
3. **Add it to GitHub** — repo Settings → Secrets → Actions → New secret:
   - Name: `NPM_TOKEN`
   - Value: the token from step 2

## Release flow

### Automated (preferred)

```bash
# Bump version in packages/cli/package.json and packages/shared/package.json
# Commit, then tag:
git tag cli-v0.1.0
git push origin cli-v0.1.0
```

The `publish-cli.yml` workflow will typecheck, test, build both packages, and publish them to npm with provenance.

To test the workflow without publishing, run it manually via GitHub Actions → "Publish CLI to npm" → "Run workflow" with `dry-run: true`.

### Manual (from your machine)

```bash
# From repo root
pnpm install
pnpm typecheck
pnpm test

# Build in order (CLI depends on shared)
pnpm --filter @openfihris/shared build
pnpm --filter fihris build

# Dry-run first to see what would be published
pnpm --filter @openfihris/shared publish --dry-run --access public
pnpm --filter fihris publish --dry-run --access public

# Real publish (will convert workspace:* to the actual version)
pnpm --filter @openfihris/shared publish --access public
pnpm --filter fihris publish --access public
```

## Version bumping

Both packages should move in lockstep for now. When `fihris` bumps, `@openfihris/shared` bumps too.

## What's included in the published tarball

Each package has an explicit `files` field in its `package.json`. Run `npm pack --dry-run` in a package dir to see exactly what would ship. In general:

- **`fihris`** ships `dist/`, `bin/`, `README.md`, `LICENSE`
- **`@openfihris/shared`** ships `dist/`, `src/` (for source maps), `README.md`, `LICENSE`

## Post-publish checks

```bash
# Install globally from npm and make sure it works
npm install -g fihris
fihris --version

# Install as a project dep
cd /tmp && mkdir test-fihris && cd test-fihris
npm init -y
npm install fihris
npx fihris search "hello"
```
