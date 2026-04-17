"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0b1326] text-on-surface px-6">
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <div className="relative z-10 text-center max-w-md">
        <div className="mono-text text-tertiary text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
          Something went wrong
        </div>
        <h1 className="text-4xl font-bold mb-4">We hit a snag.</h1>
        <p className="text-on-surface-variant mb-8">
          The page failed to render. This has been logged — try again, or
          head back home.
        </p>
        {error.digest && (
          <p className="mono-text text-xs text-on-surface-variant/50 mb-8">
            Digest: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-container transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-surface-container-high hover:bg-surface-container-highest px-6 py-3 rounded-lg font-semibold border border-white/5 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
