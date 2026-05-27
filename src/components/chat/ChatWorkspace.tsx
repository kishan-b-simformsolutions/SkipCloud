"use client";

import { Suspense, useDeferredValue, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, MessageSquareText, Search, X } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { ChatBox } from "@/components/ChatBox";
import { useAuth } from "@/contexts/AuthContext";
import { upsertConversationRequest, updateConversationRequestStatus } from "@/firebase/firestore";
import { useAutoStartPeerSession, usePeerSession } from "@/hooks/usePeerSession";
import { cn } from "@/lib/classNames";
import { fullName } from "@/lib/format";
import { ConversationRequestRecord } from "@/types";

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getRequestCounterpartyId(request: ConversationRequestRecord, currentUserId: string) {
  return request.fromUserId === currentUserId ? request.toUserId : request.fromUserId;
}

function involvesUsers(request: ConversationRequestRecord, firstUserId: string, secondUserId: string) {
  const participantIds = new Set([request.fromUserId, request.toUserId]);
  return participantIds.has(firstUserId) && participantIds.has(secondUserId);
}

function getConversationMetaToneClass(tone: "accepted" | "pending" | "idle") {
  if (tone === "accepted") {
    return "text-emerald-300";
  }

  if (tone === "pending") {
    return "text-amber-200";
  }

  return "text-zinc-500";
}

function getConversationAccessCopy(input: {
  isPendingOutgoing: boolean;
  isPendingIncoming: boolean;
  canStartChat: boolean;
}) {
  if (input.isPendingOutgoing) {
    return "Your request is waiting for this member to accept.";
  }

  if (input.isPendingIncoming) {
    return "This member requested a conversation. Accept from the left pane to start.";
  }

  if (input.canStartChat) {
    return "Conversation request accepted. The live session opens automatically when both members are online.";
  }

  return "Send a request to this member before opening a direct live session.";
}

function getPeerSummary(peerUser: {
  email: string;
  position: string;
}) {
  return `(${peerUser.email} · ${peerUser.position})`;
}

function getSessionSummary(canStartChat: boolean, peerOnline: boolean, connectionState: string, channelState: string) {
  if (!canStartChat) {
    return "Chat unlocks after the request is accepted.";
  }

  if (!peerOnline) {
    return "Member is offline. Try reconnect after they come back online.";
  }

  if (channelState === "open") {
    return "Live session ready.";
  }

  if (connectionState === "connecting") {
    return "Opening secure tunnel automatically.";
  }

  if (connectionState === "failed") {
    return "Secure tunnel failed. Retry required.";
  }

  return `Session ${connectionState} · Channel ${channelState}`;
}

function ChatWorkspaceContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, members, presence, conversationRequests } = useAuth();
  const [query, setQuery] = useState("");
  const [isSearching, startSearchTransition] = useTransition();
  const [isUpdatingRequests, startRequestTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const organizationMembers = useMemo(
    () => members.filter((member) => member.id !== user?.id),
    [members, user?.id],
  );

  const activeUserId = params.get("userId");
  const queueIds = useMemo(
    () =>
      (params.get("queue") || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [params],
  );

  const peerUser = useMemo(
    () => organizationMembers.find((member) => member.id === activeUserId) ?? null,
    [activeUserId, organizationMembers],
  );

  const queuedMembers = useMemo(
    () =>
      queueIds
        .map((memberId) => organizationMembers.find((member) => member.id === memberId))
        .filter((member): member is (typeof organizationMembers)[number] => Boolean(member)),
    [organizationMembers, queueIds],
  );

  const memberMap = useMemo(
    () => new Map(organizationMembers.map((member) => [member.id, member])),
    [organizationMembers],
  );

  const relevantRequests = useMemo(
    () => (user
      ? conversationRequests.filter((request) => request.fromUserId === user.id || request.toUserId === user.id)
      : []),
    [conversationRequests, user],
  );

  const incomingPendingRequests = useMemo(
    () => (user
      ? relevantRequests.filter((request) => request.toUserId === user.id && request.status === "pending")
      : []),
    [relevantRequests, user],
  );

  const currentConversationRequest = useMemo(() => {
    if (!user || !peerUser) {
      return null;
    }

    return relevantRequests.find((request) => involvesUsers(request, user.id, peerUser.id)) ?? null;
  }, [peerUser, relevantRequests, user]);

  const selectedMembers = useMemo(() => {
    const selected = new Map<string, (typeof organizationMembers)[number]>();

    if (peerUser) {
      selected.set(peerUser.id, peerUser);
    }

    for (const member of queuedMembers) {
      if (!selected.has(member.id)) {
        selected.set(member.id, member);
      }
    }

    for (const request of relevantRequests) {
      if (!user) {
        continue;
      }

      if (request.status !== "pending" && request.status !== "accepted") {
        continue;
      }

      const counterparty = memberMap.get(getRequestCounterpartyId(request, user.id));
      if (counterparty && !selected.has(counterparty.id)) {
        selected.set(counterparty.id, counterparty);
      }
    }

    return Array.from(selected.values());
  }, [memberMap, peerUser, queuedMembers, relevantRequests, user]);

  const filteredMembers = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    const baseMembers = normalized
      ? organizationMembers.filter((member) =>
          `${member.firstName} ${member.lastName} ${member.email} ${member.position}`.toLowerCase().includes(normalized),
        )
      : [];

    const activeAndQueuedIds = new Set([activeUserId, ...queueIds]);

    return [...baseMembers].sort((left, right) => {
      const leftWeight = activeAndQueuedIds.has(left.id) ? 0 : 1;
      const rightWeight = activeAndQueuedIds.has(right.id) ? 0 : 1;
      if (leftWeight !== rightWeight) return leftWeight - rightWeight;
      const leftName = `${left.firstName} ${left.lastName}`.toLowerCase();
      const rightName = `${right.firstName} ${right.lastName}`.toLowerCase();
      const queryWeight = Number(!leftName.startsWith(normalized)) - Number(!rightName.startsWith(normalized));
      if (queryWeight !== 0) return queryWeight;
      return right.createdAt.localeCompare(left.createdAt);
    });
  }, [activeUserId, deferredQuery, organizationMembers, queueIds]);

  const session = usePeerSession(user, peerUser);
  const hasQuery = deferredQuery.trim().length > 0;
  const peerOnline = peerUser ? Boolean(presence[peerUser.id]?.online) : false;
  const canStartChat = currentConversationRequest?.status === "accepted";
  const isPendingOutgoing = currentConversationRequest?.status === "pending" && currentConversationRequest.fromUserId === user?.id;
  const isPendingIncoming = currentConversationRequest?.status === "pending" && currentConversationRequest.toUserId === user?.id;
  const canRequestPeer = Boolean(
    user
      && peerUser
      && (!currentConversationRequest
        || currentConversationRequest.status === "declined"
        || currentConversationRequest.status === "cancelled"),
  );
  const peerSummary = peerUser ? getPeerSummary(peerUser) : "";
  const sessionSummary = getSessionSummary(canStartChat, peerOnline, session.connectionState, session.channelState);
  const showRetrySessionButton = canStartChat
    && session.channelState !== "open"
    && session.connectionState !== "connecting";

  useAutoStartPeerSession({
    currentUserId: user?.id,
    peerUserId: peerUser?.id,
    peerOnline,
    connectionState: canStartChat ? session.connectionState : "blocked",
    connect: session.connect,
  });

  function handleSendRequest(memberId: string) {
    if (!user) {
      return Promise.resolve();
    }

    startRequestTransition(() => {
      upsertConversationRequest({
        orgId: user.orgId,
        fromUserId: user.id,
        toUserId: memberId,
        status: "pending",
      }).catch(() => undefined);
    });

    return Promise.resolve();
  }

  function handleRequestDecision(requestId: string, status: "accepted" | "declined") {
    if (!user) {
      return Promise.resolve();
    }

    const request = incomingPendingRequests.find((entry) => entry.id === requestId);
    if (!request) {
      return Promise.resolve();
    }

    startRequestTransition(() => {
      updateConversationRequestStatus(requestId, status).then(() => {
        if (status === "accepted") {
          router.push(`/chat?userId=${request.fromUserId}`);
        }
      }).catch(() => undefined);
    });

    return Promise.resolve();
  }

  function getMemberRequest(memberId: string) {
    if (!user) {
      return null;
    }

    return relevantRequests.find((request) => involvesUsers(request, user.id, memberId)) ?? null;
  }

  function getMemberConversationMeta(memberId: string) {
    const request = getMemberRequest(memberId);

    if (!request || !user) {
      return { label: "Available", tone: "idle" as const };
    }

    if (request.status === "accepted") {
      return { label: "Accepted", tone: "accepted" as const };
    }

    if (request.status === "pending") {
      return {
        label: request.fromUserId === user.id ? "Requested" : "Awaiting response",
        tone: "pending" as const,
      };
    }

    return { label: formatRole(request.status), tone: "idle" as const };
  }

  function buildChatHref(memberId: string) {
    const remainingQueue = [activeUserId, ...queueIds].filter(
      (value): value is string => Boolean(value) && value !== memberId,
    );
    const nextParams = new URLSearchParams({ userId: memberId });

    if (remainingQueue.length) {
      nextParams.set("queue", remainingQueue.join(","));
    }

    return `/chat?${nextParams.toString()}`;
  }

  return (
    <AuthGate>
      <div className="mx-auto flex h-[calc(100vh-5.5rem)] max-w-7xl flex-col gap-4 overflow-hidden px-4 py-4 text-white sm:px-6 lg:px-8 lg:py-5">
        <section className="glass-panel relative z-30 shrink-0 rounded-[2rem] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100/70">Direct Message</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Search and open conversation</h1>
              <p className="mt-2 text-sm text-zinc-400">Use the top search bar to find a member. Once selected, they appear in the left chat list and the right side shows their activity and status.</p>
            </div>
          </div>

          <div className="relative mt-5">
            <label className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-4">
              <Search className="h-5 w-5 text-zinc-400" />
              <input
                value={query}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  startSearchTransition(() => {
                    setQuery(nextQuery);
                  });
                }}
                placeholder="Search member by name, email, or position"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </label>
            {isSearching ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Refreshing member results...</p> : null}

            {hasQuery ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#09090d]/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:-left-2 lg:-right-2">
                {filteredMembers.length ? (
                  <div className="max-h-[28rem] overflow-y-auto p-3">
                    {filteredMembers.map((member) => {
                      const isActive = member.id === peerUser?.id;
                      const isQueued = queueIds.includes(member.id);
                      const isOnline = Boolean(presence[member.id]?.online);
                      const memberRequest = getMemberRequest(member.id);
                      const canRequest = !memberRequest || memberRequest.status === "declined" || memberRequest.status === "cancelled";

                      return (
                        <div
                          key={member.id}
                          className={cn(
                            "rounded-[1.25rem] border px-4 py-3 transition",
                            isActive
                              ? "border-cyan-300/30 bg-cyan-300/10 shadow-glow"
                              : "border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/6",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-white">{fullName(member.firstName, member.lastName)}</p>
                                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-100">
                                  {formatRole(member.role)}
                                </span>
                              </div>
                              <p className="truncate text-xs text-zinc-400">{member.email}</p>
                              <p className="mt-1 truncate text-xs text-zinc-500">{member.position}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-zinc-300">
                              {isQueued ? <span className="rounded-full border border-white/10 px-2 py-1 text-[10px]">Saved</span> : null}
                              <span className={cn("h-2.5 w-2.5 rounded-full", isOnline ? "bg-emerald-400" : "bg-zinc-500")} />
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <Link
                              href={buildChatHref(member.id)}
                              onClick={() => setQuery("")}
                              className="inline-flex rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-cyan-300/30 hover:bg-white/10"
                            >
                              View details
                            </Link>
                            {canRequest ? (
                              <button
                                type="button"
                                disabled={!isOnline || isUpdatingRequests}
                                onClick={() => {
                                  handleSendRequest(member.id).catch(() => undefined);
                                  setQuery("");
                                }}
                                className="button-primary rounded-full px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Send request
                              </button>
                            ) : (
                              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-300">
                                {memberRequest?.status === "pending" ? "Request pending" : "Ready for chat"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-5 py-6 text-sm text-zinc-400">No members match your search.</div>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <div className="relative z-0 grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start">
          <aside className="glass-panel flex h-full min-h-0 flex-col rounded-[2rem] p-4 xl:sticky xl:top-24 xl:max-h-[calc(100vh-8.5rem)] xl:overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-100/70">Chat List</p>
                <p className="mt-2 text-lg font-semibold text-white">Conversation list</p>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                {selectedMembers.length}
              </div>
            </div>

            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1 xl:max-h-[calc(100vh-15rem)]">
            {incomingPendingRequests.length ? (
              <div className="rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/10 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-100/80">Incoming requests</p>
                <div className="mt-3 space-y-3">
                  {incomingPendingRequests.map((request) => {
                    const requester = memberMap.get(request.fromUserId);
                    if (!requester) {
                      return null;
                    }

                    return (
                      <div key={request.id} className="rounded-[1.25rem] border border-white/10 bg-black/20 p-3">
                        <p className="text-sm font-semibold text-white">{fullName(requester.firstName, requester.lastName)}</p>
                        <p className="mt-1 text-xs text-zinc-400">{requester.position}</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={isUpdatingRequests}
                            onClick={() => {
                              handleRequestDecision(request.id, "accepted").catch(() => undefined);
                            }}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-900 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={isUpdatingRequests}
                            onClick={() => {
                              handleRequestDecision(request.id, "declined").catch(() => undefined);
                            }}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {selectedMembers.length ? (
              <div className="space-y-2">
                {selectedMembers.map((member) => {
                  const meta = getMemberConversationMeta(member.id);

                  return (
                    <Link
                      key={member.id}
                      href={buildChatHref(member.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[1.5rem] border px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/10",
                        member.id === peerUser?.id ? "border-cyan-300/30 bg-cyan-300/10" : "border-white/10 bg-black/20",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-white">{fullName(member.firstName, member.lastName)}</p>
                          <span className="rounded-full border border-white/10 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-cyan-100">
                            {formatRole(member.role)}
                          </span>
                        </div>
                        <p className="truncate text-xs text-zinc-400">{member.position}</p>
                        <p className={cn(
                          "mt-1 text-[10px] uppercase tracking-[0.18em]",
                          getConversationMetaToneClass(meta.tone),
                        )}>
                          {meta.label}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-xs text-zinc-400">
                        <span className={cn("h-2.5 w-2.5 rounded-full", presence[member.id]?.online ? "bg-emerald-400" : "bg-zinc-500")} />
                        {presence[member.id]?.online ? "Live" : "Away"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-black/20 px-4 py-10 text-center text-sm text-zinc-400">
                No request or conversation entries yet. Search above and send a request to an online member.
              </div>
            )}
            </div>
          </aside>

          <div className="grid h-full min-h-0 gap-4 overflow-hidden xl:grid-rows-[auto_minmax(0,1fr)]">
            {user && peerUser ? (
              <>
                <section className="glass-panel shrink-0 rounded-[2rem] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-100/70">Activity</p>
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="truncate text-2xl font-semibold text-white">{fullName(peerUser.firstName, peerUser.lastName)}</h2>
                        <p className="truncate text-sm text-zinc-300">{peerSummary}</p>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{getConversationAccessCopy({ isPendingOutgoing, isPendingIncoming, canStartChat })} {sessionSummary}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {isPendingIncoming && currentConversationRequest ? (
                        <button
                          type="button"
                          disabled={isUpdatingRequests}
                          onClick={() => {
                            handleRequestDecision(currentConversationRequest.id, "accepted").catch(() => undefined);
                          }}
                          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-900 disabled:opacity-50"
                        >
                          Accept request
                        </button>
                      ) : null}

                      {canRequestPeer ? (
                        <button
                          type="button"
                          disabled={!peerOnline || isUpdatingRequests}
                          onClick={() => {
                            if (peerUser) {
                              handleSendRequest(peerUser.id).catch(() => undefined);
                            }
                          }}
                          className="button-primary inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Send request
                        </button>
                      ) : null}

                      {isPendingOutgoing ? (
                        <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-300">
                          Request pending
                        </span>
                      ) : null}

                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-300">
                        <span className={cn("h-2.5 w-2.5 rounded-full", peerOnline ? "bg-emerald-400" : "bg-zinc-500")} />
                        {peerOnline ? "Online" : "Offline"}
                      </div>

                      {showRetrySessionButton ? (
                        <button
                          type="button"
                          onClick={() => {
                            session.connect().catch(() => undefined);
                          }}
                          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
                        >
                          Try reconnect
                        </button>
                      ) : null}
                    </div>
                  </div>
                </section>

                <div className="min-h-0 h-full">
                  <ChatBox
                    currentUser={user}
                    peerUser={peerUser}
                    messages={session.messages}
                    onSendMessage={session.sendMessage}
                    onSendFile={session.sendFile}
                    channelState={session.channelState}
                    sessionError={canStartChat ? session.sessionError : "Send and accept a conversation request before starting a live chat."}
                    peerOnline={peerOnline}
                    canStartChat={canStartChat}
                  />
                </div>
              </>
            ) : (
              <div className="glass-panel rounded-[2rem] p-10 text-center text-sm text-zinc-400">
                <MessageSquareText className="mx-auto h-8 w-8 text-cyan-100" />
                <p className="mt-4">Search a member from the top bar. After you click one, they appear in the left chat list and their activity opens here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

export function ChatWorkspace() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10"><div className="glass-panel rounded-[2rem] px-5 py-6 text-sm text-zinc-300">Opening conversation workspace...</div></div>}>
      <ChatWorkspaceContent />
    </Suspense>
  );
}