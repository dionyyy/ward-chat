import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export default async function ServerPage({
  params,
}: {
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

  // Find the first channel to redirect to
  const firstChannel = await prisma.channel.findFirst({
    where: {
      serverId,
      deletedAt: null,
    },
    orderBy: [{ category: { position: "asc" } }, { position: "asc" }],
  });

  if (firstChannel) {
    redirect(`/servers/${serverId}/channels/${firstChannel.id}`);
  }

  // No channels exist - show empty state
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-900/50 p-8">
      <p className="text-slate-400">No channels yet. Create one to get started.</p>
    </div>
  );
}
