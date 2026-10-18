"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";
import { createServerSchema, updateServerSchema } from "@/lib/validators/server";
import { revalidatePath } from "next/cache";
import { nanoid } from "@/lib/nanoid";

export async function createServer(input: { name: string; description?: string }) {
  const session = await requireAuth();

  const validated = createServerSchema.parse(input);
  const inviteCode = nanoid(8);

  // Use transaction to create server, member, category, and channel atomically
  const server = await prisma.$transaction(async (tx) => {
    // Create the server
    const newServer = await tx.server.create({
      data: {
        name: validated.name,
        description: validated.description,
        inviteCode,
      },
    });

    // Create the admin member
    await tx.member.create({
      data: {
        userId: session.user.id,
        serverId: newServer.id,
        role: "ADMIN",
      },
    });

    // Create default category
    const category = await tx.category.create({
      data: {
        name: "Text Channels",
        position: 0,
        serverId: newServer.id,
      },
    });

    // Create default general channel
    await tx.channel.create({
      data: {
        name: "general",
        type: "TEXT",
        position: 0,
        serverId: newServer.id,
        categoryId: category.id,
      },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        action: "SERVER_CREATE",
        details: { serverName: newServer.name },
        userId: session.user.id,
        serverId: newServer.id,
      },
    });

    return newServer;
  });

  revalidatePath("/servers");
  return { success: true, server };
}

export async function updateServer(
  serverId: string,
  input: { name?: string; description?: string; imageUrl?: string | null }
) {
  const session = await requireAuth();

  // Verify admin permission
  const member = await prisma.member.findUnique({
    where: {
      userId_serverId: {
        userId: session.user.id,
        serverId,
      },
    },
  });

  if (!member || member.role === "MEMBER") {
    throw new Error("You don't have permission to edit this server");
  }

  const validated = updateServerSchema.parse(input);

  const server = await prisma.server.update({
    where: { id: serverId },
    data: {
      ...(validated.name && { name: validated.name }),
      ...(validated.description !== undefined && { description: validated.description }),
      ...(validated.imageUrl !== undefined && { imageUrl: validated.imageUrl }),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "SERVER_UPDATE",
      details: { changes: validated },
      userId: session.user.id,
      serverId,
    },
  });

  revalidatePath(`/servers/${serverId}`);
  return { success: true, server };
}

export async function deleteServer(serverId: string) {
  const session = await requireAuth();

  // Verify admin permission
  const member = await prisma.member.findUnique({
    where: {
      userId_serverId: {
        userId: session.user.id,
        serverId,
      },
    },
  });

  if (!member || member.role !== "ADMIN") {
    throw new Error("Only the server admin can delete this server");
  }

  // Soft delete
  await prisma.server.update({
    where: { id: serverId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/servers");
  return { success: true };
}

export async function leaveServer(serverId: string) {
  const session = await requireAuth();

  const member = await prisma.member.findUnique({
    where: {
      userId_serverId: {
        userId: session.user.id,
        serverId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this server");
  }

  if (member.role === "ADMIN") {
    throw new Error("Admin cannot leave the server. Transfer ownership or delete it.");
  }

  await prisma.member.delete({
    where: { id: member.id },
  });

  await prisma.auditLog.create({
    data: {
      action: "MEMBER_LEAVE",
      details: { userId: session.user.id },
      userId: session.user.id,
      serverId,
    },
  });

  revalidatePath("/servers");
  return { success: true };
}

export async function joinServerByInvite(inviteCode: string) {
  const session = await requireAuth();

  // Find invite by code
  const invite = await prisma.invite.findUnique({
    where: { code: inviteCode },
    include: { server: true },
  });

  // Also check if it's a server's default invite code
  const serverByCode = await prisma.server.findUnique({
    where: { inviteCode },
  });

  const server = invite?.server || serverByCode;

  if (!server) {
    throw new Error("Invalid invite code");
  }

  if (server.deletedAt) {
    throw new Error("This server no longer exists");
  }

  // Check if invite is expired or maxed out
  if (invite) {
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new Error("This invite has expired");
    }
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      throw new Error("This invite has reached its max uses");
    }
  }

  // Check if already a member
  const existingMember = await prisma.member.findUnique({
    where: {
      userId_serverId: {
        userId: session.user.id,
        serverId: server.id,
      },
    },
  });

  if (existingMember) {
    return { success: true, server, alreadyMember: true };
  }

  // Join the server
  await prisma.member.create({
    data: {
      userId: session.user.id,
      serverId: server.id,
      role: "MEMBER",
    },
  });

  // Increment invite uses
  if (invite) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { uses: { increment: 1 } },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "MEMBER_JOIN",
      details: { userId: session.user.id, inviteCode },
      userId: session.user.id,
      serverId: server.id,
    },
  });

  revalidatePath("/servers");
  return { success: true, server, alreadyMember: false };
}

export async function createInvite(serverId: string, options?: { maxUses?: number | null; expiresInHours?: number | null }) {
  const session = await requireAuth();

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
    throw new Error("You are not a member of this server");
  }

  const code = nanoid(8);
  const expiresAt = options?.expiresInHours
    ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000)
    : null;

  const invite = await prisma.invite.create({
    data: {
      code,
      serverId,
      creatorId: session.user.id,
      maxUses: options?.maxUses ?? null,
      expiresAt,
    },
  });

  return { success: true, invite };
}
