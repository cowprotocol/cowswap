# cowswap-frontend-e2e AGENTS.md

Root rules: [`../../AGENTS.md`](../../AGENTS.md) (global safety, workflow, and verification baseline).
This file: e2e app-specific commands and caveats.

## App commands
- Run e2e: `pnpx nx run cowswap-frontend-e2e:e2e` (or `pnpm e2e` to run all e2e targets)
- Open Cypress: `pnpx nx run cowswap-frontend-e2e:e2e:open` (or `pnpm e2e:open`)
- Lint: `pnpx nx run cowswap-frontend-e2e:lint`

## Notes
- This project depends on `cowswap-frontend` (see `implicitDependencies` in `apps/cowswap-frontend-e2e/project.json`). Ensure the app is running before e2e runs when required.
