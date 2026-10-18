import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const session = await requireAuth();
  const { channelId } = await params;

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      category: true,
    },
  });

  if (!channel || channel.deletedAt) {
    return Response.json({ error: "Channel not found" }, { status: 404 });
  }

  // Verify membership
  const member = await prisma.member.findUnique({
    where: {
      userId_serverId: { userId: session.user.id, serverId: channel.serverId },
    },
  });

  if (!member) {
    return Response.json({ error: "Not a member of this server" }, { status: 403 });
  }

  return Response.json({ channel });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  const body = await request.json();

  try {
    const { updateChannel } = await import("@/server/actions/channel");
    const result = await updateChannel(channelId, body);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update channel";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;

  try {
    const { deleteChannel } = await import("@/server/actions/channel");
    const result = await deleteChannel(channelId);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete channel";
    return Response.json({ error: message }, { status: 400 });
  }
}
