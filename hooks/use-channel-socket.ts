"use client";

import { useEffect } from "react";
import { Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  memberId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface TypingUser {
  userId: string;
  userName: string;
  channelId: string;
  isTyping: boolean;
}

interface UseChannelSocketOptions {
  socket: Socket | null;
  channelId: string;
  onNewMessage?: (message: Message) => void;
  onMessageUpdate?: (message: Partial<Message> & { id: string }) => void;
  onMessageDelete?: (data: { id: string; channelId: string }) => void;
  onTyping?: (data: TypingUser) => void;
}

/**
 * Hook that subscribes to channel-specific Socket.IO events.
 * Automatically joins/leaves the channel room.
 */
export function useChannelSocket({
  socket,
  channelId,
  onNewMessage,
  onMessageUpdate,
  onMessageDelete,
  onTyping,
}: UseChannelSocketOptions) {
  useEffect(() => {
    if (!socket || !channelId) return;

    // Join the channel room
    socket.emit("join:channel", channelId);

    // Set up event listeners
    const handleNewMessage = (message: Message) => {
      if (message.channelId === channelId) {
        onNewMessage?.(message);
      }
    };

    const handleMessageUpdate = (message: Partial<Message> & { id: string }) => {
      if (message.channelId === channelId) {
        onMessageUpdate?.(message);
      }
    };

    const handleMessageDelete = (data: { id: string; channelId: string }) => {
      if (data.channelId === channelId) {
        onMessageDelete?.(data);
      }
    };

    const handleTyping = (data: TypingUser) => {
      if (data.channelId === channelId) {
        onTyping?.(data);
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:update", handleMessageUpdate);
    socket.on("message:delete", handleMessageDelete);
    socket.on("typing", handleTyping);

    return () => {
      // Leave room and remove listeners
      socket.emit("leave:channel", channelId);
      socket.off("message:new", handleNewMessage);
      socket.off("message:update", handleMessageUpdate);
      socket.off("message:delete", handleMessageDelete);
      socket.off("typing", handleTyping);
    };
  }, [socket, channelId, onNewMessage, onMessageUpdate, onMessageDelete, onTyping]);
}
