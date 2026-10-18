import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  const session = await requireAuth();
  const { searchParams } = request.nextUrl;

  const channelId = searchParams.get("channelId");
  const cursor = searchParams.get("cursor") || undefined;
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

  if (!channelId) {
    return Response.json({ error: "channelId is required" }, { status: 400 });
  }

  // Verify channel exists and user is a member
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel || channel.deletedAt) {
    return Response.json({ error: "Channel not found" }, { status: 404 });
  }

  const member = await prisma.member.findUnique({
    where: {
      userId_serverId: {
        userId: session.user.id,
        serverId: channel.serverId,
      },
    },
  });

  if (!member) {
    return Response.json({ error: "Not a member" }, { status: 403 });
  }

  // Fetch messages with cursor-based pagination (newest first)
  const messages = await prisma.message.findMany({
    where: {
      channelId,
      deletedAt: null,
    },
    take: limit + 1, // fetch one extra to determine if there are more
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // skip the cursor itself
    }),
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
      reactions: {
        select: {
          id: true,
          emoji: true,
          userId: true,
        },
      },
      _count: {
        select: { attachments: true },
      },
    },
  });

  // Check if there are more messages
  let nextCursor: string | undefined;
  if (messages.length > limit) {
    const nextItem = messages.pop();
    nextCursor = nextItem?.id;
  }

  return Response.json({
    messages: messages.reverse(), // Return in chronological order
    nextCursor,
    hasMore: !!nextCursor,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const { sendMessage } = await import("@/server/actions/message");
    const result = await sendMessage(body);
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return Response.json({ error: message }, { status: 400 });
  }
}
