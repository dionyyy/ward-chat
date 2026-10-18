"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { updatePresence } from "@/server/actions/presence";

type Status = "ONLINE" | "IDLE" | "BUSY" | "INVISIBLE" | "OFFLINE";

const STATUS_OPTIONS: { value: Status; label: string; color: string; description: string }[] = [
  {
    value: "ONLINE",
    label: "Online",
    color: "bg-emerald-500",
    description: "You are visible to others",
  },
  {
    value: "IDLE",
    label: "Idle",
    color: "bg-amber-500",
    description: "You appear as away",
  },
  {
    value: "BUSY",
    label: "Do Not Disturb",
    color: "bg-red-500",
    description: "Suppress notifications",
  },
  {
    value: "INVISIBLE",
    label: "Invisible",
    color: "bg-slate-500",
    description: "You appear offline to others",
  },
];

interface StatusPickerProps {
  currentStatus: Status;
  onClose?: () => void;
}

export function StatusPicker({ currentStatus, onClose }: StatusPickerProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleSelect(status: Status) {
    setIsUpdating(true);
    try {
      await updatePresence(status);
      onClose?.();
    } catch {
      // Silently fail
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-700 bg-slate-800 p-2 shadow-xl">
      <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-400">
        Set Status
      </p>
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          disabled={isUpdating}
          className={cn(
            "flex items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-slate-700/50 disabled:opacity-50",
            currentStatus === option.value && "bg-slate-700/30"
          )}
        >
          <div className={cn("h-3 w-3 rounded-full", option.color)} />
          <div>
            <p className="text-sm font-medium text-slate-200">
              {option.label}
            </p>
            <p className="text-xs text-slate-400">{option.description}</p>
          </div>
          {currentStatus === option.value && (
            <span className="ml-auto text-xs text-sky-400">Current</span>
          )}
        </button>
      ))}
    </div>
  );
}
