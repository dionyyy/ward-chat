"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Hash, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  createChannelSchema,
  type CreateChannelInput,
} from "@/lib/validators/channel";
import { createChannel } from "@/server/actions/channel";

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  categoryId?: string | null;
}

export function CreateChannelModal({
  open,
  onOpenChange,
  serverId,
  categoryId,
}: CreateChannelModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateChannelInput>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      type: "TEXT",
      isPrivate: false,
      categoryId: categoryId ?? null,
    },
  });

  const isPrivate = watch("isPrivate");

  async function onSubmit(data: CreateChannelInput) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createChannel(serverId, {
        ...data,
        categoryId: categoryId ?? data.categoryId,
      });
      if (result.success) {
        reset();
        onOpenChange(false);
        router.push(`/servers/${serverId}/channels/${result.channel.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create channel");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Add a new text channel to this server.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Channel type selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Channel Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValue("type", "TEXT")}
                className={`flex flex-1 items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                  watch("type") === "TEXT"
                    ? "border-sky-500 bg-sky-500/10 text-sky-300"
                    : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                }`}
              >
                <Hash className="h-4 w-4" />
                Text
              </button>
            </div>
          </div>

          {/* Channel name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="channel-name"
              className="text-sm font-medium text-slate-300"
            >
              Channel Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                {isPrivate ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Hash className="h-4 w-4" />
                )}
              </span>
              <input
                id="channel-name"
                type="text"
                placeholder="new-channel"
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-9 pr-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
            <p className="text-xs text-slate-500">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {/* Private toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="peer sr-only"
                {...register("isPrivate")}
              />
              <div className="h-5 w-9 rounded-full bg-slate-700 transition-colors peer-checked:bg-sky-500" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <span className="text-sm font-medium text-slate-200">
                Private Channel
              </span>
              <p className="text-xs text-slate-400">
                Only selected members can view this channel.
              </p>
            </div>
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Channel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
