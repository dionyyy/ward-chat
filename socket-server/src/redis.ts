import { Server } from "socket.io";
import Redis from "ioredis";

/**
 * Redis channels that the Socket.IO service subscribes to.
 * Next.js publishes events to these channels, and we broadcast them to clients.
 */
const REDIS_CHANNELS = [
  "message:new",
  "message:update",
  "message:delete",
  "typing",
  "presence:update",
  "notification",
];

/**
 * Set up the Redis subscriber that bridges events from Next.js → Socket.IO clients.
 */
export function setupRedisSubscriber(io: Server, redisUrl: string) {
  const redisSub = new Redis(redisUrl, {
    connectionName: "socket-server-sub",
    maxRetriesPerRequest: null,
    lazyConnect: false,
  });

  redisSub.on("error", (err) => {
    console.error("Redis subscriber error:", err.message);
  });

  redisSub.on("connect", () => {
    console.log("Redis subscriber connected");
  });

  redisSub.subscribe(...REDIS_CHANNELS, (err) => {
    if (err) {
      console.error("Failed to subscribe to Redis channels:", err);
    } else {
      console.log("Subscribed to Redis channels:", REDIS_CHANNELS.join(", "));
    }
  });

  redisSub.on("message", (channel, message) => {
    try {
      const data = JSON.parse(message);
      handleRedisMessage(io, channel, data);
    } catch (err) {
      console.error(`Failed to parse Redis message on ${channel}:`, err);
    }
  });

  return redisSub;
}

/**
 * Route Redis messages to the appropriate Socket.IO rooms.
 */
function handleRedisMessage(
  io: Server,
  channel: string,
  data: Record<string, unknown>
) {
  switch (channel) {
    case "message:new":
      // Broadcast new message to the channel room
      io.to(`channel:${data.channelId}`).emit("message:new", data);
      break;

    case "message:update":
      // Broadcast message edit to the channel room
      io.to(`channel:${data.channelId}`).emit("message:update", data);
      break;

    case "message:delete":
      // Broadcast message deletion to the channel room
      io.to(`channel:${data.channelId}`).emit("message:delete", data);
      break;

    case "typing":
      // Broadcast typing indicator to channel room (excluding the sender)
      io.to(`channel:${data.channelId}`).emit("typing", data);
      break;

    case "presence:update":
      // Broadcast presence changes to all server rooms the user is in
      if (data.serverIds && Array.isArray(data.serverIds)) {
        for (const serverId of data.serverIds) {
          io.to(`server:${serverId}`).emit("presence:update", data);
        }
      }
      break;

    case "notification":
      // Send notification to the specific user
      if (data.userId) {
        io.to(`user:${data.userId}`).emit("notification", data);
      }
      break;
  }
}
