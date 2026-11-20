"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Transaction } from "@/lib/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransactionCard from "@/components/TransactionCard";
import { PageLoader } from "@/components/Loader";

type StatusFilter = "all" | "paid" | "failed";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
];

function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (status: StatusFilter) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAllTransactions(
        status === "all" ? undefined : status,
      );
      setTransactions(data.transactions);
    } catch (err) {
      setTransactions([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load transactions. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">
        Transactions
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Payment records, newest first. Records are created by the Stripe
        webhook and cannot be edited here.
      </p>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter by payment status"
      >
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
          <PageLoader label="Loading transactions…" />
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
        ) : transactions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
            No transactions match this filter.
          </p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                showCustomer
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <ProtectedRoute role="admin">
      <TransactionsContent />
    </ProtectedRoute>
  );
}
