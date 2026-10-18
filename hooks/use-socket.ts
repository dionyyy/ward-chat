"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
  userId?: string;
  token?: string;
  enabled?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  joinServer: (serverId: string) => void;
  leaveServer: (serverId: string) => void;
  startTyping: (channelId: string, userName: string) => void;
  stopTyping: (channelId: string) => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useSocket({
  userId,
  token,
  enabled = true,
}: UseSocketOptions): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !userId || !token) {
      return;
    }

    // Don't create duplicate connections
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { userId, token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [userId, token, enabled]);

  const joinChannel = useCallback((channelId: string) => {
    socketRef.current?.emit("join:channel", channelId);
  }, []);

  const leaveChannel = useCallback((channelId: string) => {
    socketRef.current?.emit("leave:channel", channelId);
  }, []);

  const joinServer = useCallback((serverId: string) => {
    socketRef.current?.emit("join:server", serverId);
  }, []);

  const leaveServer = useCallback((serverId: string) => {
    socketRef.current?.emit("leave:server", serverId);
  }, []);

  const startTyping = useCallback((channelId: string, userName: string) => {
    socketRef.current?.emit("typing:start", { channelId, userName });
  }, []);

  const stopTyping = useCallback((channelId: string) => {
    socketRef.current?.emit("typing:stop", { channelId });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinChannel,
    leaveChannel,
    joinServer,
    leaveServer,
    startTyping,
    stopTyping,
  };
}
