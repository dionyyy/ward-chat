"use client";

import { cn } from "@/lib/utils";
import { Plus, Compass } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServerIconProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  isActive?: boolean;
  onClick?: () => void;
}

function ServerIcon({
  name,
  imageUrl,
  isActive,
  onClick,
}: ServerIconProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="group relative flex items-center"
          aria-label={name}
        >
          {/* Active indicator pill */}
          <div
            className={cn(
              "absolute left-0 w-1 rounded-r-full bg-white transition-all",
              isActive ? "h-10" : "h-0 group-hover:h-5"
            )}
          />

          {/* Server icon */}
          <div
            className={cn(
              "mx-3 flex h-12 w-12 items-center justify-center overflow-hidden transition-all",
              isActive
                ? "rounded-2xl bg-sky-500"
                : "rounded-3xl bg-slate-700 group-hover:rounded-2xl group-hover:bg-sky-500"
            )}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-white">
                {initials}
              </span>
            )}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface Server {
  id: string;
  name: string;
  imageUrl?: string | null;
}

interface ServerSidebarProps {
  servers: Server[];
  activeServerId?: string;
  onServerSelect?: (serverId: string) => void;
  onCreateServer?: () => void;
  onExplore?: () => void;
}

export function ServerSidebar({
  servers,
  activeServerId,
  onServerSelect,
  onCreateServer,
  onExplore,
}: ServerSidebarProps) {
  return (
    <div className="flex h-full w-[72px] flex-col items-center bg-slate-900 py-3">
      {/* Home / DMs button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="group relative flex items-center"
            aria-label="Direct Messages"
          >
            <div
              className={cn(
                "absolute left-0 w-1 rounded-r-full bg-white transition-all",
                !activeServerId ? "h-10" : "h-0 group-hover:h-5"
              )}
            />
            <div
              className={cn(
                "mx-3 flex h-12 w-12 items-center justify-center transition-all",
                !activeServerId
                  ? "rounded-2xl bg-sky-500"
                  : "rounded-3xl bg-slate-700 group-hover:rounded-2xl group-hover:bg-sky-500"
              )}
            >
              <span className="text-lg font-bold text-white">W</span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Direct Messages</p>
        </TooltipContent>
      </Tooltip>

      <Separator className="mx-auto my-2 w-8" />

      {/* Server list */}
      <ScrollArea className="w-full flex-1">
        <div className="flex flex-col items-center gap-2">
          {servers.map((server) => (
            <ServerIcon
              key={server.id}
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
              isActive={server.id === activeServerId}
              onClick={() => onServerSelect?.(server.id)}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator className="mx-auto my-2 w-8" />

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onCreateServer}
              className="group mx-3 flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-700 transition-all hover:rounded-2xl hover:bg-emerald-500"
              aria-label="Add a Server"
            >
              <Plus className="h-5 w-5 text-emerald-400 transition-colors group-hover:text-white" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add a Server</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onExplore}
              className="group mx-3 flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-700 transition-all hover:rounded-2xl hover:bg-emerald-500"
              aria-label="Explore Servers"
            >
              <Compass className="h-5 w-5 text-emerald-400 transition-colors group-hover:text-white" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Explore Servers</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
