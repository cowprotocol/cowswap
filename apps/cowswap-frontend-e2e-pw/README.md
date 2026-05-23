# cowswap-frontend-e2e-pw

Playwright + Synpress e2e suite for swap.cow.fi. See
[design spec](../../docs/superpowers/specs/2026-05-23-playwright-e2e-design.md).

## Commands

```
pnpm e2e                  # full suite
pnpm e2e:smoke            # PR smoke subset (--grep @smoke)
pnpm e2e:ui               # Playwright UI mode
pnpm e2e:report           # regenerate coverage-report.md from current tests + xlsx
pnpm e2e:sync-checklist   # regenerate src/checklist/checklist.json from xlsx
```

## Env vars

- `INTEGRATION_TEST_PRIVATE_KEY` (required) — Sepolia test account.
- `REACT_APP_NETWORK_URL_11155111` (required) — Sepolia RPC URL.
- `E2E_PW_MM_SEED` (CI only) — twelve-word seed for the cached MetaMask user-data-dir.
