"use client";

import { useState } from "react";
import { Pencil, Trash2, Reply, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";

interface MessageItemProps {
  id: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  user: {
    id: string;
    name: string;
    username?: string | null;
    avatarUrl?: string | null;
  };
  member?: {
    role: string;
    nickname?: string | null;
  };
  replyTo?: {
    id: string;
    content: string;
    user: { id: string; name: string };
  } | null;
  isOwn: boolean;
  isGrouped?: boolean;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onReply?: (id: string) => void;
}

export function MessageItem({
  id,
  content,
  createdAt,
  isEdited,
  user,
  member,
  replyTo,
  isOwn,
  isGrouped = false,
  onEdit,
  onDelete,
  onReply,
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showActions, setShowActions] = useState(false);

  const displayName = member?.nickname || user.name;
  const time = new Date(createdAt);
  const timeStr = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = time.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year:
      time.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });

  function handleEditSubmit() {
    if (editContent.trim() && editContent !== content) {
      onEdit?.(id, editContent.trim());
    }
    setIsEditing(false);
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === "Escape") {
      setEditContent(content);
      setIsEditing(false);
    }
  }

  return (
    <div
      className={cn(
        "group relative flex gap-4 px-4 py-0.5 hover:bg-slate-800/30",
        !isGrouped && "mt-4 pt-1"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Reply reference */}
      {replyTo && !isGrouped && (
        <div className="absolute -top-3 left-16 flex items-center gap-1 text-xs text-slate-400">
          <Reply className="h-3 w-3 rotate-180" />
          <span className="font-medium text-slate-300">
            {replyTo.user.name}
          </span>
          <span className="truncate max-w-[200px]">{replyTo.content}</span>
        </div>
      )}

      {/* Avatar or spacer */}
      {isGrouped ? (
        <div className="w-10 shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-[10px] text-slate-500">{timeStr}</span>
        </div>
      ) : (
        <UserAvatar
          name={user.name}
          imageUrl={user.avatarUrl}
          size="md"
          showStatus={false}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header (only for non-grouped) */}
        {!isGrouped && (
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-slate-100">
              {displayName}
            </span>
            {member?.role === "ADMIN" && (
              <span className="rounded bg-sky-500/20 px-1 py-0.5 text-[10px] font-medium text-sky-300">
                ADMIN
              </span>
            )}
            {member?.role === "MODERATOR" && (
              <span className="rounded bg-teal-500/20 px-1 py-0.5 text-[10px] font-medium text-teal-300">
                MOD
              </span>
            )}
            <span className="text-xs text-slate-500">
              {dateStr} {timeStr}
            </span>
          </div>
        )}

        {/* Message body */}
        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="w-full resize-none rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
              rows={2}
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-500">
              Press Enter to save, Escape to cancel
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">
            {content}
            {isEdited && (
              <span className="ml-1 text-[10px] text-slate-500">(edited)</span>
            )}
          </p>
        )}
      </div>

      {/* Action buttons (hover) */}
      {showActions && !isEditing && (
        <div className="absolute -top-3 right-4 flex items-center gap-0.5 rounded-md border border-slate-700 bg-slate-800 p-0.5 shadow-lg">
          {onReply && (
            <button
              onClick={() => onReply(id)}
              className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              aria-label="Reply"
            >
              <Reply className="h-4 w-4" />
            </button>
          )}
          {isOwn && onEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {(isOwn || member?.role !== "MEMBER") && onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="rounded p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            aria-label="More"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
