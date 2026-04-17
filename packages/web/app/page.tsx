import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { SearchBar } from "./components/SearchBar";
import { AgentCard } from "./components/AgentCard";
import { API_BASE, GITHUB_URL, getTrending } from "./lib/api";

export const metadata: Metadata = {
  title: "OpenFihris | The Open Registry for AI Agents",
  description:
    "Search, install, and share AI agents across any framework. One unified CLI to integrate production-grade agentic capabilities. Free and open source.",
};

export default async function Home() {
  const agents = await getTrending(4);

  return (
    <>
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <Nav />

      <main className="relative z-10 pt-24">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] -z-10" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Live registry — free &amp; open source
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-b from-on-surface via-on-surface to-on-surface/40 leading-[1.05]">
            The Open Registry <br className="hidden md:block" />
            for AI Agents
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed">
            Search, install, and share AI agents across any framework. One
            unified CLI to integrate production-grade agentic capabilities.
          </p>

          <SearchBar />

          <div className="flex items-center justify-center gap-4 text-xs mono-text text-on-surface-variant/60 mb-12 flex-wrap">
            <span className="text-primary/60 font-bold uppercase tracking-tighter">
              Live Endpoints:
            </span>
            <a
              href={`${API_BASE}/api/v1/trending`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              /api/v1/trending
            </a>
            <span className="opacity-30">•</span>
            <a
              href={`${API_BASE}/api/v1/categories`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              /api/v1/categories
            </a>
            <span className="opacity-30">•</span>
            <a
              href={`${API_BASE}/health`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              /health
            </a>
          </div>

          <div className="flex items-center justify-center gap-3 px-4">
            <div className="bg-surface-container-high/50 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-outline-variant/20 flex items-center gap-3 sm:gap-6 hover:border-primary/30 transition-colors max-w-full">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span
                  className="text-primary-fixed-dim select-none shrink-0"
                  aria-hidden="true"
                >
                  $
                </span>
                <code className="mono-text text-primary text-xs sm:text-sm font-medium truncate">
                  fihris install @user/agent
                </code>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant shrink-0">
                CLI
              </span>
            </div>
          </div>
        </section>

        {/* Framework Strip */}
        <section className="py-10 md:py-12 border-y border-outline-variant/10 bg-surface-container-lowest/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 mb-8">
              Production Ready Framework Integration
            </p>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
              {[
                { name: "Claude Code", dot: "bg-primary" },
                { name: "LangChain", dot: "bg-primary" },
                { name: "CrewAI", dot: "bg-secondary" },
                { name: "AutoGen", dot: "bg-tertiary" },
                { name: "Cursor", dot: "bg-primary" },
                { name: "Google ADK", dot: "bg-secondary" },
                { name: "OpenClaw", dot: "bg-tertiary" },
              ].map((fw) => (
                <div
                  key={fw.name}
                  className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-all duration-500 cursor-default"
                >
                  <div className={`w-2 h-2 rounded-full ${fw.dot}`} />
                  <span className="mono-text font-medium text-on-surface">
                    {fw.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 md:py-32 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon="architecture"
                color="primary"
                title="Metadata-Only Architecture"
                body="We don't execute code. OpenFihris indexes agent metadata, schemas, and tool descriptors — your secrets and execution stay local."
              />
              <FeatureCard
                icon="hub"
                color="secondary"
                title="A2A Compatibility"
                body="Agent-to-Agent universal interface. Any agent in the registry can communicate with another, regardless of framework or underlying LLM."
              />
              <FeatureCard
                icon="verified"
                color="tertiary"
                title="Community Curation"
                body="Upvotes, download counts, and abuse reporting let the community curate quality. Bad agents get flagged; good ones rise to the top."
              />
            </div>
          </div>
        </section>

        {/* Terminal Demo */}
        <section className="py-24 md:py-32 relative">
          <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full max-w-4xl mx-auto h-[400px]" />
          <div className="max-w-4xl mx-auto px-6 relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                One command, any framework.
              </h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                The fihris CLI is framework-aware — it detects your project
                and installs agents in the right place.
              </p>
            </div>
            <div className="warp-terminal bg-[#060e20] rounded-xl overflow-hidden border border-white/10">
              <div className="bg-[#1c2333] px-5 py-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-sm text-on-surface-variant/40"
                      aria-hidden="true"
                    >
                      terminal
                    </span>
                    <span className="text-[11px] font-medium text-on-surface-variant/80 mono-text uppercase tracking-widest">
                      fihris-cli — zsh
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-8 mono-text text-xs sm:text-sm leading-relaxed min-h-[360px] bg-gradient-to-b from-[#0b1326] to-[#060e20] overflow-x-auto">
                <div className="flex gap-4 mb-4">
                  <span className="text-primary-fixed-dim">➜</span>
                  <span className="text-on-surface">
                    <span className="text-secondary font-bold">fihris</span>{" "}
                    search{" "}
                    <span className="text-primary">&quot;code review&quot;</span>
                  </span>
                </div>
                <div className="text-on-surface-variant/40 mb-4 flex items-center gap-3">
                  <span
                    className="text-primary text-[10px] material-symbols-outlined"
                    aria-hidden="true"
                  >
                    check_circle
                  </span>
                  Querying /api/v1/agents/search...
                </div>
                <div className="flex flex-col gap-1 mb-6 pl-4 border-l-2 border-primary/20">
                  <div className="flex gap-4">
                    <span className="text-primary font-bold">[3 found]</span>
                    <span className="text-on-surface">
                      Matching &quot;code review&quot;
                    </span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant/60">
                    @alice/code-reviewer ★ 42 &nbsp;@bob/pr-helper ★ 38
                    &nbsp;@charlie/lint ★ 21
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  <span className="text-primary-fixed-dim">➜</span>
                  <span className="text-on-surface">
                    <span className="text-secondary font-bold">fihris</span>{" "}
                    install{" "}
                    <span className="text-primary">@alice/code-reviewer</span>
                  </span>
                </div>
                <div className="text-on-surface-variant/80 mb-6">
                  Installed v1.2.0{" "}
                  <span className="text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20 font-bold ml-2">
                    MIT Verified
                  </span>
                </div>
                <div className="bg-surface-container-highest/30 rounded-lg p-5 border border-white/5 mb-6">
                  <div className="text-on-surface-variant font-bold mb-2 uppercase text-[10px] tracking-widest opacity-50">
                    Local Configuration
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] text-on-surface-variant/60 uppercase">
                        Framework
                      </span>
                      <span className="text-primary-fixed-dim font-medium">
                        claude-code
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-on-surface-variant/60 uppercase">
                        Category
                      </span>
                      <span className="text-primary-fixed-dim font-medium">
                        Development
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-primary-fixed-dim">➜</span>
                  <span className="text-on-surface italic">Agent ready.</span>
                  <div className="w-2 h-5 bg-primary/60 motion-safe:animate-pulse rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Agents */}
        <section
          id="agents"
          className="py-24 md:py-32 max-w-6xl mx-auto px-6 scroll-mt-24"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
                Curated Registry
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Top Rated Agents
              </h2>
              <p className="text-on-surface-variant max-w-lg">
                Live data from the OpenFihris registry. Upvoted and downloaded
                by the community.
              </p>
            </div>
            <Link
              href="/search"
              className="flex items-center gap-2 text-secondary font-bold text-sm hover:translate-x-1 transition-transform group"
            >
              View all agents
              <span
                className="material-symbols-outlined group-hover:text-primary transition-colors"
                aria-hidden="true"
              >
                arrow_right_alt
              </span>
            </Link>
          </div>

          {agents.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center">
              <p className="text-on-surface-variant mb-4">
                Loading agents from the registry...
              </p>
              <a
                href={`${API_BASE}/api/v1/trending`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-block"
              >
                View raw API response →
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {agents.map((item) => (
                <AgentCard key={item.agent.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="py-32 md:py-40 border-t border-outline-variant/15 relative">
          <div className="max-w-4xl mx-auto px-6 text-center relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -z-10" />

            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-[1.1]">
              Fully Open Source. <br />
              Built in the open.
            </h2>
            <p className="text-on-surface-variant text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              OpenFihris is MIT Licensed. A transparent, community-driven
              registry that empowers developers to build the next generation
              of autonomous systems.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                className="flex items-center gap-4 bg-[#24292f] hover:bg-[#1a1e22] transition-all px-8 py-5 rounded-xl border border-white/10 w-full sm:w-auto justify-center group shadow-2xl"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className="material-symbols-outlined text-2xl text-white"
                  aria-hidden="true"
                >
                  code
                </span>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-1">
                    GitHub
                  </span>
                  <span className="font-bold text-lg">View Source</span>
                </div>
              </a>
              <Link
                className="flex items-center gap-4 bg-surface-container-high hover:bg-surface-container-highest transition-all px-8 py-5 rounded-xl border border-outline-variant/20 w-full sm:w-auto justify-center group shadow-xl"
                href="/docs"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    menu_book
                  </span>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-1">
                    Documentation
                  </span>
                  <span className="font-bold text-lg">Read the Docs</span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function FeatureCard({
  icon,
  color,
  title,
  body,
}: {
  icon: string;
  color: "primary" | "secondary" | "tertiary";
  title: string;
  body: string;
}) {
  const colorClasses = {
    primary: {
      hover: "hover:border-primary/40",
      bg: "bg-primary/10",
      text: "text-primary",
      hoverBg: "group-hover:bg-primary",
      hoverText: "group-hover:text-on-primary",
    },
    secondary: {
      hover: "hover:border-secondary/40",
      bg: "bg-secondary/10",
      text: "text-secondary",
      hoverBg: "group-hover:bg-secondary",
      hoverText: "group-hover:text-on-secondary",
    },
    tertiary: {
      hover: "hover:border-tertiary/40",
      bg: "bg-tertiary/10",
      text: "text-tertiary",
      hoverBg: "group-hover:bg-tertiary",
      hoverText: "group-hover:text-on-tertiary",
    },
  }[color];

  return (
    <div
      className={`glass-panel p-8 rounded-2xl group ${colorClasses.hover} transition-all duration-500`}
    >
      <div
        className={`w-14 h-14 rounded-xl ${colorClasses.bg} flex items-center justify-center ${colorClasses.text} mb-8 group-hover:scale-110 ${colorClasses.hoverBg} ${colorClasses.hoverText} transition-all`}
      >
        <span className="material-symbols-outlined text-3xl" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-on-surface-variant leading-relaxed text-sm">{body}</p>
    </div>
  );
}
