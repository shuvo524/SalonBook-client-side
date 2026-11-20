import type { AppointmentStatus, PaymentStatus } from "@/lib/types";

const appointmentStyles: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-stone-200 text-stone-700",
};

const paymentStyles: Record<PaymentStatus, string> = {
  unpaid: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
};

const transactionStyles: Record<"paid" | "failed", string> = {
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${appointmentStyles[status]}`}
    >
      {capitalize(status)}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStyles[status]}`}
    >
      {capitalize(status)}
    </span>
  );
}

export function TransactionStatusBadge({
  status,
}: {
  status: "paid" | "failed";
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${transactionStyles[status]}`}
    >
      {capitalize(status)}
    </span>
  );
}
