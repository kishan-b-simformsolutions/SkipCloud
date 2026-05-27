"use client";

import { useActionState, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { validateInviteSubmission } from "@/app/actions/admin";
import { AsyncSubmitButton } from "@/components/AsyncSubmitButton";
import { createManagedUserAccount, mapFirebaseAuthError } from "@/firebase/auth";
import { emptyAsyncFormState } from "@/lib/asyncFormState";
import { UserRecord } from "@/types";

export function InviteUserForm({ currentUser, onInvited }: Readonly<{ currentUser: UserRecord; onInvited: () => Promise<void> }>) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
  });
  const [status, setStatus] = useState("");
  const [validationState, formAction, isValidating] = useActionState(validateInviteSubmission, emptyAsyncFormState);
  const [isCreating, startCreateTransition] = useTransition();
  const [optimisticProvisionQueue, addOptimisticProvision] = useOptimistic<string[], string>([], (current, email) => [email, ...current].slice(0, 3));
  const handledSubmissionRef = useRef("");

  useEffect(() => {
    if (validationState.status !== "validated") {
      return;
    }

    if (!validationState.submissionId || handledSubmissionRef.current === validationState.submissionId) {
      return;
    }

    handledSubmissionRef.current = validationState.submissionId;

    startCreateTransition(async () => {
      addOptimisticProvision(validationState.normalizedEmail ?? form.email);
      setStatus("");

      try {
        await createManagedUserAccount({
          id: "pending",
          firstName: form.firstName,
          lastName: form.lastName,
          email: validationState.normalizedEmail ?? form.email,
          position: form.position,
          orgId: currentUser.orgId,
          role: "user",
        });
        await onInvited();
        setForm({ firstName: "", lastName: "", email: "", position: "" });
        setStatus("User account created. Share the temporary password from your environment configuration with the employee.");
      } catch (error) {
        setStatus(mapFirebaseAuthError(error));
      }
    });
  }, [addOptimisticProvision, currentUser.orgId, form, onInvited, validationState]);

  const isBusy = isValidating || isCreating;
  const errorMessage = validationState.status === "invalid" ? validationState.message : "";
  const inputClassName = "rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/35 focus:bg-black/30";

  return (
    <section className="glass-panel rounded-[2rem] p-6 text-white">
      <div className="mb-4">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-100/70">Manual invite</p>
        <h3 className="mt-2 text-lg font-semibold text-white">Invite user manually</h3>
        <p className="mt-2 text-sm text-zinc-400">Create a single organization user account without uploading a spreadsheet.</p>
      </div>
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <input name="firstName" value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} placeholder="First name" className={inputClassName} required />
            {validationState.fieldErrors.firstName ? <p className="text-sm text-amber-200">{validationState.fieldErrors.firstName}</p> : null}
          </div>
          <div className="grid gap-2">
            <input name="lastName" value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} placeholder="Last name" className={inputClassName} required />
            {validationState.fieldErrors.lastName ? <p className="text-sm text-amber-200">{validationState.fieldErrors.lastName}</p> : null}
          </div>
        </div>
        <div className="grid gap-2">
          <input name="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" autoComplete="email" placeholder="Email" className={inputClassName} required />
          {validationState.fieldErrors.email ? <p className="text-sm text-amber-200">{validationState.fieldErrors.email}</p> : null}
        </div>
        <div className="grid gap-2">
          <input name="position" value={form.position} onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))} placeholder="Position" className={inputClassName} required />
          {validationState.fieldErrors.position ? <p className="text-sm text-amber-200">{validationState.fieldErrors.position}</p> : null}
        </div>
        {errorMessage ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</p> : null}
        <AsyncSubmitButton idleLabel={isCreating ? "Creating user..." : "Invite user"} pendingLabel="Validating..." disabled={isBusy} className="button-primary rounded-full px-5 py-3 text-sm font-medium disabled:opacity-60" />
      </form>
      {optimisticProvisionQueue.length ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
          {optimisticProvisionQueue.map((email) => (
            <span key={email} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              Provisioning {email}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">{status || "Temporary password is not stored in Firestore. Set it in your environment before use."}</div>
    </section>
  );
}
