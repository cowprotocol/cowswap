---
author: agents
status: normative
last_reviewed: 2026-08-13
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
  free function in the spec file. Example: `tradePage.mockOrderPosting(cowApi, owner)` sets up `postOrder` +
  `accountOrders` together (the order shows up as `open` the moment it's posted), and returns a handle
  whose `fulfill(balances, chainId, sellTokenBalanceBefore, buyTokenBalanceBefore)` you call whenever the test is ready for the
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
  (including when batched into a Multicall3 `aggregate3`), intercepted host-agnostically by matching
  `(owner, token)` in the call data itself, not by RPC URL (see the note below on why). An owner with no
  entry resolves to `0`, not "unknown" — this is what makes `[MO-03]`-style "insufficient allowance"
  tests deterministic without any setup.
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

## Diagnosing flaky tests

A test that fails only under the full suite's parallel load, not alone or with `-g`, is almost
never a logic bug in the test — check infrastructure contention first.

- **Reproduce the actual failure before touching anything.** A single flaky test run proves
  nothing either way; run the full suite (or the same worker count) a couple of times with
  `LOG_UNMOCKED_RPC=1 npx playwright test` and look at `test-results/unmocked-rpc-requests.log` for
  real `429`s before assuming a code regression. One session's evidence, captured this way:
  ```
  [CC-03] ... status: 429 ... url: https://mainnet.infura.io/v3/...
  [CC-01] ... status: 429 ... url: https://mainnet.infura.io/v3/...
  [CC-26] ... status: 429 ... url: https://mainnet.infura.io/v3/...
  ```
- **Root cause 1: a single shared real Infura key gets rate-limited under N-way parallel workers.**
  `mocks.allowances` and `installMulticall3` deliberately fall back to a real `route.fetch()`
  whenever a Multicall3 batch isn't *fully* recognized (see each one's own doc comment) — reliable
  for one test at a time, but every worker's fallback hits the exact same hardcoded Infura key, and
  enough concurrent workers trip its rate limit. `logUnmockedRpcRequests.ts` exists specifically to
  make this observable; it's disabled by default because logging every request has its own cost.
  (`mockSocketVerifier` used to be in this list too — it no longer makes any real-RPC fallback at
  all, see the "connected wallet's own provider" note below; a *different* root cause than this one.)
- **Closing a real-RPC-fallback gap directly beats retrying around it.** `mocks/unmocked-rpc-requests.log`
  entries are a to-do list, not just a diagnosis — each distinct `(method, selector, to)` still
  hitting a real host is a mock this suite is missing, and adding it removes a 429 source instead
  of just tolerating it. Example this session: an `approve(address,uint256)` preflight `eth_call`
  (selector `0x095ea7b3`) was firing — and 429-ing — even on cross-chain tests that pre-seed
  sufficient allowance and never click Approve, because the wallet-connector layer simulates it
  unconditionally regardless of whether the UI will ever show that step.
  `mockApproveTransaction.ts` already answered this exact selector, but only for its own specific
  `token` and only for tests that call it — `mockApproveSimulation.ts` now answers it
  host-agnostically for *any* token/spender, registered globally in the `mocks` fixture. Safe to
  match on selector alone with no token/spender scoping: an ERC20 `approve()` succeeding is a fair
  default assumption, no test in this suite asserts on one reverting, and Playwright's LIFO route
  order means a more specific handler registered later (e.g. `mockApproveTransaction`'s own, set up
  inside a test body) still wins for the token it cares about — this one only catches what nothing
  more specific claimed.
- **A multi-row UI read can tear across a re-render — read the whole snapshot atomically, not row
  by row.** `[CS-127]`/`[CS-128]` each read four tooltip rows (`Before costs`/`Protocol fee`/
  `Network costs`/`To`) as four separately-awaited `readRowAmount()` calls, then computed a ratio
  from them. The swap form fires its own default-amount probe quote before the typed amount's real
  quote lands (same root cause as the "full wallet balance" case already noted above, just a
  different default-amount source) — `waitForQuote()` only waits for the loading flag to clear
  *once*, so if the real quote's render lands in between two of the four reads, the result is a mix
  of old and new state (e.g. `beforeCosts` from the stale 1-unit probe, `protocolFee` from the
  fresh 1000-unit quote), producing a self-consistent-*looking* but wrong ratio — confirmed by
  instrumenting the mock callback with `console.log` (prints to the Node process, not the browser)
  and correlating its output against the same test's row-read output via a per-run random tag,
  since parallel workers' console output interleaves. Fixed by moving all four reads inside a
  single `expect.poll(async () => { ...four reads...; return ratio })` callback, so every retry
  re-reads the full snapshot together instead of trusting a stale mix — the same idiom `[CC-17]`'s
  checkbox retry already uses, just applied to a read instead of a click.
- **A page-load default (currency or typed amount) can still be mid-resolution when the very next
  UI action fires, even when the test already "types before selecting" to dodge it.** Two distinct
  production hooks each carry a sticky ref written specifically to survive this kind of currency/
  amount change, but a ref only latches once the state it preserves has actually resolved — right
  after `goto()`, under CI load, that resolution can still be in flight when the next action lands,
  so the mitigation not being airtight isn't a logic bug in the hook, just a race it doesn't fully
  close.
  - **Typed sell amount reverts to "1".** `useSetupTradeAmountsFromUrl`'s
    `isAtLeastOneAmountIsSetRef.current ||= Boolean(inputCurrencyAmount || outputCurrencyAmount)`
    only latches once the just-typed amount has been reparsed into a real `inputCurrencyAmount`
    *against whichever token is currently selected* — a synchronous, no-debounce `useMemo` in
    `useBuildTradeDerivedState.ts`, but under severe CI CPU contention even that can still not have
    been scheduled/rendered by the time the currency switch fires, and `useSetupTradeAmountsFromUrl`'s
    own "no amount set yet" 1-unit default wins the race. Observed as `[CS-59]`/`[CS-118]`
    (`selectTokens`-driven, both sides picked) and `[CS-68]` (a *native ETH* pick specifically, which
    has an extra `crossChainFamilySwitch()` microtask gap per `useOpenTokenSelectWidget.ts` on top of
    the same reparse race). **First attempt that didn't actually work:** `await swapPage.waitForQuote()`
    right after typing, before the switch — the theory (a quote fetch can't fire without a genuinely
    parsed amount, so waiting one out proves the reparse landed) is reasonable but wrong in practice,
    because the quote fetch itself sits behind its *own*, separate 350ms debounce
    (`AMOUNT_CHANGE_DEBOUNCE_TIME` in `useQuoteParams.ts`) — checking too soon after typing finds
    `data-isLoading` never having been set at all yet, a false-positive "not loading" `waitForFunction`
    happily resolves in milliseconds. Confirmed by tracing a CI run where this added wait resolved in
    ~40ms and `[CS-59]` still lost the race identically. **Actual fix:** retype the same amount again
    once the currency switch has fully landed (`selectTokens`/both `searchAndPick()` calls returned)
    — this removes any dependency on winning the race in the first place, rather than trying to catch
    the exact moment it's safe to proceed. Applied to all four: `[CS-59]`/`[CS-118]`/`[CS-68]`/`[CS-103]`.
  - **Currency reverts to "Select a token".** `useNavigateOnCurrencySelection`'s
    `lastKnownInputCurrencyIdRef`/`lastKnownOutputCurrencyIdRef` exist specifically to preserve
    whichever side *isn't* being picked, but each only latches once that side's currency has
    resolved in React state. Picking the *other* side before that lands wipes the untouched side
    back to `null` in the resulting URL/trade state instead of preserving it. Observed as `[CS-104]`
    finding no `#input-currency-input` token at all (not a wrong value — the whole panel was blank,
    since the sell side had no currency selected). Fixed with `SwapPage.waitForBothCurrenciesResolved()`
    — waits until neither `sellTokenSelect` nor `buyTokenSelect` still shows `CurrencySelectButton`'s
    "Select a token" placeholder — called right after `goto()`, before the first
    `tokens.open{Input,Output}()` + `searchAndPick()`, in any test that changes one side via the
    picker while relying on the default for the other (`[CS-68]`/`[CS-103]`/`[CS-104]`). Deliberately
    **not** baked into `goto()`/`unlockIfNeeded()` themselves: `[CS-299]`/`[CS-301]` (picking a
    Solana/Bitcoin destination) leave one side genuinely, deliberately unresolved for a while, and
    would hang forever waiting on it — call the helper explicitly, only where both sides are
    actually expected to already have a value.
  - **General lesson for both:** don't guess at a fixed sleep for either race, and don't trust a
    signal just because it's *plausible* that it depends on the same state — verify it's actually
    *causally guaranteed* to, or it can resolve as a false positive before anything real happened
    (`waitForQuote()`'s failed attempt above: reasonable-sounding, wrong, because the thing being
    waited on sits behind a *different* debounce than the thing that actually needed to settle).
    Where possible, prefer removing the dependency on timing altogether over trying to catch the
    exact safe moment — retyping after the fact (used for the amount race) beats waiting before the
    fact. Where the race is about identity rather than a value (the currency race, nothing to
    "retype"), wait on a signal from the *same* render path as the ref being protected — a resolved
    currency selector, the same idiom the "multi-row UI read" fix above uses for a torn read. Either
    way, keep the wait in one named, reusable page-object method (`waitForBothCurrenciesResolved`)
    rather than duplicating an inline assertion — with its full "why" comment — at every call site
    that needs it; a hardcoded expected value (e.g. `'Selected token: WETH'`) also doesn't generalize
    to tests using a non-default pair, where a generic "not still the placeholder" check does.
- **Root cause 2: the default 5s `expect` timeout is tight under CPU contention.** Several
  known-load-sensitive assertions (the recipient-confirmation checkbox retry in `[CC-17]`, the
  order-progress-modal reopen in `[CS-60]`) have their own comments acknowledging they only flake
  under concurrent test load, not in isolation — heavy parallel Chromium + one shared dev server
  competing for CPU cores makes debounces/polling cycles that normally settle in well under a
  second take long enough to blow past a tight default.
- **Suite-wide mitigation applied in `playwright.config.ts`:** `expect: { timeout: 10_000 }` (was
  the unconfigured 5s default) and `retries: 1` unconditionally (was `CI ? 1 : 0`) — a load-induced
  flake should self-heal on retry rather than fail the run, locally too, not just in CI. These are
  mitigations for contention, not a fix for the underlying rate limit — a real `429` under
  sufficiently heavy load can still exhaust a retry. Per-assertion overrides above this floor (like
  `[CS-60]`'s existing 15s wait) are still correct and still needed for the worst offenders; don't
  remove them just because the global floor moved up.
- **Root cause 3a (real, but only part of the story): `page.goto()`'s default `waitUntil: 'load'`
  blocks on irrelevant third-party resources, eating into a fixed post-navigation timeout.**
  `wallet.openApp()` (`fixtures/mockWallet.ts`) and `SwapPage.goto()` both call
  `page.locator('#web3-status-connected').waitFor({ timeout: 15_000 })` right after `await
  page.goto(...)` returns — but `goto()`'s default `waitUntil: 'load'` only resolves once *every*
  resource on the page has finished loading, including third-party iframes the app injects for
  analytics (Google Tag Manager). Confirmed by instrumenting the reconnect path end to end: in one
  captured run, the mock wallet's `connect()` resolved in ~15ms, but `page.goto()` itself didn't
  return control to the test for another 2.5s, waiting on GTM's `ns.html` iframe. Fixed by passing
  `{ waitUntil: 'domcontentloaded' }` to both `goto()` calls. **This genuinely helps but does not
  fix the flake on its own** — it was fixed and retested, and the same "wallet not connected"
  timeout still reproduced under `--workers=6`, which is what led to root cause 3b below.
- **Root cause 3b (the actual cause): a startup race inside wagmi + `@reown/appkit-adapter-wagmi`
  can wipe a just-written wallet connection before the UI ever reads it — nothing to do with this
  suite's mocks.** Reconnect logic here always succeeded (`wagmi`'s internal store reached
  `status: 'connected'` within ~100–400ms in every capture, confirmed via temporary instrumentation
  of `@wagmi/core`'s `reconnect()`/`getConnection()`), yet `useAccountState()`
  (`libs/wallet/src/wagmi/hooks/useAccountState.ts`) kept reporting `isConnected: true, address:
  undefined` — so `WalletStatusButton` never rendered `#web3-status-connected` and fell through to
  the disconnected UI once `useIsRestoringConnection`'s 1s safety timeout expired. Root cause,
  proven with millisecond-level logs: AppKit's `WagmiAdapter.syncConnections()` drives its own
  async `reconnect()` (writing the real connection into `config.state.connections`), while
  `@wagmi/core`'s *own* `hydrate()` `onMount` — configured with `reconnectOnMount: false` since
  AppKit handles reconnection itself — independently runs `config.setState(x => ({...x,
  connections: new Map()}))` ("reset connections that may have been hydrated from storage") on
  every mount, dozens of times in the first ~100ms of boot. These two initializations are
  completely uncoordinated. Normally the reset finishes before `syncConnections()`'s reconnect
  writes anything (harmless — nothing to reset yet). Under load, the ordering can flip: reconnect
  writes the real connection, then the reset fires milliseconds later and wipes it; `reconnect()`'s
  own final `status: 'connected'` write then lands on an empty `connections` map. This is why it
  only shows up in *this* suite and not for real users: every mock-wallet RPC call
  (`eth_accounts`/`eth_chainId`/etc.) is a genuine async round trip through
  `context.exposeBinding`, unlike a real browser-extension wallet's near-synchronous response —
  that extra latency is what gives the reset enough of a window to interleave and win.
  **Fixed with a durable pnpm patch**, not a source edit to our own code: `patches/@wagmi__core@3.4.8.patch`
  guards wagmi's reset branch on `config.state.status === 'disconnected'` — if anything (e.g.
  AppKit's own reconnect) is already connecting/connected by the time this mount callback runs,
  skip the reset instead of clobbering it. Registered via `patchedDependencies` in
  `pnpm-workspace.yaml` (see the note below on where that key now belongs). Confirmed against 3+
  consecutive `--workers=6` runs with zero recurrence after this patch, versus reliably reproducing
  every few runs before it.
- **`pnpm.patchedDependencies` (and `overrides`/`peerDependencyRules`/`packageExtensions`/
  `allowBuilds`) in root `package.json` are silently ignored under this repo's pinned `pnpm@10.30.3`.**
  Every `pnpm` invocation prints "The 'pnpm' field in package.json is no longer read by pnpm" —
  these settings must live under a top-level `patchedDependencies:` (etc.) key in
  `pnpm-workspace.yaml` instead. Only `patchedDependencies` has been migrated so far (required to
  make the `@wagmi/core` patch above actually apply — `pnpm patch-commit` still *writes* new entries
  into `package.json`'s dead `pnpm.patchedDependencies` block by default, which silently does
  nothing on install; move the entry to `pnpm-workspace.yaml` immediately after committing any new
  patch, or it won't take effect). Even after migrating, a single `pnpm install`/`pnpm dedupe` may
  not converge every peer-dependency-hashed copy of a patched package in `node_modules` — check with
  `find node_modules/.pnpm -maxdepth 1 -iname '<pkg>@<version>*'` and diff each copy's patched file
  if something still isn't taking effect. `overrides`/`peerDependencyRules`/`packageExtensions`/
  `allowBuilds` are still unmigrated and therefore still inert — a deliberate, separate fix, not
  something to migrate as a side effect of an unrelated change, since enforcing dormant `overrides`
  for the first time could shift other resolved versions.
- **Confirm a suspected regression by testing the *unmodified* code under the same load**, not just
  by re-running your changed version and seeing it pass once. `git stash` the diff, rerun the exact
  same failing test/suite, and only call something a regression if the clean baseline doesn't
  reproduce it too. This is how CC-13's "insufficient balance"/"Error loading price" failures and
  CS-128's flake were both confirmed pre-existing and unrelated to a same-session diff, twice.

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
  dispatch/proxy (`walletEngine.ts` → `rpcProxy.ts`) and the real MetaMask network config in
  `wallet.setup.ts`. Every mock in `mocks/`/`support/` that intercepts a *direct* RPC read — receipt
  polls, native-balance multicalls, allowance/approve reads, `eth_estimateGas` — is registered
  host-agnostically (`context.route('**/*', ...)`, decode the JSON-RPC body, match by `method` and
  the actual call data/tx hash) rather than scoped to that URL, precisely because plenty of calls the
  *app itself* makes go straight to whichever of the app's own hardcoded providers it picks (Infura,
  the WalletConnect RPC relay, publicnode, ...), unpredictable and outside this env var's control
  (see `mockEthEstimateGas` in `mockEthFlowTransaction.ts` for the canonical example, and
  `installNativeBalanceRoute`/`mockApproveTransaction`'s own receipt route for two more). Bungee's
  on-chain SocketVerifier check is a *different* case entirely — see the next note.
- **Bungee's on-chain SocketVerifier check (`validateRotueId`/`validateSocketRequest`,
  `verifyBungeeBuildTxData` in `@cowprotocol/sdk-bridging`) is mocked entirely by
  `mocks/socketVerifier.ts` — a standalone, host-agnostic `context.route('**/*', ...)` mock, same
  shape as `ethBlockNumber.ts`/`ethGetCode.ts`.** It decodes both a direct `eth_call` to the
  SocketVerifier contract and one batched inside a Multicall3 `aggregate3` (mirroring
  `installMulticall3`'s own batch decoding), resolving either to a safe empty success without
  touching the network, and otherwise falling back untouched. It's registered *ahead of* both
  `installMulticall3` and `installAllowances` in the `mocks` fixture (Playwright's route order is
  LIFO — last registered gets first look), so it catches the check regardless of which real RPC
  host the app's independent read-only client would otherwise have picked — e.g.
  `https://ethereum-rpc.publicnode.com` for Mainnet, the same host `REACT_APP_NETWORK_URL_1`
  configures and `mocks/allowances` owns. Deliberately *not* folded into
  `mocks/allowances/codec.ts`: that codec is allowance-shaped (`ClassifiedCall` = allowance |
  batch | opaque) and shared with `installMulticall3`'s own resolver, so adding a third mock's
  selector there would have coupled two unrelated concerns for no benefit — a standalone mock
  keeps this one deletable/testable on its own, same as every other single-purpose mock in
  `mocks/`.
  - **History, worth keeping in mind if this check ever silently stops being mocked again:** it was
    first mocked with a `context.route('**/*', ...)` handler modeled on `mockEthEstimateGas`, and
    that silently never matched anything under load, intermittently manifesting as `[CS-287]`/
    `[CS-297]`/etc. failing with "Error loading price" or a hung `BridgeRoutePanel.expand()`. Root
    cause, found by having the app log the real `readContract` error instead of swallowing it: the
    SDK adapter's `readContract` for this check ran against the *connected wallet's own provider*
    (this suite's mock wallet resolves the chain from the currently-connected chain, which for
    these tests happens to be the bridge's origin chain — Mainnet), not the app's separate HTTP
    viem client — and `eth_call`s made through the wallet provider go `injectedShim.ts` →
    `walletEngine.ts`'s `dispatch()` → `forward()`, a plain **Node-side** `fetch()` straight to
    this suite's own RPC proxy (`support/rpcProxy.ts`), never touching the page's network layer at
    all. That was fixed with a dedicated `support/mockSocketVerifier.ts`, stubbing the RPC proxy's
    own `(to, selector)` primitive (`rpcProxy.stubCall(...)`) directly instead of routing pages.
    Once `mocks/socketVerifier.ts` above existed and the suite kept passing without it,
    `support/mockSocketVerifier.ts` and its `rpcProxy.stubCall` usage were deleted as redundant —
    so today there is exactly one SocketVerifier mock, not two. **Lesson: if a mock built on
    `context.route()` seems to work "sometimes" for a wallet-adjacent on-chain read, check whether
    the call is actually reaching the wallet's own provider instead of the page's network layer
    before adding more retry/timeout budget around it** — no amount of extra timeout fixes a mock
    that's listening on the wrong layer. (Whether that still applies to *this* check specifically,
    or the wallet-forwarded path simply doesn't fire for it anymore, wasn't re-diagnosed before
    deleting the old mock — if this check ever starts flaking again the way `[CS-287]` did, that
    wallet-provider path is the first thing to re-check before assuming `mocks/socketVerifier.ts`
    itself regressed.)
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
