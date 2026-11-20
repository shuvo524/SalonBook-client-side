"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/Loader";
import AdminOverview from "@/components/AdminOverview";

// Role-based overview: admins get the admin overview (Phase 5); the
// customer overview with live stats arrives in Phase 6 — until then
// customers see quick links to their sections.
export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <PageLoader label="Loading your dashboard…" />;
  }

  if (user.role === "admin") {
    return <AdminOverview />;
  }

  const quickLinks = [
    {
      href: "/services",
      title: "Browse Services",
      text: "Explore services and book a visit.",
    },
    {
      href: "/dashboard/appointments",
      title: "My Appointments",
      text: "Track and manage your bookings.",
    },
    {
      href: "/dashboard/payments",
      title: "My Payments",
      text: "See your payment history.",
    },
    {
      href: "/dashboard/profile",
      title: "My Profile",
      text: "Update your name, photo, and phone.",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">
        Welcome back, {user.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Here is a quick look at your salon bookings.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="font-display text-lg font-semibold text-stone-900">
              {link.title}
            </h2>
            <p className="mt-1 text-sm text-stone-500">{link.text}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-rose-600">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
