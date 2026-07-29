# CoW Protocol API mocks for the Playwright e2e suite

Date: 2026-07-29
Status: approved

## Problem

`apps/cowswap-frontend-e2e-pw` is meant to run without touching real network
services, but today only a handful of CoW Protocol endpoints are stubbed, and
they are stubbed with inline JSON scattered across two modules:

- `src/mocks/cowOrderApi.ts` handles `POST /api/v1/orders` and
  `GET /api/v1/orders/{uid}`.
- `src/mocks/bff.ts` handles `POST /api/v1/quote` — despite its name, this is an
  orderbook endpoint, not `bff.cow.fi`. The real BFF surface is unmocked.

Everything else the frontend calls — account orders, trades, native prices,
total surplus, app data, solver competition, transaction orders, version —
reaches the live barn API. Localhost runs against staging because
`isBarnBackendEnv` is `true` for local (`libs/common-utils/src/environments.ts`),
so those calls resolve against `https://barn.api.cow.fi`.

Consequences: tests depend on live-service availability and on the mutable state
of a shared staging account, and there is no way for a spec to declare the order
history it wants to render against.

## Goals

1. No request from a Playwright test reaches `api.cow.fi` or `barn.api.cow.fi`.
2. Default responses come from committed `.json` fixture files seeded from real
   API responses.
3. A spec can override any endpoint's body, including varying the body by
   request, and can drive error paths.
4. A gap in coverage fails a test with an actionable message rather than
   silently leaking to the network.

## Non-goals

- Mocking `bff.cow.fi` (`usdPrice`, `topHolders`, `simulateBundle`, affiliate)
  and `partners.cow.fi`. These are the next unmocked surface and get their own
  round; this spec only records them in the README.
- Changing RPC isolation. `src/support/rpcProxy.ts` already partitions chain
  reads per worker and is out of scope.
- Mocking the other third-party services already stubbed in `src/mocks/`
  (`bungee.ts`, `nearIntents.ts`, `tokenLists.ts`, `safeSdk.ts`).

## Design

### Module layout

```
src/mocks/cowProtocolApi/
  index.ts                  installCowProtocolApi(context) -> CowProtocolApiMock
  endpoints.ts              endpoint catalogue (single source of truth)
  types.ts                  CowApiRequest, CowApiOverride, reply()
  record.ts                 fixture recorder script
  fixtures/*.json           committed, one file per endpoint
  cowProtocolApi.test.ts    node:test unit tests for matcher + resolver
```

A directory rather than a flat file: the catalogue, the fixtures and the
recorder are three separate concerns. This follows the existing `src/mockWallet/`
precedent, including colocated `node:test` unit tests run under `tsx`.

### Endpoint catalogue

Paths verified against `@cowprotocol/sdk-order-book@4.0.1`. Hosts are
`https://api.cow.fi` (prod) and `https://barn.api.cow.fi` (staging).

| key | method | path |
|---|---|---|
| `accountOrders` | GET | `/api/v1/account/{address}/orders` |
| `order` | GET | `/api/v1/orders/{uid}` |
| `orderStatus` | GET | `/api/v1/orders/{uid}/status` |
| `postOrder` | POST | `/api/v1/orders` |
| `cancelOrders` | DELETE | `/api/v1/orders` |
| `transactionOrders` | GET | `/api/v1/transactions/{txHash}/orders` |
| `nativePrice` | GET | `/api/v1/token/{address}/native_price` |
| `totalSurplus` | GET | `/api/v1/users/{address}/total_surplus` |
| `appData` | GET | `/api/v1/app_data/{hash}` |
| `putAppData` | PUT | `/api/v1/app_data/{hash}` |
| `quote` | POST | `/api/v1/quote` |
| `version` | GET | `/api/v1/version` |
| `trades` | GET | `/api/v2/trades` |
| `solverCompetition` | GET | `/api/v2/solver_competition/{auctionId}` |
| `solverCompetitionByTx` | GET | `/api/v2/solver_competition/by_tx_hash/{txHash}` |

Network slugs in the first path segment (`mainnet`, `xdai`, `arbitrum_one`,
`base`, `sepolia`, `bnb`, `avalanche`, `polygon`, `lens`, `ink`, `linea`,
`plasma`, `solana`) are mapped to chain ids by a table in `endpoints.ts`,
mirroring the SDK's own slug list. An unrecognised slug is not an error — the
handler still matches the endpoint and passes the raw slug through as
`network` with `chainId` left `undefined`.

Each catalogue entry:

```ts
interface CowApiEndpoint {
  key: string                    // override key, also the fixture basename
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  match: RegExp                  // against the path after the network segment,
                                 // with named capture groups
  fixture?: string               // fixture filename; omitted for endpoints whose
                                 // default is computed (postOrder, putAppData)
  dynamicDefault?: (req: CowApiRequest) => unknown
  normalizeDefault?: (body: unknown, req: CowApiRequest) => unknown
  contentType?: string           // defaults to 'application/json'
}
```

The catalogue array drives three things — route matching, the union type of
override keys, and the recorder's endpoint list — so adding an endpoint is a
one-place change.

### Request context

Every override factory and every `normalizeDefault` receives:

```ts
interface CowApiRequest {
  env: 'prod' | 'barn'
  network: string                     // raw slug from the URL, e.g. 'mainnet'
  chainId: number | undefined         // resolved from the slug, undefined if unknown
  method: string
  url: URL
  params: Record<string, string>      // named regex groups: address, uid, hash, txHash
  query: URLSearchParams
  body: unknown                       // parsed JSON request body, when present
  defaults: unknown                   // the resolved default body for this endpoint
}
```

`defaults` is what makes overrides small: a spec that wants one field changed
spreads the default rather than restating a whole order.

### Override API

```ts
type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue }

type CowApiOverride =
  | CowApiReply                                    // reply(status, body)
  | ((req: CowApiRequest) => unknown | CowApiReply | Promise<unknown | CowApiReply>)
  | JsonValue                                      // a literal body

interface CowProtocolApiMock {
  set(key: CowApiEndpointKey, override: CowApiOverride): void
  clear(key: CowApiEndpointKey): void
  allowUnmocked(): void
  readonly posted: Array<{ uid: string; body: unknown }>
  reset(): void
}
```

The literal-body member is `JsonValue`, not `unknown`: TypeScript reduces
`unknown | X` to plain `unknown`, which would make `set()` check nothing and
force every factory override to carry an explicit `(req: CowApiRequest)`
annotation — taxing the exact "vary the body by request" capability this API
exists for. `JsonValue` is not a real narrowing, since every override is
`JSON.stringify`d on the way out anyway.

Usage:

```ts
mocks.cowApi.set('accountOrders', [openOrder, filledOrder])

mocks.cowApi.set('order', ({ params, defaults }) => ({
  ...(defaults as OrderRecord),
  uid: params.uid,
  status: 'fulfilled',
}))

mocks.cowApi.set('quote', reply(429, { errorType: 'TooManyRequests' }))
```

Status control goes through an explicit branded `reply(status, body)` helper
rather than a bare `{ status, body }` object. Real orderbook bodies contain a
`status` field, so a bare object would be ambiguous:
`set('order', { status: 'fulfilled', … })` must mean "this body", not "HTTP
status". `reply()` returns a branded value that is unambiguous both as a `set`
argument and as a factory return.

`posted` records `POST /api/v1/orders` bodies with the uid the mock generated,
replacing `CowOrderApiMock.posted`.

### Lockdown

One catch-all route:

```ts
context.route(/^https:\/\/(barn\.)?api\.cow\.fi\//, handler)
```

Handler flow:

1. Parse host to `env`, first path segment to `network` / `chainId`, remainder
   to the endpoint path.
2. Find the catalogue entry matching method + path. If none: push the URL to
   `unmatched` and `route.abort('blockedbyclient')`.
3. If the key has an override, resolve it (call the factory if it is one).
   `reply()` values supply status and body; anything else is a 200 body.
4. Otherwise resolve the default: the fixture body or `dynamicDefault`, then
   `normalizeDefault` if the entry declares one.
5. Fulfil with `application/json`.

Teardown in the `mocks` fixture: if `unmatched` is non-empty and
`allowUnmocked()` was not called, throw listing every un-mocked URL. Throwing in
fixture teardown fails the test, which is the intended signal — the fix is to
add a catalogue entry.

### Default realism

Recorded fixtures carry a real owner address and absolute timestamps. Rendered
verbatim, an order fixture belongs to a stranger and is already expired.

`normalizeDefault` handles this, declared per-entry in the catalogue so it is
visible rather than buried in the handler:

- `accountOrders`, `order`, `trades`: stamp `owner` and `receiver` to the
  requesting address (`params.address`, or the `owner` query param for
  `trades`), set `creationDate` to now and `validTo` to now + 1 hour.
- `transactionOrders`: timestamp refreshing only. `GET
  /api/v1/transactions/{txHash}/orders` identifies no address, so there is
  nothing to re-own to; the recorded account stays in `owner`/`receiver`. A
  spec that needs a specific owner overrides the endpoint.
- `quote`: echo the request's `sellToken`, `buyToken`, `receiver`, `from`,
  `kind` and `appData`; set the requested side's amount to exactly what was
  asked for; derive the opposite side by scaling the fixture's own
  `buyAmount`/`sellAmount` ratio. The recorded fixture is a mainnet WETH→USDC
  quote, so without this a Sepolia swap would render mainnet amounts for the
  wrong tokens. `validTo` and `expiration` are refreshed. The derived price is
  a deterministic placeholder — any spec asserting on a specific output amount
  must override `quote`.
- Other endpoints: no normalization.

`GET /api/v1/version` returns `text/plain`, not JSON (verified against the live
API). Catalogue entries therefore carry an optional `contentType` defaulting to
`application/json`. Its fixture stays a `.json` file holding a JSON string; the
fulfil step sends a resolved string body raw when `contentType` is not JSON, and
`JSON.stringify`s otherwise.

Overrides bypass `normalizeDefault` entirely — a spec that supplies a body gets
exactly that body. A factory that wants normalization applied can spread
`defaults`, which is post-normalization.

### Recorder

`record.ts` holds a list of recordings:

```ts
interface Recording {
  key: CowApiEndpointKey
  env: 'prod' | 'barn'
  network: string
  path: string        // concrete path with real sample params
  body?: unknown      // request body for POST/PUT endpoints
}
```

Sample params: `0xfb3c7eb936cAA12B5A884d612393969A557d4307` for `accountOrders`
and `totalSurplus`, a uid taken from that account's order history for `order` /
`orderStatus` / `trades`, WETH for `nativePrice`, the app data hash from the
same order for `appData`.

Behaviour: fetch each recording, trim top-level arrays to 3 entries,
pretty-print with 2-space indent, write `fixtures/<key>.json`. Individual
failures are reported and skipped rather than aborting the run; a summary of
written / skipped keys prints at the end. Endpoints whose default is computed
(`postOrder`, `putAppData`, `cancelOrders`) have no recording.

Wired as an nx target `e2e:record-mocks` in
`apps/cowswap-frontend-e2e-pw/project.json` (`tsx src/mocks/cowProtocolApi/record.ts`)
and documented in the app README.

Fixtures are committed so the suite never needs the network.

### Fixture integration

`src/fixtures/shared.ts` gains `cowApi: CowProtocolApiMock` in
`SharedFixtures['mocks']`, installed alongside the others and reset — with the
unmatched assertion — in teardown. Because the assertion throws, it runs after
the other mocks' resets so those still execute.

### Migration

- Delete `src/mocks/cowOrderApi.ts`. `postOrder` and `order` catalogue entries
  replace it; `expectPostOrderOnce` has no successor because `open` is the
  default order status and other statuses are one `set('order', …)` call.
- Delete `src/mocks/bff.ts`. Its `/api/v1/quote` route becomes the `quote`
  catalogue entry. The module is misnamed and, once the quote route moves out,
  empty; an empty module rots. The `bff.cow.fi` surface it never covered is
  recorded in the README instead.
- Remove `bff` and `cowOrderApi` from `SharedFixtures['mocks']`.
- Update the two spec call sites — `src/tests/market-orders.spec.ts:9` and
  `src/tests/limit-orders.spec.ts:14` — which both call
  `mocks.cowOrderApi.expectPostOrderOnce({ status: 'open' })`. Both can drop the
  line, since `open` is the default.

### Testing

`cowProtocolApi.test.ts`, using `node:test` under `tsx` like
`src/mockWallet/walletEngine.test.ts`, covers the pure resolver without a
browser:

- URL parsing: host to `env`, slug to `chainId`, path to endpoint key and
  `params`.
- Method discrimination: `POST /api/v1/orders` and `DELETE /api/v1/orders`
  resolve to different keys.
- Override resolution: literal body, factory body, factory receiving `defaults`,
  `reply()` status and body.
- `normalizeDefault` applied to defaults and skipped for overrides.
- Unmatched URLs accumulate in the unmatched list.

Integration is verified by the existing specs continuing to pass with all
network egress to `api.cow.fi` blocked.

### Documentation

The app README gains:

- A "CoW Protocol API mocks" section: the override API, `reply()`, `defaults`,
  `allowUnmocked()`, and how to add a catalogue entry.
- A `pnpm e2e:record-mocks` row in the commands table.
- A "Not yet mocked" section naming `bff.cow.fi` (`usdPrice`, `topHolders`,
  `simulateBundle`, affiliate) and `partners.cow.fi` as the next round.

## Risks

- **Fixture drift.** Committed fixtures go stale when the orderbook API changes
  shape. Mitigated by the recorder making a refresh a one-command operation; not
  eliminated, since nothing forces the refresh.
- **Teardown failures mask test failures.** A test that already failed will also
  report un-mocked URLs. Acceptable: the unmatched list is additive diagnostic
  output, not a replacement for the original error.
- **Regex path matching.** Patterns can overlap — `/orders/{uid}` vs
  `/orders/{uid}/status`, and `/solver_competition/{auctionId}` vs
  `/solver_competition/by_tx_hash/{txHash}`. Mitigated by anchoring every
  `match` with `^…$`, constraining the capture groups (`\d+` for `auctionId`,
  `0x[a-f0-9]+` for uids and hashes) so they cannot swallow a literal segment,
  and by unit tests asserting each sample path resolves to exactly one key.
