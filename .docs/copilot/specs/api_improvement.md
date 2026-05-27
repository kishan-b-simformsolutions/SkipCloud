# Spec: API Improvement

## Problem statement

SkipCloud relies on internal APIs in the form of server actions, Firebase service helpers, and typed packets. These contracts are clear in code but not centrally documented as a maintained interface set.

## Functional requirements

- Define a documented contract catalog for server actions, Firebase helpers, and runtime packet types.
- Add examples of inputs, outputs, and expected error behavior.
- Preserve all existing function signatures and route patterns.

## Non-functional requirements

- No runtime behavior changes.
- Documentation must stay aligned with the current TypeScript contracts.
- The API catalog should be understandable by frontend, QA, and support engineers.

## Acceptance criteria

- Every exported server action is documented.
- Core Firebase auth, Firestore, presence, and signaling functions are listed with purpose.
- Peer packet types are described with payload expectations.

## Technical design

- Source of truth remains the implementation under `src/app/actions`, `src/firebase`, and `src/types`.
- Documentation can be stored under `.docs/copilot/API_DOCUMENTATION.md` or promoted later into product docs.

## Edge cases

- Validation returns field-level errors with normalized email state.
- Signaling functions handle transient messages rather than durable business state.
- Packet schema must remain compatible with the data channel parser.

## Future scalability

- Generate API docs automatically from TypeScript comments.
- Add schema-driven validation around packet payloads in a later iteration.
