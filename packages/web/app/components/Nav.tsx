import Link from "next/link";
import { API_BASE, GITHUB_URL } from "../lib/api";

export function Nav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/80 backdrop-blur-md border-b border-outline-variant/10">
      <div className="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto w-full">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2"
          >
            <span className="w-2 h-6 bg-primary rounded-full inline-block" />
            OpenFihris
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className="text-sm font-medium text-on-surface/70 hover:text-primary transition-colors duration-200"
            >
              Browse
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-on-surface/70 hover:text-primary transition-colors duration-200"
            >
              Docs
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-on-surface/70 hover:text-primary transition-colors duration-200"
            >
              About
            </Link>
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
  );
}
