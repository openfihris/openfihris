"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE, GITHUB_URL } from "../lib/api";

const LINKS = [
  { href: "/search", label: "Browse" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  }

  return (
    <nav
      className="fixed top-0 w-full z-50 bg-[#0b1326]/80 backdrop-blur-md border-b border-outline-variant/10"
      aria-label="Primary"
    >
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 max-w-screen-2xl mx-auto w-full">
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2 shrink-0"
            aria-label="OpenFihris home"
          >
            <span
              className="w-2 h-6 bg-primary rounded-full inline-block"
              aria-hidden="true"
            />
            OpenFihris
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(l.href)
                    ? "text-primary"
                    : "text-on-surface/70 hover:text-primary"
                }`}
              >
                {l.label}
              </Link>
            ))}
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

        <div className="flex items-center gap-3">
          <a
            href={API_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-block gradient-cta text-on-primary text-sm font-semibold px-5 py-2 rounded-lg active:scale-95 transition-transform shadow-lg shadow-primary/20"
          >
            Live API
          </a>
          <button
            type="button"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container-high/40 transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className="material-symbols-outlined text-2xl"
              aria-hidden="true"
            >
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed left-0 right-0 top-[64px] bg-[#0b1326] border-t border-outline-variant/10 transition-opacity duration-200 overflow-y-auto ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ height: "calc(100vh - 64px)" }}
        aria-hidden={!open}
      >
        <div className="flex flex-col h-full px-6 py-8 gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-2xl font-bold py-3 border-b border-outline-variant/10 transition-colors ${
                isActive(l.href)
                  ? "text-primary"
                  : "text-on-surface hover:text-primary"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl font-bold py-3 border-b border-outline-variant/10 text-on-surface hover:text-primary transition-colors flex items-center justify-between"
          >
            GitHub
            <span
              className="material-symbols-outlined text-base opacity-50"
              aria-hidden="true"
            >
              open_in_new
            </span>
          </a>
          <a
            href={API_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 gradient-cta text-on-primary text-center text-base font-semibold px-6 py-4 rounded-lg shadow-lg shadow-primary/20"
          >
            Live API
          </a>
        </div>
      </div>
    </nav>
  );
}
