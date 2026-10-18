import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShellWrapper } from "./app-shell-wrapper";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch user's servers for the sidebar
  const members = await prisma.member.findMany({
    where: { userId: session.user.id },
    include: {
      server: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const servers = members.map((m) => m.server);

  return <AppShellWrapper servers={servers}>{children}</AppShellWrapper>;
}
