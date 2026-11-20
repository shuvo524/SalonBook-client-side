// Authentication state for the whole app.
//
// Flow (per the server contract):
//  1. Sign-in / sign-up go through the Better Auth client, which sets a
//     session cookie on the server origin.
//  2. The client then exchanges that cookie for a JWT
//     (`POST /api/auth/token`) and stores it in localStorage.
//  3. Every protected API call sends `Authorization: Bearer <token>`.
//  4. On load / refresh, a stored token is validated with
//     `GET /api/profile/me`; if it is expired, the session cookie is tried
//     again via the token endpoint (this is also how a Google sign-in
//     redirect lands the user back signed in).
//  5. Sign-out ends the server session AND deletes the stored JWT.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  api,
  ApiError,
  exchangeToken,
  getToken,
  signOutRequest,
  TOKEN_KEY,
} from "@/lib/api";
import { signIn as authSignIn, signUp as authSignUp } from "@/lib/auth-client";
import type { User } from "@/lib/types";

interface AuthContextValue {
  /** The signed-in user, or null when signed out. */
  user: User | null;
  /** True while the initial session restore is running. */
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
    image?: string,
  ) => Promise<User>;
  /** Redirects the browser to Google; the user returns to /dashboard. */
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-fetch the current user (used after profile updates). */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function storeSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const restoring = useRef(false);
  const router = useRouter();

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // Restore the session once, on app load.
  useEffect(() => {
    if (restoring.current) return;
    restoring.current = true;

    async function restore() {
      try {
        const token = getToken();
        if (token) {
          try {
            const { user: me } = await api.getProfile();
            setUser(me);
            return;
          } catch (error) {
            // An expired/invalid token is not fatal: the session cookie
            // may still be valid, so try the exchange before giving up.
            if (!(error instanceof ApiError) || error.status !== 401) {
              throw error;
            }
          }
        }
        // No (valid) token: try the cookie-based exchange. This covers
        // the Google sign-in redirect, where no token exists yet.
        const { token: freshToken, user: me } = await exchangeToken();
        storeSession(freshToken, me);
        setUser(me);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    void restore();
  }, [clearSession]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const result = await authSignIn.email({ email, password });
      if (result.error) {
        throw new Error(result.error.message ?? "Sign-in failed.");
      }
      const { token, user: me } = await exchangeToken();
      storeSession(token, me);
      setUser(me);
      return me;
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string, image?: string) => {
      const result = await authSignUp.email({
        name,
        email,
        password,
        ...(image ? { image } : {}),
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Sign-up failed.");
      }
      const { token, user: me } = await exchangeToken();
      storeSession(token, me);
      setUser(me);
      return me;
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    // Absolute client URL: a relative path would resolve to the server's
    // origin and 404. `window.location.origin` keeps this correct after
    // deployment without a code change.
    const callbackURL = `${window.location.origin}/dashboard`;
    const result = await authSignIn.social({ provider: "google", callbackURL });
    if (result.error) {
      throw new Error(result.error.message ?? "Google sign-in failed.");
    }
    // On success the browser navigates away to Google; restore() picks
    // the session up when the user returns to /dashboard.
  }, []);

  const signOut = useCallback(async () => {
    await signOutRequest();
    clearSession();
    router.push("/");
    router.refresh();
  }, [clearSession, router]);

  const refreshUser = useCallback(async () => {
    const { user: me } = await api.getProfile();
    setUser(me);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      refreshUser,
    }),
    [
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return context;
}
