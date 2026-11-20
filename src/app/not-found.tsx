import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <p className="font-display text-7xl font-bold text-rose-200">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-stone-900">
        Page not found
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
        The page you are looking for does not exist or was moved. Let&apos;s
        get you back to something beautiful.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
        >
          Go Home
        </Link>
        <Link
          href="/services"
          className="rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Browse Services
        </Link>
      </div>
    </div>
  );
}
