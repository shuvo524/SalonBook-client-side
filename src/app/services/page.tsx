import { Suspense } from "react";
import ServicesBrowser from "./ServicesBrowser";
import { ServiceGridSkeleton } from "@/components/Loader";

// The browser reads `?category=` via useSearchParams, which must sit
// behind a Suspense boundary so the page can prerender its static shell.
export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-9 w-56 animate-pulse rounded bg-stone-200" />
          <div className="mt-8">
            <ServiceGridSkeleton count={6} />
          </div>
        </div>
      }
    >
      <ServicesBrowser />
    </Suspense>
  );
}
