"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ServerSidebar } from "./server-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CreateServerModal } from "@/components/server/create-server-modal";
import { JoinServerModal } from "@/components/server/join-server-modal";

interface AppShellProps {
  children: React.ReactNode;
  servers?: { id: string; name: string; imageUrl?: string | null }[];
  activeServerId?: string;
}

export function AppShell({
  children,
  servers = [],
  activeServerId,
}: AppShellProps) {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={50}>
      <div className="flex h-screen w-full overflow-hidden bg-slate-950">
        {/* Left sidebar - Server icons */}
        <ServerSidebar
          servers={servers}
          activeServerId={activeServerId}
          onServerSelect={(serverId) => router.push(`/servers/${serverId}`)}
          onCreateServer={() => setCreateModalOpen(true)}
          onExplore={() => setJoinModalOpen(true)}
        />

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>

      {/* Modals */}
      <CreateServerModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      <JoinServerModal open={joinModalOpen} onOpenChange={setJoinModalOpen} />
    </TooltipProvider>
  );
}
