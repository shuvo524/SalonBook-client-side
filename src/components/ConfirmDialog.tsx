"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Shows a spinner on the confirm button while an action runs. */
  confirming?: boolean;
  /** Red (destructive) or rose (default) confirm button. */
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation modal. The app never uses `alert()` or
 * `window.confirm()` — destructive actions (cancel appointment, delete
 * service, block user) go through this dialog instead.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  confirming = false,
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="font-display text-lg font-semibold text-stone-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed break-words text-stone-600">{message}</p>
        {/* Stacked full-width buttons on phones, side by side on larger screens. */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50 sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 sm:w-auto ${
              tone === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {confirming ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
