"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import type {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
} from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import AppointmentCard from "@/components/AppointmentCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import { PageLoader } from "@/components/Loader";
import { formatDate, formatPrice } from "@/lib/dates";

type StatusFilter = "all" | AppointmentStatus;
type PaymentFilter = "all" | PaymentStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_FILTERS: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "Any payment" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
];

/* ------------------------------------------------------------------ */
/* Customer view: my own appointments                                  */
/* ------------------------------------------------------------------ */

function MyAppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

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

  // Pay Now: the server creates a Stripe Checkout session and the browser
  // is redirected to Stripe. No Stripe code runs on the client, and the
  // payment status only changes when the server's webhook verifies it.
  async function handlePayNow(appointment: Appointment) {
    setPayingId(appointment.id);
    try {
      const { checkoutUrl } = await api.createCheckout(appointment.id);
      window.location.href = checkoutUrl;
    } catch (err) {
      setPayingId(null);
      if (err instanceof ApiError && err.status === 503) {
        toast.error("Payments are not available right now. Please try later.");
      } else {
        toast.error(
          err instanceof ApiError
            ? err.message
            : "Could not start checkout. Please try again.",
        );
      }
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

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter by status"
      >
        {STATUS_FILTERS.map((item) => (
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
                  <>
                    {/* Only pending requests can be cancelled. */}
                    {appointment.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(appointment)}
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
                      >
                        Cancel Appointment
                      </button>
                    )}
                    {/* Only confirmed + unpaid appointments can be paid for. */}
                    {appointment.status === "confirmed" &&
                      appointment.paymentStatus === "unpaid" && (
                        <button
                          type="button"
                          onClick={() => void handlePayNow(appointment)}
                          disabled={payingId === appointment.id}
                          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-60"
                        >
                          {payingId === appointment.id
                            ? "Redirecting to Stripe…"
                            : `Pay Now — ${formatPrice(appointment.servicePrice)}`}
                        </button>
                      )}
                  </>
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

/* ------------------------------------------------------------------ */
/* Admin view: manage every appointment                                */
/* ------------------------------------------------------------------ */

function ManageAppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = useCallback(
    async (status: StatusFilter, payment: PaymentFilter) => {
      setLoading(true);
      setError("");
      try {
        const data = await api.getAllAppointments({
          status: status === "all" ? undefined : status,
          paymentStatus: payment === "all" ? undefined : payment,
        });
        setAppointments(data.appointments);
      } catch (err) {
        setAppointments([]);
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load appointments. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load(statusFilter, paymentFilter);
  }, [statusFilter, paymentFilter, load]);

  async function handleConfirm(appointment: Appointment) {
    setConfirmingId(appointment.id);
    try {
      await api.confirmAppointment(appointment.id);
      toast.success("Appointment confirmed. The customer can now pay.");
      await load(statusFilter, paymentFilter);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not confirm this appointment. Please try again.",
      );
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      // Cancelling never changes the payment status (a paid appointment
      // stays paid in the records).
      await api.cancelAppointmentAsAdmin(cancelTarget.id);
      toast.success("Appointment cancelled.");
      setCancelTarget(null);
      await load(statusFilter, paymentFilter);
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
        Manage Appointments
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Every appointment request, newest first. Confirm pending requests so
        customers can pay.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <label className="block">
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          >
            {STATUS_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                Status: {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Filter by payment status</span>
          <select
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(event.target.value as PaymentFilter)
            }
            className="rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          >
            {PAYMENT_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6">
        {loading ? (
          <PageLoader label="Loading appointments…" />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void load(statusFilter, paymentFilter)}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
            No appointments match these filters.
          </p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                showCustomer
                actions={
                  <>
                    {/* Only pending appointments can be confirmed. */}
                    {appointment.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => void handleConfirm(appointment)}
                        disabled={confirmingId === appointment.id}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {confirmingId === appointment.id
                          ? "Confirming…"
                          : "Confirm Appointment"}
                      </button>
                    )}
                    {/* Pending or confirmed appointments can be cancelled. */}
                    {appointment.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(appointment)}
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </>
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
            ? `This cancels the ${cancelTarget.serviceId.serviceName} appointment for ${formatDate(cancelTarget.appointmentDate)} at ${cancelTarget.timeSlot}. Cancelling never changes the payment status.`
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

/* ------------------------------------------------------------------ */
/* Route: customers see their own list, admins manage every request.   */
/* The dashboard shell already requires a signed-in user.              */
/* ------------------------------------------------------------------ */

export default function AppointmentsPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <PageLoader label="Loading appointments…" />;
  }

  return user.role === "admin" ? (
    <ManageAppointmentsContent />
  ) : (
    <MyAppointmentsContent />
  );
}
