import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { publishPresenceUpdate } from "@/lib/realtime";

const PRESENCE_KEY_PREFIX = "presence:";
const PRESENCE_TTL = 300; // 5 minutes - auto-expire if not refreshed

export type PresenceStatus = "ONLINE" | "IDLE" | "BUSY" | "INVISIBLE" | "OFFLINE";

interface PresenceData {
  status: PresenceStatus;
  lastSeen: number; // Unix timestamp
}

/**
 * Set a user's presence status in Redis.
 * Also updates the database status field.
 */
export async function setPresence(
  userId: string,
  status: PresenceStatus
): Promise<void> {
  const data: PresenceData = {
    status,
    lastSeen: Date.now(),
  };

  // Store in Redis with TTL (auto-expires to offline if not refreshed)
  await redis.set(
    `${PRESENCE_KEY_PREFIX}${userId}`,
    JSON.stringify(data),
    "EX",
    PRESENCE_TTL
  );

  // Update database (for persistence across restarts)
  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  // Get user's server memberships to broadcast to
  const members = await prisma.member.findMany({
    where: { userId },
    select: { serverId: true },
  });

  const serverIds = members.map((m) => m.serverId);

  // Broadcast to all servers the user is in
  if (serverIds.length > 0) {
    await publishPresenceUpdate({ userId, status, serverIds });
  }
}

/**
 * Refresh presence TTL without changing status.
 * Called periodically to keep the user "alive".
 */
export async function refreshPresence(userId: string): Promise<void> {
  const key = `${PRESENCE_KEY_PREFIX}${userId}`;
  const existing = await redis.get(key);

  if (existing) {
    const data: PresenceData = JSON.parse(existing);
    data.lastSeen = Date.now();
    await redis.set(key, JSON.stringify(data), "EX", PRESENCE_TTL);
  }
}

/**
 * Get a user's current presence status.
 * Falls back to database if not in Redis.
 */
export async function getPresence(userId: string): Promise<PresenceStatus> {
  const data = await redis.get(`${PRESENCE_KEY_PREFIX}${userId}`);

  if (data) {
    const parsed: PresenceData = JSON.parse(data);
    return parsed.status;
  }

  // Fallback to database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });

  return (user?.status as PresenceStatus) || "OFFLINE";
}

/**
 * Get presence for multiple users at once.
 */
export async function getPresenceBatch(
  userIds: string[]
): Promise<Map<string, PresenceStatus>> {
  const result = new Map<string, PresenceStatus>();

  if (userIds.length === 0) return result;

  // Use Redis pipeline for efficiency
  const pipeline = redis.pipeline();
  for (const userId of userIds) {
    pipeline.get(`${PRESENCE_KEY_PREFIX}${userId}`);
  }

  const responses = await pipeline.exec();

  if (responses) {
    for (let i = 0; i < userIds.length; i++) {
      const [, data] = responses[i] as [Error | null, string | null];
      if (data) {
        const parsed: PresenceData = JSON.parse(data);
        result.set(userIds[i], parsed.status);
      } else {
        result.set(userIds[i], "OFFLINE");
      }
    }
  }

  return result;
}

/**
 * Remove a user's presence (mark as offline).
 */
export async function removePresence(userId: string): Promise<void> {
  await redis.del(`${PRESENCE_KEY_PREFIX}${userId}`);
  await prisma.user.update({
    where: { id: userId },
    data: { status: "OFFLINE" },
  });

  // Broadcast offline status
  const members = await prisma.member.findMany({
    where: { userId },
    select: { serverId: true },
  });

  const serverIds = members.map((m) => m.serverId);
  if (serverIds.length > 0) {
    await publishPresenceUpdate({ userId, status: "OFFLINE", serverIds });
  }
}
