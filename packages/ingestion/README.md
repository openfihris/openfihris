# @openfihris/ingestion

Auto-ingestion pipeline for crawling and indexing existing AI agent registries into OpenFihris.

## Sources

| Source | Type | Format |
|--------|------|--------|
| ClawHub | Skills | SKILL.md |
| awesome-claude-skills | Skills | SKILL.md |
| awesome-chatgpt-prompts | Prompts | Markdown |
| lobe-chat-agents | Personas | JSON |
| A2A registries | Remote agents | Agent Card JSON |

## How It Works

1. **Crawl** — fetch repo file trees via GitHub API
2. **Parse** — extract metadata per format
3. **Normalize** — convert to OpenFihris Agent Card
4. **Embed** — generate vector embedding for search
5. **Upsert** — insert/update in PostgreSQL

## Running

```bash
# Via GitHub Actions (weekly cron)
# Or manually:
pnpm --filter @openfihris/ingestion ingest
```
