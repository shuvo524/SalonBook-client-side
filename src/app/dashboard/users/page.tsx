"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import type { User, UserWithAppointmentCounts } from "@/lib/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmDialog from "@/components/ConfirmDialog";
import { PageLoader } from "@/components/Loader";
import { formatDateTime } from "@/lib/dates";

type RoleFilter = "all" | "customer" | "admin";

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All users" },
  { value: "customer", label: "Customers" },
  { value: "admin", label: "Admins" },
];

function ManageUsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<UserWithAppointmentCounts | null>(
    null,
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [blocking, setBlocking] = useState(false);

  const load = useCallback(async (role: RoleFilter) => {
    setLoading(true);
    setError("");
    setExpandedId(null);
    setDetails(null);
    try {
      const data = await api.getUsers(role === "all" ? undefined : role);
      setUsers(data.users);
    } catch (err) {
      setUsers([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load users. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(roleFilter);
  }, [roleFilter, load]);

  async function toggleDetails(user: User) {
    if (expandedId === user.id) {
      setExpandedId(null);
      setDetails(null);
      return;
    }
    setExpandedId(user.id);
    setDetails(null);
    setDetailsLoading(true);
    try {
      const data = await api.getUserDetails(user.id);
      setDetails(data);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not load user details. Please try again.",
      );
      setExpandedId(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleBlockToggle() {
    if (!blockTarget) return;
    const nextBlocked = !blockTarget.isBlocked;
    setBlocking(true);
    try {
      await api.setUserBlocked(blockTarget.id, nextBlocked);
      toast.success(
        nextBlocked
          ? `${blockTarget.name} has been blocked.`
          : `${blockTarget.name} has been unblocked.`,
      );
      setBlockTarget(null);
      await load(roleFilter);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not update this user. Please try again.",
      );
    } finally {
      setBlocking(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">
        Manage Users
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {loading
          ? "Loading users…"
          : `${users.length} user${users.length === 1 ? "" : "s"}`}
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by role">
        {ROLE_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={roleFilter === item.value}
            onClick={() => setRoleFilter(item.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              roleFilter === item.value
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
          <PageLoader label="Loading users…" />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void load(roleFilter)}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
            No users match this filter.
          </p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const initial =
                user.name.trim().charAt(0).toUpperCase() || "?";
              const expanded = expandedId === user.id;
              return (
                <article
                  key={user.id}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-lg font-bold text-white">
                        {initial}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-semibold break-words text-stone-900">
                          {user.name}
                        </h3>
                        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 capitalize">
                          {user.role}
                        </span>
                        {user.isBlocked && (
                          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            Blocked
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-stone-500">
                        {user.email}
                        {user.phone ? ` · ${user.phone}` : ""}
                      </p>
                      <p className="text-xs text-stone-400">
                        Joined {formatDateTime(user.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void toggleDetails(user)}
                        className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                      >
                        {expanded ? "Hide details" : "View details"}
                      </button>
                      {/* Only customers can be blocked — admins cannot
                          block themselves or another admin. */}
                      {user.role === "customer" && (
                        <button
                          type="button"
                          onClick={() => setBlockTarget(user)}
                          className={`rounded-lg border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                            user.isBlocked
                              ? "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                              : "border-red-200 bg-white text-red-700 hover:bg-red-50"
                          }`}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                      )}
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-4 border-t border-stone-100 pt-4">
                      {detailsLoading ? (
                        <p className="text-sm text-stone-500">
                          Loading appointment history…
                        </p>
                      ) : details ? (
                        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                          <div className="rounded-xl bg-stone-50 p-3">
                            <dt className="text-xs text-stone-400">Total</dt>
                            <dd className="mt-0.5 text-lg font-bold text-stone-900">
                              {details.appointments.total}
                            </dd>
                          </div>
                          <div className="rounded-xl bg-amber-50 p-3">
                            <dt className="text-xs text-amber-600">Pending</dt>
                            <dd className="mt-0.5 text-lg font-bold text-amber-800">
                              {details.appointments.pending}
                            </dd>
                          </div>
                          <div className="rounded-xl bg-emerald-50 p-3">
                            <dt className="text-xs text-emerald-600">
                              Confirmed
                            </dt>
                            <dd className="mt-0.5 text-lg font-bold text-emerald-800">
                              {details.appointments.confirmed}
                            </dd>
                          </div>
                          <div className="rounded-xl bg-stone-100 p-3">
                            <dt className="text-xs text-stone-500">
                              Cancelled
                            </dt>
                            <dd className="mt-0.5 text-lg font-bold text-stone-700">
                              {details.appointments.cancelled}
                            </dd>
                          </div>
                        </dl>
                      ) : null}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={blockTarget !== null}
        title={
          blockTarget?.isBlocked ? "Unblock this user?" : "Block this user?"
        }
        message={
          blockTarget
            ? blockTarget.isBlocked
              ? `${blockTarget.name} will be able to use the platform again.`
              : `${blockTarget.name} will no longer be able to access protected platform features.`
            : ""
        }
        confirmLabel={
          blockTarget?.isBlocked ? "Yes, Unblock" : "Yes, Block"
        }
        tone={blockTarget?.isBlocked ? "default" : "danger"}
        confirming={blocking}
        onConfirm={() => void handleBlockToggle()}
        onCancel={() => {
          if (!blocking) setBlockTarget(null);
        }}
      />
    </div>
  );
}

export default function ManageUsersPage() {
  return (
    <ProtectedRoute role="admin">
      <ManageUsersContent />
    </ProtectedRoute>
  );
}
