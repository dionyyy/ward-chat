"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";
import {
  createChannelSchema,
  updateChannelSchema,
  createCategorySchema,
} from "@/lib/validators/channel";
import { revalidatePath } from "next/cache";

// Helper: verify user is admin/moderator in a server
async function verifyModPermission(userId: string, serverId: string) {
  const member = await prisma.member.findUnique({
    where: { userId_serverId: { userId, serverId } },
  });

  if (!member) {
    throw new Error("You are not a member of this server");
  }

  if (member.role === "MEMBER") {
    throw new Error("You don't have permission for this action");
  }

  return member;
}

// ============================================================
// CHANNEL ACTIONS
// ============================================================

export async function createChannel(
  serverId: string,
  input: {
    name: string;
    type?: "TEXT" | "VOICE" | "ANNOUNCEMENT";
    categoryId?: string | null;
    isPrivate?: boolean;
  }
) {
  const session = await requireAuth();
  await verifyModPermission(session.user.id, serverId);

  const validated = createChannelSchema.parse(input);

  // Get the next position within the category or server
  const lastChannel = await prisma.channel.findFirst({
    where: {
      serverId,
      categoryId: validated.categoryId ?? null,
      deletedAt: null,
    },
    orderBy: { position: "desc" },
  });

  const position = (lastChannel?.position ?? -1) + 1;

  const channel = await prisma.channel.create({
    data: {
      name: validated.name,
      type: validated.type ?? "TEXT",
      isPrivate: validated.isPrivate ?? false,
      position,
      serverId,
      categoryId: validated.categoryId ?? null,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "CHANNEL_CREATE",
      details: { channelName: channel.name, channelType: channel.type },
      userId: session.user.id,
      serverId,
    },
  });

  revalidatePath(`/servers/${serverId}`);
  return { success: true, channel };
}

export async function updateChannel(
  channelId: string,
  input: {
    name?: string;
    topic?: string | null;
    isPrivate?: boolean;
    isArchived?: boolean;
    slowMode?: number;
    categoryId?: string | null;
    position?: number;
  }
) {
  const session = await requireAuth();

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel || channel.deletedAt) {
    throw new Error("Channel not found");
  }

  await verifyModPermission(session.user.id, channel.serverId);

  const validated = updateChannelSchema.parse(input);

  const updated = await prisma.channel.update({
    where: { id: channelId },
    data: {
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.topic !== undefined && { topic: validated.topic }),
      ...(validated.isPrivate !== undefined && { isPrivate: validated.isPrivate }),
      ...(validated.isArchived !== undefined && { isArchived: validated.isArchived }),
      ...(validated.slowMode !== undefined && { slowMode: validated.slowMode }),
      ...(validated.categoryId !== undefined && { categoryId: validated.categoryId }),
      ...(validated.position !== undefined && { position: validated.position }),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CHANNEL_UPDATE",
      details: { channelId, changes: validated },
      userId: session.user.id,
      serverId: channel.serverId,
    },
  });

  revalidatePath(`/servers/${channel.serverId}`);
  return { success: true, channel: updated };
}

export async function deleteChannel(channelId: string) {
  const session = await requireAuth();

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel || channel.deletedAt) {
    throw new Error("Channel not found");
  }

  await verifyModPermission(session.user.id, channel.serverId);

  // Don't allow deleting the last channel in a server
  const channelCount = await prisma.channel.count({
    where: { serverId: channel.serverId, deletedAt: null },
  });

  if (channelCount <= 1) {
    throw new Error("Cannot delete the last channel in a server");
  }

  // Soft delete
  await prisma.channel.update({
    where: { id: channelId },
    data: { deletedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      action: "CHANNEL_DELETE",
      details: { channelName: channel.name },
      userId: session.user.id,
      serverId: channel.serverId,
    },
  });

  revalidatePath(`/servers/${channel.serverId}`);
  return { success: true, serverId: channel.serverId };
}

export async function archiveChannel(channelId: string) {
  return updateChannel(channelId, { isArchived: true });
}

export async function unarchiveChannel(channelId: string) {
  return updateChannel(channelId, { isArchived: false });
}

// ============================================================
// CATEGORY ACTIONS
// ============================================================

export async function createCategory(
  serverId: string,
  input: { name: string }
) {
  const session = await requireAuth();
  await verifyModPermission(session.user.id, serverId);

  const validated = createCategorySchema.parse(input);

  // Get next position
  const lastCategory = await prisma.category.findFirst({
    where: { serverId },
    orderBy: { position: "desc" },
  });

  const position = (lastCategory?.position ?? -1) + 1;

  const category = await prisma.category.create({
    data: {
      name: validated.name,
      position,
      serverId,
    },
  });

  revalidatePath(`/servers/${serverId}`);
  return { success: true, category };
}

export async function updateCategory(
  categoryId: string,
  input: { name?: string; position?: number }
) {
  const session = await requireAuth();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  await verifyModPermission(session.user.id, category.serverId);

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.position !== undefined && { position: input.position }),
    },
  });

  revalidatePath(`/servers/${category.serverId}`);
  return { success: true, category: updated };
}

export async function deleteCategory(categoryId: string) {
  const session = await requireAuth();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { channels: { where: { deletedAt: null } } },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  await verifyModPermission(session.user.id, category.serverId);

  // Move channels to uncategorized (null categoryId)
  if (category.channels.length > 0) {
    await prisma.channel.updateMany({
      where: { categoryId },
      data: { categoryId: null },
    });
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  revalidatePath(`/servers/${category.serverId}`);
  return { success: true };
}
