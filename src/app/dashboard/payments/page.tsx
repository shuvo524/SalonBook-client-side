"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Transaction } from "@/lib/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransactionCard from "@/components/TransactionCard";
import { PageLoader } from "@/components/Loader";

function MyPaymentsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .getMyTransactions()
      .then((data) => {
        if (!cancelled) setTransactions(data.transactions);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load your payments. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">
        My Payments
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Every payment you have made for confirmed appointments.
      </p>

      <div className="mt-6">
        {loading ? (
          <PageLoader label="Loading your payments…" />
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
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="font-display text-lg font-semibold text-stone-800">
              No payments yet
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Once you pay for a confirmed appointment, the payment shows up
              here.
            </p>
            <Link
              href="/dashboard/appointments"
              className="mt-4 inline-block rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
            >
              View My Appointments
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyPaymentsPage() {
  return (
    <ProtectedRoute role="customer">
      <MyPaymentsContent />
    </ProtectedRoute>
  );
}
