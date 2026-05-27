"use client";

import Link from "next/link";
import { PresenceRecord, UserRecord } from "@/types";
import { fullName } from "@/lib/format";

interface UserListProps {
  users: UserRecord[];
  presence: Record<string, PresenceRecord>;
  currentUserId?: string;
}

export function UserList({ users, presence, currentUserId }: Readonly<UserListProps>) {
  return (
    <div className="grid gap-3">
      {users
        .filter((user) => user.id !== currentUserId)
        .map((user) => {
          const isOnline = presence[user.id]?.online;
          return (
            <div key={user.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
              <div>
                <p className="font-semibold text-ink">{fullName(user.firstName, user.lastName)}</p>
                <p className="text-sm text-slate-500">{user.position}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-signal" : "bg-slate-300"}`} />
                  {isOnline ? "Online" : "Offline"}
                </span>
                <div className="flex gap-2">
                  <Link href={`/chat?userId=${user.id}`} className="rounded-full bg-ink px-4 py-2 text-sm text-white hover:bg-pulse">
                    Open conversation
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
