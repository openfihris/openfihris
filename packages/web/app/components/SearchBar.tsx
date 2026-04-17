"use client";

import { useState } from "react";

const API_BASE = "https://openfihris-api.vercel.app";

export function SearchBar() {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const url = `${API_BASE}/api/v1/agents/search?q=${encodeURIComponent(trimmed)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-primary">
          <span className="material-symbols-outlined font-bold">search</span>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find an agent (e.g., 'code-reviewer', 'lead-gen')..."
          className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none h-20 pl-14 pr-6 rounded-2xl text-on-surface text-lg placeholder:text-on-surface-variant/40 transition-all shadow-2xl"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <kbd className="hidden md:block bg-surface-container-high px-3 py-1.5 rounded-lg text-[10px] text-on-surface-variant border border-outline-variant/30 mono-text shadow-sm">
            ⌘ K
          </kbd>
        </div>
      </div>
    </form>
  );
}
