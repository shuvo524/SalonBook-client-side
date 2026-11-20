import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <svg
          className="h-8 w-8 text-amber-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold text-stone-900">
        Payment cancelled
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
        No payment was taken, and your appointment is still confirmed. You can
        try paying again whenever you are ready.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard/appointments"
          className="rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
        >
          Back to My Appointments
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
