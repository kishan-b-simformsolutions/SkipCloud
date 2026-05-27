# SkipCloud Copilot Instructions

## Project Scope

- SkipCloud is a Next.js 16 App Router application using React 19, TypeScript, Firebase Auth, Firestore, Realtime Database presence, and WebRTC data channels.
- Prefer small, non-breaking changes that preserve the existing route structure, Firebase data model, and peer-to-peer transfer flow.

## Where To Read First

- Start with `.docs/copilot/README.md` for the documentation index.
- Use `.docs/copilot/PROJECT_OVERVIEW.md` and `.docs/copilot/CODEBASE_MAP.md` for architecture and ownership.
- Use `.docs/copilot/API_DOCUMENTATION.md` for route, action, and service behavior.
- Use `.docs/copilot/TESTING_STRATEGY.md` before proposing new tests or changing validation behavior.

## Build And Validation

- Use `npm run lint` for the main repository-wide validation command.
- Use `npm run build` only when a change affects runtime integration and a broader validation is justified.
- Preserve the current package manager and script names from `package.json`.

## Coding Conventions

- Follow existing App Router patterns under `src/app` and shared component patterns under `src/components`.
- Keep Firebase concerns in `src/firebase`, WebRTC concerns in `src/webrtc`, and orchestration in `src/hooks`.
- Reuse shared types from `src/types` instead of redefining payload shapes locally.
- Prefer focused edits over broad refactors unless the task explicitly asks for restructuring.

## Change Safety

- Preserve organization-scoped auth, conversation, signaling, and presence behavior.
- Treat `.docs/copilot` as reference documentation; update it when behavior or architecture materially changes.

## Project AI Instructions

Always read specifications from:

- .docs/copilot/specs/README.md
- .docs/copilot/specs/api_improvement.md
- .docs/copilot/specs/authentication_flow.md
- .docs/copilot/specs/caching_strategy.md
- .docs/copilot/specs/error_handling_standardization.md
- .docs/copilot/specs/existing_feature_enhancement.md
- .docs/copilot/specs/logging_strategy.md
- .docs/copilot/specs/reusable_component_standards.md

Follow project architecture and validation rules from these specs before generating code.