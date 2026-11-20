"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function NavLink({
  href,
  children,
  active,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-rose-50 text-rose-700"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  }

  function goToDashboard() {
    setMenuOpen(false);
    router.push("/dashboard");
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 font-display text-lg font-bold text-white">
            S
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-stone-900">
            Salon<span className="text-rose-600">Book</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink href="/" active={pathname === "/"}>
            Home
          </NavLink>
          <NavLink href="/services" active={pathname.startsWith("/services")}>
            Services
          </NavLink>
          {user && (
            <NavLink
              href="/dashboard"
              active={pathname.startsWith("/dashboard")}
            >
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Desktop auth area */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-stone-100" />
          ) : user ? (
            <>
              <button
                type="button"
                onClick={goToDashboard}
                className="flex items-center gap-2 rounded-full border border-stone-200 py-1 pl-1 pr-3 transition-colors hover:border-rose-200 hover:bg-rose-50"
              >
                {user.image ? (
                  // Plain <img>: avatars can come from any host (Google,
                  // ImgBB, user URLs), so next/image remote patterns
                  // cannot cover them all.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
                    {initial}
                  </span>
                )}
                <span className="max-w-32 truncate text-sm font-medium text-stone-800">
                  {user.name}
                </span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
              >
                {signingOut ? "Signing out…" : "Sign Out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100 md:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-stone-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink
              href="/"
              active={pathname === "/"}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              href="/services"
              active={pathname.startsWith("/services")}
              onClick={() => setMenuOpen(false)}
            >
              Services
            </NavLink>
            {user && (
              <NavLink
                href="/dashboard"
                active={pathname.startsWith("/dashboard")}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </NavLink>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-stone-100 pt-3">
            {loading ? null : user ? (
              <>
                <p className="truncate px-3 text-sm text-stone-500">
                  Signed in as{" "}
                  <span className="font-medium text-stone-800">
                    {user.name}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="rounded-lg bg-stone-100 px-3 py-2 text-left text-sm font-medium text-stone-800 disabled:opacity-50"
                >
                  {signingOut ? "Signing out…" : "Sign Out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-stone-100 px-3 py-2 text-center text-sm font-medium text-stone-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
