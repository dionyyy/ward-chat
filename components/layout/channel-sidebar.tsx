"use client";

import { cn } from "@/lib/utils";
import { Hash, ChevronDown, Plus, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Channel {
  id: string;
  name: string;
  type: "TEXT" | "VOICE" | "ANNOUNCEMENT";
}

interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

interface ChannelSidebarProps {
  serverName: string;
  categories: Category[];
  activeChannelId?: string;
  onChannelSelect?: (channelId: string) => void;
  onCreateChannel?: (categoryId: string) => void;
  onServerSettings?: () => void;
}

export function ChannelSidebar({
  serverName,
  categories,
  activeChannelId,
  onChannelSelect,
  onCreateChannel,
  onServerSettings,
}: ChannelSidebarProps) {
  return (
    <div className="flex h-full w-60 flex-col bg-slate-800/50">
      {/* Server header */}
      <button
        onClick={onServerSettings}
        className="flex h-12 items-center justify-between border-b border-slate-700/50 px-4 transition-colors hover:bg-slate-700/30"
      >
        <h2 className="truncate text-sm font-semibold text-slate-100">
          {serverName}
        </h2>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {/* Channel list */}
      <ScrollArea className="flex-1 px-2 py-3">
        <div className="flex flex-col gap-4">
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category header */}
              <div className="group mb-1 flex items-center justify-between px-1">
                <button className="flex items-center gap-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-200">
                  <ChevronDown className="h-3 w-3" />
                  {category.name}
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onCreateChannel?.(category.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label={`Create channel in ${category.name}`}
                    >
                      <Plus className="h-4 w-4 text-slate-400 hover:text-slate-200" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create Channel</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Channels */}
              <div className="flex flex-col gap-0.5">
                {category.channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => onChannelSelect?.(channel.id)}
                    className={cn(
                      "group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                      channel.id === activeChannelId
                        ? "bg-slate-700/50 text-slate-100"
                        : "text-slate-400 hover:bg-slate-700/30 hover:text-slate-200"
                    )}
                  >
                    <Hash className="h-4 w-4 shrink-0 text-slate-500" />
                    <span className="truncate">{channel.name}</span>
                    {channel.id !== activeChannelId && (
                      <Settings className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User panel at bottom */}
      <div className="border-t border-slate-700/50 p-2">
        <div className="flex items-center gap-2 rounded-md bg-slate-900/50 px-2 py-1.5">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-slate-600" />
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-800 bg-emerald-500" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-medium text-slate-200">
              Loading...
            </p>
            <p className="truncate text-[10px] text-slate-400">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
