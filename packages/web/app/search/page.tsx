import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { SearchBar } from "../components/SearchBar";
import { AgentCard } from "../components/AgentCard";
import {
  AGENT_TYPES,
  CATEGORIES,
  FRAMEWORKS,
  searchAgents,
} from "../lib/api";

export const metadata: Metadata = {
  title: "Browse Agents | OpenFihris",
  description:
    "Search and filter AI agents by capability, framework, or category. Live registry data from OpenFihris.",
};

type Params = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    framework?: string;
    type?: string;
  }>;
};

function sanitize(value: string | undefined, allowed?: readonly string[]): string | undefined {
  if (!value) return undefined;
  const clean = String(value).trim().slice(0, 100);
  if (!clean) return undefined;
  if (allowed && !allowed.includes(clean)) return undefined;
  return clean;
}

export default async function SearchPage({ searchParams }: Params) {
  const sp = await searchParams;
  const q = sanitize(sp.q);
  const category = sanitize(sp.category, CATEGORIES);
  const framework = sanitize(sp.framework, FRAMEWORKS);
  const type = sanitize(sp.type, AGENT_TYPES);

  const result = await searchAgents({ q, category, framework, type, limit: 24 });

  function filterHref(next: { [k: string]: string | undefined }) {
    const params = new URLSearchParams();
    const merged = { q, category, framework, type, ...next };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <Nav />

      <main className="relative z-10 pt-32 pb-24">
        <section className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <div className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
              Registry
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {q ? (
                <>
                  Results for{" "}
                  <span className="text-primary">&quot;{q}&quot;</span>
                </>
              ) : (
                "Browse Agents"
              )}
            </h1>
            <p className="text-on-surface-variant max-w-2xl">
              {q
                ? `${result.total ?? result.results.length} agent${(result.total ?? result.results.length) === 1 ? "" : "s"} matching your query.`
                : "Discover AI agents across every framework. Filter by category, framework, or type."}
            </p>
          </div>

          <SearchBar defaultValue={q ?? ""} autofocus={!q} />

          {/* Filters */}
          <div className="mt-10 space-y-6">
            <FilterRow
              label="Category"
              values={CATEGORIES}
              active={category}
              hrefFor={(v) => filterHref({ category: v })}
              clearHref={filterHref({ category: undefined })}
            />
            <FilterRow
              label="Framework"
              values={FRAMEWORKS}
              active={framework}
              hrefFor={(v) => filterHref({ framework: v })}
              clearHref={filterHref({ framework: undefined })}
            />
            <FilterRow
              label="Type"
              values={AGENT_TYPES}
              active={type}
              hrefFor={(v) => filterHref({ type: v })}
              clearHref={filterHref({ type: undefined })}
            />
          </div>

          {/* Results */}
          <div className="mt-16">
            {result.results.length === 0 ? (
              <div className="glass-panel p-16 rounded-2xl text-center">
                <div className="text-5xl mb-4 opacity-50">🔎</div>
                <h3 className="text-xl font-bold mb-2">No agents found</h3>
                <p className="text-on-surface-variant mb-6">
                  Try a different search term or clear your filters.
                </p>
                <Link
                  href="/search"
                  className="inline-block bg-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-container transition-colors"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {result.results.map((item) => (
                  <AgentCard key={item.agent.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function FilterRow({
  label,
  values,
  active,
  hrefFor,
  clearHref,
}: {
  label: string;
  values: readonly string[];
  active?: string;
  hrefFor: (value: string) => string;
  clearHref: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
          {label}
        </span>
        {active && (
          <Link
            href={clearHref}
            className="text-[10px] text-primary hover:underline"
          >
            Clear
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => {
          const isActive = v === active;
          return (
            <Link
              key={v}
              href={hrefFor(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isActive
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container-high/40 text-on-surface-variant border-white/5 hover:border-primary/30 hover:text-on-surface"
              }`}
            >
              {v}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
