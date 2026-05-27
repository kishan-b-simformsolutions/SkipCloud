# Project Overview

## Purpose

SkipCloud is an internal collaboration platform for organization-scoped messaging and peer-to-peer file sharing. It combines Next.js 16, React 19, Firebase Auth, Firestore, Realtime Database presence, and WebRTC data channels to enable browser-to-browser communication without introducing a separate backend API layer.

## Current implementation

| Area | Current state | Evidence |
| --- | --- | --- |
| App shell | App Router layout with shared navigation and providers | `src/app/layout.tsx`, `src/components/Providers.tsx` |
| Authentication | Firebase email/password auth with organization-aware user profiles | `src/firebase/auth.ts`, `src/contexts/AuthContext.tsx` |
| Data model | Firestore stores orgs, users, signals, and conversation requests | `src/firebase/firestore.ts`, `src/types/index.ts` |
| Presence | Realtime Database stores online state and last seen | `src/firebase/presence.ts` |
| P2P transfer | WebRTC RTCPeerConnection plus data channel file/message packets | `src/webrtc/peerConnection.ts`, `src/hooks/usePeerSession.ts` |
| Admin workflow | Admin can provision users manually or via Excel/CSV import | `src/components/admin/AdminWorkspace.tsx`, `src/components/ExcelUpload.tsx` |

## High-level understanding report

### Primary user journeys

1. Organization admin registers a workspace and profile.
2. Team members sign in and load organization-scoped profiles.
3. Members discover coworkers and request conversations.
4. Once a conversation is approved, peers establish a WebRTC data channel.
5. Messages and files are exchanged directly between browsers.
6. Admin users manage onboarding through bulk import or manual invite.

### Architectural style

- Frontend-first Next.js application with client-side orchestration.
- Firebase services act as identity, persistence, and signaling infrastructure.
- WebRTC handles the actual transfer plane for chat and files.
- TypeScript interfaces define the shared contract across UI, Firebase, and WebRTC modules.

## Copilot usage in this area

- Used GitHub Copilot to accelerate codebase understanding across routes, components, and services.
- Used Copilot to connect auth, Firebase, and peer session flows into one architectural view.

## Suggested improvements

| Improvement | Why it matters | Risk level |
| --- | --- | --- |
| Add a root architecture README | Faster onboarding and handoff | Safe |
| Add explicit environment variable documentation | Reduces setup errors | Safe |
| Add focused test coverage around auth and signaling edge cases | Improves regression confidence | Safe |
| Add operational logging guidelines | Makes peer connection issues easier to diagnose | Safe |

## Safe non-breaking recommendations

- Preserve the current route and Firebase model boundaries.
- Document conversation request states and signaling expectations.
- Add more JSDoc to complex orchestration modules rather than refactoring them.
- Add lightweight developer docs before introducing runtime changes.

## Real examples from project

```ts
// Firebase user profile bootstrap is coordinated from a single provider.
const unsubscribe = subscribeToAuthState((firebaseUser) => {
  void bootstrapSession(firebaseUser);
});
```

```ts
// WebRTC file transfer is packetized over the data channel.
const completionSent = await managerRef.current.send({
  type: "file-complete",
  payload: { fileId: meta.id },
});
```

## Developer experience benefits

- New developers can understand the app in terms of flows instead of isolated files.
- Team leads can review architecture decisions without reading every module.
- Shows how Copilot can support project understanding without changing behavior.
