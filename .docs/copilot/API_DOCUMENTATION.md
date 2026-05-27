# API Documentation

## Purpose

SkipCloud does not expose a large REST API surface. Its operational interface is a combination of Next.js server actions, Firebase service helpers, and typed packet contracts. This document explains those interfaces in API terms for developers and reviewers.

## Current implementation

### Server action surface

| Action | File | Role | Notes |
| --- | --- | --- | --- |
| `validateLoginSubmission` | `src/app/actions/auth.ts` | Login validation | Returns normalized email and field errors |
| `validateRegisterSubmission` | `src/app/actions/auth.ts` | Registration validation | Enforces password and profile shape |
| `validateInviteSubmission` | `src/app/actions/admin.ts` | Invite validation | Used before managed account creation |

### Firebase service surface

| Service area | Primary functions | File |
| --- | --- | --- |
| Auth | `registerOrganizationAdmin`, `loginWithEmailPassword`, `createManagedUserAccount` | `src/firebase/auth.ts` |
| Firestore | `createOrganization`, `createUserProfile`, `upsertConversationRequest`, `subscribeToSignals` | `src/firebase/firestore.ts` |
| Presence | `bindPresence`, `subscribeToPresence` | `src/firebase/presence.ts` |
| Signaling | `emitOffer`, `emitAnswer`, `emitIceCandidate`, `listenForSignals` | `src/firebase/signaling.ts` |

### Runtime packet contract

| Packet type | Purpose | Source of contract |
| --- | --- | --- |
| `message` | Text message payload | `src/types/index.ts` |
| `file-meta` | File metadata handshake | `src/types/index.ts` |
| `file-chunk` | File chunk transfer | `src/types/index.ts` |
| `file-complete` | Transfer completion marker | `src/types/index.ts` |
| `presence` | Session connection status signal | `src/types/index.ts` |

## Copilot usage in this area

- Used GitHub Copilot to organize server actions, Firebase services, and packet contracts into a clear interface catalog.
- Used Copilot to turn implementation details into documentation that is easier to review and present.

## Suggested improvements

| Area | Suggestion | Safe impact |
| --- | --- | --- |
| Server actions | Add doc comments and input/output examples | Safe |
| Firebase helpers | Document expected callers and side effects | Safe |
| Packet schema | Add a markdown packet reference table for QA/support | Safe |
| Error contracts | Standardize string messages for user-facing failures | Safe |

## Safe non-breaking recommendations

- Treat typed functions and packets as the application’s API contract.
- Add documentation before introducing any route handlers or backend abstractions.
- Keep packet definitions centralized in `src/types/index.ts`.

## Real examples from project

```ts
export async function emitOffer(fromUserId: string, toUserId: string, sdp: RTCSessionDescriptionInit) {
  return sendSignal(fromUserId, toUserId, "offer", JSON.stringify(sdp));
}
```

```ts
export interface FileChunkPacket extends PeerPacketBase {
  type: "file-chunk";
  payload: {
    fileId: string;
    chunkIndex: number;
    totalChunks: number;
    content: string;
  };
}
```

## Developer experience benefits

- Gives the team a contract-oriented view of the app.
- Makes test planning easier because input and output boundaries are clearer.
- Makes internal contracts easier to explain during design, QA, and review discussions.
