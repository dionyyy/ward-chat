import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Get the current session on the server side.
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export async function getServerSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

/**
 * Require authentication. Throws if not authenticated.
 * Use in Server Actions and Route Handlers for protected operations.
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
