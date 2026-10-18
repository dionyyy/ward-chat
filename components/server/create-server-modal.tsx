"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createServerSchema, type CreateServerInput } from "@/lib/validators/server";
import { createServer } from "@/server/actions/server";

interface CreateServerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateServerModal({ open, onOpenChange }: CreateServerModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateServerInput>({
    resolver: zodResolver(createServerSchema),
  });

  async function onSubmit(data: CreateServerInput) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createServer(data);
      if (result.success) {
        reset();
        onOpenChange(false);
        router.push(`/servers/${result.server.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a server</DialogTitle>
          <DialogDescription>
            Give your new server a name. You can always change it later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="server-name"
              className="text-sm font-medium text-slate-300"
            >
              Server Name
            </label>
            <input
              id="server-name"
              type="text"
              placeholder="My awesome server"
              className="h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="server-description"
              className="text-sm font-medium text-slate-300"
            >
              Description{" "}
              <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="server-description"
              type="text"
              placeholder="What's this server about?"
              className="h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

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
                "Create Server"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
