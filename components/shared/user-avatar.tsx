"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  status?: "ONLINE" | "IDLE" | "BUSY" | "INVISIBLE" | "OFFLINE";
  size?: "sm" | "md" | "lg";
  className?: string;
  showStatus?: boolean;
}

const statusColors = {
  ONLINE: "bg-emerald-500",
  IDLE: "bg-amber-500",
  BUSY: "bg-red-500",
  INVISIBLE: "bg-slate-500",
  OFFLINE: "bg-slate-500",
};

const sizeClasses = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

const statusSizeClasses = {
  sm: "h-2.5 w-2.5 border",
  md: "h-3 w-3 border-2",
  lg: "h-4 w-4 border-2",
};

export function UserAvatar({
  name,
  imageUrl,
  status = "OFFLINE",
  size = "md",
  className,
  showStatus = true,
}: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("relative", className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={imageUrl || undefined} alt={name} />
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            size === "lg" && "text-lg",
            size === "sm" && "text-[10px]"
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-slate-900",
            statusColors[status],
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  );
}
