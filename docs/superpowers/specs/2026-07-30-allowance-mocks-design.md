# Allowance mocks for the Playwright e2e suite

Date: 2026-07-30
Status: approved

## Problem

`apps/cowswap-frontend-e2e-pw` cannot control ERC-20 allowances. Every allowance
the app reads comes from the live Sepolia node, so the approve-related UI is
driven by the mutable on-chain state of a shared test account:

- `useNeedsApproval` (`apps/cowswap-frontend/src/common/hooks/useNeedsApproval.ts`)
  decides whether the trade flow shows an approval step at all.
- `useEnoughAllowance`, `useApproveState`, and `useApproval`
  (`apps/cowswap-frontend/src/modules/erc20Approve/hooks/`) drive the approve
  button, its pending state, and the bundled-approval path.
- The Account → Tokens page (`apps/cowswap-frontend/src/pages/Account/Tokens/TokensOverview.tsx:338`)
  renders a per-token approve column.

A spec that wants "this token needs approval" or "this token is already
approved" has no way to say so. Whichever branch the shared account happens to
be in is the branch the test exercises, and a single real approval transaction
by anyone flips it for every future run.

The existing chain-mocking primitive does not help. `src/support/rpcProxy.ts`
exposes `stubCall({ chainId, to, dataPrefix, returnHex })`, but two things make
it a dead end here:

1. **It is not on the app's RPC path.** The app builds its viem transport from
   `RPC_URLS[chainId]` (`libs/wallet/src/wagmi/config.ts:26`), which resolves to
   `REACT_APP_NETWORK_URL_<chainId>` — the real node. The proxy only serves the
   wallet (the cached MetaMask profile and the mock wallet engine). No test uses
   `stubCall` or `setBalance` today, and neither would affect what the app
   renders.
2. **Its key is too coarse.** `(chainId, to, selector)` ignores the call
   arguments, so it cannot distinguish `allowance(ownerA, spender)` from
   `allowance(ownerB, spender)`, and it cannot see inside a batched call at all
   (see below).

## Goals

1. A committed JSON file declares allowances as `owner -> chainId -> token -> raw atoms`.
2. Both live allowance read paths resolve from it — `useTokenAllowances`
   (`libs/balances-and-allowances/src/hooks/useTokenAllowances.ts:15`) and
   `useTokenAllowance` (`apps/cowswap-frontend/src/common/hooks/useTokenAllowance.ts:25`).
3. An allowance read that the JSON does not mention resolves to `0`, so the
   default state of every test is deterministic.
4. A spec can override the JSON at runtime, which is the only way to key on the
   wallet address that `INTEGRATION_TEST_PRIVATE_KEY` produces.
5. No production code changes.

## Non-goals

- **Balances.** `BalancesRpcCallUpdater` and the balances watcher are a separate
  surface with a WebSocket path; allowances have no watcher path and are
  RPC-only, which is what makes this spec small.
- **Keying on spender.** See "Spender is not a dimension" below.
- **The dormant `tokenAllowancesFamily` path.** See "Known gap" below.
- **Changing the app's multicall batching.** Turning off `batch.multicall`
  (`libs/wallet/src/wagmi/config.ts:60`) would make the mock trivial at the cost
  of testing a transport configuration that production does not use.
- **Retiring `rpcProxy.stubCall`.** Unifying all chain mocking behind the node
  proxy is a plausible follow-up, but it requires the proxy to become
  default-forward (it currently answers `-32601` for any method outside
  `FORWARD_METHODS`), which touches the wallet path. Out of scope.

## Design

### What reaches the wire

Both hooks end at the same viem HTTP transport, and `batch.multicall` coalesces
`eth_call`s into Multicall3 within a 130 ms window:

| Hook | Action | On the wire |
| --- | --- | --- |
| `useTokenAllowances` | wagmi `useReadContracts` → `multicall` | `aggregate3` |
| `useTokenAllowance` | `publicClient.readContract` → `call` | `aggregate3`, or a bare `allowance()` `eth_call` when the call misses the coalescing window |

So the mock recognises two shapes of `eth_call`:

- **Direct.** `data` starts with `0xdd62ed3e` (`allowance(address,address)`);
  `to` is the token, `args[0]` is the owner, `args[1]` the spender.
- **Wrapped.** `data` starts with `0x82ad56cb`
  (`aggregate3((address,bool,bytes)[])`), decoded into its `Call3[]`, each inner
  call classified by the same rules — recursively, since nothing prevents viem
  from wrapping an already-encoded `aggregate3`.

Classification keys on the **selector, not on `to`**. Validating `to` against
each chain's Multicall3 address buys nothing: calldata that decodes as
`aggregate3` is an `aggregate3` batch whatever it is addressed to, and skipping
the check drops a chainId → Multicall3-address table.

### Module layout

```
src/mocks/allowances/
  index.ts               installAllowances(context) -> AllowancesMock
  types.ts               AllowancesFixture, AllowanceRead, AllowancesMock
  fixture.ts             load + validate fixtures/allowances.json
  resolve.ts             (owner, chainId, token) -> bigint
  codec.ts               decode allowance/aggregate3, re-encode aggregate3 results
  fixtures/allowances.json
  codec.test.ts
  resolve.test.ts
  fixture.test.ts
```

Registered in `src/fixtures/shared.ts` next to `cowApi`, `tokenLists`, `bungee`,
`nearIntents`, and `safeSdk`, and reset by the same `auto: true` `mocks` fixture
that already resets those.

### Fixture format

```json
{
  "0x1111111111111111111111111111111111111111": {
    "11155111": {
      "0xfff9976782d46cc05630d1f6ebab18b2324d6b14": "5000000",
      "0x0625afb445c3b6b7b929342a04a22599fd5dbb59": "0"
    },
    "100": {
      "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d": "1000000000000000000"
    }
  }
}
```

- Owner and token keys are addresses, matched case-insensitively (both sides
  lowercased on lookup). Chain keys are decimal chain ids as JSON strings.
- Values are **raw atoms** — what `allowance()` actually returns. No unit
  conversion, so the mock needs no `decimals` and stays independent of the
  token-list mock.
- A value may be a decimal string or a JSON number. `fixture.ts` rejects a
  number that is not a safe integer, because `JSON.parse` silently rounds
  those: `1000000000000000000` must be written as a string. It also rejects
  negatives, non-integers, and malformed addresses, with the JSON path in the
  message.
- Validation failures throw at install time, which surfaces as a test error
  rather than as mysteriously-zero allowances.

### Resolution

`resolve(owner, chainId, token)` lowercases owner and token, walks
`overrides` then `fixture`, and returns `0n` when any level is missing. There
are no wildcards: an owner absent from the file gets `0n` for every token, as
does a token absent from a present owner's chain map. This is the "default to 0"
rule — a spec is deterministic before it configures anything, and the cost of
forgetting an entry is a visible needs-approval UI rather than a live-node read.

### Request handling

`installAllowances(context)` registers one route whose matcher is the set of
URLs the app itself uses: `process.env['REACT_APP_NETWORK_URL_' + chainId]` for
each chain in `CHAIN_IDS` that has one set. The suite already requires
`REACT_APP_NETWORK_URL_11155111`. The chainId for a request comes from **which
URL matched**, not from inspecting the body. A chain whose env var is unset is
not intercepted and reaches its real node; the mock logs that set once at
install so it is stated rather than discovered.

For each intercepted POST — a single JSON-RPC object or an array — every entry is
classified, then:

| Case | Action |
| --- | --- |
| Nothing mockable | `route.continue()` — untouched passthrough |
| Everything mockable | `route.fulfill()` from the fixture, no network |
| Mixed (an `aggregate3` holding non-allowance calls) | `route.fetch()` the **original** body upstream, overwrite only the mocked `(success, returnData)` slots in the decoded result, re-encode, `route.fulfill()` |
| Malformed body, or a decode failure | forward untouched, record the reason |

Forwarding the original body verbatim in the mixed case, rather than re-encoding
a filtered batch, is what keeps result arity and ordering trivially correct — the
upstream response already has one slot per inner call in the right order, and the
mock only overwrites slots. A mocked slot is written as `success = true` with the
32-byte value, so a token that does not exist upstream (a fixture token that was
never deployed on Sepolia) still resolves cleanly instead of surfacing the
upstream revert.

A decode failure never fails the request. The page always gets an answer, and
the reason is recorded for the teardown report.

### Spender is not a dimension

`allowance(owner, spender)` is matched on owner and token only; any spender
resolves to the same value. The spender varies by flow — the vault relayer for
normal trades, and `useApproval` passes an explicit one — and no test has
expressed a need to distinguish them. Adding a key that every fixture would set
identically is a footgun, not a feature. The recorded reads include the spender,
so a spec that ever needs to assert on it can.

### Test-facing API

```ts
mocks.allowances.set(owner, chainId, { [token]: '5000000' })
mocks.allowances.clear()
mocks.allowances.reads() // AllowanceRead[]: { chainId, owner, spender, token, value }
```

- `set` merges **token by token** into `(owner, chainId)`: tokens it does not
  name keep their fixture value, and a token it sets to `'0'` overrides a
  non-zero fixture value. Calling it twice for the same `(owner, chainId)`
  accumulates. `clear()` drops all overrides for all owners, restoring the
  fixture. This is the supported way to key on `wallet.address`, which is not
  knowable when the JSON is written.
- Every allowance read the codec classifies is recorded, with `value` as the
  resolved `bigint` — including reads that resolved to `0n` by the default rule.
  A read the codec could not decode is not recorded as an `AllowanceRead`; it
  goes to the teardown report instead.
- `reads()` lets a spec assert an allowance was actually queried — the
  difference between "the UI shows no approval step because allowance is high"
  and "because the read never happened".
- Overrides and recorded reads reset between tests in the `mocks` fixture.

### Unknown-owner diagnostic

Literal-only owner keys plus default-0 create one sharp edge: the wallet address
comes from `INTEGRATION_TEST_PRIVATE_KEY`, which differs between developers and
CI, so a committed fixture keyed to one address yields all-zero allowances for
anyone else — every token silently rendering as needs-approval.

At teardown, `reportUnknownOwners()` emits a **non-fatal** `console.warn` listing
every owner address that was queried but has no entry in the fixture or the
overrides, so the fix is a copy-paste into the JSON or a `set()` call. It runs
alongside the existing `cowApi.assertNoUnmatched()` teardown, before reset.

Non-fatal is deliberate: an unknown owner is the *expected* state for reads the
spec does not care about (the token list produces an allowance read per token),
so failing on it would make the mock unusable.

### Known gap

`tokenAllowancesFamily` (`libs/balances-and-allowances/src/state/allowancesAtom.ts:81`)
is **not** intercepted. It calls
`getPublicClientFromProvider(chainId, provider)` with the connector's provider,
so its reads go through the wallet — the mock wallet engine and the node RPC
proxy — not the app's HTTP transport. It is dead code today: the block that would
use it is commented out at `useTokenAllowances.ts:19-26`.

When that TODO lands, this mock needs a second install point in
`src/mockWallet/walletEngine.ts` (or in `rpcProxy.ts`, reusing `codec.ts`). A
comment in `installAllowances` records this so the connection is not
rediscovered from scratch.

## Testing

Unit tests in the existing `node:test` + `node:assert` style used by
`src/mocks/cowProtocolApi/resolve.test.ts` and `src/support/rpcProxy.test.ts`:

- `codec.test.ts` — direct `allowance` decode; `aggregate3` decode; a nested
  `aggregate3`; mixed-batch patching that asserts non-mocked slots survive
  untouched and ordering is preserved; malformed calldata.
- `resolve.test.ts` — hit, case-insensitive hit, missing token, missing chain,
  missing owner, override precedence over fixture.
- `fixture.test.ts` — valid file; unsafe-integer number rejected; negative,
  non-integer, and malformed-address rejected, each naming its JSON path.

### Enabling the unit tests

`cowswap-frontend-e2e-pw` has **no `test` target and no jest config**, so its
five existing `node:test` files (`endpoints.test.ts`, `resolve.test.ts`,
`install.test.ts`, `walletEngine.test.ts`, `rpcProxy.test.ts`) are run by
nothing — not `pnpm test`, not `nx run-many -t test`, not CI.

This spec adds a `test` target to `apps/cowswap-frontend-e2e-pw/project.json`
running `tsx --test 'src/**/*.test.ts'`, which picks up the new tests and the
five existing ones. The Playwright specs are unaffected: they are `.spec.ts`
under `src/tests`, and `playwright.config.ts` sets `testDir: './src/tests'`.

If any of the five pre-existing files fail once they actually run, that is
reported as a finding, not fixed silently under cover of this work and not
papered over by narrowing the glob.

## Documentation

A "Token allowances" section in `apps/cowswap-frontend-e2e-pw/README.md`, next to
"CoW Protocol API mocks": the fixture format, raw-atom units, the default-0 rule,
the `set`/`clear`/`reads` API, and the unknown-owner warning. The commands table
gains the new `test` target.

## Risks

- **A fixture keyed to the wrong owner reads as all-zero.** Mitigated by the
  teardown warning and `set()`; accepted because default-0 was chosen
  deliberately over passthrough.
- **viem changes how it batches.** If `batch.multicall` were reconfigured or
  viem changed its aggregation, allowance calls could take a shape the codec
  does not classify. They would then forward to the real node and the mock would
  go quiet rather than fail loudly. `reads()` is the check: a spec asserting on
  approval behaviour can assert the read was seen.
- **Mixed batches cost an upstream round trip.** Unchanged from today, where
  every batch hits the node; only fully-mocked batches get faster.
- **Multi-chain coverage is env-dependent.** Only chains with
  `REACT_APP_NETWORK_URL_<chainId>` set are intercepted. Sepolia is required by
  the suite; the rest are logged as un-intercepted at install.
