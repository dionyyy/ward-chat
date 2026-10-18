import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const body = await request.json();
  const { serverId, name, type, categoryId, isPrivate } = body;

  if (!serverId || !name) {
    return Response.json(
      { error: "Server ID and channel name are required" },
      { status: 400 }
    );
  }

  // Verify membership
  const member = await prisma.member.findUnique({
    where: { userId_serverId: { userId: session.user.id, serverId } },
  });

  if (!member || member.role === "MEMBER") {
    return Response.json(
      { error: "You don't have permission to create channels" },
      { status: 403 }
    );
  }

  try {
    const { createChannel } = await import("@/server/actions/channel");
    const result = await createChannel(serverId, { name, type, categoryId, isPrivate });
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create channel";
    return Response.json({ error: message }, { status: 400 });
  }
}
