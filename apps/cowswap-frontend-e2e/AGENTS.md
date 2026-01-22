# cowswap-frontend-e2e AGENTS.md

This file is additive. Follow the repo root `AGENTS.md` for full rules.

## App commands
- Run e2e: `yarn nx run cowswap-frontend-e2e:e2e` (or `yarn e2e` to run all e2e targets)
- Open Cypress: `yarn nx run cowswap-frontend-e2e:e2e:open` (or `yarn e2e:open`)
- Lint: `yarn nx run cowswap-frontend-e2e:lint`

## Notes
- This project depends on `cowswap-frontend` (see `implicitDependencies`). Ensure the app is running before e2e runs when required.
