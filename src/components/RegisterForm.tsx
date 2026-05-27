"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { validateRegisterSubmission } from "@/app/actions/auth";
import { AsyncSubmitButton } from "@/components/AsyncSubmitButton";
import { useAuth } from "@/contexts/AuthContext";
import { mapFirebaseAuthError, registerOrganizationAdmin } from "@/firebase/auth";
import { emptyAsyncFormState } from "@/lib/asyncFormState";

export function RegisterForm() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    position: "Organization Admin",
  });
  const [submitError, setSubmitError] = useState("");
  const [validationState, formAction, isValidating] = useActionState(validateRegisterSubmission, emptyAsyncFormState);
  const [isRegistering, startRegisterTransition] = useTransition();
  const handledSubmissionRef = useRef("");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/chat");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (validationState.status !== "validated") {
      return;
    }

    if (!validationState.submissionId || handledSubmissionRef.current === validationState.submissionId) {
      return;
    }

    handledSubmissionRef.current = validationState.submissionId;

    startRegisterTransition(async () => {
      try {
        setSubmitError("");
        await registerOrganizationAdmin({
          ...form,
          email: validationState.normalizedEmail ?? form.email,
        });
        router.replace("/chat");
      } catch (nextError) {
        setSubmitError(mapFirebaseAuthError(nextError));
      }
    });
  }, [form, router, validationState]);

  const isBusy = isValidating || isRegistering;
  const error = submitError || (validationState.status === "invalid" ? validationState.message : "");

  return (
    <form action={formAction} className="glass-panel grid gap-5 rounded-[2rem] p-8 shadow-glow lg:p-10">
      <div>
        <p className="section-kicker">Register</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white">Create organization</h1>
        <p className="mt-2 text-sm text-zinc-400">Set up your internal workspace and onboard your team.</p>
      </div>
      <div className="grid gap-2">
        <input name="organizationName" value={form.organizationName} onChange={(event) => setForm((current) => ({ ...current, organizationName: event.target.value }))} placeholder="Organization name" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-black/55" required />
        {validationState.fieldErrors.organizationName ? <p className="text-sm text-amber-200">{validationState.fieldErrors.organizationName}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <input name="firstName" value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} placeholder="First name" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-black/55" required />
          {validationState.fieldErrors.firstName ? <p className="text-sm text-amber-200">{validationState.fieldErrors.firstName}</p> : null}
        </div>
        <div className="grid gap-2">
          <input name="lastName" value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} placeholder="Last name" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-black/55" required />
          {validationState.fieldErrors.lastName ? <p className="text-sm text-amber-200">{validationState.fieldErrors.lastName}</p> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <input name="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" autoComplete="email" inputMode="email" placeholder="Admin work email" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-black/55" required />
        {validationState.fieldErrors.email ? <p className="text-sm text-amber-200">{validationState.fieldErrors.email}</p> : null}
      </div>
      <div className="grid gap-2">
        <input name="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} type="password" autoComplete="new-password" minLength={10} placeholder="Create password" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-black/55" required />
        <p className="text-xs text-zinc-500">Use at least 10 characters with upper-case, lower-case, and a number.</p>
        {validationState.fieldErrors.password ? <p className="text-sm text-amber-200">{validationState.fieldErrors.password}</p> : null}
      </div>
      <div className="grid gap-2">
        <input name="position" value={form.position} onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))} placeholder="Position" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-black/55" required />
        {validationState.fieldErrors.position ? <p className="text-sm text-amber-200">{validationState.fieldErrors.position}</p> : null}
      </div>
      {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}
      <AsyncSubmitButton idleLabel={isRegistering ? "Creating organization..." : "Create organization"} pendingLabel="Validating..." disabled={isBusy} className="button-primary rounded-2xl px-5 py-3 font-medium disabled:opacity-60" />
    </form>
  );
}
