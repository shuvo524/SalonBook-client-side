// Shared loading indicators. Every fetch shows one of these instead of a
// blank page: a spinner for full-page loads, skeletons for card lists.

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
      {label && <span className="text-sm text-stone-500">{label}</span>}
    </span>
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="aspect-[4/3] bg-stone-200" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-1/3 rounded bg-stone-200" />
        <div className="h-5 w-3/4 rounded bg-stone-200" />
        <div className="h-4 w-full rounded bg-stone-200" />
        <div className="h-4 w-2/3 rounded bg-stone-200" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-16 rounded bg-stone-200" />
          <div className="h-9 w-28 rounded-lg bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <ServiceCardSkeleton key={index} />
      ))}
    </div>
  );
}
