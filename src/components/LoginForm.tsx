"use client";

import { useActionState, useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { validateLoginSubmission } from "@/app/actions/auth";
import { AsyncSubmitButton } from "@/components/AsyncSubmitButton";
import { useAuth } from "@/contexts/AuthContext";
import { loginWithEmailPassword, mapFirebaseLoginError } from "@/firebase/auth";
import { emptyAsyncFormState } from "@/lib/asyncFormState";

export function LoginForm() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [validationState, formAction, isValidating] = useActionState(validateLoginSubmission, emptyAsyncFormState);
  const [isAuthenticating, startAuthenticationTransition] = useTransition();
  const handledSubmissionRef = useRef("");
  const commitValidatedLogin = useEffectEvent(async (normalizedEmail?: string) => {
    try {
      setAuthError("");
      await loginWithEmailPassword(normalizedEmail ?? email, password);
      router.replace("/chat");
    } catch (nextError) {
      setAuthError(mapFirebaseLoginError(nextError));
    }
  });

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

    startAuthenticationTransition(() => {
      void commitValidatedLogin(validationState.normalizedEmail);
    });
  }, [validationState]);

  const isBusy = isValidating || isAuthenticating;
  const error = authError || (validationState.status === "invalid" ? validationState.message : "");

  return (
    <form action={formAction} className="glass-panel grid gap-5 rounded-[2rem] p-8 shadow-glow lg:p-10">
      <div>
        <p className="section-kicker">Login</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white">Access your workspace</h1>
        <p className="mt-2 text-sm text-zinc-400">Sign in to your organization and continue with direct internal sharing.</p>
      </div>
      <div className="grid gap-2">
        <input
          name="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setAuthError("");
          }}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Work email"
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-black/55"
          required
        />
        {validationState.fieldErrors.email ? <p className="text-sm text-amber-200">{validationState.fieldErrors.email}</p> : null}
      </div>
      <div className="grid gap-2">
        <input
          name="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setAuthError("");
          }}
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:bg-black/55"
          required
        />
        {validationState.fieldErrors.password ? <p className="text-sm text-amber-200">{validationState.fieldErrors.password}</p> : null}
      </div>
      {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}
      <AsyncSubmitButton
        idleLabel={isAuthenticating ? "Signing in..." : "Log in"}
        pendingLabel="Validating..."
        disabled={isBusy}
        className="button-primary rounded-2xl px-5 py-3 font-medium disabled:opacity-60"
      />
    </form>
  );
}
