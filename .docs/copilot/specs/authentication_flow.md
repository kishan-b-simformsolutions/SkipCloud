# Spec: Authentication Flow

## Problem statement

The current authentication flow is functional and well-integrated with organization onboarding, but its design assumptions should be captured formally to support future hardening and testing.

## Functional requirements

- Document registration, login, logout, managed user provisioning, and profile bootstrap flows.
- Define expected transitions between Firebase auth state and Firestore profile state.
- Preserve current role and organization behavior.

## Non-functional requirements

- No schema or route changes.
- No impact to current admin or member workflows.
- Clear coverage of recoverable versus terminal auth errors.

## Acceptance criteria

- Registration, login, and provisioning flows are described end-to-end.
- The relationship between Firebase Auth UID and Firestore `users/{id}` records is explicit.
- Bootstrap failure paths are documented for support and testing.

## Technical design

- Source modules remain `src/firebase/auth.ts`, `src/contexts/AuthContext.tsx`, and `src/firebase/firestore.ts`.
- The spec should become the basis for future tests and security reviews.

## Edge cases

- Auth succeeds but profile lookup fails.
- Permission denied during bootstrap.
- Managed account creation succeeds in Auth but fails during profile creation.

## Future scalability

- Move provisioning to a server-trusted boundary in a future release.
- Add password rotation or first-login reset flow for managed users.
