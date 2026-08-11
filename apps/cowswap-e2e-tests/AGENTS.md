---
author: agents
status: normative
last_reviewed: 2026-08-04
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
- **Mock-driven scenarios that span multiple endpoints belong on the page object as a method**, not as a
  free function in the spec file. Example: `SwapPage.mockSwapFulfillment(cowApi, balances, owner, chainId,
  sellTokenBalanceBefore)` sets up `postOrder` + `accountOrders` + `orderStatus` + the balance debit/credit
  together, because they describe one coherent thing ("the orderbook fulfilled this order") and every spec
  needing that scenario should get it identically.
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
