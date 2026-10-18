import { Server } from "socket.io";
import type { AuthenticatedSocket } from "../middleware/auth";

/**
 * Register all Socket.IO event handlers for an authenticated connection.
 */
export function registerHandlers(io: Server, socket: AuthenticatedSocket) {
  const userId = socket.data.userId;

  // Auto-join user's personal room for DMs and notifications
  socket.join(`user:${userId}`);

  // ─── Room Management ────────────────────────────────────

  socket.on("join:channel", (channelId: string) => {
    if (!channelId) return;
    socket.join(`channel:${channelId}`);
  });

  socket.on("leave:channel", (channelId: string) => {
    if (!channelId) return;
    socket.leave(`channel:${channelId}`);
  });

  socket.on("join:server", (serverId: string) => {
    if (!serverId) return;
    socket.join(`server:${serverId}`);
  });

  socket.on("leave:server", (serverId: string) => {
    if (!serverId) return;
    socket.leave(`server:${serverId}`);
  });

  // ─── Typing Indicators ──────────────────────────────────

  socket.on(
    "typing:start",
    (data: { channelId: string; userName: string }) => {
      if (!data.channelId) return;
      // Broadcast to everyone in the channel except the sender
      socket.to(`channel:${data.channelId}`).emit("typing", {
        userId,
        userName: data.userName,
        channelId: data.channelId,
        isTyping: true,
      });
    }
  );

  socket.on("typing:stop", (data: { channelId: string }) => {
    if (!data.channelId) return;
    socket.to(`channel:${data.channelId}`).emit("typing", {
      userId,
      channelId: data.channelId,
      isTyping: false,
    });
  });

  // ─── Presence ───────────────────────────────────────────

  socket.on(
    "presence:set",
    (data: { status: string; serverIds: string[] }) => {
      // Broadcast to all servers the user is a member of
      if (data.serverIds && Array.isArray(data.serverIds)) {
        for (const serverId of data.serverIds) {
          socket.to(`server:${serverId}`).emit("presence:update", {
            userId,
            status: data.status,
          });
        }
      }
    }
  );
}
