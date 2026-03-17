# CoW Protocol Agent Harness (Root AGENTS.md)

This file is the root coordination contract for AI and human contributors in this monorepo.
Keep this file compact and route detailed guidance to docs.

Owner: Frontend platform maintainers
Last reviewed: 2026-03-05
Review cadence: weekly during active frontend work, otherwise bi-weekly

## Scope

- Applies to the whole repository unless a closer `AGENTS.md` defines additive overrides.
- A closer `AGENTS.md` may tighten rules for its subtree, but must not relax root safety rules.
- Repository layout: `apps/`, `libs/`, `tools/`, `testing/`.

## Rule Precedence

1. Nearest additive `AGENTS.md` to the changed file.
2. Root [`AGENTS.md`](./AGENTS.md).
3. Referenced docs and standards (for example [`CONTRIBUTING.md`](./CONTRIBUTING.md)).

Normative language:
- `MUST`/`MUST NOT`: mandatory and blocking.
- `SHOULD`/`SHOULD NOT`: expected by default; deviations must be justified in PR notes.
- `MAY`: optional.

## Non-Negotiables

- `MUST NOT` use `any` or non-null assertions (`!`) in production code.
- `MUST NOT` run `pnpm lint --fix`.
- `MUST` keep diffs scoped to the task and avoid unrelated edits.
- `MUST` preserve module boundaries and import direction constraints already enforced by lint.
- `MUST` prefer existing shared utilities/hooks over creating near-duplicates.
- `MUST` run targeted verification (lint/tests/typecheck) for the touched area.
- Both SWR and Jotai `atomWithQuery` are acceptable for data fetching. The team is evaluating migration; no forced migration yet.
- Avoid introducing new `common/** -> modules/**` imports; treat existing cases as legacy debt and track cleanup in `docs/QUALITY.md`.

## Command Baseline

- Install: `pnpm install`
- i18n: `pnpm i18n`
- Start: `pnpm start`, `pnpm start:cowswap`, `pnpm start:explorer`, `pnpm start:widget`, `pnpm start:cowfi`
- Lint/test/typecheck: `pnpm lint`, `pnpm test`, `pnpm typecheck`
- Project target: `pnpx nx run <project>:<target>`
- Harness checks: `pnpm agents:check`

## Where To Look

- Architecture and dependency map: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Naming, file structure, imports, component shape: [`docs/MODULE_CONVENTIONS.md`](./docs/MODULE_CONVENTIONS.md)
- Jotai/query, persistence, migrations: [`docs/STATE_MANAGEMENT.md`](./docs/STATE_MANAGEMENT.md)
- Quality grades and known gaps: [`docs/QUALITY.md`](./docs/QUALITY.md)
- Hardening roadmap (next enforcement steps): [`docs/HARNESS_HARDENING.md`](./docs/HARNESS_HARDENING.md)
- Frontend-specific additive rules: [`apps/cowswap-frontend/AGENTS.md`](./apps/cowswap-frontend/AGENTS.md)
- Other app-local commands/overrides: `apps/*/AGENTS.md`

## Branch-Scoped AGENTS Task Protocol

Use this protocol only when explicitly asked to "apply/fix AGENTS.md rules in this branch."

1. Compute touched files:
   ```bash
   git diff --name-only $(git merge-base HEAD develop)..HEAD
   ```
2. Load context:
   - root [`AGENTS.md`](./AGENTS.md)
   - nearest additive `AGENTS.md` for each touched file
3. Audit touched files for violations; keep scope to touched files by default.
4. Allow extra files only when required for correctness; list each with one-line justification.
5. Verify with file-level lint + targeted tests.

Required response format for this task:
1. Findings first (severity order) with `file:line`
2. Exact fixes made
3. Additional files changed with justification
4. Commands run and pass/fail
5. Residual risks/gaps

## Enforcement

Mechanical checks are preferred over prose.

- ESLint + Nx rules are the first enforcement layer:
  - module boundaries (`@nx/enforce-module-boundaries`)
  - restricted imports (`@typescript-eslint/no-restricted-imports`)
  - import order and restricted internal module paths
- Run `pnpm agents:check` to verify AGENTS/doc harness integrity.
- CI enforcement: `.github/workflows/ci.yml` job `agent-harness` runs `pnpm agents:check` on push and PR.
- If adding new architectural rules, add machine checks (lint rule, script, or test) in the same PR.

## Drift Detection

- If you spot architecture or convention drift, open a focused cleanup PR instead of piggybacking unrelated fixes.
- Update [`docs/QUALITY.md`](./docs/QUALITY.md) when domain health improves/regresses.
- Keep plan files current:
  - active execution plans in `.plans/active/`
  - completed plans in `.plans/completed/`
  - debt items in `.plans/debt/`

## Agent Artifacts

- Plans are first-class artifacts for medium/large work.
- Use templates in `.plans/` and keep decision logs in version control.
- Close or move stale active plans during related feature work.
