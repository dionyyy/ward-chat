import { redisPub } from "./redis";

/**
 * Publish a real-time event to the Socket.IO service via Redis.
 * The Socket.IO service subscribes to these channels and broadcasts to connected clients.
 */
export async function publishEvent(
  channel: string,
  data: Record<string, unknown>
) {
  try {
    await redisPub.publish(channel, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to publish event to ${channel}:`, err);
  }
}

// ─── Typed event publishers ───────────────────────────────

export async function publishNewMessage(data: {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  memberId: string;
  createdAt: string;
  user?: { id: string; name: string; avatarUrl?: string | null };
}) {
  return publishEvent("message:new", data);
}

export async function publishMessageUpdate(data: {
  id: string;
  content: string;
  channelId: string;
  isEdited: boolean;
}) {
  return publishEvent("message:update", data);
}

export async function publishMessageDelete(data: {
  id: string;
  channelId: string;
}) {
  return publishEvent("message:delete", data);
}

export async function publishTyping(data: {
  userId: string;
  userName: string;
  channelId: string;
  isTyping: boolean;
}) {
  return publishEvent("typing", data);
}

export async function publishPresenceUpdate(data: {
  userId: string;
  status: string;
  serverIds: string[];
}) {
  return publishEvent("presence:update", data);
}

export async function publishNotification(data: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
}) {
  return publishEvent("notification", data);
}
