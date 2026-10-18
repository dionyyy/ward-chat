import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { setPresence, getPresenceBatch } from "@/server/services/presence";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["ONLINE", "IDLE", "BUSY", "INVISIBLE", "OFFLINE"];
    if (!validStatuses.includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    await setPresence(session.user.id, status);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to update presence" }, { status: 500 });
  }
}

/**
 * GET /api/presence?serverIds=id1,id2
 * Returns presence status for all members of the specified servers.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serverId = request.nextUrl.searchParams.get("serverId");
  if (!serverId) {
    return Response.json({ error: "serverId required" }, { status: 400 });
  }

  // Verify user is a member
  const membership = await prisma.member.findUnique({
    where: {
      userId_serverId: { userId: session.user.id, serverId },
    },
  });

  if (!membership) {
    return Response.json({ error: "Not a member" }, { status: 403 });
  }

  // Get all members' user IDs
  const members = await prisma.member.findMany({
    where: { serverId },
    select: { userId: true },
  });

  const userIds = members.map((m) => m.userId);
  const presenceMap = await getPresenceBatch(userIds);

  // Convert Map to object for JSON response
  const presence: Record<string, string> = {};
  for (const [userId, status] of presenceMap) {
    presence[userId] = status;
  }

  return Response.json({ presence });
}
