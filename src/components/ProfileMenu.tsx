"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { KeyRound, LoaderCircle, LogOut, Settings, UserCircle2, X } from "lucide-react";
import { logoutUser, mapFirebaseAuthError, updateCurrentUserPassword } from "@/firebase/auth";
import { UserRecord } from "@/types";

interface ProfileMenuProps {
  user: UserRecord;
}

export function ProfileMenu({ user }: Readonly<ProfileMenuProps>) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = useMemo(() => `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase(), [user.firstName, user.lastName]);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setStatus("");

    if (password.trim().length < 6) {
      setStatus("Use a stronger password with at least 6 characters.");
      setSavingPassword(false);
      return;
    }

    if (password !== confirmPassword) {
      setStatus("Password confirmation does not match.");
      setSavingPassword(false);
      return;
    }

    try {
      await updateCurrentUserPassword(password);
      setPassword("");
      setConfirmPassword("");
      setStatus("Password updated.");
    } catch (error) {
      setStatus(mapFirebaseAuthError(error));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="relative z-[90]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
        aria-label="Open profile"
      >
        {initials || <UserCircle2 className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[100] w-[min(92vw,28rem)]">
          <button
            type="button"
            aria-label="Close profile dialog"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[95] bg-black/35 backdrop-blur-[2px]"
          />
          <div className="relative z-[100] overflow-hidden rounded-[2rem] border border-white/10 bg-[#050816]/95 p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.12),transparent_30%)]" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/70">Profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Your account</h2>
                <p className="mt-2 text-sm text-zinc-400">Update your role details and password from one place.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close profile"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-6 grid gap-4 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-lg font-semibold text-cyan-100 shadow-glow">
                {initials || <UserCircle2 className="h-6 w-6" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-white">{user.firstName} {user.lastName}</p>
                <p className="mt-1 truncate text-sm text-zinc-300">{user.email}</p>
                <p className="mt-2 inline-flex rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">Security settings</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="relative mt-6 grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <KeyRound className="h-4 w-4 text-cyan-100" />
                Change password
              </div>
              <p className="text-sm text-zinc-400">Set a new password for your account. Use at least 6 characters.</p>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="New password"
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40 focus:bg-black/55"
                required
              />
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                placeholder="Confirm password"
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40 focus:bg-black/55"
                required
              />
              <button type="submit" disabled={savingPassword} className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:scale-[1.01] disabled:opacity-60">
                {savingPassword ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Update password"}
              </button>
            </form>

            {status ? (
              <p className="relative mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-sm text-zinc-200">
                {status}
              </p>
            ) : null}

            <div className="relative mt-5 border-t border-white/10 pt-5">
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  <Settings className="h-4 w-4" />
                  Organization settings
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => logoutUser()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/15"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}