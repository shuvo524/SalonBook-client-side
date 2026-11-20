"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const PASSWORD_RULES = [
  { test: (value: string) => value.length >= 6, label: "At least 6 characters" },
  { test: (value: string) => /[A-Z]/.test(value), label: "One uppercase letter" },
  { test: (value: string) => /[a-z]/.test(value), label: "One lowercase letter" },
];

export default function SignUpPage() {
  const { user, loading, signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Already signed in? There is nothing to sign up for.
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const failedRule = PASSWORD_RULES.find((rule) => !rule.test(password));
    if (failedRule) {
      setFormError(`Password: ${failedRule.label.toLowerCase()}.`);
      return;
    }
    if (image && !/^https?:\/\//i.test(image)) {
      setFormError("Profile image must be a valid image URL.");
      return;
    }

    setSubmitting(true);
    try {
      await signUpWithEmail(
        name.trim(),
        email.trim(),
        password,
        image.trim() || undefined,
      );
      toast.success("Welcome to SalonBook! Your account is ready.");
      router.push("/dashboard");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Sign-up failed. Please try again.",
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
          Create your account
        </h1>
        <p className="mt-2 text-center text-sm text-stone-500">
          Book salon appointments in minutes.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>

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
              placeholder="Create a password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-2 text-xs ${
                      passed ? "text-emerald-600" : "text-stone-500"
                    }`}
                  >
                    <span aria-hidden="true">{passed ? "✓" : "○"}</span>
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <label
              htmlFor="image"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Profile Image URL{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="image"
              type="url"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="https://example.com/your-photo.jpg"
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
            <p className="mt-1.5 text-xs text-stone-400">
              You can also upload a photo later from your profile page.
            </p>
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
            {submitting ? "Creating your account…" : "Sign Up"}
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
          label={googleLoading ? "Redirecting to Google…" : "Sign up with Google"}
        />

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-rose-600 hover:text-rose-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
