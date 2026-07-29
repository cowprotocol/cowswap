# CoW Protocol API Mocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Playwright e2e suite intercept every request to `api.cow.fi` / `barn.api.cow.fi`, serving committed JSON fixtures by default and letting a spec override any endpoint's body.

**Architecture:** One `context.route` catch-all on both CoW API hosts. A declarative endpoint catalogue (method + anchored path regex + fixture filename) drives route matching, the override key union type, and the fixture recorder. Requests with no catalogue entry are aborted and recorded, then reported as a test failure at fixture teardown. Overrides are per-endpoint literals or factories that receive the parsed request plus the resolved default body.

**Tech Stack:** TypeScript, `@playwright/test` 1.49.1, `node:test` + `tsx` for unit tests, Nx run-commands targets.

**Spec:** `docs/superpowers/specs/2026-07-29-cow-api-mocks-design.md`

## Global Constraints

- All work is inside `apps/cowswap-frontend-e2e-pw/`. Run all commands from that directory unless stated otherwise.
- Unit tests use `node:test` (`import { test } from 'node:test'`, `import { strict as assert } from 'node:assert'`), matching `src/mockWallet/walletEngine.test.ts` and `src/support/rpcProxy.test.ts`. Run them with `pnpm exec tsx --test <file>`.
- Playwright's `testDir` is `./src/tests`, so `*.test.ts` files elsewhere are never picked up by Playwright. Keep unit tests colocated with the code under `src/mocks/cowProtocolApi/`.
- tsconfig is `strict: true` with `noImplicitAny: true`. No `any` without an eslint-disable; prefer `unknown` plus a narrowing cast.
- Module resolution is `bundler` with `resolveJsonModule: true`, but fixtures are read at runtime with `readFileSync(path.join(__dirname, 'fixtures', ...))` — not imported — so the recorder's output is picked up without a rebuild and the fixture set stays data-driven.
- The two CoW API hosts are exactly `https://api.cow.fi` (prod) and `https://barn.api.cow.fi` (staging). Localhost runs staging because `isBarnBackendEnv` is `true` for local.
- Every catalogue `match` regex is anchored `^...$` and uses named capture groups.
- Lint with `pnpm nx run cowswap-frontend-e2e-pw:lint` from the repo root before each commit.

## File Structure

| File | Responsibility |
|---|---|
| `src/mocks/cowProtocolApi/types.ts` | `CowApiRequest`, `CowApiReply`, `reply()`, `isReply()`, `CowApiOverride`, `CowApiEndpoint` |
| `src/mocks/cowProtocolApi/networks.ts` | network slug → chain id table |
| `src/mocks/cowProtocolApi/normalize.ts` | `normalizeDefault` implementations (orders, trades, quote) |
| `src/mocks/cowProtocolApi/endpoints.ts` | the catalogue array, `CowApiEndpointKey`, `matchEndpoint()`, `parseCowApiUrl()` |
| `src/mocks/cowProtocolApi/resolve.ts` | pure default/override resolution — `resolveResponse()` |
| `src/mocks/cowProtocolApi/index.ts` | `installCowProtocolApi(context)`, the Playwright route handler, unmatched tracking |
| `src/mocks/cowProtocolApi/record.ts` | fixture recorder script |
| `src/mocks/cowProtocolApi/fixtures/*.json` | recorded default bodies |
| `src/mocks/cowProtocolApi/endpoints.test.ts` | URL parsing + endpoint matching tests |
| `src/mocks/cowProtocolApi/resolve.test.ts` | override/default/normalize resolution tests |
| `src/fixtures/shared.ts` (modify) | add `cowApi` to `mocks`, assert no unmatched URLs at teardown |
| `src/mocks/cowOrderApi.ts` (delete) | superseded |
| `src/mocks/bff.ts` (delete) | superseded; misnamed (stubbed the orderbook `/quote`) |
| `src/tests/market-orders.spec.ts` (modify) | drop `mocks.cowOrderApi` call |
| `src/tests/limit-orders.spec.ts` (modify) | drop `mocks.cowOrderApi` call |
| `project.json` (modify) | `e2e:record-mocks` target |
| `package.json` (root, modify) | `e2e:record-mocks` script |
| `README.md` (modify) | mocks docs, recorder command, "Not yet mocked" |

---

### Task 1: Types, network table, and the endpoint catalogue

**Files:**
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/types.ts`
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/networks.ts`
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/endpoints.ts`
- Test: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/endpoints.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface CowApiRequest { env: 'prod' | 'barn'; network: string; chainId: number | undefined; method: string; url: URL; params: Record<string, string>; query: URLSearchParams; body: unknown; defaults: unknown }`
  - `interface CowApiReply { readonly __cowApiReply: true; status: number; body: unknown }`
  - `function reply(status: number, body?: unknown): CowApiReply`
  - `function isReply(value: unknown): value is CowApiReply`
  - `type CowApiOverride = unknown | CowApiReply | ((req: CowApiRequest) => unknown | Promise<unknown>)`
  - `interface CowApiEndpoint { key: string; method: 'GET' | 'POST' | 'PUT' | 'DELETE'; match: RegExp; fixture?: string; dynamicDefault?: (req: CowApiRequest) => unknown; normalizeDefault?: (body: unknown, req: CowApiRequest) => unknown; contentType?: string }`
  - `const COW_API_ENDPOINTS: readonly CowApiEndpoint[]`
  - `type CowApiEndpointKey = (typeof COW_API_ENDPOINTS)[number]['key']` — declared as an explicit union (see Step 5) because a `readonly` array of a widened interface does not narrow `key` to a literal union.
  - `function parseCowApiUrl(rawUrl: string): { env: 'prod' | 'barn'; network: string; chainId: number | undefined; path: string } | null`
  - `function matchEndpoint(method: string, path: string): { endpoint: CowApiEndpoint; params: Record<string, string> } | null`

- [ ] **Step 1: Write the failing test**

Create `src/mocks/cowProtocolApi/endpoints.test.ts`:

```ts
import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { COW_API_ENDPOINTS, matchEndpoint, parseCowApiUrl } from './endpoints'

const ACCOUNT = '0xfb3c7eb936cAA12B5A884d612393969A557d4307'
const ORDER_UID =
  '0x71622d8563a51e03b4f32cfaa8c6e80c6fd6a22eeacf1a00d41309326ba7f13afb3c7eb936caa12b5a884d612393969a557d43076bfb1da4'
const TX_HASH = '0x4cda04d9e5872969256306c98540279f10a822a718e85d46d535c50c2555fe2d'
const APP_DATA_HASH = '0xbc9e102748829db8395db85375d62375efe09b7109bc3aab8c12518fa22fe459'

test('parseCowApiUrl splits host, network and path', () => {
  const parsed = parseCowApiUrl(`https://barn.api.cow.fi/mainnet/api/v1/account/${ACCOUNT}/orders?offset=0&limit=10`)
  assert.deepEqual(parsed, {
    env: 'barn',
    network: 'mainnet',
    chainId: 1,
    path: `/api/v1/account/${ACCOUNT}/orders`,
  })
})

test('parseCowApiUrl recognises the prod host', () => {
  const parsed = parseCowApiUrl('https://api.cow.fi/sepolia/api/v1/version')
  assert.equal(parsed?.env, 'prod')
  assert.equal(parsed?.chainId, 11155111)
})

test('parseCowApiUrl leaves chainId undefined for an unknown slug', () => {
  const parsed = parseCowApiUrl('https://api.cow.fi/atlantis/api/v1/version')
  assert.equal(parsed?.network, 'atlantis')
  assert.equal(parsed?.chainId, undefined)
  assert.equal(parsed?.path, '/api/v1/version')
})

test('parseCowApiUrl returns null for a non-CoW host', () => {
  assert.equal(parseCowApiUrl('https://bff.cow.fi/1/tokens/0x00/usdPrice'), null)
})

test('matchEndpoint resolves account orders and captures the address', () => {
  const matched = matchEndpoint('GET', `/api/v1/account/${ACCOUNT}/orders`)
  assert.equal(matched?.endpoint.key, 'accountOrders')
  assert.equal(matched?.params.address, ACCOUNT)
})

test('matchEndpoint distinguishes order from orderStatus', () => {
  assert.equal(matchEndpoint('GET', `/api/v1/orders/${ORDER_UID}`)?.endpoint.key, 'order')
  assert.equal(matchEndpoint('GET', `/api/v1/orders/${ORDER_UID}/status`)?.endpoint.key, 'orderStatus')
})

test('matchEndpoint discriminates on method for /api/v1/orders', () => {
  assert.equal(matchEndpoint('POST', '/api/v1/orders')?.endpoint.key, 'postOrder')
  assert.equal(matchEndpoint('DELETE', '/api/v1/orders')?.endpoint.key, 'cancelOrders')
  assert.equal(matchEndpoint('GET', '/api/v1/orders'), null)
})

test('matchEndpoint discriminates on method for /api/v1/app_data/{hash}', () => {
  assert.equal(matchEndpoint('GET', `/api/v1/app_data/${APP_DATA_HASH}`)?.endpoint.key, 'appData')
  assert.equal(matchEndpoint('PUT', `/api/v1/app_data/${APP_DATA_HASH}`)?.endpoint.key, 'putAppData')
})

test('matchEndpoint keeps solver competition variants apart', () => {
  assert.equal(matchEndpoint('GET', '/api/v2/solver_competition/15567158')?.endpoint.key, 'solverCompetition')
  const byTx = matchEndpoint('GET', `/api/v2/solver_competition/by_tx_hash/${TX_HASH}`)
  assert.equal(byTx?.endpoint.key, 'solverCompetitionByTx')
  assert.equal(byTx?.params.txHash, TX_HASH)
})

test('matchEndpoint resolves the remaining catalogue entries', () => {
  assert.equal(matchEndpoint('GET', `/api/v1/transactions/${TX_HASH}/orders`)?.endpoint.key, 'transactionOrders')
  assert.equal(
    matchEndpoint('GET', '/api/v1/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/native_price')?.endpoint.key,
    'nativePrice',
  )
  assert.equal(matchEndpoint('GET', `/api/v1/users/${ACCOUNT}/total_surplus`)?.endpoint.key, 'totalSurplus')
  assert.equal(matchEndpoint('POST', '/api/v1/quote')?.endpoint.key, 'quote')
  assert.equal(matchEndpoint('GET', '/api/v1/version')?.endpoint.key, 'version')
  assert.equal(matchEndpoint('GET', '/api/v2/trades')?.endpoint.key, 'trades')
})

test('matchEndpoint returns null for an unknown path', () => {
  assert.equal(matchEndpoint('GET', '/api/v1/auction'), null)
})

test('every sample path matches exactly one catalogue entry', () => {
  const samples: Array<[string, string]> = [
    ['GET', `/api/v1/account/${ACCOUNT}/orders`],
    ['GET', `/api/v1/orders/${ORDER_UID}`],
    ['GET', `/api/v1/orders/${ORDER_UID}/status`],
    ['POST', '/api/v1/orders'],
    ['DELETE', '/api/v1/orders'],
    ['GET', `/api/v1/transactions/${TX_HASH}/orders`],
    ['GET', '/api/v1/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/native_price'],
    ['GET', `/api/v1/users/${ACCOUNT}/total_surplus`],
    ['GET', `/api/v1/app_data/${APP_DATA_HASH}`],
    ['PUT', `/api/v1/app_data/${APP_DATA_HASH}`],
    ['POST', '/api/v1/quote'],
    ['GET', '/api/v1/version'],
    ['GET', '/api/v2/trades'],
    ['GET', '/api/v2/solver_competition/15567158'],
    ['GET', `/api/v2/solver_competition/by_tx_hash/${TX_HASH}`],
  ]
  for (const [method, path] of samples) {
    const hits = COW_API_ENDPOINTS.filter((e) => e.method === method && e.match.test(path))
    assert.equal(hits.length, 1, `${method} ${path} matched ${hits.length} entries: ${hits.map((h) => h.key)}`)
  }
})

test('catalogue keys are unique', () => {
  const keys = COW_API_ENDPOINTS.map((e) => e.key)
  assert.equal(new Set(keys).size, keys.length)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run from `apps/cowswap-frontend-e2e-pw`:
```bash
pnpm exec tsx --test src/mocks/cowProtocolApi/endpoints.test.ts
```
Expected: FAIL — `Cannot find module './endpoints'`.

- [ ] **Step 3: Write `types.ts`**

```ts
export type CowApiEnv = 'prod' | 'barn'

export interface CowApiRequest {
  env: CowApiEnv
  /** Raw network slug from the URL, e.g. `mainnet`. */
  network: string
  /** Resolved from the slug; `undefined` when the slug is not in the table. */
  chainId: number | undefined
  method: string
  url: URL
  /** Named capture groups from the endpoint's `match` regex. */
  params: Record<string, string>
  query: URLSearchParams
  /** Parsed JSON request body, or `undefined` when there is none. */
  body: unknown
  /** The default body this endpoint would have served, post-normalization. */
  defaults: unknown
}

const REPLY_BRAND = '__cowApiReply' as const

export interface CowApiReply {
  readonly [REPLY_BRAND]: true
  status: number
  body: unknown
}

/**
 * Wrap a body with an explicit HTTP status.
 *
 * Real orderbook bodies contain a `status` field of their own, so a bare
 * `{ status, body }` object would be ambiguous. This brand removes the guess.
 */
export function reply(status: number, body: unknown = undefined): CowApiReply {
  return { [REPLY_BRAND]: true, status, body }
}

export function isReply(value: unknown): value is CowApiReply {
  return typeof value === 'object' && value !== null && REPLY_BRAND in value
}

export type CowApiOverrideFactory = (req: CowApiRequest) => unknown | Promise<unknown>

export type CowApiOverride = unknown | CowApiReply | CowApiOverrideFactory

export interface CowApiEndpoint {
  key: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Anchored, with named capture groups. Tested against the path after the network segment. */
  match: RegExp
  /** Fixture filename under `fixtures/`. Omit when the default is computed. */
  fixture?: string
  /** Computes the default body when there is no fixture. */
  dynamicDefault?: (req: CowApiRequest) => unknown
  /** Adjusts a fixture body to the incoming request. Never applied to overrides. */
  normalizeDefault?: (body: unknown, req: CowApiRequest) => unknown
  /** Defaults to `application/json`. */
  contentType?: string
}
```

- [ ] **Step 4: Write `networks.ts`**

```ts
/**
 * Network slugs used in CoW API paths, mirroring the slug list in
 * `@cowprotocol/sdk-order-book`. An unknown slug is not an error — the request
 * still matches its endpoint, it just carries `chainId: undefined`.
 */
export const NETWORK_SLUG_TO_CHAIN_ID: Readonly<Record<string, number>> = {
  mainnet: 1,
  xdai: 100,
  bnb: 56,
  polygon: 137,
  base: 8453,
  arbitrum_one: 42161,
  avalanche: 43114,
  linea: 59144,
  ink: 57073,
  lens: 232,
  plasma: 9745,
  sepolia: 11155111,
}
```

Note: `solana` appears in the SDK slug list but has no EVM chain id; it is intentionally absent and resolves to `undefined`.

- [ ] **Step 5: Write `endpoints.ts`**

`normalizeDefault` hooks are wired in Task 3 — leave them off the entries for now so this task stays self-contained.

```ts
import { NETWORK_SLUG_TO_CHAIN_ID } from './networks'

import type { CowApiEndpoint, CowApiEnv } from './types'

const HEX_ADDRESS = '0x[a-fA-F0-9]{40}'
const HEX_UID = '0x[a-fA-F0-9]{112}'
const HEX_32 = '0x[a-fA-F0-9]{64}'

export const COW_API_ENDPOINTS: readonly CowApiEndpoint[] = [
  {
    key: 'accountOrders',
    method: 'GET',
    match: new RegExp(`^/api/v1/account/(?<address>${HEX_ADDRESS})/orders$`),
    fixture: 'accountOrders.json',
  },
  {
    key: 'orderStatus',
    method: 'GET',
    match: new RegExp(`^/api/v1/orders/(?<uid>${HEX_UID})/status$`),
    fixture: 'orderStatus.json',
  },
  {
    key: 'order',
    method: 'GET',
    match: new RegExp(`^/api/v1/orders/(?<uid>${HEX_UID})$`),
    fixture: 'order.json',
  },
  { key: 'postOrder', method: 'POST', match: /^\/api\/v1\/orders$/ },
  { key: 'cancelOrders', method: 'DELETE', match: /^\/api\/v1\/orders$/ },
  {
    key: 'transactionOrders',
    method: 'GET',
    match: new RegExp(`^/api/v1/transactions/(?<txHash>${HEX_32})/orders$`),
    fixture: 'transactionOrders.json',
  },
  {
    key: 'nativePrice',
    method: 'GET',
    match: new RegExp(`^/api/v1/token/(?<address>${HEX_ADDRESS})/native_price$`),
    fixture: 'nativePrice.json',
  },
  {
    key: 'totalSurplus',
    method: 'GET',
    match: new RegExp(`^/api/v1/users/(?<address>${HEX_ADDRESS})/total_surplus$`),
    fixture: 'totalSurplus.json',
  },
  {
    key: 'appData',
    method: 'GET',
    match: new RegExp(`^/api/v1/app_data/(?<hash>${HEX_32})$`),
    fixture: 'appData.json',
  },
  { key: 'putAppData', method: 'PUT', match: new RegExp(`^/api/v1/app_data/(?<hash>${HEX_32})$`) },
  { key: 'quote', method: 'POST', match: /^\/api\/v1\/quote$/, fixture: 'quote.json' },
  {
    key: 'version',
    method: 'GET',
    match: /^\/api\/v1\/version$/,
    fixture: 'version.json',
    contentType: 'text/plain',
  },
  { key: 'trades', method: 'GET', match: /^\/api\/v2\/trades$/, fixture: 'trades.json' },
  {
    key: 'solverCompetitionByTx',
    method: 'GET',
    match: new RegExp(`^/api/v2/solver_competition/by_tx_hash/(?<txHash>${HEX_32})$`),
    fixture: 'solverCompetitionByTx.json',
  },
  {
    key: 'solverCompetition',
    method: 'GET',
    match: /^\/api\/v2\/solver_competition\/(?<auctionId>\d+)$/,
    fixture: 'solverCompetition.json',
  },
]

/**
 * Explicit union rather than a derived one: `COW_API_ENDPOINTS` is typed as
 * `readonly CowApiEndpoint[]`, which widens `key` to `string`.
 * `endpoints.test.ts` asserts this list and the catalogue stay in sync.
 */
export type CowApiEndpointKey =
  | 'accountOrders'
  | 'order'
  | 'orderStatus'
  | 'postOrder'
  | 'cancelOrders'
  | 'transactionOrders'
  | 'nativePrice'
  | 'totalSurplus'
  | 'appData'
  | 'putAppData'
  | 'quote'
  | 'version'
  | 'trades'
  | 'solverCompetition'
  | 'solverCompetitionByTx'

const COW_API_HOSTS: Readonly<Record<string, CowApiEnv>> = {
  'api.cow.fi': 'prod',
  'barn.api.cow.fi': 'barn',
}

export function parseCowApiUrl(
  rawUrl: string,
): { env: CowApiEnv; network: string; chainId: number | undefined; path: string } | null {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }
  const env = COW_API_HOSTS[url.hostname]
  if (!env) return null

  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length < 2) return null

  const [network, ...rest] = segments
  return {
    env,
    network,
    chainId: NETWORK_SLUG_TO_CHAIN_ID[network],
    path: `/${rest.join('/')}`,
  }
}

export function matchEndpoint(
  method: string,
  path: string,
): { endpoint: CowApiEndpoint; params: Record<string, string> } | null {
  for (const endpoint of COW_API_ENDPOINTS) {
    if (endpoint.method !== method.toUpperCase()) continue
    const matched = endpoint.match.exec(path)
    if (!matched) continue
    return { endpoint, params: { ...matched.groups } }
  }
  return null
}
```

- [ ] **Step 6: Add the key/catalogue sync test**

In `endpoints.test.ts`, extend the existing import to
`import { COW_API_ENDPOINTS, COW_API_ENDPOINT_KEYS, matchEndpoint, parseCowApiUrl } from './endpoints'`
and append:

```ts
test('CowApiEndpointKey union covers exactly the catalogue', () => {
  assert.deepEqual([...COW_API_ENDPOINT_KEYS].sort(), COW_API_ENDPOINTS.map((e) => e.key).sort())
})
```

And add to `endpoints.ts`, immediately after the `CowApiEndpointKey` union:

```ts
/** Runtime mirror of `CowApiEndpointKey`, kept in sync by `endpoints.test.ts`. */
export const COW_API_ENDPOINT_KEYS: readonly CowApiEndpointKey[] = [
  'accountOrders',
  'order',
  'orderStatus',
  'postOrder',
  'cancelOrders',
  'transactionOrders',
  'nativePrice',
  'totalSurplus',
  'appData',
  'putAppData',
  'quote',
  'version',
  'trades',
  'solverCompetition',
  'solverCompetitionByTx',
]
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
pnpm exec tsx --test src/mocks/cowProtocolApi/endpoints.test.ts
```
Expected: PASS, 14 tests.

- [ ] **Step 8: Typecheck and lint**

```bash
pnpm exec tsc --noEmit -p tsconfig.json
cd ../.. && pnpm nx run cowswap-frontend-e2e-pw:lint && cd apps/cowswap-frontend-e2e-pw
```
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
cd ../.. && git add apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi && \
git commit -m "test(e2e): add CoW API endpoint catalogue and URL matcher"
```

---

### Task 2: Fixture recorder and recorded fixtures

**Files:**
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/record.ts`
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/fixtures/*.json` (generated)
- Modify: `apps/cowswap-frontend-e2e-pw/project.json`
- Modify: `package.json` (repo root)

**Interfaces:**
- Consumes: `CowApiEndpointKey` from `./endpoints`.
- Produces: `fixtures/<key>.json` for every catalogue entry that has a `fixture`. Task 3 reads these at runtime.

- [ ] **Step 1: Write `record.ts`**

Every path below was verified against the live barn API on 2026-07-29 and returned HTTP 200.

```ts
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import type { CowApiEndpointKey } from './endpoints'

const HOSTS = {
  prod: 'https://api.cow.fi',
  barn: 'https://barn.api.cow.fi',
} as const

const FIXTURES_DIR = path.join(__dirname, 'fixtures')

/** Trim recorded arrays to this many entries so fixtures stay reviewable. */
const MAX_ARRAY_ENTRIES = 3

const ACCOUNT = '0xfb3c7eb936cAA12B5A884d612393969A557d4307'
const ORDER_UID =
  '0x71622d8563a51e03b4f32cfaa8c6e80c6fd6a22eeacf1a00d41309326ba7f13afb3c7eb936caa12b5a884d612393969a557d43076bfb1da4'
const TX_HASH = '0x4cda04d9e5872969256306c98540279f10a822a718e85d46d535c50c2555fe2d'
const APP_DATA_HASH = '0xbc9e102748829db8395db85375d62375efe09b7109bc3aab8c12518fa22fe459'
const AUCTION_ID = '15567158'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

interface Recording {
  key: CowApiEndpointKey
  env: keyof typeof HOSTS
  network: string
  path: string
  body?: unknown
}

/**
 * Endpoints whose default is computed rather than recorded (`postOrder`,
 * `cancelOrders`, `putAppData`) have no entry here.
 */
const RECORDINGS: readonly Recording[] = [
  { key: 'accountOrders', env: 'barn', network: 'mainnet', path: `/api/v1/account/${ACCOUNT}/orders?offset=0&limit=10` },
  { key: 'order', env: 'barn', network: 'mainnet', path: `/api/v1/orders/${ORDER_UID}` },
  { key: 'orderStatus', env: 'barn', network: 'mainnet', path: `/api/v1/orders/${ORDER_UID}/status` },
  { key: 'transactionOrders', env: 'barn', network: 'mainnet', path: `/api/v1/transactions/${TX_HASH}/orders` },
  { key: 'nativePrice', env: 'barn', network: 'mainnet', path: `/api/v1/token/${WETH}/native_price` },
  { key: 'totalSurplus', env: 'barn', network: 'mainnet', path: `/api/v1/users/${ACCOUNT}/total_surplus` },
  { key: 'appData', env: 'barn', network: 'mainnet', path: `/api/v1/app_data/${APP_DATA_HASH}` },
  { key: 'version', env: 'barn', network: 'mainnet', path: '/api/v1/version' },
  { key: 'trades', env: 'barn', network: 'mainnet', path: `/api/v2/trades?owner=${ACCOUNT}` },
  { key: 'solverCompetition', env: 'barn', network: 'mainnet', path: `/api/v2/solver_competition/${AUCTION_ID}` },
  {
    key: 'solverCompetitionByTx',
    env: 'barn',
    network: 'mainnet',
    path: `/api/v2/solver_competition/by_tx_hash/${TX_HASH}`,
  },
  {
    key: 'quote',
    env: 'barn',
    network: 'mainnet',
    path: '/api/v1/quote',
    body: {
      sellToken: WETH,
      buyToken: USDC,
      from: ACCOUNT,
      receiver: ACCOUNT,
      sellAmountBeforeFee: '1000000000000000000',
      kind: 'sell',
      onchainOrder: false,
      signingScheme: 'eip712',
      priceQuality: 'optimal',
    },
  },
]

function trim(value: unknown): unknown {
  if (Array.isArray(value)) return value.slice(0, MAX_ARRAY_ENTRIES)
  return value
}

async function record(recording: Recording): Promise<'written' | 'skipped'> {
  const url = `${HOSTS[recording.env]}/${recording.network}${recording.path}`
  const init: RequestInit = recording.body
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(recording.body) }
    : { method: 'GET' }

  const response = await fetch(url, init)
  if (!response.ok) {
    console.error(`  ✗ ${recording.key}: HTTP ${response.status} from ${url}`)
    return 'skipped'
  }

  const contentType = response.headers.get('content-type') ?? ''
  // `GET /api/v1/version` answers text/plain; store it as a JSON string so every
  // fixture stays a .json file.
  const parsed = contentType.toLowerCase().startsWith('application/json')
    ? trim((await response.json()) as unknown)
    : await response.text()

  const file = path.join(FIXTURES_DIR, `${recording.key}.json`)
  writeFileSync(file, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
  console.log(`  ✓ ${recording.key} -> fixtures/${recording.key}.json`)
  return 'written'
}

async function main(): Promise<void> {
  mkdirSync(FIXTURES_DIR, { recursive: true })
  console.log(`Recording ${RECORDINGS.length} CoW API fixtures into ${FIXTURES_DIR}`)

  const results = await Promise.all(
    RECORDINGS.map(async (recording) => {
      try {
        return await record(recording)
      } catch (error) {
        console.error(`  ✗ ${recording.key}: ${String(error)}`)
        return 'skipped' as const
      }
    }),
  )

  const written = results.filter((r) => r === 'written').length
  const skipped = results.length - written
  console.log(`\nDone: ${written} written, ${skipped} skipped.`)
  if (skipped > 0) process.exitCode = 1
}

void main()
```

- [ ] **Step 2: Add the nx target**

In `apps/cowswap-frontend-e2e-pw/project.json`, add to `targets` after the `e2e:report` entry:

```json
    "e2e:record-mocks": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "apps/cowswap-frontend-e2e-pw",
        "command": "tsx src/mocks/cowProtocolApi/record.ts"
      }
    },
```

- [ ] **Step 3: Add the root script**

In the repo-root `package.json`, add next to the other `e2e:*` scripts:

```json
    "e2e:record-mocks": "nx run cowswap-frontend-e2e-pw:e2e:record-mocks",
```

- [ ] **Step 4: Run the recorder**

```bash
cd ../.. && pnpm e2e:record-mocks
```
Expected: `Done: 12 written, 0 skipped.` and 12 files under `src/mocks/cowProtocolApi/fixtures/`.

If any endpoint 404s, the sample param has aged out of the barn API's retention. Replace it: fetch `https://barn.api.cow.fi/mainnet/api/v1/account/<ACCOUNT>/orders?offset=0&limit=10`, take a fresh `uid` and `appData` from the response, and take a fresh `txHash` from `https://barn.api.cow.fi/mainnet/api/v2/trades?owner=<ACCOUNT>`; then re-derive `AUCTION_ID` from `/api/v2/solver_competition/by_tx_hash/<txHash>`.

- [ ] **Step 5: Sanity-check the recorded fixtures**

```bash
cd apps/cowswap-frontend-e2e-pw && ls src/mocks/cowProtocolApi/fixtures/ && \
node -e "console.log(JSON.parse(require('fs').readFileSync('src/mocks/cowProtocolApi/fixtures/version.json','utf8')))"
```
Expected: 12 filenames listed; `version.json` parses to a plain string like `main@b99d9da…`.

- [ ] **Step 6: Lint**

```bash
cd ../.. && pnpm nx run cowswap-frontend-e2e-pw:lint
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi apps/cowswap-frontend-e2e-pw/project.json package.json && \
git commit -m "test(e2e): record CoW API response fixtures"
```

---

### Task 3: Default normalization, response resolution, and the route handler

**Files:**
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/normalize.ts`
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/resolve.ts`
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/index.ts`
- Modify: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/endpoints.ts` (wire `normalizeDefault` and `dynamicDefault`)
- Test: `apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi/resolve.test.ts`

**Interfaces:**
- Consumes: `COW_API_ENDPOINTS`, `matchEndpoint`, `parseCowApiUrl`, `CowApiEndpointKey` from `./endpoints`; `CowApiRequest`, `CowApiReply`, `reply`, `isReply`, `CowApiOverride` from `./types`; fixtures from Task 2.
- Produces:
  - `function loadFixture(filename: string): unknown`
  - `function resolveDefaultBody(endpoint: CowApiEndpoint, req: CowApiRequest): unknown`
  - `async function resolveResponse(args: { endpoint: CowApiEndpoint; req: CowApiRequest; override: CowApiOverride | undefined }): Promise<{ status: number; body: unknown; contentType: string }>`
  - `function installCowProtocolApi(context: BrowserContext): CowProtocolApiMock`
  - `interface CowProtocolApiMock { set(key, override): void; clear(key): void; allowUnmocked(): void; readonly posted: ReadonlyArray<{ uid: string; body: unknown }>; readonly unmatched: readonly string[]; assertNoUnmatched(): void; reset(): void }`
  - Re-export `reply` from `index.ts` so specs need one import.

- [ ] **Step 1: Write the failing test**

Create `src/mocks/cowProtocolApi/resolve.test.ts`:

```ts
import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { COW_API_ENDPOINTS } from './endpoints'
import { resolveDefaultBody, resolveResponse } from './resolve'
import { reply } from './types'

import type { CowApiEndpoint, CowApiRequest } from './types'

const TRADER = '0x1111111111111111111111111111111111111111'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

function endpoint(key: string): CowApiEndpoint {
  const found = COW_API_ENDPOINTS.find((e) => e.key === key)
  assert.ok(found, `no catalogue entry for ${key}`)
  return found
}

function makeRequest(overrides: Partial<CowApiRequest> = {}): CowApiRequest {
  const url = new URL(`https://barn.api.cow.fi/mainnet/api/v1/account/${TRADER}/orders`)
  return {
    env: 'barn',
    network: 'mainnet',
    chainId: 1,
    method: 'GET',
    url,
    params: { address: TRADER },
    query: url.searchParams,
    body: undefined,
    defaults: undefined,
    ...overrides,
  }
}

test('accountOrders default is re-owned and refreshed', () => {
  const nowSec = Math.floor(Date.now() / 1000)
  const body = resolveDefaultBody(endpoint('accountOrders'), makeRequest()) as Array<Record<string, unknown>>

  assert.ok(Array.isArray(body) && body.length > 0)
  for (const order of body) {
    assert.equal(order.owner, TRADER.toLowerCase())
    assert.equal(order.receiver, TRADER.toLowerCase())
    assert.ok(Number(order.validTo) > nowSec, 'validTo must be in the future')
    assert.ok(Date.parse(String(order.creationDate)) <= Date.now() + 1000)
  }
})

test('order default takes its uid from the path', () => {
  const uid = `0x${'ab'.repeat(56)}`
  const req = makeRequest({ params: { uid, address: TRADER } })
  const body = resolveDefaultBody(endpoint('order'), req) as Record<string, unknown>
  assert.equal(body.uid, uid)
  assert.equal(body.status, 'open')
})

test('quote default echoes the requested pair and scales the opposite side', () => {
  const req = makeRequest({
    method: 'POST',
    params: {},
    body: {
      sellToken: WETH,
      buyToken: USDC,
      from: TRADER,
      receiver: TRADER,
      sellAmountBeforeFee: '500000000000000000',
      kind: 'sell',
    },
  })
  const body = resolveDefaultBody(endpoint('quote'), req) as { quote: Record<string, unknown>; from: string }

  assert.equal(body.quote.sellToken, WETH)
  assert.equal(body.quote.buyToken, USDC)
  assert.equal(body.quote.receiver, TRADER)
  assert.equal(body.from, TRADER)
  assert.equal(body.quote.sellAmount, '500000000000000000')
  assert.ok(BigInt(String(body.quote.buyAmount)) > 0n)
  assert.ok(Number(body.quote.validTo) > Math.floor(Date.now() / 1000))
})

test('quote default honours a buy-kind request', () => {
  const req = makeRequest({
    method: 'POST',
    params: {},
    body: { sellToken: WETH, buyToken: USDC, from: TRADER, kind: 'buy', buyAmountAfterFee: '1000000000' },
  })
  const body = resolveDefaultBody(endpoint('quote'), req) as { quote: Record<string, unknown> }
  assert.equal(body.quote.buyAmount, '1000000000')
  assert.ok(BigInt(String(body.quote.sellAmount)) > 0n)
})

test('a literal override replaces the body and skips normalization', async () => {
  const res = await resolveResponse({
    endpoint: endpoint('accountOrders'),
    req: makeRequest(),
    override: [{ uid: '0xdead', owner: 'someone-else' }],
  })
  assert.equal(res.status, 200)
  assert.deepEqual(res.body, [{ uid: '0xdead', owner: 'someone-else' }])
})

test('a factory override receives the normalized defaults', async () => {
  const res = await resolveResponse({
    endpoint: endpoint('order'),
    req: makeRequest({ params: { uid: `0x${'cd'.repeat(56)}` } }),
    override: ({ params, defaults }) => ({ ...(defaults as object), uid: params.uid, status: 'fulfilled' }),
  })
  const body = res.body as Record<string, unknown>
  assert.equal(body.status, 'fulfilled')
  assert.equal(body.uid, `0x${'cd'.repeat(56)}`)
  assert.ok('sellToken' in body, 'defaults should have been spread in')
})

test('reply() controls the status code', async () => {
  const res = await resolveResponse({
    endpoint: endpoint('quote'),
    req: makeRequest({ method: 'POST', body: {} }),
    override: reply(429, { errorType: 'TooManyRequests' }),
  })
  assert.equal(res.status, 429)
  assert.deepEqual(res.body, { errorType: 'TooManyRequests' })
})

test('a factory may return reply()', async () => {
  const res = await resolveResponse({
    endpoint: endpoint('quote'),
    req: makeRequest({ method: 'POST', body: {} }),
    override: () => reply(500, { errorType: 'InternalError' }),
  })
  assert.equal(res.status, 500)
})

test('version resolves as text/plain', async () => {
  const res = await resolveResponse({ endpoint: endpoint('version'), req: makeRequest(), override: undefined })
  assert.equal(res.contentType, 'text/plain')
  assert.equal(typeof res.body, 'string')
})

test('postOrder computes a deterministic uid from the request', () => {
  const req = makeRequest({
    method: 'POST',
    params: {},
    body: { sellToken: WETH, buyToken: USDC, from: TRADER, sellAmount: '1' },
  })
  const first = resolveDefaultBody(endpoint('postOrder'), req)
  const second = resolveDefaultBody(endpoint('postOrder'), req)
  assert.equal(typeof first, 'string')
  assert.match(first as string, /^0x[0-9a-f]{112}$/)
  assert.equal(first, second, 'same request body must yield the same uid')
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm exec tsx --test src/mocks/cowProtocolApi/resolve.test.ts
```
Expected: FAIL — `Cannot find module './resolve'`.

- [ ] **Step 3: Write `normalize.ts`**

```ts
import { createHash } from 'node:crypto'

import type { CowApiRequest } from './types'

const ONE_HOUR_SEC = 3600

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

interface OrderLike {
  owner?: string
  receiver?: string
  uid?: string
  creationDate?: string
  validTo?: number
  status?: string
}

/** Address the fixture should appear to belong to for this request. */
function subjectAddress(req: CowApiRequest): string | undefined {
  return (req.params.address ?? req.query.get('owner') ?? undefined)?.toLowerCase()
}

function freshenOrder(order: OrderLike, req: CowApiRequest): OrderLike {
  const owner = subjectAddress(req)
  return {
    ...order,
    ...(owner ? { owner, receiver: owner } : {}),
    ...(req.params.uid ? { uid: req.params.uid } : {}),
    creationDate: new Date().toISOString(),
    validTo: nowSeconds() + ONE_HOUR_SEC,
  }
}

/**
 * Recorded order fixtures belong to a real account and carry absolute
 * timestamps, so verbatim they render as a stranger's expired orders. Re-own
 * them and push their deadlines forward.
 */
export function normalizeOrderList(body: unknown, req: CowApiRequest): unknown {
  if (!Array.isArray(body)) return body
  return body.map((order) => freshenOrder(order as OrderLike, req))
}

/**
 * `status` is pinned to `open` rather than inherited from the fixture: the
 * default must not drift when the fixture is re-recorded from a different
 * order. Specs wanting another status override `order`.
 */
export function normalizeOrder(body: unknown, req: CowApiRequest): unknown {
  if (typeof body !== 'object' || body === null) return body
  return { ...freshenOrder(body as OrderLike, req), status: 'open' }
}

/** Trades carry an `owner` but no `validTo`/`creationDate`. */
export function normalizeTrades(body: unknown, req: CowApiRequest): unknown {
  if (!Array.isArray(body)) return body
  const owner = subjectAddress(req)
  if (!owner) return body
  return body.map((trade) => ({ ...(trade as Record<string, unknown>), owner }))
}

interface QuoteRequestBody {
  sellToken?: string
  buyToken?: string
  receiver?: string
  from?: string
  kind?: 'sell' | 'buy'
  appData?: string
  sellAmountBeforeFee?: string
  sellAmountAfterFee?: string
  buyAmountAfterFee?: string
}

function scale(reference: string, from: string, to: string): string {
  const ref = BigInt(reference)
  const fromAmount = BigInt(from)
  const toAmount = BigInt(to)
  if (fromAmount === 0n) return toAmount.toString()
  return ((ref * toAmount) / fromAmount).toString()
}

/**
 * The recorded quote is a mainnet WETH→USDC quote for 1 WETH. Served verbatim
 * it would show mainnet amounts for whatever pair the test actually asked for.
 * Echo the request, pin the requested side to the requested amount, and derive
 * the other side by preserving the fixture's own price ratio.
 *
 * The derived price is a deterministic placeholder. A spec asserting on a
 * specific output amount must override `quote`.
 */
export function normalizeQuote(body: unknown, req: CowApiRequest): unknown {
  if (typeof body !== 'object' || body === null) return body
  const fixture = body as { quote: Record<string, unknown>; from?: string }
  const request = (req.body ?? {}) as QuoteRequestBody

  const fixtureSell = String(fixture.quote.sellAmount)
  const fixtureBuy = String(fixture.quote.buyAmount)
  const kind = request.kind ?? (fixture.quote.kind as 'sell' | 'buy' | undefined) ?? 'sell'

  const requestedSell = request.sellAmountBeforeFee ?? request.sellAmountAfterFee
  const requestedBuy = request.buyAmountAfterFee

  let sellAmount: string
  let buyAmount: string
  if (kind === 'sell' && requestedSell) {
    sellAmount = requestedSell
    buyAmount = scale(requestedSell, fixtureSell, fixtureBuy)
  } else if (kind === 'buy' && requestedBuy) {
    buyAmount = requestedBuy
    sellAmount = scale(requestedBuy, fixtureBuy, fixtureSell)
  } else {
    sellAmount = requestedSell ?? fixtureSell
    buyAmount = requestedBuy ?? fixtureBuy
  }

  return {
    ...fixture,
    quote: {
      ...fixture.quote,
      ...(request.sellToken ? { sellToken: request.sellToken } : {}),
      ...(request.buyToken ? { buyToken: request.buyToken } : {}),
      ...(request.receiver ? { receiver: request.receiver } : {}),
      ...(request.appData ? { appData: request.appData } : {}),
      kind,
      sellAmount,
      buyAmount,
      validTo: nowSeconds() + 600,
    },
    ...(request.from ? { from: request.from } : {}),
    expiration: new Date(Date.now() + 60_000).toISOString(),
  }
}

/**
 * Deterministic 56-byte uid derived from the posted order, so a re-run of the
 * same test produces the same uid and traces stay comparable.
 */
export function fakeOrderUid(body: unknown): string {
  const digest = createHash('sha256').update(JSON.stringify(body ?? {})).digest('hex')
  return `0x${digest.repeat(2).slice(0, 112)}`
}
```

- [ ] **Step 4: Wire the hooks into `endpoints.ts`**

Add this import at the top of `endpoints.ts`:

```ts
import { fakeOrderUid, normalizeOrder, normalizeOrderList, normalizeQuote, normalizeTrades } from './normalize'
```

Then add the fields to the corresponding entries:

- `accountOrders`: `normalizeDefault: normalizeOrderList,`
- `order`: `normalizeDefault: normalizeOrder,`
- `transactionOrders`: `normalizeDefault: normalizeOrderList,`
- `trades`: `normalizeDefault: normalizeTrades,`
- `quote`: `normalizeDefault: normalizeQuote,`
- `postOrder`: `dynamicDefault: (req) => fakeOrderUid(req.body),`
- `cancelOrders`: `dynamicDefault: () => null,`
- `putAppData`: `dynamicDefault: (req) => req.params.hash,`

- [ ] **Step 5: Write `resolve.ts`**

```ts
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { isReply } from './types'

import type { CowApiEndpoint, CowApiOverride, CowApiOverrideFactory, CowApiRequest } from './types'

const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const JSON_CONTENT_TYPE = 'application/json'

const fixtureCache = new Map<string, unknown>()

export function loadFixture(filename: string): unknown {
  const cached = fixtureCache.get(filename)
  if (cached !== undefined) return cached

  const file = path.join(FIXTURES_DIR, filename)
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8')) as unknown
  } catch (error) {
    throw new Error(
      `Missing or invalid CoW API fixture "${filename}". Run \`pnpm e2e:record-mocks\` to regenerate it. (${String(error)})`,
    )
  }
  fixtureCache.set(filename, parsed)
  return parsed
}

export function resolveDefaultBody(endpoint: CowApiEndpoint, req: CowApiRequest): unknown {
  const raw = endpoint.fixture
    ? structuredClone(loadFixture(endpoint.fixture))
    : endpoint.dynamicDefault
      ? endpoint.dynamicDefault(req)
      : null
  return endpoint.normalizeDefault ? endpoint.normalizeDefault(raw, req) : raw
}

export async function resolveResponse(args: {
  endpoint: CowApiEndpoint
  req: CowApiRequest
  override: CowApiOverride | undefined
}): Promise<{ status: number; body: unknown; contentType: string }> {
  const { endpoint, req, override } = args
  const contentType = endpoint.contentType ?? JSON_CONTENT_TYPE
  const defaults = resolveDefaultBody(endpoint, req)

  if (override === undefined) {
    return { status: 200, body: defaults, contentType }
  }

  const resolved =
    typeof override === 'function' ? await (override as CowApiOverrideFactory)({ ...req, defaults }) : override

  if (isReply(resolved)) {
    return { status: resolved.status, body: resolved.body, contentType }
  }
  return { status: 200, body: resolved, contentType }
}

/** Serialise a resolved body for `route.fulfill`. */
export function serializeBody(body: unknown, contentType: string): string {
  if (body === undefined || body === null) return ''
  if (!contentType.startsWith(JSON_CONTENT_TYPE) && typeof body === 'string') return body
  return JSON.stringify(body)
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm exec tsx --test src/mocks/cowProtocolApi/resolve.test.ts
```
Expected: PASS, 10 tests.

- [ ] **Step 7: Write `index.ts`**

```ts
import { matchEndpoint, parseCowApiUrl } from './endpoints'
import { resolveResponse, serializeBody } from './resolve'
import { reply } from './types'

import type { CowApiEndpointKey } from './endpoints'
import type { CowApiOverride, CowApiRequest } from './types'
import type { BrowserContext, Route } from '@playwright/test'

export { reply }
export type { CowApiEndpointKey, CowApiOverride, CowApiRequest }

const COW_API_URL_PATTERN = /^https:\/\/(?:barn\.)?api\.cow\.fi\//

export interface PostedOrder {
  uid: string
  body: unknown
}

export interface CowProtocolApiMock {
  /** Override an endpoint with a literal body, a `reply(status, body)`, or a factory. */
  set(key: CowApiEndpointKey, override: CowApiOverride): void
  clear(key: CowApiEndpointKey): void
  /** Suppress the teardown failure for un-mocked CoW API URLs in this test. */
  allowUnmocked(): void
  readonly posted: ReadonlyArray<PostedOrder>
  readonly unmatched: readonly string[]
  /** Throws listing every un-mocked CoW API URL. Called by the shared fixture at teardown. */
  assertNoUnmatched(): void
  reset(): void
}

function parseRequestBody(route: Route): unknown {
  try {
    return route.request().postDataJSON() as unknown
  } catch {
    return undefined
  }
}

export function installCowProtocolApi(context: BrowserContext): CowProtocolApiMock {
  const overrides = new Map<CowApiEndpointKey, CowApiOverride>()
  const posted: PostedOrder[] = []
  const unmatched: string[] = []
  let unmatchedAllowed = false

  const handler = async (route: Route): Promise<void> => {
    const request = route.request()
    const rawUrl = request.url()
    const parsed = parseCowApiUrl(rawUrl)

    if (!parsed) return route.fallback()

    const matched = matchEndpoint(request.method(), parsed.path)
    if (!matched) {
      unmatched.push(`${request.method()} ${rawUrl}`)
      return route.abort('blockedbyclient')
    }

    const url = new URL(rawUrl)
    const req: CowApiRequest = {
      env: parsed.env,
      network: parsed.network,
      chainId: parsed.chainId,
      method: request.method(),
      url,
      params: matched.params,
      query: url.searchParams,
      body: parseRequestBody(route),
      defaults: undefined,
    }

    const { status, body, contentType } = await resolveResponse({
      endpoint: matched.endpoint,
      req,
      override: overrides.get(matched.endpoint.key as CowApiEndpointKey),
    })

    if (matched.endpoint.key === 'postOrder' && typeof body === 'string') {
      posted.push({ uid: body, body: req.body })
    }

    await route.fulfill({ status, contentType, body: serializeBody(body, contentType) })
  }

  void context.route(COW_API_URL_PATTERN, handler)

  return {
    posted,
    unmatched,
    set(key, override) {
      overrides.set(key, override)
    },
    clear(key) {
      overrides.delete(key)
    },
    allowUnmocked() {
      unmatchedAllowed = true
    },
    assertNoUnmatched() {
      if (unmatchedAllowed || unmatched.length === 0) return
      const list = [...new Set(unmatched)].map((u) => `  - ${u}`).join('\n')
      throw new Error(
        `Un-mocked CoW Protocol API requests were blocked during this test:\n${list}\n\n` +
          `Add a catalogue entry in src/mocks/cowProtocolApi/endpoints.ts (and a fixture via ` +
          `\`pnpm e2e:record-mocks\`), or call mocks.cowApi.allowUnmocked() for a work-in-progress spec.`,
      )
    },
    reset() {
      overrides.clear()
      posted.length = 0
      unmatched.length = 0
      unmatchedAllowed = false
    },
  }
}
```

- [ ] **Step 8: Typecheck, lint, re-run both unit suites**

```bash
pnpm exec tsc --noEmit -p tsconfig.json
pnpm exec tsx --test src/mocks/cowProtocolApi/endpoints.test.ts src/mocks/cowProtocolApi/resolve.test.ts
cd ../.. && pnpm nx run cowswap-frontend-e2e-pw:lint && cd apps/cowswap-frontend-e2e-pw
```
Expected: no type errors, 24 tests pass, no lint errors.

- [ ] **Step 9: Commit**

```bash
cd ../.. && git add apps/cowswap-frontend-e2e-pw/src/mocks/cowProtocolApi && \
git commit -m "test(e2e): resolve CoW API mock responses from fixtures and overrides"
```

---

### Task 4: Wire into the shared fixture, retire the old mocks, document

**Files:**
- Modify: `apps/cowswap-frontend-e2e-pw/src/fixtures/shared.ts`
- Delete: `apps/cowswap-frontend-e2e-pw/src/mocks/cowOrderApi.ts`
- Delete: `apps/cowswap-frontend-e2e-pw/src/mocks/bff.ts`
- Modify: `apps/cowswap-frontend-e2e-pw/src/tests/market-orders.spec.ts`
- Modify: `apps/cowswap-frontend-e2e-pw/src/tests/limit-orders.spec.ts`
- Modify: `apps/cowswap-frontend-e2e-pw/README.md`

**Interfaces:**
- Consumes: `installCowProtocolApi`, `CowProtocolApiMock` from `../mocks/cowProtocolApi`.
- Produces: `SharedFixtures['mocks'].cowApi: CowProtocolApiMock`, available in every spec as `mocks.cowApi`. `mocks.bff` and `mocks.cowOrderApi` no longer exist.

- [ ] **Step 1: Update `shared.ts` imports**

Remove these two lines:

```ts
import { installBff, type BffMock } from '../mocks/bff'
import { installCowOrderApi, type CowOrderApiMock } from '../mocks/cowOrderApi'
```

Add, keeping the existing alphabetical import grouping:

```ts
import { installCowProtocolApi, type CowProtocolApiMock } from '../mocks/cowProtocolApi'
```

- [ ] **Step 2: Update the `SharedFixtures` interface**

Replace the `mocks` block:

```ts
  mocks: {
    cowApi: CowProtocolApiMock
    tokenLists: TokenListsMock
    safeSdk: SafeSdkMock
    bungee: BungeeMock
    nearIntents: NearIntentsMock
  }
```

- [ ] **Step 3: Update the `mocks` fixture**

Replace the whole `mocks` fixture with:

```ts
  mocks: async ({ context }, use) => {
    const cowApi = installCowProtocolApi(context)
    const tokenLists = installTokenLists(context)
    const safeSdk = installSafeSdk(context)
    const bungee = installBungee(context)
    const nearIntents = installNearIntents(context)

    await use({ cowApi, tokenLists, safeSdk, bungee, nearIntents })

    tokenLists.reset()
    bungee.reset()
    nearIntents.reset()
    await safeSdk.disable()
    // Runs last: it throws when the test hit an un-mocked CoW API URL, and the
    // resets above must still happen.
    try {
      cowApi.assertNoUnmatched()
    } finally {
      cowApi.reset()
    }
  },
```

Note the fixture no longer destructures `page` — `installCowProtocolApi` only needs `context`.

- [ ] **Step 4: Delete the superseded mocks**

```bash
git rm apps/cowswap-frontend-e2e-pw/src/mocks/cowOrderApi.ts apps/cowswap-frontend-e2e-pw/src/mocks/bff.ts
```

- [ ] **Step 5: Update the two spec call sites**

In `src/tests/market-orders.spec.ts`, delete line 9 and the blank line after it:

```ts
    mocks.cowOrderApi.expectPostOrderOnce({ status: 'open' })
```

and drop `mocks` from the destructured fixtures on line 8, leaving:

```ts
  test('[MO-01] Sell order: WETH → USDC @smoke', async ({ swapPage, wallet, confirmModal }) => {
```

Apply the same removal in `src/tests/limit-orders.spec.ts` (line 14 and its destructured `mocks`). `open` is the default order status, so nothing replaces the call. Read each file first — line numbers shift once the first edit lands.

- [ ] **Step 6: Typecheck and lint**

```bash
cd apps/cowswap-frontend-e2e-pw && pnpm exec tsc --noEmit -p tsconfig.json
cd ../.. && pnpm nx run cowswap-frontend-e2e-pw:lint
```
Expected: no errors. A `Cannot find module '../mocks/bff'` here means a leftover import — grep for `cowOrderApi` and `mocks/bff` and remove the survivors.

- [ ] **Step 7: Run the smoke suite**

```bash
pnpm e2e:smoke
```
Expected: PASS. If a test fails with the "Un-mocked CoW Protocol API requests were blocked" error, the listed URLs are genuinely missing catalogue entries — add them to `COW_API_ENDPOINTS` (Task 1's file), add a matching `Recording` to `record.ts`, re-run `pnpm e2e:record-mocks`, and re-run the suite. That is the intended workflow, not a plan defect.

- [ ] **Step 8: Update the README**

In the commands table, after the `pnpm e2e:report` row:

```markdown
| `pnpm e2e:record-mocks` | Re-record the CoW Protocol API response fixtures from the live barn API |
```

Add a new section after the "Mock wallet (fast path, no MetaMask)" section:

````markdown
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
  ...defaults,
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

Order and quote fixtures are re-owned and time-shifted per request
(`src/mocks/cowProtocolApi/normalize.ts`) so they don't render as a stranger's
expired orders. The default quote price is a deterministic placeholder derived
from the fixture's ratio — a spec asserting on a specific output amount must
override `quote`.

### Not yet mocked

These still reach the network and are the next round of work:

- `bff.cow.fi` — `usdPrice`, `topHolders`, `simulateBundle`, affiliate endpoints
- `partners.cow.fi` / `partners.barn.cow.fi`
````

- [ ] **Step 9: Commit**

```bash
git add -A apps/cowswap-frontend-e2e-pw && \
git commit -m "test(e2e): route all CoW API traffic through the fixture-backed mock

Replaces the ad-hoc cowOrderApi and bff mocks. bff.ts was misnamed — it stubbed
the orderbook /quote endpoint, never bff.cow.fi, which is now recorded in the
README as the next unmocked surface."
```

---

## Self-Review

**Spec coverage**

| Spec section | Task |
|---|---|
| Module layout | 1, 2, 3 (`normalize.ts`/`resolve.ts` split out of `index.ts` for testability; `networks.ts` split out of `endpoints.ts`) |
| Endpoint catalogue | 1 Step 5 |
| Request context | 1 Step 3 |
| Override API (`set`/`clear`/`allowUnmocked`/`posted`/`reset`, `reply()`) | 1 Step 3, 3 Steps 5 & 7 |
| Lockdown + unmatched teardown failure | 3 Step 7, 4 Step 3 |
| Default realism / `normalizeDefault` | 3 Steps 3 & 4 |
| `version` `text/plain` handling | 1 Step 5 (`contentType`), 3 Step 5 (`serializeBody`) |
| Recorder + nx target + committed fixtures | 2 |
| Fixture integration in `shared.ts` | 4 Steps 1–3 |
| Migration (delete both mocks, update 2 specs) | 4 Steps 4–5 |
| Testing (unit tests + existing specs pass) | 1, 3, 4 Step 7 |
| Documentation (README sections) | 4 Step 8 |

No gaps.

**Type consistency**

- `CowApiEndpointKey` is defined once in `endpoints.ts` and imported by `record.ts`, `resolve.ts` and `index.ts`.
- `resolveResponse` returns `{ status, body, contentType }` in Task 3 Step 5 and is destructured with exactly those names in Step 7.
- `installCowProtocolApi(context)` takes one argument in the interface block, in Step 7's implementation, and at the Task 4 Step 3 call site.
- `assertNoUnmatched()` / `reset()` / `allowUnmocked()` are spelled identically in the interface, the implementation, and `shared.ts`.
- `serializeBody(body, contentType)` is exported from `resolve.ts` and imported in `index.ts`.
- `normalizeOrderList` / `normalizeOrder` / `normalizeTrades` / `normalizeQuote` / `fakeOrderUid` are exported from `normalize.ts` (Step 3) and imported into `endpoints.ts` (Step 4) under those exact names.
