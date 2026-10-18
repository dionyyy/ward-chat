import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const session = await requireAuth();
  const { serverId } = await params;

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
    return Response.json({ error: "Not a member of this server" }, { status: 403 });
  }

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    include: {
      categories: {
        orderBy: { position: "asc" },
        include: {
          channels: {
            where: { deletedAt: null },
            orderBy: { position: "asc" },
          },
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              status: true,
            },
          },
        },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  if (!server || server.deletedAt) {
    return Response.json({ error: "Server not found" }, { status: 404 });
  }

  return Response.json({ server, currentMember: member });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const { serverId } = await params;
  const body = await request.json();

  try {
    const { updateServer } = await import("@/server/actions/server");
    const result = await updateServer(serverId, body);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update server";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const { serverId } = await params;

  try {
    const { deleteServer } = await import("@/server/actions/server");
    const result = await deleteServer(serverId);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete server";
    return Response.json({ error: message }, { status: 400 });
  }
}
