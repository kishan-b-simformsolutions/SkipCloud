"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderUp } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { DashboardShell } from "@/components/DashboardShell";

function FileTransferRedirectContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const nextParams = new URLSearchParams(params.toString());
    const target = nextParams.toString() ? `/chat?${nextParams.toString()}` : "/chat";
    router.replace(target);
  }, [params, router]);

  return (
    <AuthGate>
      <DashboardShell>
        <div className="glass-panel rounded-[2rem] p-10 text-center text-sm text-zinc-400">
          <FolderUp className="mx-auto h-8 w-8 text-cyan-100" />
          <p className="mt-4">Moving file sharing into the direct conversation workspace...</p>
        </div>
      </DashboardShell>
    </AuthGate>
  );
}

export default function FileTransferPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10"><div className="glass-panel rounded-[2rem] px-5 py-6 text-sm text-zinc-300">Opening conversation workspace...</div></div>}>
      <FileTransferRedirectContent />
    </Suspense>
  );
}
