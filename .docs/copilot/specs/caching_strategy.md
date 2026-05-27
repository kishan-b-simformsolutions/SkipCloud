# Spec: Caching Strategy

## Problem statement

SkipCloud currently favors direct realtime subscriptions and current-session state over explicit caching. That is appropriate for the current implementation, but future scale and UX refinement may benefit from documented caching rules.

## Functional requirements

- Define what should remain realtime versus what could be cached locally.
- Preserve current correctness for auth, presence, signaling, and transfer state.
- Avoid introducing stale data risks in organization membership or request status.

## Non-functional requirements

- No behavior changes in the current demo scope.
- Caching decisions must prioritize correctness over speed.
- Any future cache must be easy to invalidate.

## Acceptance criteria

- A documented strategy exists for profile, member list, and static UI metadata caching.
- Presence, signals, and transfer progress remain explicitly non-cache-first.
- The strategy distinguishes durable profile data from transient session state.

## Technical design

- Document profile/member caching as a future optimization candidate.
- Keep presence and signaling purely realtime.
- Prefer small client cache layers over major architecture changes.

## Edge cases

- Cached members after an admin invite.
- Stale profile metadata after updates.
- Offline or flaky connection behavior with stale cached UI.

## Future scalability

- Introduce query caching for member lists with timestamp invalidation.
- Consider optimistic UI only after formal test coverage exists.
