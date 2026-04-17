import { SearchBar } from "./components/SearchBar";

const API_BASE = "https://openfihris-api.vercel.app";
const GITHUB_URL = "https://github.com/openfihris/openfihris";

type TrendingAgent = {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  category: string;
  downloads: number;
  upvotes: number;
  frameworks: string[];
  version?: string;
  creator?: { username: string };
};

type TrendingResponseItem = {
  agent: Omit<TrendingAgent, "creator">;
  creator?: { username: string };
};

async function getTrendingAgents(): Promise<TrendingAgent[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/trending`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { agents?: TrendingResponseItem[] };
    const items = data.agents ?? [];
    return items.slice(0, 4).map((item) => ({
      ...item.agent,
      creator: item.creator,
    }));
  } catch {
    return [];
  }
}

type ColorKey = "primary" | "secondary" | "tertiary";

const FRAMEWORK_COLORS: Record<string, ColorKey> = {
  "claude-code": "tertiary",
  langchain: "primary",
  crewai: "secondary",
  autogen: "tertiary",
  cursor: "primary",
  openclaw: "secondary",
  "google-adk": "secondary",
  any: "primary",
};

const CARD_CLASSES: Record<
  ColorKey,
  {
    hoverBorder: string;
    iconText: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    hoverTitle: string;
  }
> = {
  primary: {
    hoverBorder: "hover:border-primary/40",
    iconText: "text-primary",
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
    badgeBorder: "border-primary/20",
    hoverTitle: "group-hover:text-primary",
  },
  secondary: {
    hoverBorder: "hover:border-secondary/40",
    iconText: "text-secondary",
    badgeBg: "bg-secondary/10",
    badgeText: "text-secondary",
    badgeBorder: "border-secondary/20",
    hoverTitle: "group-hover:text-secondary",
  },
  tertiary: {
    hoverBorder: "hover:border-tertiary/40",
    iconText: "text-tertiary",
    badgeBg: "bg-tertiary/10",
    badgeText: "text-tertiary",
    badgeBorder: "border-tertiary/20",
    hoverTitle: "group-hover:text-tertiary",
  },
};

function agentIcon(type: string) {
  switch (type) {
    case "skill":
      return "code_blocks";
    case "remote":
      return "hub";
    case "prompt":
      return "description";
    case "team":
      return "groups";
    default:
      return "code_blocks";
  }
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default async function Home() {
  const agents = await getTrendingAgents();

  return (
    <>
      {/* Grid Overlay */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#0b1326]/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex items-center gap-8 max-w-screen-2xl mx-auto w-full justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full inline-block" />
              OpenFihris
            </span>
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#agents"
                className="text-sm font-medium text-on-surface/70 hover:text-primary transition-colors duration-200"
              >
                Search
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-on-surface/70 hover:text-primary transition-colors duration-200"
              >
                Docs
              </a>
              <a
                href={`${GITHUB_URL}/tree/main/packages/cli`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-on-surface/70 hover:text-primary transition-colors duration-200"
              >
                CLI
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-on-surface/70 hover:text-primary transition-colors duration-200"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={API_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-cta text-on-primary text-sm font-semibold px-5 py-2 rounded-lg active:scale-95 transition-transform shadow-lg shadow-primary/20 inline-block"
            >
              Live API
            </a>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 py-24 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] -z-10" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Live registry — free &amp; open source
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-on-surface via-on-surface to-on-surface/40 leading-[1.1]">
            The Open Registry <br className="hidden md:block" />
            for AI Agents
          </h1>

          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
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

          <div className="flex items-center justify-center gap-3">
            <div className="bg-surface-container-high/50 backdrop-blur-sm px-6 py-4 rounded-xl border border-outline-variant/20 flex items-center gap-6 group hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-primary-fixed-dim select-none">$</span>
                <code className="mono-text text-primary text-sm font-medium">
                  fihris install @user/agent
                </code>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                CLI
              </span>
            </div>
          </div>
        </section>

        {/* Framework Integration Strip */}
        <section className="py-12 border-y border-outline-variant/10 bg-surface-container-lowest/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 mb-10">
              Production Ready Framework Integration
            </p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
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
        <section className="py-32 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-2xl group hover:border-primary/40 transition-all duration-500">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined text-3xl">
                    architecture
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4">
                  Metadata-Only Architecture
                </h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  We don&apos;t execute code. OpenFihris indexes agent
                  metadata, schemas, and tool descriptors — your secrets and
                  execution stay local.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-2xl group hover:border-secondary/40 transition-all duration-500">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-8 group-hover:scale-110 group-hover:bg-secondary group-hover:text-on-secondary transition-all">
                  <span className="material-symbols-outlined text-3xl">
                    hub
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4">A2A Compatibility</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  Agent-to-Agent universal interface. Any agent in the
                  registry can communicate with another, regardless of
                  framework or underlying LLM.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-2xl group hover:border-tertiary/40 transition-all duration-500">
                <div className="w-14 h-14 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-8 group-hover:scale-110 group-hover:bg-tertiary group-hover:text-on-tertiary transition-all">
                  <span className="material-symbols-outlined text-3xl">
                    verified
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4">Community Curation</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  Upvotes, download counts, and abuse reporting let the
                  community curate quality. Bad agents get flagged; good ones
                  rise to the top.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Terminal Demo */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full max-w-4xl mx-auto h-[400px]" />
          <div className="max-w-4xl mx-auto px-6 relative">
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
                    <span className="material-symbols-outlined text-sm text-on-surface-variant/40">
                      terminal
                    </span>
                    <span className="text-[11px] font-medium text-on-surface-variant/80 mono-text uppercase tracking-widest">
                      fihris-cli — zsh
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-8 mono-text text-sm leading-relaxed min-h-[360px] bg-gradient-to-b from-[#0b1326] to-[#060e20]">
                <div className="flex gap-4 mb-4">
                  <span className="text-primary-fixed-dim">➜</span>
                  <span className="text-on-surface">
                    <span className="text-secondary font-bold">fihris</span>{" "}
                    search <span className="text-primary">&quot;code review&quot;</span>
                  </span>
                </div>
                <div className="text-on-surface-variant/40 mb-4 flex items-center gap-3">
                  <span className="text-primary text-[10px] material-symbols-outlined">
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
                  <span className="text-on-surface italic">
                    Agent ready.
                  </span>
                  <div className="w-2 h-5 bg-primary/60 animate-pulse rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Agents */}
        <section
          id="agents"
          className="py-32 max-w-6xl mx-auto px-6 scroll-mt-24"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
                Curated Registry
              </div>
              <h2 className="text-4xl font-bold mb-3">Top Rated Agents</h2>
              <p className="text-on-surface-variant max-w-lg">
                Live data from the OpenFihris registry. Upvoted and downloaded
                by the community.
              </p>
            </div>
            <a
              href={`${API_BASE}/api/v1/trending`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-secondary font-bold text-sm hover:translate-x-1 transition-transform group"
            >
              View Full Registry
              <span className="material-symbols-outlined group-hover:text-primary transition-colors">
                arrow_right_alt
              </span>
            </a>
          </div>

          {agents.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center">
              <p className="text-on-surface-variant">
                Loading agents from the registry...
              </p>
              <a
                href={`${API_BASE}/api/v1/trending`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline mt-4 inline-block"
              >
                View raw API response →
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {agents.map((agent) => {
                const fw = agent.frameworks?.[0] ?? "any";
                const colorKey = FRAMEWORK_COLORS[fw] ?? "primary";
                const c = CARD_CLASSES[colorKey];
                return (
                  <div
                    key={agent.id}
                    className={`bg-surface-container-high/40 backdrop-blur-sm rounded-2xl p-6 border border-white/5 ${c.hoverBorder} transition-all group relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-primary text-sm">
                        open_in_new
                      </span>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div
                        className={`w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center ${c.iconText} group-hover:scale-110 transition-transform`}
                      >
                        <span className="material-symbols-outlined">
                          {agentIcon(agent.type)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-[10px] mono-text text-on-surface-variant font-bold">
                          <span className="material-symbols-outlined text-xs text-secondary">
                            download
                          </span>
                          {formatNumber(agent.downloads)}
                        </div>
                        <span
                          className={`${c.badgeBg} ${c.badgeText} text-[8px] font-bold px-2 py-0.5 rounded uppercase border ${c.badgeBorder}`}
                        >
                          {fw}
                        </span>
                      </div>
                    </div>
                    <h4
                      className={`text-lg font-bold mb-2 ${c.hoverTitle} transition-colors truncate`}
                    >
                      {agent.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant mb-8 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {agent.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold bg-surface-container-highest/60 px-2.5 py-1.5 rounded-lg border border-white/5">
                        <span className="material-symbols-outlined text-[10px]">
                          thumb_up
                        </span>
                        {agent.upvotes}
                      </div>
                      <span className="text-[10px] font-bold text-on-surface-variant/40 mono-text">
                        {agent.version ?? "v0.1.0"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="py-40 border-t border-outline-variant/15 relative">
          <div className="max-w-4xl mx-auto px-6 text-center relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -z-10" />

            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-[1.2]">
              Fully Open Source. <br />
              Built in the open.
            </h2>
            <p className="text-on-surface-variant text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              OpenFihris is MIT Licensed. A transparent, community-driven
              registry that empowers developers to build the next generation
              of autonomous systems.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                className="flex items-center gap-4 bg-[#24292f] hover:bg-[#1a1e22] transition-all px-8 py-5 rounded-xl border border-white/10 w-full sm:w-auto justify-center group shadow-2xl"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-2xl text-white">
                  code
                </span>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-1">
                    GitHub
                  </span>
                  <span className="font-bold text-lg">View Source</span>
                </div>
              </a>
              <a
                className="flex items-center gap-4 bg-surface-container-high hover:bg-surface-container-highest transition-all px-8 py-5 rounded-xl border border-outline-variant/20 w-full sm:w-auto justify-center group shadow-xl"
                href={API_BASE}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined">api</span>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-1">
                    Documentation
                  </span>
                  <span className="font-bold text-lg">Explore API</span>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-20 px-6 border-t border-outline-variant/10 bg-[#0b1326]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col items-start gap-6 max-w-sm">
            <span className="text-2xl font-bold text-on-surface flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full inline-block" />
              OpenFihris
            </span>
            <p className="text-sm text-on-surface-variant/60 leading-relaxed">
              The open registry for AI agents, skills, and prompts. Built for
              speed, security, and developer joy.
            </p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/30">
              © {new Date().getFullYear()} OpenFihris. MIT Licensed.
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            <div className="flex flex-col gap-4">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Resources
              </h5>
              <a
                className="text-sm text-on-surface-variant hover:text-white transition-colors"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </a>
              <a
                className="text-sm text-on-surface-variant hover:text-white transition-colors"
                href={`${GITHUB_URL}/tree/main/packages/cli`}
                target="_blank"
                rel="noopener noreferrer"
              >
                CLI Reference
              </a>
              <a
                className="text-sm text-on-surface-variant hover:text-white transition-colors"
                href={`${API_BASE}/health`}
                target="_blank"
                rel="noopener noreferrer"
              >
                API Status
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                Community
              </h5>
              <a
                className="text-sm text-on-surface-variant hover:text-white transition-colors"
                href={`${GITHUB_URL}/discussions`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Discussions
              </a>
              <a
                className="text-sm text-on-surface-variant hover:text-white transition-colors"
                href={`${GITHUB_URL}/issues`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Issues
              </a>
              <a
                className="text-sm text-on-surface-variant hover:text-white transition-colors"
                href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contribute
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">
                Project
              </h5>
              <a
                className="text-sm text-on-surface-variant hover:text-white transition-colors"
                href={`${GITHUB_URL}/blob/main/ROADMAP.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Roadmap
              </a>
              <a
                className="text-sm text-on-surface-variant hover:text-white transition-colors"
                href={`${GITHUB_URL}/blob/main/ARCHITECTURE.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Architecture
              </a>
              <a
                className="text-sm text-on-surface-variant hover:text-white transition-colors"
                href={`${GITHUB_URL}/blob/main/LICENSE`}
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT License
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
