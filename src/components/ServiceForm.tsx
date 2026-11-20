"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import type { Service } from "@/lib/types";

// Fallback if the category list cannot be fetched (matches the server's
// seeded categories). Normally the list comes from /api/meta/categories.
export const FALLBACK_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
];

interface ServiceFormProps {
  /** When set, the form edits this service; otherwise it creates a new one. */
  service?: Service;
  categories: string[];
  onSaved: () => void;
  onCancel: () => void;
}

/**
 * Add / edit service form (admin only). The image is always a FILE upload —
 * never a URL: the server forwards the file to ImgBB. When editing, leaving
 * the file empty keeps the existing image.
 */
export default function ServiceForm({
  service,
  categories,
  onSaved,
  onCancel,
}: ServiceFormProps) {
  const isEditing = Boolean(service);
  const categoryOptions =
    categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  const [serviceName, setServiceName] = useState(service?.serviceName ?? "");
  const [category, setCategory] = useState(
    service?.category ?? categoryOptions[0] ?? "",
  );
  const [description, setDescription] = useState(service?.description ?? "");
  const [price, setPrice] = useState(
    service ? String(service.price) : "",
  );
  const [duration, setDuration] = useState(
    service ? String(service.duration) : "",
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    service?.status ?? "active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke the preview URL when it changes or the form unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const priceValue = Number(price);
    const durationValue = Number(duration);
    if (!serviceName.trim()) {
      setFormError("Service name is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setFormError("Price must be a positive number.");
      return;
    }
    if (!Number.isInteger(durationValue) || durationValue <= 0) {
      setFormError("Duration must be a positive number of minutes.");
      return;
    }
    if (!isEditing && !imageFile) {
      setFormError("A service image is required.");
      return;
    }

    const form = new FormData();
    form.append("serviceName", serviceName.trim());
    form.append("category", category);
    form.append("description", description.trim());
    form.append("price", String(priceValue));
    form.append("duration", String(durationValue));
    form.append("status", status);
    if (imageFile) form.append("image", imageFile);

    setSubmitting(true);
    try {
      if (isEditing && service) {
        await api.updateService(service.id, form);
        toast.success("Service updated.");
      } else {
        await api.createService(form);
        toast.success("Service added.");
      }
      onSaved();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "Could not save the service. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const shownImage = previewUrl ?? service?.image ?? null;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6"
    >
      <h2 className="font-display text-xl font-bold text-stone-900">
        {isEditing ? `Edit: ${service?.serviceName}` : "Add a New Service"}
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="service-name"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Service Name
          </label>
          <input
            id="service-name"
            type="text"
            required
            value={serviceName}
            onChange={(event) => setServiceName(event.target.value)}
            placeholder="e.g. Signature Haircut"
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div>
          <label
            htmlFor="service-category"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Category
          </label>
          <select
            id="service-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          >
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="service-description"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Description
          </label>
          <textarea
            id="service-description"
            rows={3}
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What does this service include?"
            className="w-full resize-none rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div>
          <label
            htmlFor="service-price"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Price (USD)
          </label>
          <input
            id="service-price"
            type="number"
            required
            min="0.01"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="25.00"
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div>
          <label
            htmlFor="service-duration"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Duration (minutes)
          </label>
          <input
            id="service-duration"
            type="number"
            required
            min="1"
            step="1"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="45"
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-stone-700">
            Status
          </span>
          <div className="flex gap-2">
            {(["active", "inactive"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  status === value
                    ? value === "active"
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-600 text-white"
                    : "border border-stone-300 bg-white text-stone-600"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-stone-500">
            Only active services show on the public site and can be booked.
          </p>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-stone-700">
            Service Image{" "}
            <span className="font-normal text-stone-400">
              {isEditing ? "(leave empty to keep the current image)" : "(required)"}
            </span>
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            required={!isEditing}
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null)
            }
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-rose-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-rose-700"
          />
          {shownImage && (
            <div className="relative mt-3 h-32 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shownImage}
                alt="Service preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {formError && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          {formError}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-60"
        >
          {submitting
            ? "Saving…"
            : isEditing
              ? "Save Changes"
              : "Add Service"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
