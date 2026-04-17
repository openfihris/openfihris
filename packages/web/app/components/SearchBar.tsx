"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SearchBar({
  defaultValue = "",
  placeholder = "Find an agent (e.g., 'code-reviewer', 'lead-gen')...",
  autofocus = false,
}: {
  defaultValue?: string;
  placeholder?: string;
  autofocus?: boolean;
}) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autofocus) inputRef.current?.focus();
  }, [autofocus]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    // Basic safety: strip anything but letters, numbers, spaces, and a handful of punctuation
    const safe = trimmed.replace(/[<>{}]/g, "").slice(0, 200);
    const qs = safe ? `?q=${encodeURIComponent(safe)}` : "";
    router.push(`/search${qs}`);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-primary">
          <span className="material-symbols-outlined font-bold" aria-hidden="true">
            search
          </span>
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search agents"
          maxLength={200}
          className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none h-16 md:h-20 pl-14 pr-24 md:pr-32 rounded-2xl text-on-surface text-base md:text-lg placeholder:text-on-surface-variant/40 transition-all shadow-2xl"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <kbd className="hidden md:block bg-surface-container-high px-3 py-1.5 rounded-lg text-[10px] text-on-surface-variant border border-outline-variant/30 mono-text shadow-sm">
            ⌘ K
          </kbd>
          <button
            type="submit"
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
