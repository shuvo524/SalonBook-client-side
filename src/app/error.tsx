"use client";

import Link from "next/link";

/**
 * Route-level error boundary: if a page crashes while rendering, the user
 * sees this friendly screen (with a retry) instead of a blank page.
 */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-display text-3xl font-bold text-stone-900">
        Something went wrong
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
        This page ran into a problem. Please try again — if it keeps
        happening, check that the server is running and reload.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
