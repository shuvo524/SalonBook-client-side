"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function SignInForm() {
  const { user, loading, signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // After sign-in, return to the page that required auth (e.g. a service
  // details page), or to the dashboard by default. Only same-site paths
  // are honoured, so a crafted `next` can never redirect off-site.
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      toast.success("Welcome back!");
      router.push(next);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Sign-in failed. Please check your email and password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setFormError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Google sign-in failed. Please try again.",
      );
      setGoogleLoading(false);
    }
  }

  if (loading || user) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-16rem)] w-full max-w-md items-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center font-display text-3xl font-bold text-stone-900">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-stone-500">
          Sign in to manage your appointments.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || googleLoading}
            className="w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-stone-200" />
          <span className="text-xs font-medium tracking-wide text-stone-400 uppercase">
            or
          </span>
          <span className="h-px flex-1 bg-stone-200" />
        </div>

        <GoogleSignInButton
          onClick={handleGoogle}
          disabled={submitting || googleLoading}
          label={googleLoading ? "Redirecting to Google…" : "Sign in with Google"}
        />

        <p className="mt-6 text-center text-sm text-stone-500">
          New to SalonBook?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-rose-600 hover:text-rose-700"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
