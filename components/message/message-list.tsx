"use client";

import { useRef, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { MessageItem } from "./message-item";

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

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReply: (id: string) => void;
}

export function MessageList({
  messages,
  currentUserId,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onEdit,
  onDelete,
  onReply,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // Scroll to bottom on new messages (if already at bottom)
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Track scroll position for auto-scroll behavior
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    isAtBottomRef.current = isAtBottom;

    // Load more when scrolled to top
    if (el.scrollTop < 100 && hasMore && !isLoadingMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Determine if messages should be "grouped" (same user within 5 min)
  function shouldGroup(current: Message, previous: Message | undefined): boolean {
    if (!previous) return false;
    if (current.userId !== previous.userId) return false;
    if (current.replyTo) return false;

    const timeDiff =
      new Date(current.createdAt).getTime() -
      new Date(previous.createdAt).getTime();
    return timeDiff < 5 * 60 * 1000; // 5 minutes
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex flex-1 flex-col overflow-y-auto"
    >
      {/* Load more indicator */}
      {hasMore && (
        <div className="flex justify-center py-4">
          {isLoadingMore ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : (
            <button
              onClick={onLoadMore}
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              Load older messages
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1" />
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          id={message.id}
          content={message.content}
          createdAt={message.createdAt}
          isEdited={message.isEdited}
          user={message.user}
          member={message.member}
          replyTo={message.replyTo}
          isOwn={message.userId === currentUserId}
          isGrouped={shouldGroup(message, messages[index - 1])}
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
        />
      ))}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
