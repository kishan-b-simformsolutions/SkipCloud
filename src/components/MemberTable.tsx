"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { PresenceRecord, UserRecord } from "@/types";
import { formatDate, fullName } from "@/lib/format";

export function MemberTable({ users, presence }: Readonly<{ users: UserRecord[]; presence: Record<string, PresenceRecord> }>) {
  const [query, setQuery] = useState("");
  const [isSearching, startSearchTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const filteredUsers = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    const nextUsers = normalized
      ? users.filter((user) =>
          `${user.firstName} ${user.lastName} ${user.email} ${user.position} ${user.role}`.toLowerCase().includes(normalized),
        )
      : users;

    return [...nextUsers].sort((left, right) => {
      const availabilityDelta = Number(Boolean(presence[right.id]?.online)) - Number(Boolean(presence[left.id]?.online));
      if (availabilityDelta !== 0) {
        return availabilityDelta;
      }

      return `${left.firstName} ${left.lastName}`.localeCompare(`${right.firstName} ${right.lastName}`);
    });
  }, [deferredQuery, presence, users]);

  return (
    <section className="glass-panel overflow-hidden rounded-[2rem] text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-100/70">Directory</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Organization members</h3>
            <p className="mt-2 text-sm text-zinc-400">Search, availability, and role visibility for secure peer discovery.</p>
          </div>
          <div className="w-full max-w-sm">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                value={query}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  startSearchTransition(() => {
                    setQuery(nextQuery);
                  });
                }}
                placeholder="Filter by name, role, or position"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </label>
            {isSearching ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Refreshing table...</p> : null}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Position</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t border-white/8 transition hover:bg-white/[0.03]">
                <td className="px-6 py-4 font-medium text-white">{fullName(user.firstName, user.lastName)}</td>
                <td className="px-6 py-4 text-zinc-300">{user.email}</td>
                <td className="px-6 py-4 text-zinc-300">{user.position}</td>
                <td className="px-6 py-4 capitalize text-zinc-300">{user.role}</td>
                <td className="px-6 py-4 text-zinc-300">
                  <span className="inline-flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${presence[user.id]?.online ? "bg-emerald-400" : "bg-zinc-500"}`} />
                    {presence[user.id]?.online ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-300">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-400">
                  No members match the current filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
