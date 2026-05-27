"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatedSection } from "@/components/landing/AnimatedSection";

const features = [
  {
    icon: Zap,
    title: "Share in real time",
    description: "Send messages and files directly between organization members without an upload step.",
  },
  {
    icon: Shield,
    title: "Stay inside your workspace",
    description: "Keep access scoped to authenticated members in the same organization.",
  },
  {
    icon: Lock,
    title: "Reduce storage exposure",
    description: "Use Firebase for auth and signaling while keeping file payloads off cloud storage.",
  },
];

const whySkipCloudPoints = [
  {
    title: "Fast delivery",
    description: "Messages and files move directly between organization members.",
  },
  {
    title: "Clear access",
    description: "Sharing stays inside the authenticated workspace.",
  },
  {
    title: "Easy workflow",
    description: "The path from sign-in to transfer stays understandable.",
  },
];

const workflowSteps = [
  {
    title: "Authenticate",
    description: "Members sign in to the organization workspace.",
  },
  {
    title: "Select a teammate",
    description: "Presence makes it clear who is ready for a live session.",
  },
  {
    title: "Transfer directly",
    description: "Messages and file chunks move browser to browser in real time.",
  },
];

const securityNotes = [
  "Workspace login keeps access limited to organization members.",
  "Presence signals help users choose an available teammate.",
  "Messages and files move without a separate cloud storage upload.",
];

const designNotes = [
  "Short headings instead of heavy technical language",
  "One clear product story above the fold",
  "CTA kept at the end for the final conversion step",
];

export function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28),transparent_62%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-[8rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.26),transparent_64%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_15%,transparent_85%,rgba(255,255,255,0.02))]" />
      </div>

      <section className="relative mx-auto min-h-[calc(100vh-72px)] max-w-6xl px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-6 py-10 shadow-[0_24px_120px_rgba(0,0,0,0.45)] sm:px-8 sm:py-12 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_86%_16%,rgba(99,102,241,0.12),transparent_26%)]" />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-3 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                Internal P2P transfer with zero cloud file storage
              </div>

              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.24em] text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Built for internal teams
              </div>
            </div>

            <h1 className="mt-6 font-display text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
              Internal sharing that feels immediate, private, and easy to trust.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              Give your organization one clear place to sign in, see who is available, and move messages or files directly between browsers without a separate storage step.
            </p>

            <div className="mx-auto mt-10 grid max-w-3xl gap-3 rounded-[1.75rem] border border-white/10 bg-white/4 p-4 text-left sm:grid-cols-3">
              {[
                ["Private by default", "Direct browser delivery with no separate cloud upload flow."],
                ["Clear availability", "Presence helps users pick the right teammate before sending."],
                ["Built for teams", "Workspace access keeps sharing scoped to your organization."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-[1.25rem] border border-white/8 bg-black/30 px-4 py-4">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-6 grid max-w-3xl gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/8 text-left sm:grid-cols-3">
              {[
                ["Auth", "Scoped organization workspace"],
                ["Presence", "Clear teammate availability"],
                ["Transfer", "Direct browser delivery"],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#080808] px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-zinc-200">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatedSection className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.4)] sm:px-8 lg:px-8 lg:py-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(99,102,241,0.14),transparent_22%)] opacity-80" />

          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="max-w-xl">
              <p className="section-kicker">Secure organization sharing</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                Why SkipCloud
              </h2>
              <h3 className="mt-4 text-2xl font-medium text-zinc-100 sm:text-3xl">
                A simpler way to share inside your organization.
              </h3>
              <p className="mt-5 text-base leading-8 text-zinc-400">
                The product focuses on fast delivery, clear access control, and a workflow that feels easy from first use.
              </p>
            </div>

            <div className="space-y-5">
              {whySkipCloudPoints.map((point, index) => (
                <div key={point.title} className="flex items-start gap-4 rounded-[1.5rem] bg-white/[0.03] px-1 py-1">
                  <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-cyan-300">
                    {index === 0 ? <Zap className="h-4 w-4" /> : index === 1 ? <Shield className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-white">{point.title}</p>
                    <p className="mt-2 text-sm leading-7 text-zinc-400">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 grid gap-3 pt-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3 rounded-[1.25rem] bg-white/[0.03] px-4 py-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-cyan-300">
                  <feature.icon className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium text-zinc-200">{feature.title}</p>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8" delay={0.08}>
        <section id="how-it-works" className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-6 py-7 sm:px-8 lg:px-8 lg:py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.10),transparent_26%)]" />

          <div className="relative">
            <div className="max-w-3xl">
              <p className="section-kicker">How it works</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                Three steps. One clear story.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
                Users should understand the product in seconds: sign in, find the right teammate, and start a secure direct session.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="pt-2 lg:pt-2">
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] font-mono text-sm font-semibold text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-white">{step.title}</p>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              <div className="max-w-3xl">
                <p className="section-kicker">Security</p>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  Secure by design. Easy to grasp.
                </h3>
                <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
                  The interface should make the promise obvious: access is controlled by the workspace, while the transfer path stays direct between browsers.
                </p>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div className="divide-y divide-white/10 border-y border-white/10">
                  {securityNotes.map((point) => (
                    <div key={point} className="flex items-start gap-4 py-4">
                      <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-cyan-300">
                        <Lock className="h-4 w-4" />
                      </span>
                      <p className="text-sm leading-7 text-zinc-300">{point}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 lg:self-stretch">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Designed for the main page</p>
                  <div className="mt-4 space-y-3">
                    {designNotes.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                        <p className="text-sm leading-7 text-zinc-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8" delay={0.1}>
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(168,85,247,0.14),rgba(6,182,212,0.12))] p-[1px] shadow-glow-lg">
          <div className="rounded-[2.45rem] bg-black/80 px-6 py-10 backdrop-blur-xl sm:px-8 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-kicker mx-auto">CTA</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                Bring internal sharing closer to real time.
              </h2>
              <p className="mt-5 text-lg text-zinc-400">
                Launch a secure organization workspace with a black-theme control surface, modern motion, and direct browser-to-browser collaboration.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/register" className="button-primary rounded-full px-6 py-3 font-medium">
                  Register Organization
                </Link>
                <Link href="/login" className="button-secondary rounded-full px-6 py-3 font-medium">
                  Login to Workspace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <footer className="relative mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-12 pt-2 text-sm text-zinc-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>SkipCloud. Share files instantly. Skip the cloud.</p>
        <div className="flex gap-5">
          <Link href="/register" className="transition hover:text-white">Register</Link>
          <Link href="/login" className="transition hover:text-white">Login</Link>
        </div>
      </footer>
    </main>
  );
}