"use client";

import { AuthGate } from "@/components/AuthGate";
import { DashboardShell } from "@/components/DashboardShell";
import { ExcelUpload } from "@/components/ExcelUpload";
import { InviteUserForm } from "@/components/InviteUserForm";
import { MemberTable } from "@/components/MemberTable";
import { useAuth } from "@/contexts/AuthContext";

export function AdminWorkspace() {
  const { user, members, presence, refreshMembers } = useAuth();

  return (
    <AuthGate requireAdmin>
      <DashboardShell showSidebar={false}>
        <div className="grid gap-6 text-white">
          <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_26%)]" />
            <div className="relative">
              <p className="section-kicker">Admin settings</p>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Organization control center</h1>
              <p className="mt-3 max-w-3xl text-sm text-zinc-300 sm:text-base">
                Provision members, invite teammates, and keep your workspace directory aligned with the same secure collaboration theme used across chat and file transfer.
              </p>
            </div>
          </section>
          {user ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <ExcelUpload currentUser={user} onUploaded={refreshMembers} />
              <InviteUserForm currentUser={user} onInvited={refreshMembers} />
            </div>
          ) : null}
          <MemberTable users={members} presence={presence} />
        </div>
      </DashboardShell>
    </AuthGate>
  );
}