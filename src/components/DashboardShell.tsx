"use client";

import { ReactNode, useMemo } from "react";
import { MessageSquareText } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardShell({
  children,
  showSidebar = true,
}: Readonly<{
  children: ReactNode;
  showSidebar?: boolean;
}>) {
  const { user } = useAuth();

  const items = useMemo(() => {
    const baseItems = [
      {
        href: "/chat",
        label: "Messages",
        description: "Search, select, and handle direct messages with file sharing in one pane.",
        icon: MessageSquareText,
      },
    ];

    return baseItems;
  }, []);

  return (
    <div className={showSidebar
      ? "mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 lg:py-8"
      : "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"}
    >
      {showSidebar ? <Sidebar items={items} user={user} /> : null}
      <main className="min-w-0">{children}</main>
    </div>
  );
}
