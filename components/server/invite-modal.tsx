"use client";

import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createInvite } from "@/server/actions/server";

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  serverName: string;
  defaultInviteCode: string;
}

export function InviteModal({
  open,
  onOpenChange,
  serverId,
  serverName,
  defaultInviteCode,
}: InviteModalProps) {
  const [inviteUrl, setInviteUrl] = useState(
    `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${defaultInviteCode}`
  );
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerateNew() {
    setIsGenerating(true);
    try {
      const result = await createInvite(serverId, { expiresInHours: 24 });
      if (result.success) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setInviteUrl(`${origin}/invite/${result.invite.code}`);
      }
    } catch {
      // Keep existing URL on error
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite people to {serverName}</DialogTitle>
          <DialogDescription>
            Share this link with others to grant access to your server.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteUrl}
              className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-200 focus:outline-none"
            />
            <Button
              size="icon"
              variant="secondary"
              onClick={handleCopy}
              aria-label="Copy invite link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateNew}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Generate New Link"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
