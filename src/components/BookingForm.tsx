"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import { todayString } from "@/lib/dates";

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
}

/**
 * Appointment request form (customers only). The time slots come from the
 * server so the form can never offer a slot the API would reject. A 409
 * means the slot was just taken — the customer picks another time.
 */
export default function BookingForm({ serviceId, serviceName }: BookingFormProps) {
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [minDate, setMinDate] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Today's date for the picker's minimum (computed after mount so the
  // prerendered shell stays deterministic).
  useEffect(() => {
    setMinDate(todayString());
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .getTimeSlots()
      .then((data) => {
        if (!cancelled) setTimeSlots(data.timeSlots);
      })
      .catch(() => {
        if (!cancelled) setTimeSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    if (!date) {
      setFormError("Please choose an appointment date.");
      return;
    }
    if (minDate && date < minDate) {
      setFormError("Appointments cannot be booked for a past date.");
      return;
    }
    if (!timeSlot) {
      setFormError("Please choose a time slot.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createAppointment({
        serviceId,
        appointmentDate: date,
        timeSlot,
        message: message.trim() || undefined,
      });
      toast.success("Appointment requested! The salon will confirm it soon.");
      router.push("/dashboard/appointments");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setFormError(
          "This slot is already booked — please pick another time.",
        );
      } else {
        setFormError(
          error instanceof ApiError
            ? error.message
            : "Could not submit your request. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-display text-2xl font-bold text-stone-900">
        Book an Appointment
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        Request <span className="font-medium text-stone-700">{serviceName}</span>{" "}
        — the salon confirms your booking, and you pay afterwards.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="appointment-date"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Appointment Date
          </label>
          <input
            id="appointment-date"
            type="date"
            required
            min={minDate || undefined}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div>
          <label
            htmlFor="time-slot"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Time Slot
          </label>
          <select
            id="time-slot"
            required
            value={timeSlot}
            onChange={(event) => setTimeSlot(event.target.value)}
            disabled={slotsLoading}
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-700 outline-none transition-colors focus:border-rose-500 focus:ring-2 focus:ring-rose-100 disabled:opacity-60"
          >
            <option value="">
              {slotsLoading ? "Loading time slots…" : "Select a time slot"}
            </option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Additional Message{" "}
          <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <textarea
          id="message"
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Anything the salon should know? (e.g. allergies, style references)"
          className="w-full resize-none rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {formError && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {submitting ? "Submitting your request…" : "Request Appointment"}
      </button>
    </form>
  );
}
