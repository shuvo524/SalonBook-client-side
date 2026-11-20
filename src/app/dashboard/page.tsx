"use client";

import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/Loader";
import AdminOverview from "@/components/AdminOverview";
import CustomerOverview from "@/components/CustomerOverview";

// Role-based overview: each role sees its own dashboard.
export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <PageLoader label="Loading your dashboard…" />;
  }

  if (user.role === "admin") {
    return <AdminOverview />;
  }

  return <CustomerOverview />;
}
