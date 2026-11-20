"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/Loader";

interface ProtectedRouteProps {
  children: ReactNode;
  /** When set, only users with this role may see the page. */
  role?: "customer" | "admin";
}

/**
 * Client-side route guard. Unauthenticated visitors go to sign-in (and are
 * returned here afterwards); a user with the wrong role goes to their own
 * dashboard. This is UX only — the server enforces every role on its APIs.
 */
export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    } else if (role && user.role !== role) {
      router.replace("/dashboard");
    }
  }, [loading, user, role, router, pathname]);

  if (loading || !user || (role && user.role !== role)) {
    return <PageLoader label="Checking your access…" />;
  }

  return <>{children}</>;
}
