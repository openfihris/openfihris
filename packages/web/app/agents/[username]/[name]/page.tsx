import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "../../../components/Nav";
import { Footer } from "../../../components/Footer";
import { API_BASE, GITHUB_URL, formatNumber, getAgent } from "../../../lib/api";

type Params = { params: Promise<{ username: string; name: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username, name } = await params;
  const data = await getAgent(username, name);
  if (!data) {
    return {
      title: "Agent not found | OpenFihris",
    };
  }
  const a = data.agent;
  return {
    title: `${a.name} — @${username} | OpenFihris`,
    description: a.description.slice(0, 200),
  };
}

export default async function AgentDetailPage({ params }: Params) {
  const { username, name } = await params;
  const data = await getAgent(username, name);
  if (!data) notFound();

  const a = data.agent;
  const creator = data.creator;
  const score = (a.upvotes ?? 0) - (a.downvotes ?? 0);

  return (
    <>
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <Nav />

      <main className="relative z-10 pt-32 pb-24">
        <section className="max-w-5xl mx-auto px-6">
          <div className="mb-8">
            <Link
              href="/search"
              className="text-sm text-on-surface-variant hover:text-primary inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                arrow_back
              </span>
              Back to browse
            </Link>
          </div>

          <div className="glass-panel rounded-3xl p-8 md:p-12 mb-8">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded border border-primary/20 uppercase">
                    {a.type}
                  </span>
                  <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2.5 py-1 rounded border border-secondary/20 uppercase">
                    {a.category}
                  </span>
                  {a.verified && (
                    <span className="bg-tertiary/10 text-tertiary text-[10px] font-bold px-2.5 py-1 rounded border border-tertiary/20 uppercase flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-xs"
                        aria-hidden="true"
                      >
                        verified
                      </span>
                      Verified
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                  {a.name}
                </h1>
                <div className="mono-text text-on-surface-variant/80 text-sm mb-6">
                  {a.slug}
                  {a.version && (
                    <>
                      <span className="opacity-30 mx-2">•</span>v{a.version}
                    </>
                  )}
                  {a.license && (
                    <>
                      <span className="opacity-30 mx-2">•</span>
                      {a.license}
                    </>
                  )}
                </div>
                <p className="text-on-surface-variant leading-relaxed text-lg max-w-2xl">
                  {a.description}
                </p>
              </div>

              <div className="flex md:flex-col gap-4 md:min-w-[180px]">
                <Stat
                  label="Downloads"
                  value={formatNumber(a.downloads)}
                  icon="download"
                />
                <Stat
                  label="Score"
                  value={String(score)}
                  icon="trending_up"
                />
                <Stat
                  label="Upvotes"
                  value={String(a.upvotes ?? 0)}
                  icon="thumb_up"
                />
              </div>
            </div>

            {/* Install */}
            <div className="mt-10 bg-[#060e20] rounded-xl p-5 border border-white/5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-primary-fixed-dim mono-text select-none">$</span>
                <code className="mono-text text-primary text-sm font-medium truncate">
                  fihris install {a.slug}
                </code>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
                CLI
              </span>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <MetaBlock title="Frameworks">
              <div className="flex flex-wrap gap-2">
                {(a.frameworks?.length ? a.frameworks : ["any"]).map((f) => (
                  <span
                    key={f}
                    className="bg-surface-container-high px-3 py-1.5 rounded-lg text-xs font-medium border border-white/5"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </MetaBlock>

            <MetaBlock title="Tags">
              <div className="flex flex-wrap gap-2">
                {a.tags?.length ? (
                  a.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/search?q=${encodeURIComponent(t)}`}
                      className="bg-surface-container-high px-3 py-1.5 rounded-lg text-xs font-medium border border-white/5 hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      #{t}
                    </Link>
                  ))
                ) : (
                  <span className="text-on-surface-variant/60 text-sm">
                    No tags
                  </span>
                )}
              </div>
            </MetaBlock>

            {a.endpoint && (
              <MetaBlock title="Endpoint">
                <a
                  href={a.endpoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono-text text-primary text-sm break-all hover:underline"
                >
                  {a.endpoint}
                </a>
              </MetaBlock>
            )}

            {a.protocols && a.protocols.length > 0 && (
              <MetaBlock title="Protocols">
                <div className="flex flex-wrap gap-2">
                  {a.protocols.map((p) => (
                    <span
                      key={p}
                      className="bg-surface-container-high px-3 py-1.5 rounded-lg text-xs font-medium border border-white/5"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </MetaBlock>
            )}

            {creator && (
              <MetaBlock title="Publisher">
                <div className="flex items-center gap-3">
                  {creator.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={creator.avatarUrl}
                      alt={`@${creator.username}`}
                      width={40}
                      height={40}
                      className="rounded-full border border-white/10"
                    />
                  )}
                  <div>
                    <div className="font-bold">
                      @{creator.username}
                      {creator.isVerified && (
                        <span
                          className="material-symbols-outlined text-primary text-sm ml-1 align-middle"
                          aria-label="Verified"
                        >
                          verified
                        </span>
                      )}
                    </div>
                    {creator.displayName && (
                      <div className="text-xs text-on-surface-variant/60">
                        {creator.displayName}
                      </div>
                    )}
                  </div>
                </div>
              </MetaBlock>
            )}

            {a.githubUrl && (
              <MetaBlock title="Source">
                <a
                  href={a.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono-text text-primary text-sm break-all hover:underline"
                >
                  {a.githubUrl.replace("https://", "")}
                </a>
              </MetaBlock>
            )}
          </div>

          {/* CTA */}
          <div className="glass-panel rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">
              Want to help curate this agent?
            </h3>
            <p className="text-on-surface-variant mb-6 text-sm">
              Upvote, flag issues, or report abuse with the CLI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`${API_BASE}/api/v1/agents/${a.slug.replace("@", "%40")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface-container-high hover:bg-surface-container-highest transition-colors px-5 py-2.5 rounded-lg text-sm font-semibold border border-white/5"
              >
                View raw JSON
              </a>
              <a
                href={`${GITHUB_URL}/issues/new?title=Report:%20${encodeURIComponent(a.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface-container-high hover:bg-surface-container-highest transition-colors px-5 py-2.5 rounded-lg text-sm font-semibold border border-white/5"
              >
                Report an issue
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-surface-container-highest/40 border border-white/5 rounded-xl px-4 py-3 flex-1 md:flex-none">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-1">
        <span className="material-symbols-outlined text-xs" aria-hidden="true">
          {icon}
        </span>
        {label}
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
    </div>
  );
}

function MetaBlock({
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
      {children}
    </div>
  );
}
