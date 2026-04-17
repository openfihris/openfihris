import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { GITHUB_URL } from "../lib/api";

export const metadata: Metadata = {
  title: "About | OpenFihris",
  description:
    "OpenFihris is the open, framework-agnostic registry for AI agents, skills, and prompts. Metadata-only. MIT licensed. Built by the community.",
};

const principles = [
  {
    icon: "shield_locked",
    title: "Metadata only",
    body: "We never execute your agent code. OpenFihris indexes schemas, descriptions, and endpoints — execution stays local, secrets stay yours.",
  },
  {
    icon: "hub",
    title: "Framework-agnostic",
    body: "Works natively with Claude Code, LangChain, CrewAI, AutoGen, Cursor, Google ADK, and any A2A-compatible agent. One registry, every framework.",
  },
  {
    icon: "groups",
    title: "Community-curated",
    body: "Upvotes, downloads, and abuse reports surface the best agents. Trust scores combine GitHub reputation with community signals.",
  },
  {
    icon: "lock_open",
    title: "MIT licensed",
    body: "Source, schema, and infrastructure code all open. Fork it, self-host it, contribute back.",
  },
  {
    icon: "bolt",
    title: "Near-zero cost",
    body: "Runs on free tiers — Vercel + Neon PostgreSQL. Public API, no paywalls, no vendor lock-in.",
  },
  {
    icon: "verified",
    title: "A2A compatible",
    body: "Agents registered in OpenFihris speak the Agent-to-Agent protocol, so they can discover and call each other without custom glue.",
  },
];

const roadmap = [
  { phase: "1", title: "Registry Core", status: "Done" },
  { phase: "2", title: "CLI Tool", status: "Done" },
  { phase: "3", title: "Community Features", status: "Done" },
  { phase: "4", title: "Documentation & Website", status: "In Progress" },
  { phase: "5", title: "A2A Discovery + Auto-Ingestion", status: "Planned" },
  { phase: "6", title: "Framework Plugins", status: "Planned" },
  { phase: "7", title: "Public Launch", status: "Planned" },
];

export default function AboutPage() {
  return (
    <>
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <Nav />

      <main className="relative z-10 pt-32 pb-24">
        <section className="max-w-5xl mx-auto px-6">
          <div className="mb-16 text-center">
            <div className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
              About
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Solving the fragmentation <br />
              of agentic intelligence.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
              Agents are scattered across GitHub repos, awesome-lists, and
              framework-specific registries. OpenFihris brings them all under
              one roof — searchable, rankable, and trustable.
            </p>
            <p className="mt-6 mono-text text-sm text-on-surface-variant/60">
              فهرس (fihris) — Arabic for &quot;index, catalog, directory&quot;
            </p>
          </div>

          {/* Principles */}
          <section className="mb-24">
            <h2 className="text-2xl font-bold mb-8">Principles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {principles.map((p) => (
                <div
                  key={p.title}
                  className="glass-panel rounded-2xl p-6 hover:border-primary/30 transition-all"
                >
                  <span
                    className="material-symbols-outlined text-2xl text-primary mb-4 block"
                    aria-hidden="true"
                  >
                    {p.icon}
                  </span>
                  <h3 className="font-bold mb-2">{p.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Stack */}
          <section className="mb-24">
            <h2 className="text-2xl font-bold mb-8">Built on</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <StackBlock title="API">
                <StackLine label="Framework" value="Hono" />
                <StackLine label="Database" value="Neon PostgreSQL + pgvector" />
                <StackLine label="ORM" value="Drizzle" />
                <StackLine label="Runtime" value="Vercel (Node 22)" />
                <StackLine label="Auth" value="GitHub OAuth + JWT" />
              </StackBlock>
              <StackBlock title="Website">
                <StackLine label="Framework" value="Next.js 16 (App Router)" />
                <StackLine label="Styling" value="Tailwind CSS v4" />
                <StackLine label="Typography" value="Inter + Space Grotesk + JetBrains Mono" />
                <StackLine label="Runtime" value="Vercel Edge" />
                <StackLine label="Data" value="ISR from OpenFihris API" />
              </StackBlock>
              <StackBlock title="CLI">
                <StackLine label="Framework" value="Commander" />
                <StackLine label="Auth" value="GitHub device flow" />
                <StackLine label="Config" value="Conf (OS-native store)" />
              </StackBlock>
              <StackBlock title="Monorepo">
                <StackLine label="Workspace" value="pnpm" />
                <StackLine label="Type safety" value="TypeScript 5.7" />
                <StackLine label="Validation" value="Zod" />
                <StackLine label="Testing" value="Vitest" />
              </StackBlock>
            </div>
          </section>

          {/* Roadmap */}
          <section className="mb-24">
            <h2 className="text-2xl font-bold mb-8">Roadmap</h2>
            <div className="space-y-2">
              {roadmap.map((p) => (
                <div
                  key={p.phase}
                  className="bg-surface-container-low/60 border border-white/5 rounded-xl px-6 py-4 flex items-center gap-4"
                >
                  <span className="mono-text font-bold text-on-surface-variant/60 text-sm w-8">
                    P{p.phase}
                  </span>
                  <span className="font-semibold flex-1">{p.title}</span>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center bg-surface-container-low/60 border border-white/5 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">Help build the index.</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto mb-8">
              Every PR, every published agent, every issue makes OpenFihris
              better. No corporate gatekeepers — just developers building for
              developers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-container transition-colors"
              >
                Contribute on GitHub
              </a>
              <Link
                href="/docs"
                className="bg-surface-container-high hover:bg-surface-container-highest transition-colors px-6 py-3 rounded-lg font-semibold border border-white/5"
              >
                Read the docs
              </Link>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
}

function StackBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-low/60 border border-white/5 rounded-2xl p-6">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-4">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StackLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-on-surface-variant/70">{label}</span>
      <span className="mono-text text-on-surface">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Done: "bg-primary/10 text-primary border-primary/20",
    "In Progress": "bg-tertiary/10 text-tertiary border-tertiary/20",
    Planned: "bg-surface-container-high text-on-surface-variant border-white/5",
  };
  const cls = map[status] ?? map.Planned;
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${cls}`}
    >
      {status}
    </span>
  );
}
