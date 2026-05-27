"use client";

import { ChangeEvent, ComponentProps, useEffect, useRef, useState } from "react";
import { Paperclip, Send, Upload } from "lucide-react";
import { ChatMessage, FileTransferProgress, UserRecord } from "@/types";
import { formatBytes, formatDate, fullName } from "@/lib/format";

interface ChatBoxProps {
  currentUser: UserRecord;
  peerUser: UserRecord;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSendFile: (file: File) => Promise<void>;
  channelState: string;
  sessionError: string;
  peerOnline: boolean;
  canStartChat: boolean;
}

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

function getBlockedStatus(peerUser: UserRecord) {
  const peerName = fullName(peerUser.firstName, peerUser.lastName);
  return `Send a conversation request to ${peerName}. Once they accept it from their request list, this chat and file pane will go live.`;
}

function getEmptyState(peerOnline: boolean) {
  return peerOnline
    ? "No messages yet. Open the secure tunnel to start chatting."
    : "Waiting for this member to come online or join this conversation.";
}

function getFileTransferLabel(status: FileTransferProgress["status"], direction: "sending" | "receiving") {
  if (status === "failed") {
    return direction === "sending" ? "Send failed" : "Receive failed";
  }

  if (status === "completed") {
    return direction === "sending" ? "Sent" : "Received";
  }

  return direction === "sending" ? "Sending" : "Receiving";
}

export function ChatBox({
  currentUser,
  peerUser,
  messages,
  onSendMessage,
  onSendFile,
  channelState,
  sessionError,
  peerOnline,
  canStartChat,
}: Readonly<ChatBoxProps>) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const canSend = canStartChat && peerOnline && channelState === "open";
  const emptyStateMessage = canStartChat
    ? getEmptyState(peerOnline)
    : getBlockedStatus(peerUser);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function handleFile(fileList: FileList | null) {
    if (!canSend) {
      return;
    }

    const file = fileList?.[0];
    if (!file) {
      return;
    }

    await onSendFile(file);
  }

  const handleSubmit = (event: FormSubmitEvent) => {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    onSendMessage(draft);
    setDraft("");
  };

  return (
    <section className="glass-panel flex min-h-[calc(100vh-15.5rem)] flex-col rounded-[2rem] p-4 sm:p-5 xl:min-h-0 xl:h-full xl:max-h-[calc(100vh-14rem)]">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-[1.75rem] border border-white/10 bg-black/20 p-4 sm:p-5">
        {messages.length ? (
          messages.map((message) => {
            const isMine = message.fromUserId === currentUser.id;
            const bubbleClassName = isMine
              ? "ml-auto border border-cyan-200 bg-white text-slate-900 shadow-[0_10px_30px_rgba(34,211,238,0.12)]"
              : "border border-slate-200 bg-white text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.08)]";
            const metaTextClassName = "text-slate-600";
            const secondaryTextClassName = "text-slate-500";
            const progressTrackClassName = isMine ? "bg-cyan-100" : "bg-slate-200";
            const progressFillClassName = message.file?.direction === "sending" ? (isMine ? "bg-cyan-600" : "bg-cyan-400") : "bg-emerald-400";

            return (
              <div
                key={message.id}
                className={`max-w-[88%] rounded-[1.5rem] px-4 py-3 sm:max-w-[80%] ${bubbleClassName}`}
              >
                {message.messageType === "file" && message.file ? (
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{message.file.fileName}</p>
                        <p className={`mt-0.5 text-xs ${secondaryTextClassName}`}>{formatBytes(message.file.fileSize)}</p>
                      </div>
                      {message.file.direction === "receiving" && message.file.downloadUrl ? (
                        <a
                          href={message.file.downloadUrl}
                          download={message.file.fileName}
                          className={`inline-flex h-8 shrink-0 items-center justify-center rounded-xl px-3 text-xs font-medium transition ${isMine ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                        >
                          Download
                        </a>
                      ) : null}
                    </div>

                    <div className={`h-2 overflow-hidden rounded-full ${progressTrackClassName}`}>
                      <div
                        className={`h-full rounded-full transition-all ${progressFillClassName}`}
                        style={{ width: `${message.file.progress}%` }}
                      />
                    </div>

                    <div className={`flex items-center justify-between gap-3 text-xs ${metaTextClassName}`}>
                      <span className="truncate">{getFileTransferLabel(message.file.transferStatus, message.file.direction)}</span>
                      <span className="shrink-0">{formatBytes(message.file.transferredBytes)} / {formatBytes(message.file.totalBytes)}</span>
                      <span className="shrink-0">{formatDate(message.createdAt)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm leading-6">{message.body}</p>
                    <p className={`text-xs ${secondaryTextClassName}`}>
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex min-h-full items-center justify-center rounded-[1.5rem] border border-dashed border-white/12 bg-black/10 px-6 text-center text-sm text-zinc-400">
            {emptyStateMessage}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
      {sessionError ? <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">{sessionError}</p> : null}

      <form onSubmit={handleSubmit} className="sticky bottom-0 flex flex-col gap-3 rounded-[1.5rem] bg-[#06070d]/95 sm:flex-row xl:pb-0">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={async (event: ChangeEvent<HTMLInputElement>) => {
            await handleFile(event.target.files);
          }}
          disabled={!canSend}
        />
        <button
          type="button"
          onClick={() => {
            if (canSend) {
              inputRef.current?.click();
            }
          }}
          disabled={!canSend}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Paperclip className="h-4 w-4" />
          <span className="hidden sm:inline">Attach file</span>
          <Upload className="h-4 w-4 sm:hidden" />
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={peerOnline ? "Type a direct message" : "Waiting for member to come online"}
          className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none ring-0 transition placeholder:text-zinc-500 focus:border-cyan-300/40"
          disabled={!canSend}
        />
        <button type="submit" disabled={!canSend || !draft.trim()} className="rounded-2xl bg-white px-6 py-3 font-medium text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50">
          <span className="inline-flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send
          </span>
        </button>
      </form>
      </div>
    </section>
  );
}
