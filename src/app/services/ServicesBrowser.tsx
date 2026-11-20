"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Service } from "@/lib/types";
import ServiceCard from "@/components/ServiceCard";
import { ServiceGridSkeleton } from "@/components/Loader";

type SortOption = "newest" | "price_asc" | "price_desc";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

export default function ServicesBrowser() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState(categoryParam);
  const [sort, setSort] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Follow the `?category=` link from the home page (and between category
  // links) without a full remount.
  useEffect(() => {
    setCategory(categoryParam);
  }, [categoryParam]);

  // Debounce the search input so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load the category list once.
  useEffect(() => {
    let cancelled = false;
    api
      .getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data.categories);
      })
      .catch(() => {
        // Categories are a filter nicety; the page still works without them.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Refetch whenever a filter changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .getServices({
        search: debouncedSearch || undefined,
        category: category || undefined,
        sort,
        limit: 50,
      })
      .then((data) => {
        if (cancelled) return;
        setServices(data.services);
        setTotal(data.pagination.total);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setServices([]);
        setTotal(0);
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load services. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, sort]);

  const hasActiveFilters = search.trim() !== "" || category !== "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">
        Browse Services
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        {loading
          ? "Finding services for you…"
          : `${total} service${total === 1 ? "" : "s"} available`}
      </p>

      {/* Search, filter & sort */}
      <div className="mt-8 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_220px] sm:p-5">
        <label className="block">
          <span className="sr-only">Search services by name</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search services by name…"
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          />
        </label>
        <label className="block">
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-700 outline-none transition-colors focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Sort services</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-700 outline-none transition-colors focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((value) => (
              <option key={value} value={value}>
                {SORT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasActiveFilters && !loading && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setCategory("");
          }}
          className="mt-4 text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          Clear search &amp; filters
        </button>
      )}

      <div className="mt-8">
        {loading ? (
          <ServiceGridSkeleton count={6} />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="font-display text-lg font-semibold text-stone-800">
              No services found
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
