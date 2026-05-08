---
author: agents
status: normative
last_reviewed: 2026-04-22
---

# cowswap-frontend-qa AGENTS.md

Root rules: [`../../AGENTS.md`](../../AGENTS.md) (global safety, workflow, and verification baseline).
This file: Playwright QA app-specific commands and caveats.

## App commands

- Run e2e: `pnpx nx run cowswap-frontend-qa:e2e`
- Run headed: `pnpx nx run cowswap-frontend-qa:e2e:headed`
- Lint: `pnpx nx run cowswap-frontend-qa:lint`
- Typecheck: `pnpx nx run cowswap-frontend-qa:typecheck`

## Notes

- Set `MAINNET_RPC` before running the QA lane locally.
- This project starts the `cowswap-frontend` preview server and an Anvil mainnet fork as part of the test run.
