"use client";

import { FileOutput, Network, ShieldCheck, Waves } from "lucide-react";

export function LandingHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[34rem]">
      <div className="absolute -left-8 top-8 hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur md:block">
        <div className="flex items-center gap-3 text-sm text-white/80">
          <span className="rounded-2xl bg-cyan-400/10 p-2 text-cyan-300">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span>No cloud storage layer</span>
        </div>
      </div>

      <div className="absolute -right-8 bottom-10 hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur md:block">
        <div className="flex items-center gap-3 text-sm text-white/80">
          <span className="rounded-2xl bg-fuchsia-500/10 p-2 text-fuchsia-300">
            <FileOutput className="h-4 w-4" />
          </span>
          <span>Chunked direct transfer</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(147,51,234,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
        <div className="relative grid gap-5">
          <div className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-black/40 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Active link</p>
              <p className="mt-1 text-sm font-medium text-white">Employee browser to employee browser</p>
            </div>
            <div className="flex items-center gap-2 text-cyan-300">
              <Waves className="h-4 w-4" />
              <span className="text-xs">Encrypted stream</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="rounded-[1.75rem] border border-cyan-400/20 bg-black/45 p-5">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.95)]" />
                <p className="text-sm font-medium text-white">Sender node</p>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/70">Design-assets.zip</div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500" />
                </div>
              </div>
            </div>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-300 shadow-glow">
              <Network className="h-8 w-8" />
            </div>

            <div className="rounded-[1.75rem] border border-fuchsia-400/20 bg-black/45 p-5">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.95)]" />
                <p className="text-sm font-medium text-white">Receiver node</p>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/70">Realtime delivery</div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={`h-10 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 ${item < 3 ? "opacity-100" : "opacity-40"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}