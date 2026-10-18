"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSocket } from "@/hooks/use-socket";
import type { Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  joinServer: (serverId: string) => void;
  leaveServer: (serverId: string) => void;
  startTyping: (channelId: string, userName: string) => void;
  stopTyping: (channelId: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: ReactNode;
  userId?: string;
  token?: string;
}

export function SocketProvider({
  children,
  userId,
  token,
}: SocketProviderProps) {
  const socketState = useSocket({
    userId,
    token,
    enabled: !!userId && !!token,
  });

  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
}
