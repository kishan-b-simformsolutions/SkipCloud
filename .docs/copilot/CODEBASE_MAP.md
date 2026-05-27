# Codebase Map

## Purpose

This document provides a folder structure explanation, feature map, naming review, reusable component inventory, and low-confidence dead-code review notes for SkipCloud.

## Current implementation

### Folder structure explanation

| Path | Responsibility |
| --- | --- |
| `src/app` | App Router pages, route-level composition, and validation actions |
| `src/components` | Shared UI, auth forms, admin workspace, chat workspace, landing content |
| `src/contexts` | Global auth/session state |
| `src/firebase` | Firebase config, auth, Firestore, presence, and signaling adapters |
| `src/hooks` | Reusable orchestration hooks such as peer session management |
| `src/lib` | Shared constants, validation, formatting, and helper utilities |
| `src/utils` | Cross-cutting file chunking and import parsing utilities |
| `src/webrtc` | Peer connection, data channel, file transfer, and RTC configuration |
| `src/types` | Shared TypeScript domain and packet contracts |
| `docs` | Product and technical background docs already present in repo |
| `.docs/copilot` | Copilot-supported documentation prepared for this demonstration |

### Feature-to-file mapping

| Feature | Main files |
| --- | --- |
| Landing and positioning | `src/app/page.tsx`, `src/components/landing/*` |
| Login and registration | `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/components/LoginForm.tsx`, `src/components/RegisterForm.tsx` |
| Admin onboarding | `src/app/admin/page.tsx`, `src/components/admin/AdminWorkspace.tsx`, `src/components/ExcelUpload.tsx`, `src/components/InviteUserForm.tsx` |
| Chat and peer transfer | `src/app/chat/page.tsx`, `src/components/chat/ChatWorkspace.tsx`, `src/hooks/usePeerSession.ts`, `src/webrtc/*` |
| Shared session state | `src/contexts/AuthContext.tsx`, `src/components/AuthGate.tsx`, `src/components/ProfileMenu.tsx` |

### Naming convention review

| Observation | Assessment | Safe recommendation |
| --- | --- | --- |
| File names are mostly descriptive and PascalCase for components | Good | Keep current convention |
| Firebase modules are named by concern | Good | Preserve this pattern if modules are later split |
| `usePeerSession` communicates ownership clearly | Good | Reuse hook naming style for future orchestration hooks |
| `file-transfer` route appears legacy relative to chat integration | Acceptable | Document the route purpose or redirect behavior |

### Reusable component identification

| Candidate | Why reusable |
| --- | --- |
| `AsyncSubmitButton.tsx` | Generic async form state handling |
| `AuthGate.tsx` | Route protection pattern |
| `DashboardShell.tsx` | Shared authenticated layout shell |
| `MemberTable.tsx` and `UserList.tsx` | Organization roster display patterns |
| `FileSender.tsx` and `FileReceiver.tsx` | Transfer-focused UI primitives |

### Low-confidence dead code or review candidates

| Candidate | Reason to review | Confidence |
| --- | --- | --- |
| `src/app/file-transfer/page.tsx` | Feature appears largely merged into chat flow | Medium |
| Any standalone file-transfer UI paths | May be historical alongside `ChatWorkspace` | Medium |
| Unused packet type `presence` in runtime flow | Present in types but not obviously central to current transfer logic | Low to medium |

## Copilot usage in this area

- Used GitHub Copilot to turn the folder tree into a clear ownership map.
- Used Copilot to identify reusable patterns, naming consistency, and low-confidence review targets.

## Suggested improvements

- Add one-line folder README files if the repository grows further.
- Consider module ownership comments in orchestration-heavy files.
- Review legacy route/documentation overlap before removing anything.

## Safe non-breaking recommendations

- Treat dead-code notes as inspection targets, not deletion instructions.
- Preserve naming consistency already present in the repo.
- Use the map as a starting point for onboarding and reviews.

## Real examples from project

```ts
export type PeerPacketType = "message" | "file-meta" | "file-chunk" | "file-complete" | "presence";
```

## Developer experience benefits

- Gives engineers a quick orientation path across folders and responsibilities.
- Supports feature ownership conversations with minimal overhead.
- Good documentation reduces the need for repeated verbal walkthroughs.
