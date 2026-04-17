import Link from "next/link";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";

export default function NotFound() {
  return (
    <>
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <Nav />
      <main className="relative z-10 pt-32 pb-24 min-h-[70vh] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="mono-text text-primary text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
            404 — Not Found
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
            Off the grid.
          </h1>
          <p className="text-on-surface-variant text-lg max-w-lg mx-auto mb-10">
            We couldn&apos;t find what you were looking for. Try the search
            or head back home.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-container transition-colors"
            >
              Back to home
            </Link>
            <Link
              href="/search"
              className="bg-surface-container-high hover:bg-surface-container-highest px-6 py-3 rounded-lg font-semibold border border-white/5 transition-colors"
            >
              Browse agents
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
