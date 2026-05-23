---
title: Playwright E2E suite for cowswap-frontend
status: draft
author: alexandr@cow.fi
created: 2026-05-23
related:
  - apps/cowswap-frontend-e2e (existing Cypress, frozen)
  - e2e-checklist.xlsx (source of truth for scenarios)
---

# Playwright E2E suite for cowswap-frontend

## 1. Purpose

Build a new Playwright-based end-to-end suite for `swap.cow.fi` that exercises the
scenarios listed in `e2e-checklist.xlsx`. The suite must:

- Provide automated regression coverage for the largest possible subset of the
  362-row checklist (11 test categories: WalletConnection, SafeWallet,
  SmartAccounts, MarketOrders, LimitOrders, TWAPOrders, CrossChain, UIUX,
  Hooks, RWA, AccountOverview; the 12th xlsx sheet, "Dashboard", is a
  per-category summary, not a test set).
- Surface a transparent coverage map back to the checklist so QA can see, per
  category, which IDs are automated, which remain manual, and why.
- Run a fast smoke subset on every PR (<10 min) and the full suite nightly.
- Coexist with the existing Cypress suite at `apps/cowswap-frontend-e2e/`; that
  suite is frozen (no new tests) but kept running until explicitly retired in a
  follow-up.

Non-goals for the first delivery:

- Migrating existing Cypress tests into Playwright.
- Automating tests that fundamentally require human interaction (real
  WalletConnect QR scan, hardware-wallet flows, MetaMask Mobile in-app browser,
  geo-restricted RWA access, live Safe Apps UI inside `app.safe.global`).
- A visual-regression baseline (out of scope; can be layered later).

## 2. Scope and coverage targets

The checklist is the source of truth. Each row has a stable ID (`WC-01`,
`MO-12`, …). The suite categorises every ID as one of:

- **Automated** — implemented as a Playwright `test()`; the test title contains
  `[XX-NN]`.
- **Manual-only** — declared as `test('[XX-NN] ...', { annotation: { type: 'manual', description: '<reason>' } }, async () => { test.skip() })`.
- **Future** — declared as `test('[XX-NN] ...', { annotation: { type: 'todo', description: '<reason>' } }, async () => { test.fixme() })`.

Target after the initial implementation phase (revisited per milestone):

| Sheet            | Total | Automated (target) | Manual / Future |
| ---------------- | ----- | ------------------ | --------------- |
| WalletConnection | 17    | ~6                 | ~11             |
| SafeWallet       | 16    | ~3                 | ~13             |
| SmartAccounts    | 12    | ~2                 | ~10             |
| MarketOrders     | 79    | ~50                | ~29             |
| LimitOrders      | 66    | ~45                | ~21             |
| TWAPOrders       | 57    | ~30                | ~27             |
| CrossChain       | 31    | ~18                | ~13             |
| UIUX             | 23    | ~18                | ~5              |
| Hooks            | 7     | ~4                 | ~3              |
| RWA              | 19    | ~12                | ~7              |
| AccountOverview  | 35    | ~25                | ~10             |
| **Total**        | 362   | ~213 (~59%)        | ~149 (~41%)     |

Numbers are targets, not contracts. The implementation plan will lock per-spec
targets once the first walking skeleton lands and we learn how each sheet
behaves under Synpress.

## 3. Relation to the existing Cypress suite

`apps/cowswap-frontend-e2e/` stays in place. New tests go in the new project;
no new tests are added to the Cypress project. Once the Playwright suite hits
its targets and is stable on PRs, a separate task will:

1. Cherry-pick anything the Cypress suite covers that the Playwright suite does
   not.
2. Remove the Cypress project.

Until then both run independently (different Nx targets, different CI
workflows).

## 4. High-level architecture

```
+-----------------------------+         +------------------------------+
|  Playwright test runner     |         |  Synpress (MetaMask v4)      |
|  (one BrowserContext / test)|<------->|  - cached user-data-dir      |
+--------------+--------------+         |  - fake networks added       |
               |                        +---------------+--------------+
               v                                        |
+-----------------------------+                         | JSON-RPC
|  cowswap-frontend dev server|                         v
|  (Vite, http://localhost:3000)|         +------------------------------+
+-----------------------------+           |  Local RPC proxy             |
               ^                          |  - lies about chainId        |
               | HTTP, fetch              |  - per-test fixture data     |
               |                          |  - real Sepolia for tx/sigs  |
               v                          +------------------------------+
+-----------------------------+
|  HTTP mock layer            |
|  (page.route fixtures):     |
|   CoW Order API, BFF,       |
|   Bungee, Near Intents,     |
|   token lists, hook dApps,  |
|   Safe Apps SDK shim        |
+-----------------------------+
```

Each running test pulls in:

- a `BrowserContext` cloned from the Synpress MetaMask cache;
- a connection to the global RPC proxy;
- a per-test set of `page.route` mocks driven by opt-in fixtures.

## 5. Project layout

A new Nx project at `apps/cowswap-frontend-e2e-pw/`:

```
apps/cowswap-frontend-e2e-pw/
├── playwright.config.ts
├── project.json
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── tests/                # one spec per checklist sheet
    │   ├── wallet-connection.spec.ts
    │   ├── safe-wallet.spec.ts
    │   ├── smart-accounts.spec.ts
    │   ├── market-orders.spec.ts
    │   ├── limit-orders.spec.ts
    │   ├── twap-orders.spec.ts
    │   ├── cross-chain.spec.ts
    │   ├── ui-ux.spec.ts
    │   ├── hooks.spec.ts
    │   ├── account-overview.spec.ts
    │   └── rwa.spec.ts
    ├── fixtures/
    │   └── index.ts          # composed test fixtures (wallet, mocks, pages)
    ├── pages/                # Page Object Models
    │   ├── SwapPage.ts
    │   ├── LimitPage.ts
    │   ├── TwapPage.ts
    │   ├── AccountPage.ts
    │   ├── TokenSelector.ts
    │   └── ConfirmModal.ts
    ├── mocks/
    │   ├── cowOrderApi.ts
    │   ├── bff.ts
    │   ├── bungee.ts
    │   ├── nearIntents.ts
    │   ├── tokenLists.ts
    │   ├── safeSdk.ts
    │   └── hookDApp.ts
    ├── support/
    │   ├── synpress.ts       # cache setup, MM bootstrap, fake networks
    │   ├── rpcProxy.ts       # local JSON-RPC proxy
    │   ├── globalSetup.ts
    │   ├── globalTeardown.ts
    │   └── checklist.ts      # xlsx parser
    └── checklist/
        ├── checklist.json    # generated: { sheets: [{ name, rows: [{ id, name, priority }] }] }
        └── coverageReport.ts # CLI: diffs xlsx ↔ tests, writes coverage-report.md
```

Nx targets in `project.json`:

- `e2e` — runs the full Playwright suite.
- `e2e:smoke` — runs `--grep @smoke`.
- `e2e:ui` — runs `playwright test --ui` for local dev.
- `e2e:report` — regenerates the coverage report from current tests + xlsx.
- `sync-checklist` — re-parses `e2e-checklist.xlsx` into
  `src/checklist/checklist.json`.

`implicitDependencies: ["cowswap-frontend"]`.

Root `package.json` aliases: `pnpm e2e`, `pnpm e2e:smoke`, `pnpm e2e:ui`,
`pnpm e2e:report`.

## 6. Wallet & network layer

### 6.1 Synpress cache

A single `setupMetamask` call (Synpress v4 `defineWalletSetup`) produces a
cached MetaMask user-data-dir. The cache is built lazily on first run and
committed-by-hash in CI cache. It contains:

- a dedicated test seed phrase (Sepolia-funded test account, never used in
  prod);
- six configured networks:
  - `Sepolia` — RPC URL = real Sepolia (via `REACT_APP_NETWORK_URL_11155111`),
    chainId 11155111.
  - `Mainnet` — RPC URL = `http://127.0.0.1:<proxy-port>/rpc/1`, chainId 1.
  - `Arbitrum` — RPC URL = `…/rpc/42161`, chainId 42161.
  - `Base` — RPC URL = `…/rpc/8453`, chainId 8453.
  - `BNB` — RPC URL = `…/rpc/56`, chainId 56.
  - `Gnosis` — RPC URL = `…/rpc/100`, chainId 100.

Each test starts on Sepolia. Tests that need another chain switch via a
fixture helper that drives MetaMask's network dropdown through Synpress.

### 6.2 Local RPC proxy

A Node `http` server started in `globalSetup`, bound to `127.0.0.1` on a free
port. Exposes `/rpc/<chainId>` and handles JSON-RPC requests:

- `eth_chainId`, `net_version` — return the chainId from the URL path (so the
  frontend sees the requested chain).
- `eth_blockNumber`, `eth_getBlockByNumber` — return a canned head block (kept
  fresh enough that the frontend's age checks pass).
- `eth_getBalance`, `eth_call`, `eth_estimateGas`, `eth_getCode`,
  `eth_getTransactionCount` — first consult the per-test fixture overrides; if
  none, forward to real Sepolia, transforming addresses where necessary
  (Sepolia token addresses are mapped to their Mainnet/L2 equivalents via a
  small lookup table for tests that need real reads).
- `eth_sendRawTransaction`, `eth_sendTransaction`,
  `eth_getTransactionReceipt` — forwarded to real Sepolia so signatures are
  honored on-chain. Receipts are returned with the originally requested
  chainId.
- `wallet_*` — no-op success (the frontend never calls these after
  connection).

Per-test API (exposed via the `rpcProxy` fixture):

```ts
rpcProxy.setBalance({ chainId, address, value })
rpcProxy.stubCall({ chainId, to, dataPrefix, returnHex })
rpcProxy.stubTokenBalance({ chainId, token, holder, value })
rpcProxy.stubTokenAllowance({ chainId, token, holder, spender, value })
rpcProxy.reset()
```

Each Playwright worker gets its own partition (`/rpc/<chainId>/w<workerId>`)
so concurrent tests don't see each other's stubs.

### 6.3 HTTP mock layer

`mocks/*.ts` modules expose per-domain controllers wired up via `page.route`.
Each is opt-in: a test that needs the CoW Order API simply destructures
`mocks` from its fixture and the route is registered for the duration of the
test.

- `cowOrderApi` — intercepts `POST /api/v1/orders` (returns a UID),
  `GET /api/v1/orders/:uid` (parameterised status sequence: `Open` → `Filled`
  by default), `GET /api/v1/trades`, `GET /api/v1/account/:addr/orders`.
- `bff` — quote endpoints, price endpoints, fee endpoints — deterministic
  prices keyed on (sell, buy, amount).
- `bungee`, `nearIntents` — quote, route, status endpoints; deterministic
  fills.
- `tokenLists` — per-chain CoW and external token lists. Critical for RWA:
  Mainnet returns Ondo + xStocks, Arbitrum returns xStocks only, BNB returns
  Ondo + xStocks, etc.
- `safeSdk` — `addInitScript` that exposes a fake `window.parent` Safe Apps
  SDK so the frontend's `isInIframe()` + `getSafeInfo()` path returns canned
  data, simulating the Safe App embedding without `app.safe.global`.
- `hookDApp` — handles iframe routes for hook dApps; returns canned metadata.

All mocks support a `record` mode (env flag) that captures live responses
once and serialises them to `src/mocks/__recordings__/<scenario>.json` for
reuse.

### 6.4 What stays manual

Synpress drives MetaMask only. The following checklist rows are explicitly
out of automation scope and remain `test.skip`:

- WC-02 WalletConnect, WC-03 Rabby, WC-04 hardware via MM, WC-08–WC-10
  mobile, WC-11 Safe via WC, WC-13 multi-tab.
- SW-* rows that require the real Safe iframe environment in
  `app.safe.global`.
- SA-* rows that require real MetaMask Smart Account or Base Smart Account
  flows.
- RW rows that depend on actual geo-IP restriction.
- UI-* rows that require real device viewports (e.g. real mobile Safari).

These show up in the coverage report with their `manual:` reason so QA still
sees them tracked.

## 7. Test structure & fixtures

### 7.1 Fixture composition

`src/fixtures/index.ts` extends `@playwright/test` with:

| Fixture       | Scope  | Purpose                                                                   |
| ------------- | ------ | ------------------------------------------------------------------------- |
| `wallet`      | test   | Synpress MetaMask driver + helpers (`connectAsEOA`, `switchChain`, `confirmSignTypedData`, `rejectSignTypedData`, `approveToken`). |
| `rpcProxy`    | test   | Handle on the global RPC proxy, scoped to the test (stubs reset on teardown). |
| `mocks`       | test   | Namespaced HTTP mock controllers (`mocks.cowOrderApi`, `mocks.bff`, …). |
| `swapPage`    | test   | POM for `/#/swap`.                                                        |
| `limitPage`   | test   | POM for `/#/limit-orders`.                                                |
| `twapPage`    | test   | POM for `/#/advanced` (TWAP).                                             |
| `accountPage` | test   | POM for `/#/account/*`.                                                   |
| `tokenSelector` | test | POM for the token search modal.                                           |
| `confirmModal`  | test | POM for the trade confirmation modal.                                     |

Fixtures unregister their mocks and reset their stubs in teardown, so each
test starts clean.

### 7.2 Spec style

```ts
// src/tests/market-orders.spec.ts
import { test, expect } from '../fixtures'

test.describe('Market Orders', () => {
  test('[MO-01] Sell order: ERC-20 → ETH @smoke', async ({
    swapPage, wallet, mocks, rpcProxy,
  }) => {
    mocks.cowOrderApi.expectPostOrderOnce({ status: 'Open' })
    rpcProxy.stubTokenBalance({
      chainId: 1, token: USDC, holder: wallet.address, value: 1_000n * 10n ** 6n,
    })

    await wallet.connectAsEOA({ chainId: 1 })
    await swapPage.goto({ sell: 'USDC', buy: 'ETH' })
    await swapPage.enterSellAmount('100')
    await swapPage.clickSwap()
    await wallet.confirmSignTypedData()

    await expect(swapPage.openOrders).toContainText('USDC → ETH')
  })

  test(
    '[MO-13] ETH-flow: SC wallet bundles wrap+approve+swap (Safe)',
    { annotation: { type: 'manual', description: 'requires Safe Apps environment' } },
    async () => { test.skip() },
  )
})
```

Rules the spec files MUST follow:

- Test title MUST start with `[XX-NN]` matching a checklist ID.
- Tag `@smoke` is reserved for tests that go in the PR smoke subset.
- Non-automated tests MUST carry a Playwright `annotation` of type `manual`
  or `todo` with a non-empty `description`. The body calls `test.skip()` or
  `test.fixme()` so the runner reports them as such. The coverage report
  reads the annotation, not the title.
- POMs own all selectors. Specs MUST NOT use raw `page.locator(...)` for
  cowswap-frontend UI; they go through POM methods. Selectors prefer
  `data-testid`; where missing, the existing `#…` IDs (e.g.
  `#input-currency-input`) are used.

### 7.3 Tags

- `@smoke` — ~30 tests, the PR check.
- `@manual-only` — skipped, requires human; tracked in coverage.
- `@flaky` — quarantined (excluded from CI required check until fixed).
- Run filters: `--grep @smoke`, `--grep-invert @flaky`.

## 8. Checklist traceability

### 8.1 Parsing the xlsx

`support/checklist.ts` uses `exceljs` (pure JS, no Python dep) to load
`e2e-checklist.xlsx` and yields a JSON snapshot to
`src/checklist/checklist.json`:

```json
{
  "generatedAt": "2026-05-23T12:34:00Z",
  "sheets": [
    {
      "name": "WalletConnection",
      "rows": [
        { "id": "WC-01", "name": "Connect MetaMask wallet", "priority": "High", "type": "Functional" },
        …
      ]
    },
    …
  ]
}
```

`nx run cowswap-frontend-e2e-pw:sync-checklist` regenerates this file. The
file is committed so CI is deterministic.

### 8.2 Coverage report

`checklist/coverageReport.ts` scans all `test()`, `test.skip()`, and
`test.fixme()` titles in `src/tests/**`, extracts `[XX-NN]` IDs and their
state (automated / skipped / fixme), and diffs against
`checklist.json`. Output:

- Markdown summary `coverage-report.md` (per-sheet table, missing IDs, stray
  IDs).
- Exit code non-zero if any ID in the checklist has no corresponding test
  entry at all (forces every row to be explicitly accounted for as automated,
  skipped, or fixme).

The full nightly run uploads `coverage-report.md` as an artifact and (TBD —
follow-up) posts it as a comment on the latest open PR.

## 9. Dev server, lifecycle, CI

### 9.1 Local dev

`playwright.config.ts` `webServer` boots the existing Vite dev server:

```ts
webServer: {
  command: 'pnpm nx serve cowswap-frontend',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 180_000,
}
```

When a developer already has `pnpm start:cowswap` running, Playwright reuses
it. In CI the server is started fresh per job (cached by Nx).

### 9.2 Setup / teardown

- `globalSetup` (`support/globalSetup.ts`):
  1. Start the local RPC proxy on a free port; export
     `process.env.E2E_RPC_PROXY_PORT`.
  2. Build or restore the Synpress MetaMask cache (`setupMetamask` snapshot
     of the user-data-dir with the test seed and the six networks).
- `globalTeardown`: stop the proxy, clean tmp dirs.

Per-test: each test gets a fresh `BrowserContext` cloned from the cached MM
user-data-dir; route handlers are unregistered in fixture teardown.

Workers: default 2–4. Each worker has its own cloned MM dir and its own RPC
proxy partition (`/rpc/<chainId>/w<workerId>`).

Retries: `process.env.CI ? 1 : 0`. Anything that requires more than 1 retry
to pass is tagged `@flaky` and excluded from the required PR check.

Artifacts: `screenshot: 'only-on-failure'`, `trace: 'retain-on-failure'`,
`video: 'retain-on-failure'`. Uploaded to GitHub Actions on failure.

### 9.3 CI workflows

- `.github/workflows/e2e-pw-smoke.yml`
  - Triggers: `pull_request` on paths `apps/cowswap-frontend/**`,
    `apps/cowswap-frontend-e2e-pw/**`, `libs/**`.
  - Steps: pnpm install → Nx affected check → if either project is affected,
    run `nx e2e:smoke cowswap-frontend-e2e-pw`.
  - Budget: <10 min. 2 workers, no sharding initially.
  - **Required check** — blocks merge on failure (except `@flaky`).

- `.github/workflows/e2e-pw-nightly.yml`
  - Triggers: `schedule: '0 2 * * *'` (02:00 UTC) and `workflow_dispatch`.
  - Steps: full suite sharded 4× (`--shard=N/4`), `nx e2e:report`, upload
    `coverage-report.md` and per-shard traces.
  - On failure: open or update a `Nightly E2E failures (YYYY-MM-DD)`
    GitHub issue with the diff vs. previous nightly.

### 9.4 Secrets

Reused from the existing Cypress setup, plus one new optional value:

- `INTEGRATION_TEST_PRIVATE_KEY` (required) — Sepolia test account, the same
  one Cypress uses today.
- `REACT_APP_NETWORK_URL_11155111` (required) — Sepolia RPC URL.
- `E2E_PW_MM_VERSION` (optional) — pin MetaMask version for Synpress cache
  reproducibility; defaults to the version pinned in
  `apps/cowswap-frontend-e2e-pw/package.json`.

## 10. Risks and open questions

- **Synpress flake budget.** Synpress launches a real Chromium with the MM
  extension; this is the most expensive part of the suite. Mitigation:
  cached user-data-dir, parallel workers, PR runs limited to smoke. If
  flake rate exceeds 2% on `@smoke` after the first month, revisit and
  consider the EIP-1193 injection fallback for the smoke subset.
- **Sepolia rate limiting / outage.** Reads forwarded to real Sepolia could
  flake under load. Mitigation: the RPC proxy caches static reads (block
  number, code) and the bulk of fixture data is stubbed; only signed
  transactions and receipt lookups hit Sepolia.
- **MetaMask UI churn.** Synpress is tightly coupled to MM's HTML; an MM
  update can break the suite overnight. Mitigation: MM version pinned in
  `package.json` and refreshed deliberately in a dedicated PR; nightly
  catches drift before it lands on PRs.
- **xlsx as source of truth.** The checklist is an Excel file edited by QA
  outside the repo. Mitigation: `sync-checklist` target + a CI check that
  warns when `checklist.json` is stale vs. the committed xlsx (or vice
  versa). Long-term, consider replacing xlsx with a markdown/yaml
  source — out of scope for this spec.
- **Safe Apps shim fidelity.** Mocking the Safe Apps SDK is approximate;
  real iframe behaviour can diverge. Rows that depend on real Safe
  behaviour stay manual; rows about UI-shape inside the embedded Safe App
  (banners, fee labels, TWAP visibility) are automated against the shim.
- **Multi-chain mapping.** The RPC proxy needs a static map of Sepolia ↔
  Mainnet/L2 token addresses for tests that exercise per-chain token lists.
  We start with USDC, WETH, DAI, GNO, plus the RWA tokens; extended as
  needed.

## 11. Milestones

The implementation plan (next document) will break this into milestones,
roughly:

1. **Walking skeleton** — Nx project, Playwright + Synpress wired up, RPC
   proxy boots, dev server reused, one `[UI-01]` page-load smoke test
   green on PR.
2. **MarketOrders happy path** — fixtures, swap POM, CoW Order API mock,
   first ~10 `[MO-NN]` tests passing.
3. **LimitOrders & TWAP** — extend POMs and mocks; ~30 more tests.
4. **CrossChain (Bungee + Near mocks)** — Bridge POMs and mocks; ~18
   tests.
5. **AccountOverview, RWA, UIUX, Hooks** — remaining sheets.
6. **Coverage report + CI gating** — `e2e:report`, smoke required check,
   nightly schedule.
7. **Cypress retirement** — separate task; not part of this spec.

Each milestone lands behind the `e2e-pw-smoke` required check and updates
the per-sheet coverage targets in §2.
