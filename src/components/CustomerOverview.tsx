"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { CustomerDashboardData } from "@/lib/types";
import StatCard from "@/components/StatCard";
import AppointmentCard from "@/components/AppointmentCard";
import { PageLoader } from "@/components/Loader";
import { formatPrice } from "@/lib/dates";

export default function CustomerOverview() {
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .getCustomerDashboard()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load your dashboard. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <PageLoader label="Loading your overview…" />;
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">
          {error || "Could not load your dashboard."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { stats, recentAppointments } = data;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">
        My Overview
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Your appointments and payments at a glance.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Requests" value={stats.totalAppointments} />
        <StatCard
          label="Pending"
          value={stats.pendingAppointments}
          hint="Waiting for the salon to confirm"
        />
        <StatCard label="Confirmed" value={stats.confirmedAppointments} />
        <StatCard label="Cancelled" value={stats.cancelledAppointments} />
        <StatCard label="Paid Appointments" value={stats.paidAppointments} />
        <StatCard
          label="Total Spent"
          value={formatPrice(stats.totalSpent)}
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-stone-900">
          Recent Appointments
        </h2>
        <Link
          href="/dashboard/appointments"
          className="text-sm font-semibold text-rose-600 hover:text-rose-700"
        >
          View all appointments →
        </Link>
      </div>

      <div className="mt-4 space-y-4">
        {recentAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="text-sm text-stone-500">
              No appointments yet. Browse services and book your first visit!
            </p>
            <Link
              href="/services"
              className="mt-4 inline-block rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          recentAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
            />
          ))
        )}
      </div>
    </div>
  );
}
