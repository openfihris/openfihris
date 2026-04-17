import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { API_BASE, GITHUB_URL } from "../lib/api";

export const metadata: Metadata = {
  title: "Documentation | OpenFihris",
  description:
    "Get started with OpenFihris: install the CLI, search the registry, publish agents, and integrate the API into your workflow.",
};

const cliCommands = [
  {
    cmd: "fihris login",
    desc: "Authenticate with GitHub via device flow.",
  },
  {
    cmd: "fihris search <query>",
    desc: "Search the registry by name, description, or tags.",
  },
  {
    cmd: "fihris info @user/agent",
    desc: "Show detailed metadata for a specific agent.",
  },
  {
    cmd: "fihris install @user/agent",
    desc: "Download an agent into your local project.",
  },
  {
    cmd: "fihris publish",
    desc: "Publish an agent from agent-card.json in your current directory.",
  },
  {
    cmd: "fihris whoami",
    desc: "Show the currently logged-in user.",
  },
  {
    cmd: "fihris logout",
    desc: "Clear stored credentials.",
  },
];

const apiEndpoints = [
  {
    method: "GET",
    path: "/health",
    desc: "Service health check.",
  },
  {
    method: "GET",
    path: "/api/v1/categories",
    desc: "List all supported categories.",
  },
  {
    method: "GET",
    path: "/api/v1/trending",
    desc: "Top agents ranked by downloads and upvotes.",
  },
  {
    method: "GET",
    path: "/api/v1/agents/search?q=<query>",
    desc: "Keyword search with optional category/framework/type filters.",
  },
  {
    method: "GET",
    path: "/api/v1/agents/@:username/:name",
    desc: "Get a single agent's metadata.",
  },
  {
    method: "POST",
    path: "/api/v1/agents",
    desc: "Publish a new agent (auth required, 50/day limit).",
  },
  {
    method: "POST",
    path: "/api/v1/agents/@:username/:name/download",
    desc: "Track a download (public, IP rate-limited).",
  },
  {
    method: "POST",
    path: "/api/v1/agents/@:username/:name/vote",
    desc: "Upvote or downvote an agent (auth required).",
  },
  {
    method: "POST",
    path: "/api/v1/agents/@:username/:name/report",
    desc: "Flag an agent for malware, spam, or abuse (auth required).",
  },
  {
    method: "POST",
    path: "/api/v1/auth/github",
    desc: "Exchange a GitHub OAuth code for an OpenFihris JWT.",
  },
  {
    method: "GET",
    path: "/api/v1/creators/:username",
    desc: "Get a creator profile.",
  },
  {
    method: "GET",
    path: "/api/v1/me",
    desc: "Get your own profile and agents (auth required).",
  },
];

export default function DocsPage() {
  return (
    <>
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <Nav />

      <main className="relative z-10 pt-32 pb-24">
        <section className="max-w-5xl mx-auto px-6">
          <div className="mb-12">
            <div className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
              Documentation
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Get started with OpenFihris
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl">
              Install the CLI, explore the registry, and publish your own
              agents in under five minutes.
            </p>
          </div>

          {/* Quick start */}
          <section id="quickstart" className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Quick start</h2>
            <div className="bg-[#060e20] rounded-2xl p-6 border border-white/10 mono-text text-sm space-y-2">
              <Line prompt>
                <span className="text-secondary font-bold">fihris</span> login
              </Line>
              <Line muted># Opens a browser for GitHub device-code auth</Line>
              <Line prompt>
                <span className="text-secondary font-bold">fihris</span> search{" "}
                <span className="text-primary">&quot;code review&quot;</span>
              </Line>
              <Line prompt>
                <span className="text-secondary font-bold">fihris</span> install{" "}
                <span className="text-primary">@alice/code-reviewer</span>
              </Line>
              <Line muted>
                # Agent card downloaded to ./agents/code-reviewer/
              </Line>
            </div>
          </section>

          {/* CLI commands */}
          <section id="cli" className="mb-16">
            <h2 className="text-2xl font-bold mb-6">CLI commands</h2>
            {/* Desktop: table. Mobile: stacked cards. */}
            <div className="hidden md:block border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low/60">
                  <tr className="text-left text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                    <th className="px-6 py-4 font-medium">Command</th>
                    <th className="px-6 py-4 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {cliCommands.map((c) => (
                    <tr
                      key={c.cmd}
                      className="border-t border-white/5 hover:bg-surface-container-low/30"
                    >
                      <td className="px-6 py-4">
                        <code className="mono-text text-primary">{c.cmd}</code>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">
                        {c.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-3">
              {cliCommands.map((c) => (
                <div
                  key={c.cmd}
                  className="bg-surface-container-low/60 border border-white/5 rounded-xl p-4"
                >
                  <code className="mono-text text-primary text-sm block mb-2 break-all">
                    {c.cmd}
                  </code>
                  <p className="text-on-surface-variant text-sm">{c.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-on-surface-variant/70">
              The CLI is built but not yet published to npm. For now, clone
              the repo and run <code className="mono-text text-primary">pnpm install</code> in
              <code className="mono-text text-primary"> packages/cli/</code>.
            </p>
          </section>

          {/* API */}
          <section id="api" className="mb-16">
            <h2 className="text-2xl font-bold mb-2">REST API</h2>
            <p className="text-on-surface-variant mb-6">
              Base URL:{" "}
              <a
                href={API_BASE}
                target="_blank"
                rel="noopener noreferrer"
                className="mono-text text-primary hover:underline"
              >
                {API_BASE}
              </a>
            </p>
            <div className="space-y-2">
              {apiEndpoints.map((e) => (
                <div
                  key={`${e.method}-${e.path}`}
                  className="bg-surface-container-low/60 border border-white/5 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 border ${
                        e.method === "GET"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-tertiary/10 text-tertiary border-tertiary/20"
                      }`}
                    >
                      {e.method}
                    </span>
                    <code className="mono-text text-xs sm:text-sm text-on-surface break-all flex-1 min-w-0">
                      {e.path}
                    </code>
                  </div>
                  <p className="text-on-surface-variant text-xs sm:text-sm">
                    {e.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Agent Card schema */}
          <section id="schema" className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Agent Card schema</h2>
            <p className="text-on-surface-variant mb-4">
              An agent card is a JSON document with the following required
              fields:
            </p>
            <pre className="bg-[#060e20] rounded-2xl p-6 border border-white/10 mono-text text-sm overflow-x-auto">
              <code>{`{
  "schemaVersion": "1.0",
  "name": "Code Reviewer",
  "description": "Reviews pull requests for security issues, style violations, and logic bugs. Supports TypeScript, Python, and Go.",
  "version": "1.0.0",
  "author": "alice",
  "license": "MIT",
  "category": "Development",
  "type": "skill",
  "frameworks": ["claude-code"],
  "tags": ["code-review", "security", "lint"],
  "homepage": "https://github.com/alice/code-reviewer",
  "githubUrl": "https://github.com/alice/code-reviewer"
}`}</code>
            </pre>
            <p className="mt-4 text-sm text-on-surface-variant/70">
              Full schema with all optional fields:{" "}
              <a
                href={`${GITHUB_URL}/blob/main/packages/shared/src/validation.ts`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                validation.ts
              </a>
            </p>
          </section>

          {/* More resources */}
          <section id="more">
            <h2 className="text-2xl font-bold mb-6">Learn more</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <DocLink
                href={`${GITHUB_URL}/blob/main/ARCHITECTURE.md`}
                icon="architecture"
                title="Architecture"
                desc="System design and trade-offs"
              />
              <DocLink
                href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`}
                icon="handshake"
                title="Contributing"
                desc="Open a PR or submit an agent"
              />
              <DocLink
                href={`${GITHUB_URL}/blob/main/ROADMAP.md`}
                icon="map"
                title="Roadmap"
                desc="What's shipped and what's next"
              />
            </div>
          </section>

          <div className="mt-16 text-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-container transition-colors"
            >
              Browse the registry
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Line({
  children,
  prompt,
  muted,
}: {
  children: React.ReactNode;
  prompt?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 ${muted ? "text-on-surface-variant/50" : "text-on-surface"}`}
    >
      {prompt && <span className="text-primary-fixed-dim select-none">$</span>}
      <span>{children}</span>
    </div>
  );
}

function DocLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-panel rounded-2xl p-6 hover:border-primary/30 transition-colors group"
    >
      <span
        className="material-symbols-outlined text-2xl text-primary mb-3 block"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="font-bold group-hover:text-primary transition-colors">
        {title}
      </div>
      <div className="text-xs text-on-surface-variant mt-1">{desc}</div>
    </a>
  );
}
