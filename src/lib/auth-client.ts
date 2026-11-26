// Better Auth client. Auth runs through the CLIENT origin: the browser
// only ever talks to the client URL, and Next.js rewrites /api/* to the
// Express server (see next.config.ts). The server still owns the Google
// client ID/secret and the OAuth callback; the client never holds any
// OAuth secret. The JWT exchange lives in `lib/api.ts`.
//
// Examiner feedback (Assignment 9, 2026-11-21): "You used server URL in
// your auth. Use Client URL."

import { createAuthClient } from "better-auth/react";

/** The origin the browser is on — the client URL in production. */
function clientOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_CLIENT_URL ?? "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: clientOrigin(),
});

export const { signIn, signUp, useSession } = authClient;
