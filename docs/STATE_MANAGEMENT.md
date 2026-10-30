---
author: agents
status: normative
last_reviewed: 2026-10-30
source_of_truth_scope: Jotai usage, query patterns, persistence, and migration conventions
---

# State Management

## Defaults

- Use Jotai for entity/shared state in frontend apps.
- Use focused atoms/selectors to avoid broad rerender cascades.
- Keep ownership local to the module that mutates the state.

## Business logic placement

Derived state and state transitions belong outside React.

- `utils/` and `services/`: pure functions. No React, no Redux, no Jotai.
- `state/`: Jotai primitive atoms, derived atoms (`atom((get) => ...)`), write atoms (`atom(null, (get, set, payload) => ...)`), and `jotai-effect` effects.
- `hooks/`: browser or React lifecycle integration (DOM, focus, observers), or logic that is not a single atom read. A hook must not chain domain hooks through `useMemo`, `useCallback`, `useEffect`, or `useLayoutEffect` to compute domain state.
- A hook whose body only returns `useAtomValue(atom)`, `useSetAtom(atom)`, or `useAtom(atom)` is an alias, including a temporary that is returned immediately. Call the Jotai hook at the component. A property access, an index, or an atom-family argument is extra logic and can stay a hook.

Canonical derived atom: `apps/cowswap-frontend/src/modules/volumeFee/state/volumeFeeAtom.ts` (`volumeFeeAtom`). Callers use `useAtomValue(volumeFeeAtom)`.

New files under `state/` and `utils/` must not import `react`, `react-redux`, or `legacy/state`. ESLint enforces that. Existing files are allowlisted in `eslint.config.js`. `pnpm arch:check` ratchets `legacy/state` imports anywhere in `apps/cowswap-frontend`, and ratchets alias hooks: a new file, or a higher alias count in an existing file, fails.

Thin-hook pressure is the orchestration ratchet in `pnpm arch:check`: a `hooks/` file that combines `useMemo`, `useCallback`, `useEffect`, or `useLayoutEffect` with 3 or more domain hook imports cannot be introduced or grown.

## Unit tests

- Test pure functions and atoms in `*.test.ts`. Atoms use `createStore()` from `jotai`.
- `*.test.tsx`, `render()`, and `renderHook()` are for a complex stateful container or a browser-only hook. The PR notes must say why.
- A unit test that uses `render` / `renderHook` should not stack `jest.mock()` calls. `pnpm arch:check` fails when a new test, or a test whose mock count grew, has more than 3 `jest.mock()` calls together with `render` / `renderHook`.
- Importing `render` or `renderHook` from `@testing-library/react` in a cowswap-frontend unit test is an ESLint warning.
- Component markup and visual behavior belong in Cosmos and Playwright, not in unit tests.

## Remote Data Fetching

- Both SWR and Jotai `atomWithQuery` (from `jotai/query`) are acceptable for data fetching.
- The team is evaluating a phased migration from SWR to `atomWithQuery`; no forced migration yet.
- When using SWR:
  - SWR keys must include every response-defining parameter.
  - Memoize key parameter objects.
  - Use no-refresh options when revalidation causes UX flicker.

## Persistence

- Do not use manual `localStorage` synchronization with `useState` + `useEffect`.
- Use `atomWithStorage` for persisted entities.
- Persistence keys must follow `camelCaseBase:v{number}`.

Reference implementations:

- `apps/cowswap-frontend/src/entities/bridgeOrders/state/bridgeOrdersAtom.ts`
- `libs/tokens/src/state/tokens/favoriteTokensAtom.ts`
- `apps/cowswap-frontend/src/modules/tokensList/state/recentTokensAtom.ts`

## Migrations

- Place migrations under `state/migrations/*` in the owning module.
- Parse persisted data defensively; malformed state must not crash startup.
- Add cleanup TODO dates for migration removal.

## Performance Guardrails

- Memoize object-returning hooks where reference identity matters.
- Avoid overlapping async writes for polling/loop flows.
- Split large provider payloads into focused slices/selectors.
