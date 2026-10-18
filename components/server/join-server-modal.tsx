"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { joinServerByInvite } from "@/server/actions/server";

interface JoinServerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinServerModal({ open, onOpenChange }: JoinServerModalProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await joinServerByInvite(inviteCode.trim());
      if (result.success && result.server) {
        setInviteCode("");
        onOpenChange(false);
        router.push(`/servers/${result.server.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a server</DialogTitle>
          <DialogDescription>
            Enter an invite code to join an existing server.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="invite-code"
              className="text-sm font-medium text-slate-300"
            >
              Invite Code
            </label>
            <input
              id="invite-code"
              type="text"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
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
            <Button onClick={handleJoin} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Join Server"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
