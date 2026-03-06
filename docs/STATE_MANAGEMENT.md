# State Management

Last reviewed: 2026-03-05
Source of truth scope: Jotai usage, query patterns, persistence, and migration conventions.

## Defaults

- Use Jotai for entity/shared state in frontend apps.
- Use focused atoms/selectors to avoid broad rerender cascades.
- Keep ownership local to the module that mutates the state.

## Remote Data Fetching

- SWR is deprecated for new work.
- New fetching must use Jotai `atomWithQuery` from `jotai/query`.
- When touching a SWR-backed flow, migrate it unless there is a documented blocker.
- Guardrail: `pnpm swr:check` blocks new SWR usage using a committed legacy baseline.

Legacy SWR fallback rules (only when migration is blocked):

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
