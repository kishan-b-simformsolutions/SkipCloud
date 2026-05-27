"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/classNames";
import { fullName } from "@/lib/format";

interface SidebarItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export function Sidebar({
  items,
  user,
}: Readonly<{
  items: SidebarItem[];
  user?: {
    firstName: string;
    lastName: string;
    position: string;
    role: string;
  } | null;
}>) {
  const pathname = usePathname();

  return (
    <aside className="glass-panel rounded-[2rem] p-4 text-white lg:sticky lg:top-24 lg:h-fit">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Workspace</p>
        <p className="mt-3 text-lg font-semibold text-white">Secure collaboration</p>
        <p className="mt-1 text-sm text-zinc-400">Search members, prepare requests, and move into one direct conversation pane for messages and files.</p>
      </div>

      {user ? (
        <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-zinc-400">Signed in as</p>
          <p className="mt-2 text-base font-semibold text-white">{fullName(user.firstName, user.lastName)}</p>
          <p className="text-sm text-zinc-400">{user.position || "Team member"}</p>
          <div className="mt-3 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100">
            {user.role}
          </div>
        </div>
      ) : null}

      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:grid lg:gap-2 lg:overflow-visible lg:pb-0">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="min-w-[220px] lg:min-w-0">
            <div
              className={cn(
                "flex items-start gap-3 rounded-[1.5rem] border px-4 py-3 text-left transition",
                pathname === item.href
                  ? "border-cyan-300/30 bg-cyan-300/12 text-white shadow-glow"
                  : "border-white/8 bg-white/4 text-zinc-300 hover:border-white/15 hover:bg-white/8 hover:text-white",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 rounded-2xl p-2",
                  pathname === item.href ? "bg-white/14 text-cyan-100" : "bg-white/8 text-zinc-300",
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </nav>

      <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-400/12 via-sky-400/8 to-transparent p-4">
        <p className="text-sm font-semibold text-white">P2P mode</p>
        <p className="mt-1 text-sm text-zinc-400">Messages and file sharing still run peer-to-peer. When both people open the same conversation, the live tunnel connects automatically.</p>
      </div>
    </aside>
  );
}
