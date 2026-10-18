"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberItem {
  id: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  status: "ONLINE" | "IDLE" | "BUSY" | "INVISIBLE" | "OFFLINE";
  role: "ADMIN" | "MODERATOR" | "MEMBER";
}

interface MemberSidebarProps {
  members: MemberItem[];
  isVisible?: boolean;
}

const statusColors = {
  ONLINE: "bg-emerald-500",
  IDLE: "bg-amber-500",
  BUSY: "bg-red-500",
  INVISIBLE: "bg-slate-500",
  OFFLINE: "bg-slate-500",
};

const roleLabels = {
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  MEMBER: "Member",
};

export function MemberSidebar({ members, isVisible = true }: MemberSidebarProps) {
  if (!isVisible) return null;

  const onlineMembers = members.filter(
    (m) => m.status !== "OFFLINE" && m.status !== "INVISIBLE"
  );
  const offlineMembers = members.filter(
    (m) => m.status === "OFFLINE" || m.status === "INVISIBLE"
  );

  return (
    <div className="hidden w-60 flex-col bg-slate-800/30 lg:flex">
      <ScrollArea className="flex-1 px-3 py-4">
        {/* Online members */}
        {onlineMembers.length > 0 && (
          <MemberGroup
            label={`Online — ${onlineMembers.length}`}
            members={onlineMembers}
          />
        )}

        {/* Offline members */}
        {offlineMembers.length > 0 && (
          <MemberGroup
            label={`Offline — ${offlineMembers.length}`}
            members={offlineMembers}
            isOffline
          />
        )}
      </ScrollArea>
    </div>
  );
}

function MemberGroup({
  label,
  members,
  isOffline = false,
}: {
  label: string;
  members: MemberItem[];
  isOffline?: boolean;
}) {
  return (
    <div className="mb-4">
      <h3 className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </h3>
      <div className="flex flex-col gap-0.5">
        {members.map((member) => (
          <button
            key={member.id}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-700/30",
              isOffline && "opacity-60"
            )}
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatarUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {member.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-800",
                  statusColors[member.status]
                )}
              />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="truncate text-sm text-slate-200">
                {member.name}
              </span>
              {member.role !== "MEMBER" && (
                <span className="text-[10px] text-slate-400">
                  {roleLabels[member.role]}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
