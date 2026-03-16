# cowswap-frontend-e2e AGENTS.md

This file is additive. Follow the repo root `AGENTS.md` for full rules.

## App commands
- Run e2e: `pnpx nx run cowswap-frontend-e2e:e2e` (or `pnpm e2e` to run all e2e targets)
- Open Cypress: `pnpx nx run cowswap-frontend-e2e:e2e:open` (or `pnpm e2e:open`)
- Lint: `pnpx nx run cowswap-frontend-e2e:lint`

## Notes
- This project depends on `cowswap-frontend` (see `implicitDependencies` in `apps/cowswap-frontend-e2e/project.json`). Ensure the app is running before e2e runs when required.
