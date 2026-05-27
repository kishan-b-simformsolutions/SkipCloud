# Testing Strategy

## Purpose

This document proposes a safe testing strategy for SkipCloud. It focuses on high-value test targets identified through code analysis, without changing current functionality.

## Current implementation

The repository currently emphasizes implementation over formal automated tests. That creates an opportunity to use Copilot for test ideation, case generation, and edge-case discovery.

### Recommended test layers

| Layer | Focus | Candidate files |
| --- | --- | --- |
| Unit | Validation and formatting helpers | `src/lib/formValidation.ts`, `src/lib/format.ts`, `src/utils/excelParser.ts` |
| Service | Firebase wrapper behavior with mocks | `src/firebase/auth.ts`, `src/firebase/firestore.ts`, `src/firebase/signaling.ts` |
| Hook | Peer session transitions and error handling | `src/hooks/usePeerSession.ts` |
| Integration | Auth bootstrap and route guard behavior | `src/contexts/AuthContext.tsx`, `src/components/AuthGate.tsx` |
| Manual scenario | Browser-to-browser signaling and file transfer | Chat and file transfer flows |

## Copilot usage in this area

- Used GitHub Copilot to identify high-value test slices based on control points and failure-prone paths.
- Used Copilot to expand edge-case coverage around auth bootstrap, signaling, and transfer failures.

## Suggested improvements

### High-priority test ideas

1. Validate login, register, and invite action field errors.
2. Verify `mapFirebaseAuthError` and `mapFirebaseLoginError` output coverage.
3. Mock signal ordering to verify `PeerConnectionManager.handleSignal` behavior.
4. Test `usePeerSession` channel-not-open failure messages.
5. Validate Excel/CSV parsing of malformed rows and duplicate emails.
6. Verify presence subscription default offline fallback behavior.

### Acceptance-oriented scenarios

| Scenario | Why it matters |
| --- | --- |
| Admin registers org and sees chat/admin access | Core happy path |
| Managed user creation fails after auth succeeds | Rollback path |
| Offer arrives while signaling state is unstable | WebRTC robustness |
| File transfer fails mid-stream | User-visible error path |
| Missing Firestore profile after auth | Session recovery path |

## Safe non-breaking recommendations

- Start with unit tests around validation and mapping helpers.
- Add mocks before attempting browser-level WebRTC automation.
- Treat this strategy as a roadmap until the team approves a test stack.

## Real examples from project

```ts
if (!password.trim()) {
  fieldErrors.password = "Enter your password.";
}
```

```ts
if (signal.type === "answer") {
  if (connection.signalingState !== "have-local-offer") {
    return false;
  }
}
```

## Developer experience benefits

- Gives QA and engineering an immediate prioritized test backlog.
- Shows Copilot’s value in generating targeted, code-aware test suggestions.
- Reduces the time required to plan regression coverage.
