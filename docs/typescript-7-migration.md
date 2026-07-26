# TypeScript 7.0 (native) migration

TypeScript 7.0 ships a native compiler written in Go (`tsgo`), distributed as
[`@typescript/native-preview`](https://www.npmjs.com/package/@typescript/native-preview). It is
type-check compatible with `tsc` and roughly 10x faster, which is the motivation for adopting it as
the type-checker across the repo.

This is an incremental migration: `tsgo` is wired in per project as each one is verified to type-check
cleanly under it. `tsc` (`typescript@5.9.3`) stays installed and is still used everywhere `tsgo` has
not been rolled out yet.

## Running the native type-checker

`tsgo` is a drop-in for `tsc --noEmit`:

```bash
# any project
node_modules/.bin/tsgo --noEmit -p apps/cowswap-frontend/tsconfig.app.json

# via nx (projects already switched over)
nx typecheck cowswap-frontend
```

## Status

| Project             | `tsgo` type-checks | Notes                                                        |
| ------------------- | ------------------ | ----------------------------------------------------------- |
| `cowswap-frontend`  | ✅ migrated         | `typecheck` target runs `tsgo`                              |
| `ui`                | ✅ (pending)        | Fixed in #7905 (missing `*.woff2` module declarations)      |
| `snackbars`         | ⬜ blocked          | See #7828                                                    |
| `core`              | ⬜ blocked          | See #7828                                                    |
| `tokens`            | ⬜ blocked          | See #7828                                                    |
| `wallet`            | ⬜ blocked          | See #7828                                                    |
| `balances-and-allowances` | ⬜ blocked    | See #7828                                                    |
| `cowswap-frontend-e2e`    | ⬜ blocked    | See #7828                                                    |

## Remaining work

Repo-wide adoption is gated on #7828 ("Fix all TypeScript errors"). The libraries above do not
type-check cleanly yet, so they cannot be switched to `tsgo` (or run through repo-wide typecheck in
CI) until those errors are resolved. As each project is fixed and verified under `tsgo`, switch its
`typecheck` target to `tsgo` and tick it off above.
