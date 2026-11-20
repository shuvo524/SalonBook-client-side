"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Service } from "@/lib/types";
import ServiceCard from "@/components/ServiceCard";
import { ServiceGridSkeleton } from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Browse services",
    text: "Explore haircuts, colouring, facials, makeup, and spa treatments — with clear prices and durations.",
  },
  {
    step: "2",
    title: "Pick a time that suits you",
    text: "Choose a date and time slot online. No phone calls, no waiting in line.",
  },
  {
    step: "3",
    title: "Relax — we confirm it",
    text: "The salon confirms your booking, and you pay securely online once it is confirmed.",
  },
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [serviceData, categoryData] = await Promise.all([
          api.getServices({ limit: 6, sort: "newest" }),
          api.getCategories(),
        ]);
        if (cancelled) return;
        setServices(serviceData.services);
        setCategories(categoryData.categories);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load services. Please try again.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-stone-900">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Inside a bright, modern salon"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/50 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <h1 className="max-w-2xl font-display text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">
            Look your best, book in minutes
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-200 sm:text-lg">
            From fresh haircuts to relaxing spa days — browse our services,
            pick a time that suits you, and pay securely online.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-rose-700"
            >
              Explore Salon Services
            </Link>
            {/* Shown only to signed-out visitors: a signed-in user
                already has an account. Hidden while the session is
                still restoring, so it never flashes for signed-in
                users (same pattern as the Navbar). */}
            {!authLoading && !user && (
              <Link
                href="/sign-up"
                className="rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Create an Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-stone-900">
              Featured Services
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Our most-loved treatments, ready to book.
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm font-semibold text-rose-600 hover:text-rose-700"
          >
            View all services →
          </Link>
        </div>

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
            <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
              No services are available right now. Please check back soon.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-stone-900">
            Browse by Category
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Find exactly the treatment you are looking for.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {loading ? (
              Array.from({ length: 7 }, (_, index) => (
                <div
                  key={index}
                  className="h-11 w-36 animate-pulse rounded-full bg-stone-100"
                />
              ))
            ) : (
              categories.map((category) => (
                <Link
                  key={category}
                  href={`/services?category=${encodeURIComponent(category)}`}
                  className="rounded-full border border-stone-200 bg-stone-50 px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                >
                  {category}
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl font-bold text-stone-900">
          How SalonBook Works
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-stone-500">
          Three simple steps between you and your next salon visit.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 font-display text-xl font-bold text-white">
                {item.step}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-stone-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-rose-600 px-6 py-10 text-center shadow-sm sm:px-10">
          <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Ready for a fresh look?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-rose-100">
            Browse today&apos;s services and book your favourite time slot in
            under a minute.
          </p>
          <Link
            href="/services"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-rose-700 shadow transition-colors hover:bg-rose-50"
          >
            Explore Salon Services
          </Link>
        </div>
      </section>
    </div>
  );
}
