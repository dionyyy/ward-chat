"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChannelSidebar } from "@/components/layout/channel-sidebar";
import { InviteModal } from "@/components/server/invite-modal";
import { CreateChannelModal } from "@/components/channel/create-channel-modal";

interface Category {
  id: string;
  name: string;
  channels: {
    id: string;
    name: string;
    type: "TEXT" | "VOICE" | "ANNOUNCEMENT";
  }[];
}

interface ServerLayoutClientProps {
  children: React.ReactNode;
  serverId: string;
  serverName: string;
  inviteCode: string;
  categories: Category[];
  memberRole: "ADMIN" | "MODERATOR" | "MEMBER";
}

export function ServerLayoutClient({
  children,
  serverId,
  serverName,
  inviteCode,
  categories,
  memberRole,
}: ServerLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // Extract active channel ID from URL
  const channelIdMatch = pathname.match(/\/channels\/([^/]+)/);
  const activeChannelId = channelIdMatch?.[1];

  function handleCreateChannel(categoryId: string) {
    if (memberRole === "MEMBER") return;
    setSelectedCategoryId(categoryId);
    setCreateChannelOpen(true);
  }

  return (
    <>
      <ChannelSidebar
        serverName={serverName}
        categories={categories}
        activeChannelId={activeChannelId}
        onChannelSelect={(channelId) =>
          router.push(`/servers/${serverId}/channels/${channelId}`)
        }
        onCreateChannel={handleCreateChannel}
        onServerSettings={() => {
          if (memberRole !== "MEMBER") {
            setInviteModalOpen(true);
          }
        }}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-900/50">
        {children}
      </div>

      {/* Modals */}
      <InviteModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        serverId={serverId}
        serverName={serverName}
        defaultInviteCode={inviteCode}
      />

      <CreateChannelModal
        open={createChannelOpen}
        onOpenChange={setCreateChannelOpen}
        serverId={serverId}
        categoryId={selectedCategoryId}
      />
    </>
  );
}
