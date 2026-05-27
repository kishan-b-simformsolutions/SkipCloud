import { deleteApp } from "firebase/app";
import {
  AuthError,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import { normalizeEmailInput, normalizeTextInput, sanitizeProvisionedUserProfile } from "@/lib/formValidation";
import { DEFAULT_TEMP_PASSWORD } from "@/lib/constants";
import { auth, getSecondaryFirebaseApp } from "@/firebase/config";
import { createOrganization, createUserProfile, getUserProfile, updateUserProfile } from "@/firebase/firestore";
import { UserRecord } from "@/types";

/**
 * Maps Firebase Auth errors into messages that are safe to show in the UI.
 */
export function mapFirebaseAuthError(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return error instanceof Error ? error.message : "Authentication request failed.";
  }

  const authError = error as AuthError;

  switch (authError.code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Use a different email or log in with the existing account.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Use a stronger password with at least 6 characters.";
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "permission-denied":
    case "auth/operation-not-allowed":
      return "Firebase project setup is incomplete. Publish the Firestore and Realtime Database rules, then try again.";
    default:
      return authError.message || "Authentication request failed.";
  }
}

export function mapFirebaseLoginError(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return "Authentication request failed.";
  }

  const authError = error as AuthError;

  switch (authError.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Unable to complete sign in right now.";
  }
}

/**
 * Creates the first admin user and the matching organization-scoped profile records.
 * If profile creation fails, the newly created auth user is rolled back.
 */
export async function registerOrganizationAdmin(input: {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  position: string;
}) {
  const normalizedInput = sanitizeProvisionedUserProfile({
    ...input,
    organizationName: normalizeTextInput(input.organizationName, 80),
  });

  const credential = await createUserWithEmailAndPassword(auth, normalizedInput.email, input.password);

  try {
    const organization = await createOrganization(normalizedInput.organizationName, credential.user.uid);

    const profile = await createUserProfile({
      id: credential.user.uid,
      firstName: normalizedInput.firstName,
      lastName: normalizedInput.lastName,
      email: normalizedInput.email,
      position: normalizedInput.position,
      orgId: organization.id,
      role: "admin",
    });

    return { credential, organization, profile };
  } catch (error) {
    await deleteUser(credential.user).catch(() => undefined);
    await signOut(auth).catch(() => undefined);
    throw error;
  }
}

export async function loginWithEmailPassword(email: string, password: string) {
  return signInWithEmailAndPassword(auth, normalizeEmailInput(email), password);
}

export async function logoutUser() {
  return signOut(auth);
}

export async function getCurrentUserProfile(userId: string, options?: { source?: "default" | "server" }) {
  return getUserProfile(userId, options);
}

export function subscribeToAuthState(callback: (credentialUser: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Provisions a managed organization user by creating a secondary Firebase Auth session,
 * then writing the corresponding Firestore profile.
 */
export async function createManagedUserAccount(profile: Pick<UserRecord, "id" | "email" | "firstName" | "lastName" | "position" | "orgId" | "role">) {
  if (!DEFAULT_TEMP_PASSWORD) {
    throw new Error("NEXT_PUBLIC_TEMP_USER_DEFAULT_PASSWORD must be set before importing users.");
  }

  const secondaryName = `skipcloud-secondary-${profile.email}`;
  const secondaryApp = getSecondaryFirebaseApp(secondaryName);
  const secondaryAuth = getAuth(secondaryApp);
  const normalizedProfile = sanitizeProvisionedUserProfile(profile);

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, normalizedProfile.email, DEFAULT_TEMP_PASSWORD);
    try {
      await createUserProfile({
        ...normalizedProfile,
        id: credential.user.uid,
      });
    } catch (error) {
      // Avoid orphaned auth users when the profile write fails.
      await deleteUser(credential.user).catch(() => undefined);
      throw error;
    }

    return credential.user.uid;
  } finally {
    await secondaryAuth.signOut().catch(() => undefined);
    await deleteApp(secondaryApp).catch(() => undefined);
  }
}

export async function updateCurrentUserPosition(position: string) {
  if (!auth.currentUser) {
    throw new Error("You must be signed in to update your profile.");
  }

  await updateUserProfile(auth.currentUser.uid, { position });
}

export async function updateCurrentUserPassword(nextPassword: string) {
  if (!auth.currentUser) {
    throw new Error("You must be signed in to update your password.");
  }

  await updatePassword(auth.currentUser, nextPassword);
}
