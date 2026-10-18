"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";
import { sendMessageSchema, editMessageSchema } from "@/lib/validators/message";
import { publishNewMessage, publishMessageUpdate, publishMessageDelete } from "@/lib/realtime";

export async function sendMessage(input: {
  content: string;
  channelId: string;
  replyToId?: string | null;
}) {
  const session = await requireAuth();
  const validated = sendMessageSchema.parse(input);

  // Get the channel to verify it exists and get serverId
  const channel = await prisma.channel.findUnique({
    where: { id: validated.channelId },
  });

  if (!channel || channel.deletedAt) {
    throw new Error("Channel not found");
  }

  // Verify membership
  const member = await prisma.member.findUnique({
    where: {
      userId_serverId: {
        userId: session.user.id,
        serverId: channel.serverId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this server");
  }

  if (member.isMuted) {
    throw new Error("You are muted in this server");
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      content: validated.content,
      channelId: validated.channelId,
      userId: session.user.id,
      memberId: member.id,
      replyToId: validated.replyToId ?? null,
    },
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
          user: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  // Publish to Redis for real-time delivery
  await publishNewMessage({
    id: message.id,
    content: message.content,
    channelId: message.channelId,
    userId: message.userId,
    memberId: message.memberId,
    createdAt: message.createdAt.toISOString(),
    user: message.user,
  });

  return { success: true, message };
}

export async function editMessage(messageId: string, input: { content: string }) {
  const session = await requireAuth();
  const validated = editMessageSchema.parse(input);

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message || message.deletedAt) {
    throw new Error("Message not found");
  }

  // Only the author can edit their message
  if (message.userId !== session.user.id) {
    throw new Error("You can only edit your own messages");
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: validated.content,
      isEdited: true,
    },
  });

  // Publish update for real-time
  await publishMessageUpdate({
    id: updated.id,
    content: updated.content,
    channelId: updated.channelId,
    isEdited: true,
  });

  return { success: true, message: updated };
}

export async function deleteMessage(messageId: string) {
  const session = await requireAuth();

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      channel: true,
    },
  });

  if (!message || message.deletedAt) {
    throw new Error("Message not found");
  }

  // Check permission: author can delete own, or admin/mod can delete any
  const isAuthor = message.userId === session.user.id;

  if (!isAuthor) {
    const member = await prisma.member.findUnique({
      where: {
        userId_serverId: {
          userId: session.user.id,
          serverId: message.channel.serverId,
        },
      },
    });

    if (!member || member.role === "MEMBER") {
      throw new Error("You don't have permission to delete this message");
    }
  }

  // Soft delete
  await prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
  });

  // Publish deletion for real-time
  await publishMessageDelete({
    id: messageId,
    channelId: message.channelId,
  });

  return { success: true };
}
