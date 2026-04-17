import Link from "next/link";
import { API_BASE, GITHUB_URL } from "../lib/api";

export function Footer() {
  return (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-16">
          <div className="flex flex-col gap-4">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Product
            </h5>
            <Link
              className="text-sm text-on-surface-variant hover:text-white transition-colors"
              href="/search"
            >
              Browse Agents
            </Link>
            <Link
              className="text-sm text-on-surface-variant hover:text-white transition-colors"
              href="/docs"
            >
              Documentation
            </Link>
            <a
              className="text-sm text-on-surface-variant hover:text-white transition-colors"
              href={API_BASE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live API
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
            <Link
              className="text-sm text-on-surface-variant hover:text-white transition-colors"
              href="/about"
            >
              About
            </Link>
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
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source Code
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
  );
}
