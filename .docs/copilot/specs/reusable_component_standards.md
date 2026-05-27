# Spec: Reusable Component Standards

## Problem statement

SkipCloud already contains reusable UI and orchestration patterns, but the criteria for reuse are implicit. A shared standard would help future contributors extend the project consistently.

## Functional requirements

- Define when a UI element becomes a shared component versus a route-local implementation.
- Define expectations for naming, props, typing, accessibility, and side-effect ownership.
- Preserve the current component structure during the demo period.

## Non-functional requirements

- No forced refactor of existing components.
- Standards must fit the current Next.js and React patterns.
- Guidance must remain lightweight enough for day-to-day use.

## Acceptance criteria

- Shared component guidelines cover naming, prop design, composition, and comments.
- Reusable logic guidelines cover hooks versus service helpers.
- Existing components can be evaluated against the standard without ambiguity.

## Technical design

- Use current examples such as `AsyncSubmitButton`, `AuthGate`, `DashboardShell`, and `FileSender` as reference patterns.
- Favor clear TypeScript interfaces and minimal side effects in presentational components.

## Edge cases

- Components that mix orchestration and presentation.
- Hooks that are reusable only within one domain.
- Shared components that rely heavily on auth context.

## Future scalability

- Add a component checklist template for pull requests.
- Introduce story-driven documentation for shared UI pieces.
