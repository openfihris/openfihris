import Link from "next/link";
import type { AgentWithCreator } from "../lib/api";
import { agentIcon, formatNumber } from "../lib/api";

type ColorKey = "primary" | "secondary" | "tertiary";

const FRAMEWORK_COLOR: Record<string, ColorKey> = {
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

function detailHref(slug: string): string {
  // slug is "@user/name"
  const match = slug.match(/^@([^/]+)\/(.+)$/);
  if (!match) return "/search";
  return `/agents/${encodeURIComponent(match[1])}/${encodeURIComponent(match[2])}`;
}

export function AgentCard({ item }: { item: AgentWithCreator }) {
  const { agent, creator } = item;
  const fw = agent.frameworks?.[0] ?? "any";
  const colorKey = FRAMEWORK_COLOR[fw] ?? "primary";
  const c = CARD_CLASSES[colorKey];

  return (
    <Link
      href={detailHref(agent.slug)}
      className={`bg-surface-container-high/40 backdrop-blur-sm rounded-2xl p-6 border border-white/5 ${c.hoverBorder} transition-all group relative overflow-hidden flex flex-col`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-primary text-sm">
          arrow_outward
        </span>
      </div>
      <div className="flex justify-between items-start mb-6">
        <div
          className={`w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center ${c.iconText} group-hover:scale-110 transition-transform`}
          aria-hidden="true"
        >
          <span className="material-symbols-outlined">
            {agentIcon(agent.type)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-[10px] mono-text text-on-surface-variant font-bold">
            <span
              className="material-symbols-outlined text-xs text-secondary"
              aria-hidden="true"
            >
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
        className={`text-lg font-bold mb-1 ${c.hoverTitle} transition-colors truncate`}
      >
        {agent.name}
      </h4>
      {creator?.username && (
        <div className="text-[11px] mono-text text-on-surface-variant/60 mb-3 truncate">
          @{creator.username}
        </div>
      )}
      <p className="text-xs text-on-surface-variant mb-6 line-clamp-3 leading-relaxed flex-1">
        {agent.description}
      </p>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-[10px] font-bold bg-surface-container-highest/60 px-2.5 py-1.5 rounded-lg border border-white/5">
          <span
            className="material-symbols-outlined text-[10px]"
            aria-hidden="true"
          >
            thumb_up
          </span>
          {agent.upvotes ?? 0}
        </div>
        <span className="text-[10px] font-bold text-on-surface-variant/40 mono-text">
          v{agent.version ?? "0.1.0"}
        </span>
      </div>
    </Link>
  );
}
