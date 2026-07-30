# cowswap-frontend-e2e-pw

Playwright + Synpress e2e suite for [swap.cow.fi](https://swap.cow.fi).

- An **automated** Playwright test (test title starts with `[XX-NN]`).
- A **manual** placeholder (`test.skip()` + `annotation.type === 'manual'`) for
  scenarios that require a real wallet, real Safe iframe, real bridge fill, or
  human interaction.
- A **todo** placeholder (`test.fixme()` + `annotation.type === 'todo'`) for
  scenarios planned for later milestones.

See [`../../docs/superpowers/specs/2026-05-23-playwright-e2e-design.md`](../../docs/superpowers/specs/2026-05-23-playwright-e2e-design.md)
for the design and
[`../../docs/superpowers/plans/2026-05-23-playwright-e2e-suite.md`](../../docs/superpowers/plans/2026-05-23-playwright-e2e-suite.md)
for the implementation plan.

## Prerequisites

- Node 22 (LTS, matches the repo).
- pnpm 10 (the version pinned in the repo's `packageManager` field).
- A Sepolia-funded test account (use a throwaway key — never a real wallet).

## Env vars

| Name | Required | Purpose |
|---|---|---|
| `INTEGRATION_TEST_PRIVATE_KEY` | yes | Sepolia test account private key |
| `REACT_APP_NETWORK_URL_11155111` | yes | Sepolia JSON-RPC URL |
| `E2E_PW_MM_SEED` | CI | Twelve-word seed used by the Synpress MetaMask cache |
| `E2E_RPC_PROXY_PORT` | no | RPC proxy port (default `18545`) — must match between cache build and test runs |

## Building the MetaMask cache (required once)

Synpress replays `src/support/wallet.setup.ts` in a real browser and snapshots the
resulting MetaMask profile into `.cache-synpress/<hash>`. Tests fail with
`Cache for <hash> does not exist` until the cache is built:

```bash
pnpm e2e:build-cache
```

Rebuild it (the CLI prompts unless you pass `--force`) whenever `wallet.setup.ts`
changes — the hash is derived from the setup function body, so any edit
invalidates the old cache. The build starts the RPC proxy on the fixed port
(`18545` by default) because MetaMask validates each network's RPC URL when it
is added, and the URLs are baked into the cached profile.

## Mock wallet (fast path, no MetaMask)

For scenarios that just need *a connected wallet that signs*, import the
mock-wallet entrypoint instead of the Synpress one:

```ts
import { test, expect } from '../fixtures/mockWallet'
import { CHAIN_IDS } from '../support/constants'

test('my scenario', async ({ wallet, page }) => {
  wallet.stubRpc('wallet_getCapabilities', () => ({ '0xaa36a7': { atomic: { status: 'supported' } } }))
  await wallet.openApp({ chainId: CHAIN_IDS.SEPOLIA }) // boots already connected
  // …
  expect(wallet.rpcCalls('wallet_getCapabilities').length).toBeGreaterThan(0)
})
```

- The wallet is a viem account from `INTEGRATION_TEST_PRIVATE_KEY`
  (override per spec: `test.use({ mockWalletKey: '0x…' })`).
- Signing is local and instant — no extension, no popups, no `.cache-synpress`
  build needed. It auto-connects by pre-seeding the AppKit/wagmi reconnect keys,
  so `openApp` arrives on the page already connected.
- `wallet.stubRpc(method, handlerOrValue)` / `wallet.restoreRpc(method)` override
  any RPC method; `wallet.rpcCalls(method?)` returns recorded calls for
  assertions. A stub may throw `{ code: 4001, message: '…' }` to drive rejection
  flows.
- `wallet.switchChain(chainId)` updates the wallet's chain and emits
  `chainChanged`. To test the connect flow itself, opt out of auto-connect with
  `test.use({ mockWalletAutoConnect: false })` and drive `wallet.connectViaModal()`
  — the mock wallet appears in the AppKit modal via EIP-6963 as "E2E Wallet".
- Chain reads go through the same per-worker RPC proxy partition as Synpress
  tests, so `rpcProxy.setBalance` / `stubCall` work unchanged.
- Keep Synpress (`../fixtures`) for scenarios that must exercise real extension
  UI (connect prompts, network-approval dialogs, popup handling).

Design: `docs/superpowers/specs/2026-07-26-mock-wallet-e2e-design.md`.

## CoW Protocol API mocks

Every request to `api.cow.fi` and `barn.api.cow.fi` is intercepted. Defaults come
from committed fixtures in `src/mocks/cowProtocolApi/fixtures/`, recorded from
the live barn API.

```ts
import { reply } from '../mocks/cowProtocolApi'

// a literal body
mocks.cowApi.set('accountOrders', [openOrder, filledOrder])

// a factory — gets the parsed request plus the resolved default body
mocks.cowApi.set('order', ({ params, defaults }) => ({
  ...(defaults as object),
  uid: params.uid,
  status: 'fulfilled',
}))

// an error path
mocks.cowApi.set('quote', reply(429, { errorType: 'TooManyRequests' }))
```

`mocks.cowApi.posted` records every `POST /api/v1/orders` body with the uid the
mock generated. `mocks.cowApi.clear(key)` drops one override; overrides reset
between tests automatically.

**Un-mocked endpoints fail the test.** A request with no catalogue entry is
blocked and reported at teardown with the exact URL. To fix, add an entry to
`COW_API_ENDPOINTS` in `src/mocks/cowProtocolApi/endpoints.ts`, add a matching
`Recording` in `record.ts`, and run `pnpm e2e:record-mocks`. For a
work-in-progress spec, `mocks.cowApi.allowUnmocked()` suppresses the failure.
A mock-internal error (a missing fixture, an override that throws) is a
separate failure mode — it is fulfilled as HTTP 500 so the request never hangs,
and it also fails the test at teardown, but `allowUnmocked()` does **not**
suppress it: that escape hatch is only for routes with no catalogue entry yet.

Order and quote fixtures are re-owned and time-shifted per request
(`src/mocks/cowProtocolApi/normalize.ts`) so they don't render as a stranger's
expired orders. The default quote price is a deterministic placeholder derived
from the fixture's ratio — a spec asserting on a specific output amount must
override `quote`.

### Not yet mocked

These still reach the network and are the next round of work:

- `bff.cow.fi` — `usdPrice`, `topHolders`, `simulateBundle`, affiliate endpoints
- `partners.cow.fi` / `partners.barn.cow.fi`

## Commands

| Command | Description |
|---|---|
| `pnpm e2e:build-cache` | Build the Synpress MetaMask profile cache (prerequisite for all test runs) |
| `pnpm e2e` | Full suite — all 362 tests |
| `pnpm e2e:smoke` | PR smoke subset — `--grep @smoke` |
| `pnpm e2e:ui` | Playwright UI mode for interactive debugging |
| `pnpm e2e:report` | Regenerate `coverage-report.md` from current tests + xlsx |
| `pnpm e2e:record-mocks` | Re-record the CoW Protocol API response fixtures from the live barn API |
| `pnpm e2e:sync-checklist` | Regenerate `src/checklist/checklist.json` from `e2e-checklist.xlsx` |

Run a single spec or test from inside this directory:

```bash
pnpm exec playwright test src/tests/market-orders.spec.ts
pnpm exec playwright test --grep '\[MO-01\]'
```

## Adding a new automated test

1. Pick a `[XX-NN]` ID from the checklist that is currently a `todo` or `manual`
   placeholder in the relevant `src/tests/<sheet>.spec.ts` file.
2. Replace the placeholder with a real `test()` body using the fixtures from
   `src/fixtures/index.ts` (`wallet`, `swapPage`, `mocks`, `rpcProxy`, etc.).
3. Tag it with `@smoke` if it should run on every PR.
4. Run `pnpm e2e:report` and confirm the new ID moves from the `TODO` or
   `Manual` column to the `Automated` column. Totals must always sum to 362.
5. Commit.

## Refreshing the checklist after QA edits the xlsx

```bash
pnpm e2e:sync-checklist                                # rewrites checklist.json
pnpm --filter @cowprotocol/cowswap-e2e-pw exec tsx \
  src/checklist/scaffold.ts                            # scaffolds any new IDs as placeholders
pnpm e2e:report                                        # confirm coverage-report.md is consistent
```

If `scaffold.ts` adds new placeholders, commit those spec-file changes
alongside the xlsx update.

## Troubleshooting

- **Synpress MetaMask version drift.** Synpress is pinned to a specific
  MetaMask build in `package.json` (`@synthetixio/synpress-metamask`). If
  Synpress upstream releases a new patch, update deliberately in its own PR;
  the nightly run will catch regressions before they reach PR smoke.
- **Sepolia RPC outages.** The local RPC proxy at `src/support/rpcProxy.ts`
  forwards transactions and receipts to real Sepolia. If the upstream RPC
  flakes, the suite will surface as e2e flake. Switch
  `REACT_APP_NETWORK_URL_11155111` to a different provider.
- **Selector drift.** When the cowswap-frontend UI changes selectors, update
  the relevant page object in `src/pages/` rather than each test.
