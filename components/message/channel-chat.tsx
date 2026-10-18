"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { TypingIndicator } from "./typing-indicator";
import { sendMessage, editMessage, deleteMessage } from "@/server/actions/message";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  userId: string;
  user: {
    id: string;
    name: string;
    username?: string | null;
    avatarUrl?: string | null;
  };
  member?: {
    id: string;
    role: string;
    nickname?: string | null;
  };
  replyTo?: {
    id: string;
    content: string;
    user: { id: string; name: string };
  } | null;
}

interface ChannelChatProps {
  channelId: string;
  channelName: string;
  currentUserId: string;
  currentUserName: string;
  initialMessages: Message[];
  initialHasMore: boolean;
  initialCursor?: string;
}

export function ChannelChat({
  channelId,
  channelName,
  currentUserId,
  currentUserName,
  initialMessages,
  initialHasMore,
  initialCursor,
}: ChannelChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    userName: string;
    content: string;
  } | null>(null);
  const [typingUsers, setTypingUsers] = useState<
    { userId: string; userName: string }[]
  >([]);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Listen for real-time events via polling (Socket.IO integration placeholder)
  // In production, this would use the useChannelSocket hook
  // For now, we poll or use SSE as a fallback

  // Handle incoming new messages (called by socket or SSE)
  const handleNewMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    },
    []
  );

  const handleMessageUpdate = useCallback(
    (data: { id: string; content: string; isEdited: boolean }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.id
            ? { ...m, content: data.content, isEdited: data.isEdited }
            : m
        )
      );
    },
    []
  );

  const handleMessageDelete = useCallback((data: { id: string }) => {
    setMessages((prev) => prev.filter((m) => m.id !== data.id));
  }, []);

  const handleTypingEvent = useCallback(
    (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (data.userId === currentUserId) return;

      if (data.isTyping) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === data.userId)) return prev;
          return [...prev, { userId: data.userId, userName: data.userName }];
        });

        // Auto-clear after 3s
        const existing = typingTimeoutsRef.current.get(data.userId);
        if (existing) clearTimeout(existing);
        const timeout = setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter((u) => u.userId !== data.userId)
          );
          typingTimeoutsRef.current.delete(data.userId);
        }, 3000);
        typingTimeoutsRef.current.set(data.userId, timeout);
      } else {
        setTypingUsers((prev) =>
          prev.filter((u) => u.userId !== data.userId)
        );
        const existing = typingTimeoutsRef.current.get(data.userId);
        if (existing) {
          clearTimeout(existing);
          typingTimeoutsRef.current.delete(data.userId);
        }
      }
    },
    [currentUserId]
  );

  // Keep references fresh for socket hook
  useEffect(() => {
    // Expose handlers for socket integration
    (window as unknown as Record<string, unknown>).__channelHandlers = {
      handleNewMessage,
      handleMessageUpdate,
      handleMessageDelete,
      handleTypingEvent,
    };
  }, [handleNewMessage, handleMessageUpdate, handleMessageDelete, handleTypingEvent]);

  // Load more messages
  async function loadMore() {
    if (!hasMore || isLoadingMore || !nextCursor) return;
    setIsLoadingMore(true);

    try {
      const res = await fetch(
        `/api/messages?channelId=${channelId}&cursor=${nextCursor}&limit=50`
      );
      const data = await res.json();

      if (data.messages) {
        setMessages((prev) => [...data.messages, ...prev]);
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }

  // Send message
  async function handleSend(content: string, replyToId?: string) {
    try {
      const result = await sendMessage({
        content,
        channelId,
        replyToId,
      });

      if (result.success && result.message) {
        // Add to local state immediately (optimistic)
        handleNewMessage(result.message as unknown as Message);
      }

      setReplyTo(null);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  // Edit message
  async function handleEdit(messageId: string, content: string) {
    try {
      const result = await editMessage(messageId, { content });
      if (result.success) {
        handleMessageUpdate({
          id: messageId,
          content,
          isEdited: true,
        });
      }
    } catch (err) {
      console.error("Failed to edit message:", err);
    }
  }

  // Delete message
  async function handleDelete(messageId: string) {
    try {
      const result = await deleteMessage(messageId);
      if (result.success) {
        handleMessageDelete({ id: messageId });
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  }

  // Reply
  function handleReply(messageId: string) {
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      setReplyTo({
        id: msg.id,
        userName: msg.user.name,
        content: msg.content,
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReply={handleReply}
      />

      <TypingIndicator typingUsers={typingUsers} />

      <MessageInput
        channelName={channelName}
        replyTo={replyTo}
        onSend={handleSend}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
