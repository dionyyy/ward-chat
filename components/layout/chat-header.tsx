"use client";

import { Hash, Users, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  channelName?: string;
  channelTopic?: string;
  isMemberListVisible?: boolean;
  onToggleMemberList?: () => void;
  onSearch?: () => void;
}

export function ChatHeader({
  channelName = "general",
  channelTopic,
  isMemberListVisible = true,
  onToggleMemberList,
  onSearch,
}: ChatHeaderProps) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-slate-700/50 px-4">
      {/* Left section */}
      <div className="flex items-center gap-2 overflow-hidden">
        <Hash className="h-5 w-5 shrink-0 text-slate-400" />
        <h3 className="truncate text-sm font-semibold text-slate-100">
          {channelName}
        </h3>
        {channelTopic && (
          <>
            <div className="h-4 w-px bg-slate-700" />
            <p className="truncate text-xs text-slate-400">{channelTopic}</p>
          </>
        )}
      </div>

      {/* Right section - action buttons */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onSearch}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Search</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleMemberList}
              aria-label="Toggle member list"
              className={cn(isMemberListVisible && "bg-slate-700/50")}
            >
              <Users className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMemberListVisible ? "Hide" : "Show"} Member List</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
