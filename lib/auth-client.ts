import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use the same origin the app is served from. This avoids CORS errors
  // when the Next.js dev server picks a different port (e.g. 3002 when
  // 3000 is already in use). On the server we fall back to the env var.
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
