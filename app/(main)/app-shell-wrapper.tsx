"use client";

import { AppShell } from "@/components/layout/app-shell";
import { usePathname } from "next/navigation";

interface AppShellWrapperProps {
  children: React.ReactNode;
  servers: { id: string; name: string; imageUrl?: string | null }[];
}

export function AppShellWrapper({ children, servers }: AppShellWrapperProps) {
  const pathname = usePathname();

  // Extract active server ID from URL pattern: /servers/[serverId]/...
  const serverIdMatch = pathname.match(/\/servers\/([^/]+)/);
  const activeServerId = serverIdMatch?.[1];

  return (
    <AppShell servers={servers} activeServerId={activeServerId}>
      {children}
    </AppShell>
  );
}
