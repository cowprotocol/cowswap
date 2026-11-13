---
author: agents
status: normative
last_reviewed: 2026-10-30
source_of_truth_scope: monorepo layout, dependency direction, and boundary enforcement
visual_reference: docs/architecture-overview.md
---

# Architecture

## Monorepo Map

- `apps/`: deployable applications.
- `libs/`: shared packages intended for reuse across apps.
- `tools/`: repository tooling and automation scripts.
- `testing/`: integration and test helpers.

## Layering Direction

Feature-Sliced direction is the default target for frontend apps where feasible.

- Preferred layers (top to bottom): `app -> pages -> widgets -> features -> entities -> shared`.
- Imports should point to the same or lower layer.
- Avoid large refactors just to satisfy layering; apply incrementally on touched features.

## cowswap-frontend Structure

- `src/common`: shared primitives and cross-domain helpers.
- `src/modules`: domain modules.
- `src/pages`, `src/api`, `src/types`: app surface and integration points.

Target boundary (legacy exceptions exist):
- New code in `src/common/**` should avoid new imports from `src/modules/**`.
- Existing imports are treated as debt and tracked in `docs/QUALITY.md`.
- Current mechanical signals:
  - `@typescript-eslint/no-restricted-imports` in `eslint.config.js` for `src/common/**`
  - `import/no-internal-modules` warnings on deep module imports

## Dependency Boundaries

Use these defaults for new code:

- If used by 2+ apps, move to `libs/`.
- If app-specific, keep it in the app.
- Imports across modules should go through module public APIs (`index.ts`) unless there is a justified local exception.
- Avoid dependency cycles between modules.

## Business logic vs React

cowswap-frontend keeps domain decisions out of the React tree:

1. Pure functions in `utils/` and `services/` (no React, no Redux, no Jotai).
2. Jotai atoms in `state/` for stored values, derived reads, and writes.
3. Components read and write those atoms with `useAtomValue`, `useSetAtom`, or `useAtom`. Hooks are for browser lifecycle or logic that is not an atom read.

Hooks and components must not reimplement a derivation a derived atom can express, and a hook must not exist only to rename an atom read. A side effect that follows atom changes uses `observe` from `jotai-effect`. A deadline wait uses `setTimeout` until that moment (`runCountdown`, `useRemainingSeconds`). Placement, hook limits, and unit-test rules: [`STATE_MANAGEMENT.md`](./STATE_MANAGEMENT.md).

Machine checks:

- Core `no-restricted-imports` in [`eslint.config.js`](../eslint.config.js) blocks `react`, `react-redux`, and `legacy/state` under `state/` and `utils/`. Existing files are an allowlist in that config.
- `pnpm arch:check` (`tools/scripts/architecture-and-tests-guardrail.mjs`) ratchets legacy Redux imports, multi-hook orchestration, atom-alias hooks, and mock-heavy `render` / `renderHook` tests.

## Mechanical Enforcement

Primary enforcement lives in [`eslint.config.js`](../eslint.config.js):

- `@nx/enforce-module-boundaries`
- `@typescript-eslint/no-restricted-imports`
- `import/no-internal-modules` (advisory level)

When introducing a new boundary rule, include:

1. a machine check (lint rule/script/test),
2. a remediation message that tells contributors what to do instead,
3. a docs update in this file.
