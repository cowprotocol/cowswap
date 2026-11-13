# TypeScript 7.0 (native) migration

TypeScript 7.0 ships a native compiler written in Go (`tsgo`), distributed as
[`@typescript/native-preview`](https://www.npmjs.com/package/@typescript/native-preview). It is
type-check compatible with `tsc` and roughly 10x faster, which is the motivation for adopting it as
the type-checker across the repo.

The repo type-checks with `tsgo` everywhere `tsc` was used before: `cowswap-frontend` (its `typecheck`
target), every workspace typechecked by `tools/scripts/typecheck-workspaces.mjs`, and `ui`. `tsc`
(`typescript@5.9.3`) stays installed for editors/other tooling.

## Required tsconfig changes

TypeScript 7.0 removes several options; these were cleaned up in `tsconfig.base.json` and the
per-project configs so `tsgo` accepts them:

- `baseUrl` — removed. `cowswap-frontend` and `explorer` replace `baseUrl: "src"` with
  `"paths": { "*": ["./src/*"] }`; others just drop `baseUrl: "."`.
- `downlevelIteration` — removed (unnecessary at `target: es2022`).
- `esModuleInterop: false` — removed; TS7 always behaves as `esModuleInterop: true`.
- `moduleResolution: "node"` (node10) — removed; the base now uses `"bundler"`.

The `"bundler"` resolution is stricter about bare side-effect imports with no types, so the apps that
`import 'inter-ui'` add a one-line `declare module 'inter-ui'` ambient shim.

## Running the native type-checker

`tsgo` is a drop-in for `tsc --noEmit`:

```bash
# any project
node_modules/.bin/tsgo --noEmit -p apps/cowswap-frontend/tsconfig.app.json

# the repo-wide typecheck
pnpm run typecheck
```

## Status

| Project                   | `tsgo` type-checks | Notes                                                                    |
| ------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `cowswap-frontend`        | ✅ migrated        | `typecheck` target runs `tsgo`                                           |
| all libs + workspace apps | ✅ migrated        | run under `tsgo` via `typecheck-workspaces.mjs`                          |
| `ui`                      | ✅ migrated        | `typecheck` target runs `tsgo`                                           |
| `balances-and-allowances` | ⬜ blocked         | Real error: missing `@cowprotocol/cow-sdk` Solana exports; still skipped |

## Remaining work

Only `balances-and-allowances` is still skipped — it has genuine type errors (missing
`SOLANA_SETTLEMENT_PROGRAM_ID` / `SOLANA_SETTLEMENT_PROGRAM_ID_STAGING` exports from
`@cowprotocol/cow-sdk`), unrelated to the compiler swap. Once those are resolved, drop it from the
`skippedLibs` set in `tools/scripts/typecheck-workspaces.mjs`.
