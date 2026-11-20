"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Service } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PageLoader } from "@/components/Loader";
import { formatPrice } from "@/lib/dates";

function ServiceDetailsContent() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { user } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api
      .getService(id)
      .then((data) => {
        if (!cancelled) setService(data.service);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load this service. Please try again.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <PageLoader label="Loading service details…" />;
  }

  if (notFound || !service) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold text-stone-900">
          Service not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-500">
          {notFound
            ? "This service does not exist or is no longer available."
            : error || "This service could not be loaded."}
        </p>
        <Link
          href="/services"
          className="mt-6 inline-block rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="text-sm font-medium text-rose-600 hover:text-rose-700"
      >
        ← Back to Services
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100 shadow-sm">
          <Image
            src={service.image}
            alt={service.serviceName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div>
          <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
            {service.category}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
            {service.serviceName}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
            {service.description}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <dt className="text-xs font-medium tracking-wide text-stone-500 uppercase">
                Price
              </dt>
              <dd className="mt-1 font-display text-2xl font-bold text-rose-700">
                {formatPrice(service.price)}
              </dd>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <dt className="text-xs font-medium tracking-wide text-stone-500 uppercase">
                Duration
              </dt>
              <dd className="mt-1 font-display text-2xl font-bold text-stone-900">
                {service.duration} min
              </dd>
            </div>
          </dl>

          {user?.role === "admin" && (
            <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You are signed in as an admin. Admins can view services but
              cannot submit customer appointment requests.
            </p>
          )}
        </div>
      </div>

      {/* The booking form is added in the next step (Phase 3). */}
    </div>
  );
}

// Service details are a protected route: visitors must sign in first.
export default function ServiceDetails() {
  return (
    <ProtectedRoute>
      <ServiceDetailsContent />
    </ProtectedRoute>
  );
}
