import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export async function GET() {
  const session = await requireAuth();

  const members = await prisma.member.findMany({
    where: { userId: session.user.id },
    include: {
      server: {
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          inviteCode: true,
          createdAt: true,
          deletedAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const servers = members
    .filter((m) => !m.server.deletedAt)
    .map((m) => ({
      ...m.server,
      role: m.role,
    }));

  return Response.json({ servers });
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const body = await request.json();

  const { name, description } = body;

  if (!name || name.length < 2) {
    return Response.json(
      { error: "Server name must be at least 2 characters" },
      { status: 400 }
    );
  }

  // Import and call the action logic inline to avoid circular deps
  const { createServer } = await import("@/server/actions/server");
  
  try {
    const result = await createServer({ name, description });
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create server";
    return Response.json({ error: message }, { status: 400 });
  }
}
