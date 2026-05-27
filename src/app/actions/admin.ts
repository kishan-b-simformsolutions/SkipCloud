"use server";

import type { AsyncFormState } from "@/lib/asyncFormState";
import { isValidEmail, normalizeEmailInput, normalizeTextInput } from "@/lib/formValidation";

type InviteField = "firstName" | "lastName" | "email" | "position";

function readFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function validateInviteSubmission(
  _previousState: AsyncFormState<InviteField>,
  formData: FormData,
): Promise<AsyncFormState<InviteField>> {
  const firstName = normalizeTextInput(readFormValue(formData, "firstName"), 60);
  const lastName = normalizeTextInput(readFormValue(formData, "lastName"), 60);
  const email = normalizeEmailInput(readFormValue(formData, "email"));
  const position = normalizeTextInput(readFormValue(formData, "position"), 80);
  const fieldErrors: Partial<Record<InviteField, string>> = {};

  if (!firstName) {
    fieldErrors.firstName = "Enter the employee first name.";
  }

  if (!lastName) {
    fieldErrors.lastName = "Enter the employee last name.";
  }

  if (!isValidEmail(email)) {
    fieldErrors.email = "Enter a valid employee email.";
  }

  if (!position) {
    fieldErrors.position = "Enter the employee position.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "invalid",
      message: "Fix the highlighted fields before provisioning the user.",
      fieldErrors,
      submissionId: crypto.randomUUID(),
    };
  }

  return {
    status: "validated",
    message: "Validation passed. Creating the managed account...",
    fieldErrors: {},
    submissionId: crypto.randomUUID(),
    normalizedEmail: email,
  };
}