import type { Transaction } from "@/lib/types";
import { TransactionStatusBadge } from "@/components/StatusBadge";
import { formatDate, formatDateTime, formatPrice } from "@/lib/dates";
import { customerDisplayName } from "@/components/AppointmentCard";

function shortSessionId(sessionId: string): string {
  if (sessionId.length <= 16) return sessionId;
  return `${sessionId.slice(0, 12)}…${sessionId.slice(-4)}`;
}

interface TransactionCardProps {
  transaction: Transaction;
  /** Show the customer block (admin views). */
  showCustomer?: boolean;
}

/** One payment record. Shared by the customer and admin transaction lists. */
export default function TransactionCard({
  transaction,
  showCustomer = false,
}: TransactionCardProps) {
  const appointment =
    typeof transaction.appointmentId === "string"
      ? null
      : transaction.appointmentId;
  const serviceName = appointment?.serviceId.serviceName ?? "Appointment";

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold break-words text-stone-900">
            {serviceName}
          </h3>
          {appointment && (
            <p className="mt-0.5 text-sm text-stone-500">
              {formatDate(appointment.appointmentDate)} at{" "}
              {appointment.timeSlot}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold text-stone-900">
            {formatPrice(transaction.amount)}
          </p>
          <p className="text-xs tracking-wide text-stone-400 uppercase">
            {transaction.currency}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-stone-400">Status</dt>
          <dd className="mt-1">
            <TransactionStatusBadge status={transaction.status} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">Stripe Session</dt>
          <dd
            className="mt-1 font-mono text-xs break-all text-stone-700"
            title={transaction.stripeSessionId}
          >
            {shortSessionId(transaction.stripeSessionId)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">Transaction Date</dt>
          <dd className="mt-1 font-medium text-stone-800">
            {formatDateTime(transaction.createdAt)}
          </dd>
        </div>
      </dl>

      {showCustomer && (
        <p className="mt-3 border-t border-stone-100 pt-3 text-sm text-stone-600">
          <span className="font-medium text-stone-800">Customer:</span>{" "}
          {customerDisplayName(transaction.customerId)}
        </p>
      )}
    </article>
  );
}
