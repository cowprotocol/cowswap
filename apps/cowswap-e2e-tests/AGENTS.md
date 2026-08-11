---
author: agents
status: normative
last_reviewed: 2026-08-11
source_of_truth_scope: cowswap-e2e-tests app-specific conventions, mocks, and debugging notes
---

# cowswap-e2e-tests AGENTS.md

Root rules: [`../../AGENTS.md`](../../AGENTS.md) (global safety, workflow, and verification baseline).
This file: operational conventions and hard-won debugging notes for agents working in this app, not a
restatement of the design doc.

## App commands

- Run all tests: `pnpx nx run cowswap-e2e-tests:e2e` (wraps `playwright test`)
- Run one test while iterating: `npx playwright test src/tests/<file>.spec.ts -g "<title substring>"`
- Smoke only: `pnpx nx run cowswap-e2e-tests:e2e:smoke`
- Playwright UI mode: `pnpx nx run cowswap-e2e-tests:e2e:ui`
- Lint: `pnpx nx run cowswap-e2e-tests:lint`
- Unit-test the mocks themselves (pure functions, no browser): `npx tsx --test "src/**/*.test.ts"`
- Build the Synpress/MetaMask wallet cache (required once, only for the Synpress fixtures — see below):
  `pnpm e2e:build-cache`

Required env vars: `INTEGRATION_TEST_PRIVATE_KEY`, `REACT_APP_NETWORK_URL_11155111` (Sepolia RPC). See
`.env.example` and the README for the full list.

## Writing tests

- Every spec follows the same shape: import `test`/`expect` from a fixtures entrypoint, drive the flow
  through a **page object** (`src/pages/*.ts`), assert through `mocks`.
- **Two wallet entrypoints — pick deliberately:**
  - `../fixtures/mockWallet` — a deterministic viem account derived from `INTEGRATION_TEST_PRIVATE_KEY`,
    injected as an EIP-6963 provider. Signing is instant, in-process, no extension. Use this for
    everything that doesn't need to exercise real wallet-extension UI. This is what every current spec
    in this app uses.
  - `../fixtures` (Synpress) — a real MetaMask extension. Slower (~20-25s connect flow alone), needs the
    wallet cache built first. Only reach for this to test the actual connect/approve/network-switch
    popups themselves.
- Page objects hold `Locator`s as readonly properties set in the constructor, plus action methods
  (`goto`, `enterSellAmount`, `clickSwap`, ...) that encapsulate waits. Add new locators/actions there,
  not ad hoc selectors inside a spec.
- **Prefer the `setupTestConditions` fixture** (`src/support/setupTestConditions.ts`) over manually
  chaining `goto` + `enterSellAmount` + `waitForQuote` + `mocks.balances.set`/`mocks.allowances.set`. It
  wires up the whole "navigate to a trade, fund/allowance the wallet, type an amount, wait for its quote"
  flow in one call, takes human-readable amounts (`{ WETH: '1' }`, not raw atoms). Reach for manual page-object calls only for
  what `setupTestConditions` doesn't cover, e.g. changing the amount again mid-test.
- **Mock-driven scenarios that span multiple endpoints belong on the page object as a method**, not as a
  free function in the spec file. Example: `SwapPage.mockOrderPosting(cowApi, owner)` sets up `postOrder` +
  `accountOrders` together (the order shows up as `open` the moment it's posted), and returns a handle
  whose `fulfill(balances, chainId, sellTokenBalanceBefore)` you call whenever the test is ready for the
  trade to settle — it's what flips `accountOrders` to `fulfilled`, debits/credits `balances`, and makes
  `orderStatus` report `traded`. Posting and fulfilling are deliberately separate calls, not one bundled
  step, so a spec can assert on the pending/open state before triggering settlement.
- **Prefer real CoW Protocol SDK types over hand-rolled interfaces** when shaping a mock's request/response
  body. `@cowprotocol/sdk-order-book` (also re-exported wholesale by `@cowprotocol/cow-sdk`, already a
  devDependency here) exports `OrderCreation` (the `postOrder` body), `Order` (an `accountOrders`/`order`
  entry), `OrderStatus` (the status enum), and the rest of the real API shapes. Only
  hand-roll a type for something genuinely local to this test app (`TradePage`, fixture helper options,
  etc.), not for anything that crosses the wire to/from the CoW Protocol API.
- Use `test.describe(...)` + `test.beforeEach(...)` for setup every test in a file needs (e.g. giving the
  wallet a default, sufficient token balance) instead of repeating `mocks.balances.set(...)` in every test
  body. Individual tests can still override on top for their specific scenario.
- **Wait for the specific value you expect, not just "non-empty."** The swap form defaults the sell input
  to the full wallet balance before you ever type anything, firing its own quote for that amount. A check
  like `expect(outputAmount).not.toHaveValue('')` is satisfied by that stale quote — you can end up
  confirming a trade for the wrong amount because the fresh quote for what you actually typed hadn't
  landed yet. Assert the exact value (or poll for stability) instead.
- Prefer asserting against what the app **actually did**, not a hand re-derived number. The app applies
  its own slippage (observed ~0.5%) and the fixture's own `protocolFeeBps` on top of whatever `quote`
  you return. Read `req.body` inside a `postOrder`/similar override and use those values for your
  balance/UI assertions rather than recomputing slippage math yourself.

## Using mocks

`mocks` is auto-installed for every test (you don't need to request it to get the lockdown/reset
behavior, only to call its methods). Sub-mocks:

- `mocks.allowances.set(owner, chainId, { [token]: rawAtomString })` — mocks ERC20 `allowance()` reads
  (including when batched into a Multicall3 `aggregate3`), intercepted by matching the app's actual RPC
  URL (`REACT_APP_NETWORK_URL_<chainId>`). An owner with no entry resolves to `0`, not "unknown" — this is
  what makes `[MO-03]`-style "insufficient allowance" tests deterministic without any setup.
- `mocks.balances.set(owner, chainId, { [token]: rawAtomString })` — mocks the balances-watcher SSE
  endpoint (matches both the prod and `.barn.` hosts). Give every test in a file a default balance via
  `beforeEach` so none of them fall back to a real, flaky balance fetch (see Known Issues below for why
  that fallback happens at all).
  - The balances-watcher path is used for every EVM chain (see `isWatcherActive` in
    `CommonPriorityBalancesAndAllowancesUpdater.tsx`) — it's no longer gated behind the
    `bwEnabledPercentage` flag, which was removed in #7985. It still falls back to a real multicall RPC
    read this mock cannot intercept for non-EVM chains, and transiently while the watcher is
    "recovering" from a prior failure — if balances stop resolving for no code reason, suspect that
    fallback path first.
- `mocks.cowApi.set(endpointKey, override)` — override any catalogued CoW Protocol API endpoint (see
  `src/mocks/cowProtocolApi/endpoints.ts` for the list: `quote`, `postOrder`, `accountOrders`,
  `orderStatus`, `order`, ...). `override` is a literal body, `reply(status, body)`, or a factory
  `(req) => body` where `req.defaults` is the normalized fixture default and `req.body` is the parsed
  request JSON. **Un-mocked CoW API URLs are blocked and fail the test at teardown** — this is deliberate;
  use `mocks.cowApi.allowUnmocked()` only for a work-in-progress spec, not to paper over a real gap.
- Reset/reporting (`reset()`, `reportUnknownOwners()`, `assertNoUnmatched()`) all run automatically at
  teardown — you don't call these yourself in a spec.

## Debugging failed tests

- **Check for a stray dev server or RPC proxy before starting a run**, especially your own from an
  earlier session: `lsof -nP -iTCP:3000 -sTCP:LISTEN` and `lsof -nP -iTCP:18545 -sTCP:LISTEN` (18545 is
  the fixed RPC-proxy port, shared for the whole run and baked into the Synpress/MetaMask cache). If
  something's listening, either reuse it or find out whose it is before touching it — don't force a
  second instance onto the same port.
- `playwright.config.ts`'s `webServer.command` is `pnpm start:cowswap` (repo root). An earlier version
  used `pnpm nx serve cowswap-frontend`, which silently ran through the root `package.json`'s `nx` alias
  (`"nx": "npx nx run"`) and expanded to invalid `nx run` syntax — this only surfaced in CI, where
  `reuseExistingServer: !process.env.CI` is `false` and Playwright always launches the server itself.
- Run one test at a time while iterating: `npx playwright test <file> -g "<title>"`.
- On failure, Playwright writes a screenshot, video, and trace under `test-results/`.
  `npx playwright show-trace <path>` gives you the real network/console timeline — much faster than
  guessing from the assertion message alone.
- For "the mock seems to be ignored" style bugs, add a temporary `console.log` **inside the mock's
  override callback** (`mocks.cowApi.set('quote', (req) => { console.log(...); ... })`). These run in the
  Node test process, so they print straight to your terminal, not the browser console — this was the
  fastest way to find every bug in this session's log (an env-var host mismatch, a stale-quote race, a
  fixed fee/protocolFeeBps skewing "clean" numbers, an order-progress screen with no accessible dismiss
  control, ...).
- If a real network call unexpectedly reaches a real host, don't assume it's a code bug before checking
  the environment: several failures this session traced back to the *frontend dev server* not having
  `REACT_APP_NETWORK_URL_11155111` in its own environment (it's a separate process from the test runner,
  which has it), or a transient DNS blip in the sandbox.

## Cross-chain bridging (`cross-chain-swaps.spec.ts`)

- **LaunchDarkly can't be mocked via HTTP here.** With no `REACT_APP_LAUNCH_DARKLY_KEY` configured,
  the real LD SDK never even attempts flag-evaluation polling (only a `/sdk/goals/` call fires, never
  `/sdk/evalx/...`), so route-mocking its API is a dead end. Instead `useFeatureFlags()`
  (`libs/common-hooks/src/useFeatureFlags.ts`) reads `window.__COWSWAP_E2E_FEATURE_FLAGS__` directly and
  merges it over the real (permanently unresolved) flags; `mocks/launchDarkly.ts` sets that window
  property via `context.addInitScript`, and `mocks.launchDarkly.setFlag(key, value)` is how a spec turns
  on `isBungeeBridgeProviderEnabled` / `isNearIntentsBridgeProviderEnabled` / `isSolBridgeEnabled` /
  `isBtcBridgeEnabled`, etc. Bungee alone doesn't need this — it's added to the provider set
  unconditionally at module load in `tradingSdk/bridgingSdk.ts`.
- **Near Intents' attestation is a real ECDSA signature check and cannot be forged.**
  `recoverDepositAddress` verifies the quote/attestation pair against Near's real attestor key — a
  captured fixture pair only satisfies it if replayed byte-for-byte for the exact route it was captured
  for. `bridgingSdk.ts` patches `nearIntentsBridgeProvider.recoverDepositAddress` to a no-op success,
  gated behind the existing `window.__COWSWAP_E2E__` flag — a production-source-file edit, but scoped to
  e2e only. Consequently the Near fixture (`mocks/bridge/fixtures/near-quote.json` /
  `near-attestation.json`) can only be served verbatim for the one route it was recorded against
  (Mainnet USDC → Base USDC) — don't edit its numbers.
- **`BridgingSdk.getBestQuote()` always fetches a *regular* CoW quote first** (swap leg: sell token →
  intermediate token) and feeds that quote's `buyAmount` in as the amount the bridge provider itself
  quotes. The default `/quote` fixture's scaling is tuned for a same-decimals WETH:testUSDC pair and
  produces nonsense for any other pair — always pin the swap leg with `mockFixedRateQuote` for a
  cross-chain test. **When sell and intermediate-buy token decimals differ (e.g. native ETH's 18dec sell
  → a 6dec USDC intermediate), `mockFixedRateQuote`'s plain `sellAmount * numerator / denominator` is
  decimals-*agnostic* and silently produces an amount ~12 orders of magnitude too large** (surfaces as
  an absurd `"for at least 99.339B USDC"` in the confirm modal). Override `quote` a second time after
  `mockFixedRateQuote` with a manually decimals-adjusted ratio in that case (see `[CC-13]`).
- **The app's own real-RPC traffic for a given chain does *not* reliably go through
  `REACT_APP_NETWORK_URL_<chainId>`.** That env var only backs this suite's own wallet-side
  dispatch/proxy (`walletEngine.ts` → `rpcProxy.ts`) and the handful of reads `mockEthFlowTransaction`/
  `mockSocketVerifier` intercept by that exact URL (tx receipts, native-balance multicalls). Plenty of
  other calls the *app itself* makes — Bungee's on-chain SocketVerifier check, `eth_estimateGas` before
  every `eth_sendTransaction` — go straight to whichever of the app's own hardcoded providers it picks
  (Infura, the WalletConnect RPC relay, publicnode, ...), unpredictable and outside this env var's
  control. The only reliable way to intercept these is host-agnostic: `context.route('**/*', ...)`,
  decode the JSON-RPC body, and match by `method` (see `mockSocketVerifier.ts` and
  `mockEthEstimateGas` in `mockEthFlowTransaction.ts`), never by URL.
- **A real native-ETH sell (`[CC-13]`, eth-flow) needs `eth_estimateGas` stubbed too, not just
  `eth_sendTransaction`.** Left unmocked, gas estimation is a real simulation against the wallet's real
  on-chain balance — zero on Mainnet, since this is a shared test key with no real funds (never fund it;
  Sepolia's equivalent test works only because that address genuinely holds real, free Sepolia ETH) — and
  fails with a genuine "exceeds the balance of the account" error before the stubbed send is ever
  reached.
- **`mockOrderPosting` doesn't work for eth-flow orders** — there's no `postOrder` call to hook (the uid
  is computed client-side before anything is sent on-chain). Override `order`/`orderStatus` manually
  instead (mirrors `[MO-11]`). One extra step specific to *bridging* eth-flow orders:
  `useSwapAndBridgeContext` resolves the bridge provider from `order.apiAdditionalInfo.fullAppData`
  (`bridgingSdk.getProviderFromAppData`) — without it, `bridgingStatus` never resolves and the progress
  modal sticks on "Executing" forever regardless of what `order`/`orderStatus` say. Since an eth-flow tx
  only carries the app-data *hash* on-chain (no room for the full JSON in a `bytes32`), capture the real
  document via a `putAppData` override (`(req.body as { fullAppData: string }).fullAppData`) and thread
  it into the `order` override's own `fullAppData` field.
- **"Expected to receive" and "Min. to receive" are computed completely differently for a bridge leg,
  and only one of them gets rescaled to match the swap leg.** `useEstimatedBridgeBuyAmount` rescales the
  swap leg's real output through the bridge quote's own before-fee ratio, so form `Receive (incl. fees)`,
  the *bridge* stop's `Expected to receive`, and (for Bungee, whose mock scales proportionally) roughly
  the swap stop's own figure all end up self-consistent. `Min. to receive` at the bridge stop is **not**
  rescaled — it's the bridge SDK quote's raw `amountsAndCosts.afterSlippage.buyAmount`, carrying that
  provider's own real routeFee/slippage. Don't assert equality between a swap leg's and a bridge leg's
  `Min. to receive` — assert presence instead. For Near Intents specifically, both the quote's `sellAmount`
  and `buyAmount` come from the same static signed fixture, so its bridge-stop `Min. to receive` is an
  absolute number from that fixture, unrelated to whatever amount the test actually trades.
- **Solana availability needs two independent flags, Bitcoin needs only one.** `isSolBridgeEnabled` /
  `isBtcBridgeEnabled` (the LD-bypass flags above) gate chain *availability* in
  `useSupportedTargetChains`, but Solana additionally needs `IS_SOLANA_ENABLED` — a plain
  `localStorage.getItem('IS_SOLANA_ENABLED')` check (`libs/common-const/src/featureFlags.ts`), a
  completely different mechanism — for `CHAIN_INFO` to have a Solana entry to look up at all. Set it via
  `context.addInitScript(() => localStorage.setItem('IS_SOLANA_ENABLED', '1'))` before navigating.
- **Near Intents' real dest-tokens fixture has no usable exact-"BTC" entry.** Its one `blockchain: "btc"`
  token with `symbol: "BTC"` (`nep141:btc.omft.near`) is on the SDK's own hardcoded deprecated-asset-id
  list and gets filtered out client-side; the only Bitcoin-chain token that survives is
  `symbol: "BTC(OMNI)"`. Search/pick `BTC(OMNI)`, not `BTC`.
- **Validation-blocking button states can render with no `id` at all.** `TradeFormButtons` only gives
  `#do-trade-button` to the "no validation errors" case; a function-component validation state (e.g.
  `RecipientNotSet`, `RecipientNotConfirmed` in `tradeButtonsMap.tsx`) renders its own
  `TradeFormBlankButton` with no `id` prop. Match those by role/text
  (`page.getByRole('button', { name: /.../i })`), not by a `#do-trade-button`/`swapButton` locator.
- **A controlled confirmation checkbox can lose a click under load.** `recipientConfirmationCheckbox`
  (`#receiver-confirmation`) is driven by recipient-validation state that can still be settling right
  after typing an address; a still-in-flight debounce can reset `confirmed` back to `false` immediately
  after Playwright's `.check()` lands, surfacing as "Clicking the checkbox did not change its state" —
  reproduces reliably only under concurrent test load (multiple workers), not in isolation. Retry via
  `expect.poll(async () => { await checkbox.check(); return checkbox.isChecked() }).toBe(true)` instead
  of a single `.check()`.
- The app's HashRouter makes `page.goto()` to a new `#/...` route a same-document navigation —
  `bridgingSdk`'s available-provider set is a page-lifetime singleton seeded once at module load, so a
  test that switches providers mid-test (`mocks.launchDarkly.setFlag` again) needs an actual
  `page.reload()` after the new hash is already in the address bar for the switch to take effect.
- The Bungee quote fixture's `output.amount` is a single captured absolute number, unrelated to whatever
  amount a given test's sell leg actually produces — `mocks/bungee.ts`'s `/quote` handler scales every
  amount field (and their USD counterparts) proportionally to the live `inputAmount` query param to keep
  the fixture's own input:output ratio (and therefore price impact) realistic for any sell amount.

## Known issues (discovered this session, unresolved)

- **`mocks.balances.set()` called after the app already has an open SSE connection (e.g. from inside a
  `postOrder` override, to reflect a fill) only reaches the UI via the browser's automatic EventSource
  reconnect** (the mock fulfills one complete response and relies on a `retry:`-driven reconnect to serve
  an updated snapshot). This has been observed to work when the affected test runs first/alone, and to
  silently fail to update (initial balance is correct, the post-trade update never arrives) when it runs
  after other tests in the same file — root cause not yet confirmed. Ruled out: mock state leaking
  between tests (each test gets a fresh context and a fresh `overrides` map).
  - A genuine push-based fix (local HTTP server + `node:events` `EventEmitter`, redirecting the browser's
    request via `route.continue({ url })`) was attempted and reverted. `route.continue()` requires the
    replacement URL to keep the same protocol as the original request; redirecting an `https://` SSE
    request to a plain-`http://` local server silently fails. A working version needs the local server to
    speak HTTPS (self-signed cert) plus `ignoreHTTPSErrors: true` set globally in `playwright.config.ts`.
  - Until one of these lands, treat post-trade balance-update assertions as best-effort: use a generous
    timeout, and don't be surprised if such a test is order-sensitive within a file.
- The Sepolia test "USDC" token used by the committed fixtures has **18 decimals, not real USDC's 6** —
  don't assume decimals from the token symbol; check the fixture data.
- After confirming a trade, the currency panels hide their balance while `disabled` (pending/
  just-submitted — `CurrencyInputPanel` only renders it when not disabled), and the flow lands on an
  order-progress screen rather than immediately back on the swap form. Its back arrow has no accessible
  name; dismiss it with `page.keyboard.press('Escape')`.
