"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/Loader";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICONS = {
  overview:
    "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  calendar:
    "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
  sparkles:
    "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
  users:
    "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  receipt:
    "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75",
  profile:
    "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
};

const CUSTOMER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <Icon d={ICONS.overview} /> },
  {
    href: "/dashboard/appointments",
    label: "My Appointments",
    icon: <Icon d={ICONS.calendar} />,
  },
  {
    href: "/dashboard/payments",
    label: "My Payments",
    icon: <Icon d={ICONS.card} />,
  },
  {
    href: "/dashboard/profile",
    label: "My Profile",
    icon: <Icon d={ICONS.profile} />,
  },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <Icon d={ICONS.overview} /> },
  {
    href: "/dashboard/services",
    label: "Services",
    icon: <Icon d={ICONS.sparkles} />,
  },
  {
    href: "/dashboard/appointments",
    label: "Appointments",
    icon: <Icon d={ICONS.calendar} />,
  },
  { href: "/dashboard/users", label: "Users", icon: <Icon d={ICONS.users} /> },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: <Icon d={ICONS.receipt} />,
  },
  {
    href: "/dashboard/profile",
    label: "My Profile",
    icon: <Icon d={ICONS.profile} />,
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Dashboard shell: guards every dashboard route (signed-in users only)
 * and renders the role-based sidebar. On mobile the sidebar becomes a
 * horizontal scrolling nav strip.
 */
export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return <PageLoader label="Loading your dashboard…" />;
  }

  const navItems = user.role === "admin" ? ADMIN_NAV : CUSTOMER_NAV;
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-10">
      {/* Desktop sidebar */}
      <aside className="sidebar-scroll sticky top-24 hidden w-64 shrink-0 self-start lg:block">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-600 text-lg font-bold text-white">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-stone-500">{user.email}</p>
              <span className="mt-1 inline-block rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 capitalize">
                {user.role}
              </span>
            </div>
          </div>

          <nav className="mt-6 space-y-1" aria-label="Dashboard">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-stone-600 hover:bg-rose-50 hover:text-rose-700"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-6 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile nav strip */}
      <div className="mb-5 lg:hidden">
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-base font-bold text-white">
              {initial}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-900">
              {user.name}
            </p>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 capitalize">
              {user.role}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="shrink-0 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700"
          >
            Sign Out
          </button>
        </div>
        <nav
          className="sidebar-scroll mt-3 flex gap-2 overflow-x-auto pb-1"
          aria-label="Dashboard"
        >
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-rose-600 text-white shadow-sm"
                    : "border border-stone-200 bg-white text-stone-600"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
