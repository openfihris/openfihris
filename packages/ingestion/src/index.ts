// TODO: Auto-ingestion pipeline
//
// This package will contain:
// - Crawlers: one per source (ClawHub, awesome-lists, A2A registries)
// - Parsers: SKILL.md, prompt markdown, LobeChat JSON, Agent Card JSON
// - Normalizer: convert all formats to OpenFihris Agent Card
// - Embedder: generate vector embeddings for semantic search
// - Orchestrator: crawl -> parse -> normalize -> embed -> upsert
//
// Runs as a GitHub Action on a weekly cron schedule.
// See the architecture doc for full ingestion design.

export {};
