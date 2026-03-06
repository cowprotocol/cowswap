# SWR to atomWithQuery Migration (cowswap-first)

Status: active
Owner: frontend platform + feature maintainers
Created: 2026-03-05
Target PR: TBD

## Goal

Migrate prioritized SWR call sites to Jotai `atomWithQuery` so data fetching follows the current architecture direction and reduces hook-level cache fragmentation.

## Scope

- In scope:
  - `apps/cowswap-frontend/src/**` SWR call sites in `modules/`, `entities/`, `common/`, `api/`, and `pages/`
  - test updates needed for migrated paths
  - docs/quality updates per completed slice
- Out of scope:
  - broad refactors unrelated to fetching
  - migration of all `libs/**` SWR call sites in the same PR train
  - behavior changes to UX/business logic

## Enforcement Context

- Enforcement is repo-wide: no new SWR usage is allowed anywhere under `apps/**` or `libs/**`.
- Mechanism:
  - `pnpm swr:check`
  - `tools/scripts/swr-usage-guardrail.mjs`
  - `tools/baselines/swr-usage-baseline.txt`
- This plan prioritizes remediation in `apps/cowswap-frontend` first.
- `libs/**` may temporarily keep baseline-listed legacy SWR usage, but must not introduce new SWR usage.

## Baseline Inventory

Snapshot date: 2026-03-05

- `apps/cowswap-frontend/src` SWR usage by area:
  - `modules/affiliate`: 7
  - `common`: 6
  - `modules/twap`: 3
  - `modules/orders`: 3
  - `legacy`: 3
  - `entities/bridgeProvider`: 3
  - `modules/usdAmount`: 2
  - `modules/permit`: 2
  - `modules/ordersTable`: 2
  - `modules/orderProgressBar`: 2
  - `modules/notifications`: 2
  - `modules/accountProxy`: 2
  - `modules/tradeFlow`: 1
  - `modules/tenderly`: 1
  - `modules/hooksStore`: 1
  - `entities/correlatedTokens`: 1
  - `entities/bridgeOrders`: 1
  - `api`: 1
  - `pages/error`: 1
  - `pages/Account`: 1
- `libs/**` SWR usage by package (deferred phase):
  - `balances-and-allowances`: 10
  - `tokens`: 5
  - `ens`: 5
  - `wallet`: 4
  - `multicall`: 2
  - `common-hooks`: 1
- Current `atomWithQuery` usage in `apps/cowswap-frontend/src` and `libs/**`: 0 matches.

## Execution Plan

1. [ ] Phase 1: migrate low-risk feature slices in cowswap-frontend
   - Target `modules/affiliate`, `modules/notifications`, `modules/accountProxy`
   - Keep each PR <= 400 LOC where possible
2. [ ] Phase 2: migrate shared data-heavy flows in cowswap-frontend
   - Target `modules/orders`, `modules/usdAmount`, `entities/bridgeProvider`
   - Validate cache keys and loading transitions
3. [ ] Phase 3: reduce SWR in `common` and `api` surfaces
   - Minimize cross-cutting blast radius; split by feature
4. [ ] Phase 4: evaluate `legacy/**` paths
   - Prefer containment over large rewrites; migrate only touched/high-value paths
5. [ ] Phase 5: create separate plan for `libs/**` migration train
   - Treat as independent follow-up once app migration is stable

## Decision Log

- 2026-03-05: Started with cowswap-frontend-first sequencing to keep risk and PR size controlled.
- 2026-03-05: Deferred `libs/**` migration to a separate train due to breadth (27 SWR files).
- 2026-03-05: Kept legacy paths as explicit phase to avoid accidental large refactors.

## Validation

- [ ] For each migrated file: run targeted eslint on changed paths
- [ ] For each migrated module: run nearest module tests
- [ ] Run app typecheck after each phase
- [ ] Track SWR usage delta after each PR and update `docs/QUALITY.md`

## Exit Criteria

- No new SWR call sites introduced repo-wide.
- Majority of active-domain SWR hooks in cowswap-frontend replaced with `atomWithQuery`.
- Remaining SWR usage documented as intentional legacy/deferred debt with owners.

## Follow-ups

- Keep SWR baseline fresh when legacy entries are removed (`pnpm swr:baseline:update`).
- Open a dedicated `libs/**` migration plan after phase 2 stabilization.
