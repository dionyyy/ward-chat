import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";
import { ServerLayoutClient } from "./server-layout-client";

export default async function ServerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) {
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
    redirect("/servers");
  }

  // Fetch server with categories and channels
  const server = await prisma.server.findUnique({
    where: { id: serverId },
    include: {
      categories: {
        orderBy: { position: "asc" },
        include: {
          channels: {
            where: { deletedAt: null },
            orderBy: { position: "asc" },
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      },
    },
  });

  if (!server || server.deletedAt) {
    redirect("/servers");
  }

  const categories = server.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    channels: cat.channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      type: ch.type as "TEXT" | "VOICE" | "ANNOUNCEMENT",
    })),
  }));

  return (
    <ServerLayoutClient
      serverId={server.id}
      serverName={server.name}
      inviteCode={server.inviteCode}
      categories={categories}
      memberRole={member.role as "ADMIN" | "MODERATOR" | "MEMBER"}
    >
      {children}
    </ServerLayoutClient>
  );
}
