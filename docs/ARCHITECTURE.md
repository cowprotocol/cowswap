---
author: agents
status: normative
last_reviewed: 2026-03-05
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

## Mechanical Enforcement

Primary enforcement lives in [`eslint.config.js`](../eslint.config.js):

- `@nx/enforce-module-boundaries`
- `@typescript-eslint/no-restricted-imports`
- `import/no-internal-modules` (advisory level)

When introducing a new boundary rule, include:

1. a machine check (lint rule/script/test),
2. a remediation message that tells contributors what to do instead,
3. a docs update in this file.
