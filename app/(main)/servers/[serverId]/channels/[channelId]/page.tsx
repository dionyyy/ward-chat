import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";
import { ChatHeader } from "@/components/layout/chat-header";
import { ChannelChat } from "@/components/message/channel-chat";

const MESSAGES_PER_PAGE = 50;

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ serverId: string; channelId: string }>;
}) {
  const session = await requireAuth();
  const { serverId, channelId } = await params;

  // Verify membership
  const member = await prisma.member.findUnique({
    where: {
      userId_serverId: {
        userId: session.user.id,
        serverId,
      },
    },
  });

  if (!member) {
    redirect("/servers");
  }

  // Fetch channel
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel || channel.deletedAt || channel.serverId !== serverId) {
    redirect(`/servers/${serverId}`);
  }

  // Fetch initial messages (newest first, then reversed for display)
  const rawMessages = await prisma.message.findMany({
    where: {
      channelId,
      deletedAt: null,
    },
    take: MESSAGES_PER_PAGE + 1,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
        },
      },
      member: {
        select: {
          id: true,
          role: true,
          nickname: true,
        },
      },
      replyTo: {
        select: {
          id: true,
          content: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  const hasMore = rawMessages.length > MESSAGES_PER_PAGE;
  if (hasMore) rawMessages.pop();

  // Reverse to chronological order
  const messages = rawMessages.reverse().map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    isEdited: m.isEdited,
    userId: m.userId,
    user: m.user,
    member: m.member,
    replyTo: m.replyTo,
  }));

  const initialCursor = hasMore ? messages[0]?.id : undefined;

  return (
    <>
      <ChatHeader
        channelName={channel.name}
        channelTopic={channel.topic || undefined}
      />

      <ChannelChat
        channelId={channelId}
        channelName={channel.name}
        currentUserId={session.user.id}
        currentUserName={session.user.name}
        initialMessages={messages}
        initialHasMore={hasMore}
        initialCursor={initialCursor}
      />
    </>
  );
}
