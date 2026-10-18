"use server";

import { requireAuth } from "@/lib/auth-server";
import { setPresence, refreshPresence } from "@/server/services/presence";
import type { PresenceStatus } from "@/server/services/presence";

const VALID_STATUSES: PresenceStatus[] = [
  "ONLINE",
  "IDLE",
  "BUSY",
  "INVISIBLE",
  "OFFLINE",
];

/**
 * Update the current user's presence status.
 */
export async function updatePresence(status: string) {
  const session = await requireAuth();

  if (!VALID_STATUSES.includes(status as PresenceStatus)) {
    throw new Error("Invalid status");
  }

  await setPresence(session.user.id, status as PresenceStatus);
  return { success: true };
}

/**
 * Heartbeat to keep presence alive.
 * Called periodically by the client.
 */
export async function heartbeat() {
  const session = await requireAuth();
  await refreshPresence(session.user.id);
  return { success: true };
}
