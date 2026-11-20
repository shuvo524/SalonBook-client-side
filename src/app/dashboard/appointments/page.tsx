"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppointmentCard from "@/components/AppointmentCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import { PageLoader } from "@/components/Loader";
import { formatDate } from "@/lib/dates";

type StatusFilter = "all" | AppointmentStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

function MyAppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async (status: StatusFilter) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getMyAppointments(
        status === "all" ? undefined : status,
      );
      setAppointments(data.appointments);
    } catch (err) {
      setAppointments([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load your appointments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.cancelMyAppointment(cancelTarget.id);
      toast.success("Appointment cancelled.");
      setCancelTarget(null);
      await load(filter);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not cancel this appointment. Please try again.",
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">
        My Appointments
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Every appointment request you have submitted, newest first.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            onClick={() => setFilter(item.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === item.value
                ? "bg-rose-600 text-white shadow-sm"
                : "border border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:text-rose-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <PageLoader label="Loading your appointments…" />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void load(filter)}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="font-display text-lg font-semibold text-stone-800">
              No appointments yet
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {filter === "all"
                ? "You have not requested any appointments yet."
                : `No ${filter} appointments.`}
            </p>
            <Link
              href="/services"
              className="mt-4 inline-block rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                actions={
                  // Only pending requests can be cancelled — confirmed or
                  // already-cancelled appointments show no Cancel button.
                  appointment.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(appointment)}
                      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
                    >
                      Cancel Appointment
                    </button>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel this appointment?"
        message={
          cancelTarget
            ? `This cancels your ${cancelTarget.serviceId.serviceName} request for ${formatDate(cancelTarget.appointmentDate)} at ${cancelTarget.timeSlot}. This cannot be undone.`
            : ""
        }
        confirmLabel="Yes, Cancel It"
        tone="danger"
        confirming={cancelling}
        onConfirm={() => void handleCancel()}
        onCancel={() => {
          if (!cancelling) setCancelTarget(null);
        }}
      />
    </div>
  );
}

// NOTE: Phase 5 opens this route to admins (appointment management). Until
// then it is the customer's own list, guarded to customers only.
export default function MyAppointmentsPage() {
  return (
    <ProtectedRoute role="customer">
      <MyAppointmentsContent />
    </ProtectedRoute>
  );
}
