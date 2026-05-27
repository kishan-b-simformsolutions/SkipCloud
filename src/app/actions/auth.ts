"use server";

import { AsyncFormState } from "@/lib/asyncFormState";
import {
  isValidEmail,
  normalizeEmailInput,
  normalizeTextInput,
  validatePasswordStrength,
} from "@/lib/formValidation";

type LoginField = "email" | "password";
type RegisterField = "organizationName" | "firstName" | "lastName" | "email" | "password" | "position";

function readFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function invalidState<TFields extends string>(fieldErrors: Partial<Record<TFields, string>>, message: string): AsyncFormState<TFields> {
  return {
    status: "invalid",
    message,
    fieldErrors,
    submissionId: crypto.randomUUID(),
  };
}

export async function validateLoginSubmission(
  _previousState: AsyncFormState<LoginField>,
  formData: FormData,
): Promise<AsyncFormState<LoginField>> {
  const email = normalizeEmailInput(readFormValue(formData, "email"));
  const password = readFormValue(formData, "password");
  const fieldErrors: Partial<Record<LoginField, string>> = {};

  if (!isValidEmail(email)) {
    fieldErrors.email = "Enter a valid work email.";
  }

  if (!password.trim()) {
    fieldErrors.password = "Enter your password.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return invalidState(fieldErrors, "Fix the highlighted fields before signing in.");
  }

  return {
    status: "validated",
    message: "Validation passed. Completing sign in...",
    fieldErrors: {},
    submissionId: crypto.randomUUID(),
    normalizedEmail: email,
  };
}

export async function validateRegisterSubmission(
  _previousState: AsyncFormState<RegisterField>,
  formData: FormData,
): Promise<AsyncFormState<RegisterField>> {
  const organizationName = normalizeTextInput(readFormValue(formData, "organizationName"), 80);
  const firstName = normalizeTextInput(readFormValue(formData, "firstName"), 60);
  const lastName = normalizeTextInput(readFormValue(formData, "lastName"), 60);
  const email = normalizeEmailInput(readFormValue(formData, "email"));
  const password = readFormValue(formData, "password");
  const position = normalizeTextInput(readFormValue(formData, "position"), 80);
  const fieldErrors: Partial<Record<RegisterField, string>> = {};

  if (!organizationName) {
    fieldErrors.organizationName = "Enter an organization name.";
  }

  if (!firstName) {
    fieldErrors.firstName = "Enter the admin first name.";
  }

  if (!lastName) {
    fieldErrors.lastName = "Enter the admin last name.";
  }

  if (!isValidEmail(email)) {
    fieldErrors.email = "Enter a valid admin email.";
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (!position) {
    fieldErrors.position = "Enter an admin role label or position.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return invalidState(fieldErrors, "Fix the highlighted fields before creating the organization.");
  }

  return {
    status: "validated",
    message: "Validation passed. Creating your workspace...",
    fieldErrors: {},
    submissionId: crypto.randomUUID(),
    normalizedEmail: email,
  };
}