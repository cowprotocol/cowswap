# cowswap-e2e-tests

Playwright + Synpress e2e suite for [swap.cow.fi](https://swap.cow.fi).

For an architecture tour (mocking mechanics, page objects, support utils) see
[`docs/OVERVIEW.md`](docs/OVERVIEW.md). For debugging notes and conventions discovered while
writing tests (including known flakiness causes and how they were diagnosed), see
[`AGENTS.md`](AGENTS.md). This file is command/setup reference.

Every test is a plain, fully automated Playwright test, titled `[XX-NN] description` — the prefix
maps to its spec file (`CS`/`MO` → `market-orders.spec.ts`, `CC` → `cross-chain-swaps.spec.ts`,
`LO` → `limit-orders.spec.ts`, `NW` → `network.spec.ts`). `@smoke`-tagged tests are the PR-gating
subset; everything runs on the nightly job.

## Prerequisites

- Node 22 (LTS, matches the repo).
- pnpm 10 (the version pinned in the repo's `packageManager` field).
- A Sepolia-funded test account (use a throwaway key — never a real wallet).

## Env vars

| Name | Required | Purpose |
|---|---|---|
| `INTEGRATION_TEST_PRIVATE_KEY` | yes | Test account private key (shared by Sepolia and Mainnet specs) |
| `REACT_APP_NETWORK_URL_11155111` | yes | Sepolia JSON-RPC URL |
| `REACT_APP_NETWORK_URL_1` | yes | Mainnet JSON-RPC URL — needed by `cross-chain-swaps.spec.ts`, which trades on Mainnet rather than Sepolia |
| `E2E_PW_MM_SEED` | CI | Twelve-word seed used by the Synpress MetaMask cache |
| `E2E_RPC_PROXY_PORT` | no | RPC proxy port (default `18545`) — must match between cache build and test runs |
| `LOG_UNMOCKED_RPC` | no | Set to `1` to log every real (unmocked) RPC request to `test-results/unmocked-rpc-requests.log` — see [`docs/OVERVIEW.md`](docs/OVERVIEW.md) |

## Building the MetaMask cache (required once, for Synpress specs only)

Needed only by specs that import the Synpress wallet fixture (`../fixtures/synpress`) — none
do today, so neither the `e2e-pw-smoke` nor `e2e-pw-nightly` CI workflow builds this cache.
The mock-wallet fixture used by every current spec (see below) needs no cache at all.

Synpress replays `src/support/wallet.setup.ts` in a real browser and snapshots the
resulting MetaMask profile into `.cache-synpress/<hash>`. A Synpress-fixture test fails with
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
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { test, expect } from '../fixtures/mockWallet'

test('my scenario', async ({ wallet, page }) => {
  wallet.stubRpc('wallet_getCapabilities', () => ({ '0xaa36a7': { atomic: { status: 'supported' } } }))
  await wallet.openApp({ chainId: SupportedChainId.SEPOLIA }) // boots already connected
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

- `bff.cow.fi` — `topHolders`, `simulateBundle`, affiliate endpoints (`usdPrice` is now mocked, see below)
- `partners.cow.fi` / `partners.barn.cow.fi`

## Other mocks

CoW API and allowances (below) aren't the only concerns intercepted — every test gets the full
stack from the `mocks` fixture. Brief pointers; see
[`docs/OVERVIEW.md`](docs/OVERVIEW.md)
for the mechanics and gotchas behind each:

| Concern | Handle | Notes |
|---|---|---|
| Token balances (SSE watcher stream) | `mocks.balances` | Give every test a default balance via `beforeEach`. |
| USD prices (BFF + Defillama + CoW native) | `mocks.usdPrices` | `setPrice(address, price)` / `setUnknown(address)`; defaults every token to $1. |
| Token lists | `mocks.tokenLists` | Empty by default; `setListForChain(chainId, list)`. |
| LaunchDarkly feature flags | `mocks.launchDarkly` | Can't be mocked over HTTP at all — routed through `window.__COWSWAP_E2E_FEATURE_FLAGS__` instead. Only relevant to cross-chain specs today. |
| Safe iframe context | `mocks.safeSdk` | Simulates the app running embedded in a Safe iframe. |
| Bungee / Near Intents bridge APIs | `mocks.bungee` / `mocks.nearIntents` | Cross-chain-swap specs only. |
| ERC-20 `approve()` preflight simulation, `eth_estimateGas`, `eth_getCode`, `eth_blockNumber`, `eth_getTransactionCount` | installed globally, no handle | Real, host-agnostic RPC calls the app fires regardless of what a test is checking — mocked unconditionally so nothing has to think about them. |

`window.__COWSWAP_E2E__` is a separate, unrelated flag (a plain boolean, set by the `mocks`
fixture before every test) that a couple of production source files branch on directly — e.g. to
speed up polling intervals, and (combined with a build-time `NODE_ENV` guard) to bypass a
signature check the mocked Near Intents fixture can't satisfy. See `docs/OVERVIEW.md` before
touching either that flag or `__COWSWAP_E2E_FEATURE_FLAGS__`.

## Token allowances

Every ERC-20 `allowance()` read the app makes is intercepted on the app's RPC
endpoint and answered from `src/mocks/allowances/fixtures/allowances.json`. Both
allowance hooks are covered — `useTokenAllowances` (the token list) and
`useTokenAllowance` (the trade flow) — because both end up on the same viem
transport, batched into Multicall3.

```json
{
  "0x1111111111111111111111111111111111111111": {
    "11155111": {
      "0xfff9976782d46cc05630d1f6ebab18b2324d6b14": "5000000",
      "0x0625afb445c3b6b7b929342a04a22599fd5dbb59": "0"
    }
  }
}
```

`owner -> chainId -> token -> raw atoms`. Notes:

- **Raw atoms**, always — `"5000000"` is 5 USDC, not 5,000,000. Write values above
  2^53 as strings; a bare `1000000000000000000` is rejected at load time because
  `JSON.parse` rounds it.
- **Anything not listed reads as 0**, including an owner with no entry at all. So
  the default state of every test is "nothing is approved".
- **Only reads for the CoW VaultRelayer (prod or staging) are ever answered from
  fixture/overrides.** Any other spender always reads as 0, regardless of what's configured for
  the VaultRelayer — this is deliberate: it's the one spender every real trade in this suite
  checks, and treating every other spender as unconfigured is what stopped a seeded allowance from
  leaking into unrelated app behavior that also happens to read `allowance()` on the same token
  (see `docs/OVERVIEW.md`'s allowance gotcha for the concrete incident). The queried spender is
  still recorded in `reads()` regardless of whether it matched.
- The committed file is `{}`. Use it for defaults tied to a fixed address.

Because the wallet address comes from `INTEGRATION_TEST_PRIVATE_KEY`, a spec
normally configures allowances at runtime instead:

```ts
test('[MO-XX] approval', async ({ wallet, mocks, swapPage }) => {
  mocks.allowances.set(wallet.address, SupportedChainId.SEPOLIA, {
    '0xfff9976782d46cc05630d1f6ebab18b2324d6b14': '5000000',
  })
  await wallet.openApp({ chainId: SupportedChainId.SEPOLIA })
  // ...
  expect(mocks.allowances.reads().length).toBeGreaterThan(0)
})
```

`set()` merges token by token into `(owner, chainId)`; `clear()` drops all
overrides. Overrides and recorded reads reset between tests.

If allowances are read for an owner that has no entry — the classic case being a
fixture keyed to another developer's address — the mock emits a **non-fatal**
warning at teardown naming the address. It stays quiet when nothing is
configured at all, since "everything is 0" is then the intended state.

Not covered: `tokenAllowancesFamily` in `libs/balances-and-allowances/src/state/allowancesAtom.ts`
reads through the *connector's* provider rather than the app transport. It is dead
code today; when the TODO in `useTokenAllowances.ts` lands, this mock needs a
second install point in `src/mockWallet/walletEngine.ts` reusing `codec.ts`.

## Commands

| Command | Description |
|---|---|
| `pnpm e2e:build-cache` | Build the Synpress MetaMask profile cache (only needed by specs using the Synpress fixture; not run in CI today) |
| `pnpm e2e` | Full suite — every spec in `src/tests/` (31 tests across 4 files as of this writing; run `pnpm exec playwright test --list` for the current count) |
| `pnpm e2e:smoke` | PR smoke subset — `--grep @smoke` |
| `pnpm e2e:ui` | Playwright UI mode for interactive debugging |
| `npx nx test cowswap-e2e-tests` | Unit tests for the mocks and support code (`node:test` via tsx) |
| `pnpm e2e:record-mocks` | Re-record the CoW Protocol API response fixtures from the live barn API |

Run a single spec or test from inside this directory:

```bash
pnpm exec playwright test src/tests/market-orders.spec.ts
pnpm exec playwright test --grep '\[MO-01\]'
```

## Troubleshooting

- **Synpress MetaMask version drift.** Synpress is pinned to a specific
  MetaMask build in `package.json` (`@synthetixio/synpress-metamask`). If
  Synpress upstream releases a new patch, update deliberately in its own PR;
  the nightly run will catch regressions before they reach PR smoke.
- **Sepolia RPC outages.** The local RPC proxy at `src/support/rpcProxy.ts`
  forwards transactions and receipts to real Sepolia. If the upstream RPC
  flakes, the suite will surface as e2e flake. Switch
  `REACT_APP_NETWORK_URL_11155111` to a different provider.
- **Flaky test under the full parallel suite, but not alone.** Almost never a logic bug — check
  infrastructure contention first: a real, rate-limited RPC endpoint 429ing under N-way parallel
  workers, or a tight timeout under CPU contention. `AGENTS.md`'s "Diagnosing flaky tests" section
  has the full diagnostic workflow (`LOG_UNMOCKED_RPC=1`, reproducing under load, confirming a
  regression by testing the unmodified code under the same load) and the concrete root causes
  found so far.
- **Selector drift.** When the cowswap-frontend UI changes selectors, update
  the relevant page object in `src/pages/` rather than each test.
