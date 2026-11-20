"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg
          className="h-8 w-8 text-emerald-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold text-stone-900">
        Payment received — thank you!
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
        Your payment is being confirmed. The appointment status updates
        automatically once Stripe confirms the payment — usually within a few
        seconds. You can check it in My Appointments.
      </p>
      {sessionId && (
        <p className="mx-auto mt-4 max-w-md truncate rounded-lg bg-stone-100 px-4 py-2 font-mono text-xs text-stone-500">
          Session: {sessionId}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard/appointments"
          className="rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
        >
          View My Appointments
        </Link>
        <Link
          href="/services"
          className="rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Browse More Services
        </Link>
      </div>
    </div>
  );
}
