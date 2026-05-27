# Spec: Logging Strategy

## Problem statement

Current logging is intentionally lightweight, but multi-system flows such as auth bootstrap, presence, signaling, and file transfer would benefit from a consistent debug strategy.

## Functional requirements

- Define logging prefixes for auth, presence, signaling, session, and transfer.
- Separate user-facing errors from developer-facing debug output.
- Keep logs safe for browser environments and production troubleshooting.

## Non-functional requirements

- No reliance on a new logging vendor.
- Minimal performance overhead.
- No leakage of passwords, tokens, or unnecessary personal data.

## Acceptance criteria

- A future implementation can add consistent log statements with a documented naming scheme.
- Engineers can trace a session from auth through transfer using prefixes.
- Existing warning and error sites can be migrated incrementally.

## Technical design

- Start with a documentation-only convention.
- Prefix examples: `[auth]`, `[presence]`, `[signal]`, `[session]`, `[transfer]`.
- Encourage structured objects for context where safe.

## Edge cases

- Multiple concurrent peer sessions.
- Repeated signal handling during reconnect scenarios.
- Presence writes failing due to permissions or connectivity.

## Future scalability

- Send structured client events to a central log or analytics store.
- Add environment-sensitive log verbosity settings.
