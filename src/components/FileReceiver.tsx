import { FileTransferProgress } from "@/types";
import { formatBytes } from "@/lib/format";

export function FileReceiver({ transfer }: Readonly<{ transfer: FileTransferProgress | null }>) {
  return (
    <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-white">Incoming transfer status</h3>
      <p className="mt-1 text-sm text-zinc-400">Received files download automatically once all chunks arrive.</p>
      {transfer ? (
        <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-white/6 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
            <span>{transfer.fileName}</span>
            <span>{transfer.percentage}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/20">
            <div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${transfer.percentage}%` }} />
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            {formatBytes(transfer.transferredBytes)} of {formatBytes(transfer.totalBytes)} received
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-[1.75rem] border border-dashed border-white/12 bg-black/20 px-4 py-10 text-center text-sm text-zinc-400">
          No incoming transfer yet.
        </div>
      )}
    </section>
  );
}
