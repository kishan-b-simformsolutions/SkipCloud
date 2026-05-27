"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileTransferProgress } from "@/types";
import { formatBytes } from "@/lib/format";

interface FileSenderProps {
  canSend: boolean;
  onConnect: () => Promise<void>;
  onSendFile: (file: File) => Promise<void>;
  connectionState: string;
  transfer: FileTransferProgress | null;
  sessionError: string;
}

export function FileSender({ canSend, onConnect, onSendFile, connectionState, transfer, sessionError }: Readonly<FileSenderProps>) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const zoneClassName = `rounded-[2rem] border-2 border-dashed px-6 py-14 text-center transition ${dragging ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/12 bg-black/20"} ${canSend ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`;

  async function handleFiles(files: FileList | null) {
    if (!canSend) return;
    const file = files?.[0];
    if (!file) return;
    await onSendFile(file);
  }

  return (
    <section className="glass-panel grid gap-4 rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Direct file transfer</h2>
          <p className="text-sm text-zinc-400">Files stay off cloud storage and move in chunks across the data channel. Once both users are in this transfer workspace, the secure tunnel should open automatically.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-300">State: {connectionState}</span>
          <button type="button" onClick={onConnect} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:scale-[1.01]">
            Retry connect
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (canSend) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event: DragEvent<HTMLButtonElement>) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (event) => {
          event.preventDefault();
          setDragging(false);
          await handleFiles(event.dataTransfer.files);
        }}
        className={zoneClassName}
        disabled={!canSend}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={async (event: ChangeEvent<HTMLInputElement>) => {
            await handleFiles(event.target.files);
          }}
          disabled={!canSend}
        />
        <p className="text-lg font-semibold text-white">Drag and drop a file, image, or video</p>
        <p className="mt-2 text-sm text-zinc-400">SkipCloud sends chunks over WebRTC only when both peers are online.</p>
      </button>

      {sessionError ? <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">{sessionError}</p> : null}

      {transfer ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
            <span>{transfer.fileName}</span>
            <span>{transfer.percentage}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/20">
            <div className="h-full rounded-full bg-cyan-100 transition-all" style={{ width: `${transfer.percentage}%` }} />
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            {formatBytes(transfer.transferredBytes)} of {formatBytes(transfer.totalBytes)} transferred
          </p>
        </div>
      ) : null}
    </section>
  );
}
