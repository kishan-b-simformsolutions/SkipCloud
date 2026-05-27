"use client";

import { ReactNode, useEffect } from "react";
import { MessageSquareText, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/firebase/config";

export function AuthGate({ children, requireAdmin = false }: Readonly<{ children: ReactNode; requireAdmin?: boolean }>) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const hasFirebaseSession = Boolean(auth.currentUser);

  useEffect(() => {
    if (loading) return;
    if (hasFirebaseSession && !user) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (requireAdmin && user.role !== "admin") {
      router.replace("/chat");
    }
  }, [hasFirebaseSession, loading, requireAdmin, router, user]);

  if (loading || (hasFirebaseSession && !user) || !user || (requireAdmin && user.role !== "admin")) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-4 py-10">
        <div className="glass-panel relative w-full overflow-hidden rounded-[2rem] p-8 text-center sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.14),transparent_28%)]" />
          <div className="relative flex flex-col items-center justify-center py-4">
            <div className="relative flex h-36 w-full max-w-md items-center justify-center">
              <div className="absolute left-6 top-8 h-12 w-12 rounded-[1.25rem] border border-white/10 bg-white/6 text-cyan-100 shadow-glow sm:left-10">
                <div className="flex h-full items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="absolute right-6 bottom-8 h-12 w-12 rounded-[1.25rem] border border-white/10 bg-white/6 text-sky-100 shadow-glow sm:right-10">
                <div className="flex h-full items-center justify-center">
                  <MessageSquareText className="h-5 w-5" />
                </div>
              </div>

              <div className="absolute inset-x-20 top-1/2 h-px -translate-y-1/2 overflow-hidden bg-white/10 sm:inset-x-24">
                <div className="h-full w-1/4 animate-[secure-chat-scan_2.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-cyan-200/90 to-transparent" />
              </div>

              <div className="absolute inset-x-[28%] top-1/2 h-12 -translate-y-1/2 rounded-full border border-cyan-200/10 bg-cyan-200/5 blur-xl" />

              <div className="absolute left-[26%] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.8)] animate-[secure-chat-node_2.2s_ease-in-out_infinite]" />
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.8)] animate-[secure-chat-node_2.2s_ease-in-out_infinite] [animation-delay:0.25s]" />
              <div className="absolute right-[26%] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.8)] animate-[secure-chat-node_2.2s_ease-in-out_infinite] [animation-delay:0.5s]" />

              <div className="absolute left-[32%] top-[34%] h-1.5 w-1.5 rounded-full bg-cyan-100/80 animate-ping" />
              <div className="absolute right-[32%] bottom-[34%] h-1.5 w-1.5 rounded-full bg-sky-100/80 animate-ping [animation-delay:0.45s]" />

              <div className="absolute bottom-0 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-zinc-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-200" />
                <span>Initializing secure tunnel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
