// Better Auth client. Auth runs against the Express server (baseURL) —
// the client only calls sign-up / sign-in / Google sign-in and never holds
// any OAuth secret. The server owns the Google client ID/secret and the
// OAuth callback; the JWT exchange lives in `lib/api.ts`.

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
});

export const { signIn, signUp, useSession } = authClient;
