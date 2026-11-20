import Image from "next/image";
import type { ReactNode } from "react";
import type { Appointment, AppointmentCustomer } from "@/lib/types";
import {
  AppointmentStatusBadge,
  PaymentStatusBadge,
} from "@/components/StatusBadge";
import { formatDate, formatDateTime, formatPrice } from "@/lib/dates";

export function customerDisplayName(
  customer: AppointmentCustomer | string,
): string {
  return typeof customer === "string" ? "Customer" : customer.name;
}

export function customerDisplayEmail(
  customer: AppointmentCustomer | string,
): string {
  return typeof customer === "string" ? "" : customer.email;
}

interface AppointmentCardProps {
  appointment: Appointment;
  /** Show the customer block (admin views). */
  showCustomer?: boolean;
  /** Action buttons rendered at the bottom (Cancel / Pay Now / Confirm). */
  actions?: ReactNode;
}

/** One appointment, as a card. Shared by the customer and admin lists. */
export default function AppointmentCard({
  appointment,
  showCustomer = false,
  actions,
}: AppointmentCardProps) {
  const service = appointment.serviceId;
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
          <Image
            src={service.image}
            alt={service.serviceName}
            fill
            sizes="80px"
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
            <div className="flex flex-wrap gap-2">
              <AppointmentStatusBadge status={appointment.status} />
              <PaymentStatusBadge status={appointment.paymentStatus} />
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-stone-400">Date</dt>
              <dd className="font-medium text-stone-800">
                {formatDate(appointment.appointmentDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-400">Time</dt>
              <dd className="font-medium text-stone-800">
                {appointment.timeSlot}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-400">Price</dt>
              <dd className="font-medium text-stone-800">
                {formatPrice(appointment.servicePrice)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-400">Requested</dt>
              <dd className="font-medium text-stone-800">
                {formatDateTime(appointment.createdAt)}
              </dd>
            </div>
          </dl>

          {showCustomer && (
            <p className="mt-3 text-sm text-stone-600">
              <span className="font-medium text-stone-800">Customer:</span>{" "}
              {customerDisplayName(appointment.customerId)}
              {customerDisplayEmail(appointment.customerId) && (
                <span className="text-stone-500">
                  {" "}
                  ({customerDisplayEmail(appointment.customerId)})
                </span>
              )}
            </p>
          )}

          {appointment.message && (
            <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600">
              <span className="font-medium text-stone-800">Message:</span>{" "}
              {appointment.message}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
          {actions}
        </div>
      )}
    </article>
  );
}
