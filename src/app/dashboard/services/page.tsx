"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import type { Service } from "@/lib/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServiceForm from "@/components/ServiceForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { PageLoader } from "@/components/Loader";
import { formatPrice } from "@/lib/dates";

type EditorState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; service: Service };

function ManageServicesContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [serviceData, categoryData] = await Promise.all([
        api.getAdminServices(),
        api.getCategories().catch(() => ({ categories: [] as string[] })),
      ]);
      setServices(serviceData.services);
      setCategories(categoryData.categories);
    } catch (err) {
      setServices([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load services. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleToggleStatus(service: Service) {
    const nextStatus = service.status === "active" ? "inactive" : "active";
    setTogglingId(service.id);
    try {
      await api.updateServiceStatus(service.id, nextStatus);
      toast.success(
        nextStatus === "active"
          ? `"${service.serviceName}" is now active.`
          : `"${service.serviceName}" is now inactive.`,
      );
      await load();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not change the status. Please try again.",
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteService(deleteTarget.id);
      toast.success(`"${deleteTarget.serviceName}" deleted.`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not delete this service. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">
            Manage Services
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {loading
              ? "Loading services…"
              : `${services.length} service${services.length === 1 ? "" : "s"} in total`}
          </p>
        </div>
        {editor.mode === "closed" && (
          <button
            type="button"
            onClick={() => setEditor({ mode: "create" })}
            className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
          >
            + Add Service
          </button>
        )}
      </div>

      {editor.mode !== "closed" && (
        <div className="mt-6">
          <ServiceForm
            service={editor.mode === "edit" ? editor.service : undefined}
            categories={categories}
            onSaved={() => {
              setEditor({ mode: "closed" });
              void load();
            }}
            onCancel={() => setEditor({ mode: "closed" })}
          />
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <PageLoader label="Loading services…" />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : services.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
            No services yet. Add your first service to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <article
                key={service.id}
                className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row"
              >
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-24 sm:w-32">
                  <Image
                    src={service.image}
                    alt={service.serviceName}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-stone-900">
                        {service.serviceName}
                      </h3>
                      <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
                        {service.category}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        service.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {service.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
                    {service.description}
                  </p>
                  <p className="mt-2 text-sm text-stone-500">
                    <span className="font-display text-lg font-bold text-rose-700">
                      {formatPrice(service.price)}
                    </span>
                    <span> · {service.duration} min</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditor({ mode: "edit", service })}
                      className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggleStatus(service)}
                      disabled={togglingId === service.id}
                      className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
                    >
                      {togglingId === service.id
                        ? "Saving…"
                        : service.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(service)}
                      className="rounded-lg border border-red-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this service?"
        message={
          deleteTarget
            ? `"${deleteTarget.serviceName}" will be permanently removed. Services with active appointments cannot be deleted — deactivate them instead.`
            : ""
        }
        confirmLabel="Yes, Delete It"
        tone="danger"
        confirming={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default function ManageServicesPage() {
  return (
    <ProtectedRoute role="admin">
      <ManageServicesContent />
    </ProtectedRoute>
  );
}
