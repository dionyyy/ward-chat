"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplyTo {
  id: string;
  userName: string;
  content: string;
}

interface MessageInputProps {
  channelName: string;
  replyTo?: ReplyTo | null;
  onSend: (content: string, replyToId?: string) => void;
  onCancelReply?: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
}

export function MessageInput({
  channelName,
  replyTo,
  onSend,
  onCancelReply,
  onTypingStart,
  onTypingStop,
  disabled = false,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.();
    }

    // Reset the stop timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop?.();
    }, 2000);
  }, [onTypingStart, onTypingStop]);

  function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed, replyTo?.id);
    setContent("");

    // Stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    onTypingStop?.();

    // Refocus
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    handleTyping();

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }

  return (
    <div className="border-t border-slate-700/50 px-4 pb-4 pt-2">
      {/* Reply indicator */}
      {replyTo && (
        <div className="mb-2 flex items-center gap-2 rounded-t-lg bg-slate-800/50 px-3 py-2 text-xs">
          <span className="text-slate-400">
            Replying to{" "}
            <span className="font-medium text-slate-200">
              {replyTo.userName}
            </span>
          </span>
          <span className="flex-1 truncate text-slate-500">
            {replyTo.content}
          </span>
          <button
            onClick={onCancelReply}
            className="text-slate-400 hover:text-slate-200"
            aria-label="Cancel reply"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input area */}
      <div
        className={cn(
          "flex items-end gap-2 rounded-lg bg-slate-800 px-3 py-2",
          replyTo && "rounded-t-none"
        )}
      >
        <button
          className="mb-0.5 shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          aria-label="Attach file"
        >
          <Plus className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          disabled={disabled}
          rows={1}
          className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || disabled}
          className={cn(
            "mb-0.5 shrink-0 rounded-full p-1.5 transition-colors",
            content.trim()
              ? "bg-sky-500 text-white hover:bg-sky-600"
              : "text-slate-500"
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
