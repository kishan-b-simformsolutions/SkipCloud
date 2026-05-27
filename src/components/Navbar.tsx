"use client";

import Link from "next/link";
import { Cloud, MessageSquareText } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { ProfileMenu } from "@/components/ProfileMenu";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-[80] border-b border-white/8 bg-black/55 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-white sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3 text-lg font-semibold tracking-[-0.02em] text-white">
          <span className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-glow">
            <Cloud className="h-5 w-5 text-cyan-300" />
          </span>
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          {user ? (
            <>
              <Link
                href="/chat"
                aria-label="Open chat"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                <MessageSquareText className="h-5 w-5" />
              </Link>
              <ProfileMenu user={user} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="button-secondary group relative rounded-full px-4 py-2">
                <span>Log in</span>
                <span className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 transition duration-300 group-hover:scale-x-100" />
              </Link>
              <Link href="/register" className="button-primary rounded-full px-4 py-2 font-medium">
                Register org
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
