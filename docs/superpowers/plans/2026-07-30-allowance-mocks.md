# e2e Allowance Mocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a Playwright spec declare ERC-20 allowances from a committed JSON file (`owner -> chainId -> token -> raw atoms`), so approve-related UI is deterministic instead of driven by live Sepolia state.

**Architecture:** A new `src/mocks/allowances/` module installs one `context.route` on the exact RPC URLs the app uses. It classifies `eth_call` bodies as a direct `allowance(address,address)` call, a Multicall3 `aggregate3` batch (recursively), or opaque. Fully-mocked bodies are fulfilled locally; mixed batches are fetched upstream and only the mocked result slots are overwritten; anything else passes through. Allowances not declared in the JSON resolve to `0n`.

**Tech Stack:** TypeScript, Playwright `BrowserContext.route`, viem 2.48.8 (`decodeAbiParameters` / `encodeAbiParameters`), `node:test` + `node:assert` for unit tests, tsx as the test runner.

**Spec:** `docs/superpowers/specs/2026-07-30-allowance-mocks-design.md`

## Global Constraints

- All code lives under `apps/cowswap-frontend-e2e-pw/`. **No production app or lib code changes.**
- No new workspace dependencies. `viem` (2.48.8) and `@playwright/test` (1.49.1) are already dependencies of `@cowprotocol/cowswap-e2e-pw`; `tsx` already resolves in that project (used by the `e2e:build-cache` target).
- Unit tests use `node:test` + `node:assert` (`import { strict as assert } from 'node:assert'`, `import { test } from 'node:test'`), matching `src/mocks/cowProtocolApi/resolve.test.ts` and `src/support/rpcProxy.test.ts`. **Do not** introduce jest or vitest here.
- Allowance values are **raw atoms** (base units). No decimals conversion anywhere.
- Addresses are compared lowercased. Chain ids are numbers in code, decimal strings as JSON keys.
- An allowance read not present in fixture or overrides resolves to `0n`. There are no wildcard keys.
- `allowance(owner, spender)` is matched on **owner and token only**; spender is recorded but never part of a lookup key.
- eslint `import/order` groups are `['external', 'builtin', 'internal', 'sibling', 'parent', 'object', 'index', 'type']`, alphabetised, with `viem` in a path group placed *before* other externals, and `import type` last. So: `viem` first, then other externals, then `node:*` builtins, then `./siblings`, then `../parents`, then `import type`.
- Playwright specs are `*.spec.ts` under `src/tests` (`playwright.config.ts` sets `testDir: './src/tests'`). Unit tests are `*.test.ts` elsewhere under `src/`. Never name a unit test `*.spec.ts`.

---

## File Structure

**Created:**

| File | Responsibility |
| --- | --- |
| `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/types.ts` | Shared types + the flat-key helper. No logic. |
| `.../allowances/fixture.ts` | Parse/validate the JSON into a flat `AllowanceLookup`; load the committed file. |
| `.../allowances/resolve.ts` | `overrides → fixture → 0n` lookup, and the "is this owner configured at all" predicate. |
| `.../allowances/codec.ts` | Classify calldata; encode/patch `aggregate3` result blobs. Pure functions, no Playwright. |
| `.../allowances/rpcUrls.ts` | Map the app's per-chain RPC URLs to chain ids from env. |
| `.../allowances/index.ts` | `installAllowances(context)` — the route handler and the `AllowancesMock` surface. |
| `.../allowances/fixtures/allowances.json` | Committed defaults. Ships as `{}`. |
| `.../allowances/fixture.test.ts`, `resolve.test.ts`, `codec.test.ts`, `rpcUrls.test.ts` | Unit tests. |

**Modified:**

| File | Change |
| --- | --- |
| `apps/cowswap-frontend-e2e-pw/project.json` | Add a `test` target so `*.test.ts` files actually run. |
| `apps/cowswap-frontend-e2e-pw/src/fixtures/shared.ts:16-83` | Add `allowances` to `SharedFixtures['mocks']`, install it, report + reset at teardown. |
| `apps/cowswap-frontend-e2e-pw/README.md` | "Token allowances" section + commands-table row. |

Split rationale: `codec.ts` is the only part with real algorithmic risk (ABI encoding, recursion, slot patching) and is pure — it must be unit-testable without a browser. `fixture.ts`/`resolve.ts` are data-shape concerns. `index.ts` is the only file that touches Playwright. `rpcUrls.ts` is separated because it reads `process.env` and needs tests that manipulate env without dragging in the route handler.

---

## Task 1: Make e2e-pw unit tests runnable

`cowswap-frontend-e2e-pw` has no `test` target and no jest config, so its five existing `node:test` files run nowhere — not `pnpm test`, not `nx run-many -t test`, not CI. Every later task in this plan is TDD, so this must land first.

**Files:**
- Modify: `apps/cowswap-frontend-e2e-pw/project.json` (add a `test` target after the existing `lint` target)

**Interfaces:**
- Consumes: nothing.
- Produces: the command `pnpm nx test cowswap-frontend-e2e-pw`, used by every later task to run unit tests. Equivalent direct form (faster while iterating): `cd apps/cowswap-frontend-e2e-pw && pnpm exec tsx --test 'src/**/*.test.ts'`.

- [ ] **Step 1: Confirm the gap is real**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2
grep -c '"test"' apps/cowswap-frontend-e2e-pw/project.json || echo "no test target"
ls apps/cowswap-frontend-e2e-pw/jest.config.ts 2>/dev/null || echo "no jest config"
```

Expected: `no test target` and `no jest config`.

- [ ] **Step 2: Add the `test` target**

In `apps/cowswap-frontend-e2e-pw/project.json`, inside `"targets"`, add this entry (keep the existing `lint` entry; JSON needs a comma between them):

```json
    "test": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "apps/cowswap-frontend-e2e-pw",
        "command": "tsx --test \"src/**/*.test.ts\""
      }
    }
```

Note the glob is quoted so **node** expands it, not the shell. It matches `*.test.ts` anywhere under `src/`, and cannot pick up the Playwright specs (those are `*.spec.ts`).

- [ ] **Step 3: Run it and record what the five pre-existing files do**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2
pnpm nx test cowswap-frontend-e2e-pw
```

Expected: the runner discovers `src/mocks/cowProtocolApi/endpoints.test.ts`, `.../resolve.test.ts`, `.../install.test.ts`, `src/mockWallet/walletEngine.test.ts`, `src/support/rpcProxy.test.ts`.

**If any of them fail:** do not fix them here and do not narrow the glob to hide them. Record the failing file and the assertion message in the task report and continue — they are a pre-existing finding, surfaced by this change, and the user decides what to do about them. `rpcProxy.test.ts` is the likeliest to need network or a free port; if it fails for an environmental reason, say which.

- [ ] **Step 4: Commit**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2
git add apps/cowswap-frontend-e2e-pw/project.json
git commit -m "test(e2e): add a test target so e2e-pw unit tests actually run"
```

---

## Task 2: Fixture parsing and resolution

**Files:**
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/types.ts`
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/fixture.ts`
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/resolve.ts`
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/fixtures/allowances.json`
- Test: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/fixture.test.ts`
- Test: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/resolve.test.ts`

**Interfaces:**
- Consumes: the `test` target from Task 1.
- Produces, from `types.ts`:
  - `type AllowanceLookup = Map<string, bigint>`
  - `function allowanceKey(owner: string, chainId: number, token: string): string`
  - `interface AllowanceRead { chainId: number; owner: string; spender: string; token: string; value: bigint }`
  - `type AllowanceValue = string | number | bigint`
- Produces, from `fixture.ts`:
  - `function parseAllowancesFixture(raw: unknown, source: string): AllowanceLookup`
  - `function parseAllowanceValue(raw: unknown, where: string): bigint`
  - `function loadAllowancesFixture(): AllowanceLookup`
- Produces, from `resolve.ts`:
  - `function resolveAllowance(fixture: AllowanceLookup, overrides: AllowanceLookup, owner: string, chainId: number, token: string): bigint`
  - `function isOwnerConfigured(fixture: AllowanceLookup, overrides: AllowanceLookup, owner: string): boolean`
  - `function hasAnyEntry(fixture: AllowanceLookup, overrides: AllowanceLookup): boolean`

- [ ] **Step 1: Write `types.ts`**

This file is types plus one trivial helper, so it needs no test of its own — `allowanceKey` is exercised by every test in this task.

```ts
/** A value as it may appear in the JSON fixture or a `set()` call. Always raw atoms. */
export type AllowanceValue = string | number | bigint

/**
 * Flat allowance lookup keyed by `${owner}|${chainId}|${token}`, addresses lowercased.
 *
 * Flat rather than nested so that overrides are a second map of the same shape:
 * "override wins, else fixture, else 0" is then a two-line lookup, and merging a
 * single token into an owner/chain needs no nested-object cloning.
 */
export type AllowanceLookup = Map<string, bigint>

export function allowanceKey(owner: string, chainId: number, token: string): string {
  return `${owner.toLowerCase()}|${chainId}|${token.toLowerCase()}`
}

/** Prefix of every key belonging to `owner`, for owner-level scans. */
export function ownerKeyPrefix(owner: string): string {
  return `${owner.toLowerCase()}|`
}

/** One allowance read observed on the wire, exposed via `mocks.allowances.reads()`. */
export interface AllowanceRead {
  chainId: number
  owner: string
  spender: string
  token: string
  value: bigint
}
```

- [ ] **Step 2: Write the failing tests for `fixture.ts`**

Create `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/fixture.test.ts`:

```ts
import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { parseAllowanceValue, parseAllowancesFixture } from './fixture'
import { allowanceKey } from './types'

const OWNER = '0x1111111111111111111111111111111111111111'
const TOKEN = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'

test('flattens owner -> chain -> token into a keyed map', () => {
  const lookup = parseAllowancesFixture({ [OWNER]: { '11155111': { [TOKEN]: '5000000' } } }, 'test')

  assert.equal(lookup.get(allowanceKey(OWNER, 11155111, TOKEN)), 5000000n)
  assert.equal(lookup.size, 1)
})

test('lowercases owner and token keys', () => {
  const lookup = parseAllowancesFixture(
    { [OWNER.toUpperCase().replace('0X', '0x')]: { '100': { [TOKEN.toUpperCase().replace('0X', '0x')]: '1' } } },
    'test',
  )

  assert.equal(lookup.get(allowanceKey(OWNER, 100, TOKEN)), 1n)
})

test('accepts a safe-integer number', () => {
  const lookup = parseAllowancesFixture({ [OWNER]: { '1': { [TOKEN]: 10000 } } }, 'test')

  assert.equal(lookup.get(allowanceKey(OWNER, 1, TOKEN)), 10000n)
})

test('an empty object is a valid fixture', () => {
  assert.equal(parseAllowancesFixture({}, 'test').size, 0)
})

test('rejects a number that is not a safe integer, naming the path', () => {
  assert.throws(
    () => parseAllowancesFixture({ [OWNER]: { '1': { [TOKEN]: 1e21 } } }, 'test'),
    (error: Error) => {
      assert.match(error.message, /test/)
      assert.match(error.message, /safe integer/)
      assert.match(error.message, new RegExp(TOKEN))
      return true
    },
  )
})

test('rejects a negative value', () => {
  assert.throws(() => parseAllowancesFixture({ [OWNER]: { '1': { [TOKEN]: '-1' } } }, 'test'), /negative/i)
})

test('rejects a non-integer decimal string', () => {
  assert.throws(() => parseAllowancesFixture({ [OWNER]: { '1': { [TOKEN]: '1.5' } } }, 'test'), /raw atoms/i)
})

test('rejects a malformed owner address', () => {
  assert.throws(() => parseAllowancesFixture({ nope: { '1': { [TOKEN]: '1' } } }, 'test'), /owner address/i)
})

test('rejects a malformed token address', () => {
  assert.throws(() => parseAllowancesFixture({ [OWNER]: { '1': { wat: '1' } } }, 'test'), /token address/i)
})

test('rejects a non-numeric chain key', () => {
  assert.throws(() => parseAllowancesFixture({ [OWNER]: { mainnet: { [TOKEN]: '1' } } }, 'test'), /chain id/i)
})

test('rejects a non-object fixture', () => {
  assert.throws(() => parseAllowancesFixture([], 'test'), /object/i)
})

test('parseAllowanceValue accepts bigint and decimal string', () => {
  assert.equal(parseAllowanceValue(7n, 'x'), 7n)
  assert.equal(parseAllowanceValue('7', 'x'), 7n)
})
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec tsx --test src/mocks/allowances/fixture.test.ts
```

Expected: FAIL — cannot resolve `./fixture`.

- [ ] **Step 4: Write `fixture.ts`**

```ts
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { allowanceKey, type AllowanceLookup, type AllowanceValue } from './types'

const FIXTURE_FILE = path.join(__dirname, 'fixtures', 'allowances.json')
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/
const DECIMAL_RE = /^\d+$/

/**
 * Parse a raw-atom allowance value.
 *
 * A JSON number is only accepted when it is a safe integer: `JSON.parse` silently
 * rounds anything larger, so a raw-atom value like 1000000000000000000 must be
 * written as a string to survive the round trip.
 */
export function parseAllowanceValue(raw: unknown, where: string): bigint {
  if (typeof raw === 'bigint') {
    if (raw < 0n) throw new Error(`${where}: allowance is negative`)
    return raw
  }

  if (typeof raw === 'number') {
    if (!Number.isSafeInteger(raw)) {
      throw new Error(
        `${where}: ${raw} is not a safe integer — write large raw-atom values as strings, e.g. "1000000000000000000"`,
      )
    }
    if (raw < 0) throw new Error(`${where}: allowance is negative`)
    return BigInt(raw)
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('-')) throw new Error(`${where}: allowance is negative`)
    if (!DECIMAL_RE.test(trimmed)) {
      throw new Error(`${where}: "${raw}" is not a decimal integer — values are raw atoms, with no decimal point`)
    }
    return BigInt(trimmed)
  }

  throw new Error(`${where}: expected a decimal string or a safe integer, got ${typeof raw}`)
}

/** Flatten `owner -> chainId -> token -> raw atoms` into a keyed lookup, validating as it goes. */
export function parseAllowancesFixture(raw: unknown, source: string): AllowanceLookup {
  const lookup: AllowanceLookup = new Map()

  for (const [owner, byChain] of entriesOf(raw, `${source}: fixture`, 'fixture')) {
    if (!ADDRESS_RE.test(owner)) {
      throw new Error(`${source}: "${owner}" is not a valid owner address`)
    }

    for (const [chainKey, byToken] of entriesOf(byChain, `${source}["${owner}"]`, 'owner entry')) {
      if (!DECIMAL_RE.test(chainKey)) {
        throw new Error(`${source}["${owner}"]: "${chainKey}" is not a valid chain id`)
      }
      const chainId = Number(chainKey)

      for (const [token, value] of entriesOf(byToken, `${source}["${owner}"]["${chainKey}"]`, 'chain entry')) {
        if (!ADDRESS_RE.test(token)) {
          throw new Error(`${source}["${owner}"]["${chainKey}"]: "${token}" is not a valid token address`)
        }
        const where = `${source}["${owner}"]["${chainKey}"]["${token}"]`
        lookup.set(allowanceKey(owner, chainId, token), parseAllowanceValue(value as AllowanceValue, where))
      }
    }
  }

  return lookup
}

export function loadAllowancesFixture(): AllowanceLookup {
  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(FIXTURE_FILE, 'utf8')) as unknown
  } catch (error) {
    throw new Error(`Missing or invalid allowances fixture at ${FIXTURE_FILE}: ${String(error)}`)
  }
  return parseAllowancesFixture(raw, 'allowances.json')
}

function entriesOf(value: unknown, where: string, what: string): Array<[string, unknown]> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${where}: expected ${what} to be a JSON object`)
  }
  return Object.entries(value as Record<string, unknown>)
}
```

- [ ] **Step 5: Create the committed fixture**

`apps/cowswap-frontend-e2e-pw/src/mocks/allowances/fixtures/allowances.json`:

```json
{}
```

It ships empty on purpose: with nothing configured every allowance is `0n`, which is the deterministic default the spec calls for. A placeholder owner would make the lookup non-empty and trip the unknown-owner warning (Task 5) on every run for no gain. The shape is documented in the README (Task 5).

- [ ] **Step 6: Run the fixture tests to verify they pass**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec tsx --test src/mocks/allowances/fixture.test.ts
```

Expected: PASS, 12 tests.

- [ ] **Step 7: Write the failing tests for `resolve.ts`**

Create `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/resolve.test.ts`:

```ts
import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { hasAnyEntry, isOwnerConfigured, resolveAllowance } from './resolve'
import { allowanceKey, type AllowanceLookup } from './types'

const OWNER = '0x1111111111111111111111111111111111111111'
const OTHER = '0x2222222222222222222222222222222222222222'
const TOKEN = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'
const OTHER_TOKEN = '0x0625afb445c3b6b7b929342a04a22599fd5dbb59'
const CHAIN = 11155111

function lookupOf(entries: Array<[string, bigint]>): AllowanceLookup {
  return new Map(entries)
}

const EMPTY: AllowanceLookup = new Map()

test('returns the fixture value', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 5000000n]])

  assert.equal(resolveAllowance(fixture, EMPTY, OWNER, CHAIN, TOKEN), 5000000n)
})

test('matches regardless of address case', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 42n]])

  assert.equal(resolveAllowance(fixture, EMPTY, OWNER.toUpperCase(), CHAIN, TOKEN.toUpperCase()), 42n)
})

test('an override wins over the fixture', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 5000000n]])
  const overrides = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 0n]])

  assert.equal(resolveAllowance(fixture, overrides, OWNER, CHAIN, TOKEN), 0n)
})

test('an unlisted token resolves to 0', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 5000000n]])

  assert.equal(resolveAllowance(fixture, EMPTY, OWNER, CHAIN, OTHER_TOKEN), 0n)
})

test('an unlisted chain resolves to 0', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 5000000n]])

  assert.equal(resolveAllowance(fixture, EMPTY, OWNER, 100, TOKEN), 0n)
})

test('an unlisted owner resolves to 0', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 5000000n]])

  assert.equal(resolveAllowance(fixture, EMPTY, OTHER, CHAIN, TOKEN), 0n)
})

test('isOwnerConfigured sees owners from either map', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 1n]])
  const overrides = lookupOf([[allowanceKey(OTHER, CHAIN, TOKEN), 1n]])

  assert.equal(isOwnerConfigured(fixture, overrides, OWNER), true)
  assert.equal(isOwnerConfigured(fixture, overrides, OTHER.toUpperCase()), true)
  assert.equal(isOwnerConfigured(fixture, overrides, '0x3333333333333333333333333333333333333333'), false)
})

test('hasAnyEntry is false only when both maps are empty', () => {
  assert.equal(hasAnyEntry(EMPTY, EMPTY), false)
  assert.equal(hasAnyEntry(lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 0n]]), EMPTY), true)
  assert.equal(hasAnyEntry(EMPTY, lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 0n]])), true)
})
```

- [ ] **Step 8: Run the tests to verify they fail**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec tsx --test src/mocks/allowances/resolve.test.ts
```

Expected: FAIL — cannot resolve `./resolve`.

- [ ] **Step 9: Write `resolve.ts`**

```ts
import { allowanceKey, ownerKeyPrefix, type AllowanceLookup } from './types'

/**
 * Override wins, else the fixture, else 0.
 *
 * Defaulting to 0 rather than forwarding to the real node is what makes a spec
 * deterministic before it configures anything: a token nobody declared reads as
 * "needs approval" instead of as whatever the shared test account happens to hold.
 */
export function resolveAllowance(
  fixture: AllowanceLookup,
  overrides: AllowanceLookup,
  owner: string,
  chainId: number,
  token: string,
): bigint {
  const key = allowanceKey(owner, chainId, token)
  return overrides.get(key) ?? fixture.get(key) ?? 0n
}

/** Whether any entry at all exists for `owner`, on any chain, for any token. */
export function isOwnerConfigured(fixture: AllowanceLookup, overrides: AllowanceLookup, owner: string): boolean {
  const prefix = ownerKeyPrefix(owner)
  return hasKeyWithPrefix(overrides, prefix) || hasKeyWithPrefix(fixture, prefix)
}

export function hasAnyEntry(fixture: AllowanceLookup, overrides: AllowanceLookup): boolean {
  return fixture.size > 0 || overrides.size > 0
}

function hasKeyWithPrefix(lookup: AllowanceLookup, prefix: string): boolean {
  for (const key of lookup.keys()) {
    if (key.startsWith(prefix)) return true
  }
  return false
}
```

- [ ] **Step 10: Run the tests to verify they pass**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec tsx --test src/mocks/allowances/resolve.test.ts
```

Expected: PASS, 8 tests.

- [ ] **Step 11: Lint and commit**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2
pnpm nx lint cowswap-frontend-e2e-pw
git add apps/cowswap-frontend-e2e-pw/src/mocks/allowances
git commit -m "test(e2e): parse and resolve allowance fixtures"
```

---

## Task 3: Calldata codec

The only algorithmically risky part: recognising allowance calls inside Multicall3 batches and patching result blobs without disturbing the slots the mock does not own.

**Files:**
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/codec.ts`
- Test: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/codec.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure module — deliberately independent of `AllowanceLookup` so it can be tested with a stub resolver).
- Produces:
  - `const ALLOWANCE_SELECTOR = '0xdd62ed3e'`, `const AGGREGATE3_SELECTOR = '0x82ad56cb'`
  - `interface AllowanceCall { kind: 'allowance'; token: string; owner: string; spender: string }`
  - `interface BatchCall { kind: 'batch'; calls: ClassifiedCall[] }`
  - `interface OpaqueCall { kind: 'opaque' }`
  - `type ClassifiedCall = AllowanceCall | BatchCall | OpaqueCall`
  - `function classifyCall(to: string, data: string): ClassifiedCall`
  - `function isFullyMocked(call: ClassifiedCall): boolean`
  - `function collectAllowanceCalls(call: ClassifiedCall): AllowanceCall[]`
  - `function encodeAllowanceResult(value: bigint): Hex`
  - `type ResolveAllowanceCall = (call: AllowanceCall) => bigint`
  - `function resolveBatchResult(call: BatchCall, resolve: ResolveAllowanceCall, upstream?: Hex): Hex`

- [ ] **Step 1: Write the failing tests**

Create `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/codec.test.ts`:

```ts
import { decodeAbiParameters, encodeAbiParameters, encodeFunctionData, erc20Abi, type Hex } from 'viem'

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import {
  AGGREGATE3_SELECTOR,
  classifyCall,
  collectAllowanceCalls,
  encodeAllowanceResult,
  isFullyMocked,
  resolveBatchResult,
  type AllowanceCall,
  type BatchCall,
} from './codec'

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'
const OWNER = '0x1111111111111111111111111111111111111111'
const SPENDER = '0x2222222222222222222222222222222222222222'
const TOKEN_A = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'
const TOKEN_B = '0x0625afb445c3b6b7b929342a04a22599fd5dbb59'

const CALL3_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'target', type: 'address' },
      { name: 'allowFailure', type: 'bool' },
      { name: 'callData', type: 'bytes' },
    ],
  },
] as const

const RESULT_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'success', type: 'bool' },
      { name: 'returnData', type: 'bytes' },
    ],
  },
] as const

function allowanceCalldata(owner: string, spender: string): Hex {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner as Hex, spender as Hex],
  })
}

function balanceOfCalldata(owner: string): Hex {
  return encodeFunctionData({ abi: erc20Abi, functionName: 'balanceOf', args: [owner as Hex] })
}

function aggregate3Calldata(calls: Array<{ target: string; callData: Hex }>): Hex {
  const encoded = encodeAbiParameters(CALL3_TUPLE, [
    calls.map((c) => ({ target: c.target as Hex, allowFailure: true, callData: c.callData })),
  ])
  return `${AGGREGATE3_SELECTOR}${encoded.slice(2)}` as Hex
}

function decodeResults(blob: Hex): ReadonlyArray<{ success: boolean; returnData: Hex }> {
  return decodeAbiParameters(RESULT_TUPLE, blob)[0] as ReadonlyArray<{ success: boolean; returnData: Hex }>
}

const resolveTo = (value: bigint) => () => value

test('classifies a direct allowance call', () => {
  const call = classifyCall(TOKEN_A, allowanceCalldata(OWNER, SPENDER))

  assert.deepEqual(call, {
    kind: 'allowance',
    token: TOKEN_A.toLowerCase(),
    owner: OWNER.toLowerCase(),
    spender: SPENDER.toLowerCase(),
  })
})

test('classifies a non-allowance call as opaque', () => {
  assert.deepEqual(classifyCall(TOKEN_A, balanceOfCalldata(OWNER)), { kind: 'opaque' })
})

test('classifies empty and truncated calldata as opaque', () => {
  assert.deepEqual(classifyCall(TOKEN_A, '0x'), { kind: 'opaque' })
  assert.deepEqual(classifyCall(TOKEN_A, '0xdd62ed3e'), { kind: 'opaque' })
})

test('classifies an aggregate3 batch, keeping call order', () => {
  const data = aggregate3Calldata([
    { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
    { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
  ])

  const call = classifyCall(MULTICALL3, data) as BatchCall

  assert.equal(call.kind, 'batch')
  assert.equal(call.calls.length, 2)
  assert.equal(call.calls[0].kind, 'allowance')
  assert.equal((call.calls[0] as AllowanceCall).token, TOKEN_A.toLowerCase())
  assert.equal(call.calls[1].kind, 'opaque')
})

test('classifies a batch by selector regardless of the target address', () => {
  const data = aggregate3Calldata([{ target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) }])

  assert.equal(classifyCall('0x9999999999999999999999999999999999999999', data).kind, 'batch')
})

test('classifies a nested aggregate3 recursively', () => {
  const inner = aggregate3Calldata([{ target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) }])
  const outer = aggregate3Calldata([{ target: MULTICALL3, callData: inner }])

  const call = classifyCall(MULTICALL3, outer) as BatchCall
  const nested = call.calls[0] as BatchCall

  assert.equal(nested.kind, 'batch')
  assert.equal(nested.calls[0].kind, 'allowance')
})

test('classifies malformed aggregate3 calldata as opaque instead of throwing', () => {
  assert.deepEqual(classifyCall(MULTICALL3, `${AGGREGATE3_SELECTOR}deadbeef` as Hex), { kind: 'opaque' })
})

test('isFullyMocked is true only when every leaf is an allowance call', () => {
  const allAllowances = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
      { target: TOKEN_B, callData: allowanceCalldata(OWNER, SPENDER) },
    ]),
  )
  const mixed = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
      { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
    ]),
  )

  assert.equal(isFullyMocked(allAllowances), true)
  assert.equal(isFullyMocked(mixed), false)
  assert.equal(isFullyMocked({ kind: 'opaque' }), false)
  assert.equal(isFullyMocked(classifyCall(TOKEN_A, allowanceCalldata(OWNER, SPENDER))), true)
})

test('an empty batch is fully mocked and encodes an empty result array', () => {
  const call = classifyCall(MULTICALL3, aggregate3Calldata([])) as BatchCall

  assert.equal(isFullyMocked(call), true)
  assert.equal(decodeResults(resolveBatchResult(call, resolveTo(1n))).length, 0)
})

test('collectAllowanceCalls flattens nested batches in order', () => {
  const inner = aggregate3Calldata([{ target: TOKEN_B, callData: allowanceCalldata(OWNER, SPENDER) }])
  const outer = aggregate3Calldata([
    { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
    { target: MULTICALL3, callData: inner },
  ])

  const tokens = collectAllowanceCalls(classifyCall(MULTICALL3, outer)).map((c) => c.token)

  assert.deepEqual(tokens, [TOKEN_A.toLowerCase(), TOKEN_B.toLowerCase()])
})

test('encodeAllowanceResult produces a 32-byte uint256', () => {
  const encoded = encodeAllowanceResult(5000000n)

  assert.equal(encoded.length, 66)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], encoded)[0], 5000000n)
})

test('resolveBatchResult fills every slot when the batch is fully mocked', () => {
  const call = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
      { target: TOKEN_B, callData: allowanceCalldata(OWNER, SPENDER) },
    ]),
  ) as BatchCall

  const results = decodeResults(resolveBatchResult(call, (c) => (c.token === TOKEN_A.toLowerCase() ? 7n : 9n)))

  assert.equal(results.length, 2)
  assert.equal(results[0].success, true)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[0].returnData)[0], 7n)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 9n)
})

test('resolveBatchResult overwrites only mocked slots and preserves upstream ones', () => {
  const call = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
      { target: TOKEN_B, callData: balanceOfCalldata(SPENDER) },
    ]),
  ) as BatchCall

  const upstreamBalance = encodeAllowanceResult(123n)
  const upstream = encodeAbiParameters(RESULT_TUPLE, [
    [
      { success: true, returnData: upstreamBalance },
      { success: false, returnData: '0x' as Hex },
      { success: true, returnData: '0x' as Hex },
    ],
  ])

  const results = decodeResults(resolveBatchResult(call, resolveTo(555n), upstream))

  assert.equal(results.length, 3)
  assert.equal(results[0].returnData, upstreamBalance)
  assert.equal(results[0].success, true)
  assert.equal(results[1].success, true)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 555n)
  assert.equal(results[2].success, true)
  assert.equal(results[2].returnData, '0x')
})

test('resolveBatchResult patches inside a nested batch', () => {
  const inner = aggregate3Calldata([
    { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
    { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
  ])
  const call = classifyCall(MULTICALL3, aggregate3Calldata([{ target: MULTICALL3, callData: inner }])) as BatchCall

  const innerUpstream = encodeAbiParameters(RESULT_TUPLE, [
    [
      { success: true, returnData: encodeAllowanceResult(1n) },
      { success: false, returnData: '0x' as Hex },
    ],
  ])
  const upstream = encodeAbiParameters(RESULT_TUPLE, [[{ success: true, returnData: innerUpstream }]])

  const outerResults = decodeResults(resolveBatchResult(call, resolveTo(42n), upstream))
  const innerResults = decodeResults(outerResults[0].returnData)

  assert.equal(decodeAbiParameters([{ type: 'uint256' }], innerResults[0].returnData)[0], 1n)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], innerResults[1].returnData)[0], 42n)
})

test('resolveBatchResult tolerates an upstream blob it cannot decode', () => {
  const call = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
    ]),
  ) as BatchCall

  const results = decodeResults(resolveBatchResult(call, resolveTo(8n), '0xdeadbeef'))

  assert.equal(results.length, 2)
  assert.equal(results[0].success, false)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 8n)
})

test('resolveBatchResult tolerates an upstream blob with too few slots', () => {
  const call = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
    ]),
  ) as BatchCall

  const upstream = encodeAbiParameters(RESULT_TUPLE, [[{ success: true, returnData: '0x' as Hex }]])
  const results = decodeResults(resolveBatchResult(call, resolveTo(8n), upstream))

  assert.equal(results.length, 2)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 8n)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec tsx --test src/mocks/allowances/codec.test.ts
```

Expected: FAIL — cannot resolve `./codec`.

- [ ] **Step 3: Write `codec.ts`**

```ts
import { decodeAbiParameters, encodeAbiParameters, type Hex } from 'viem'

/** `allowance(address,address)` */
export const ALLOWANCE_SELECTOR = '0xdd62ed3e'
/** `aggregate3((address,bool,bytes)[])` on Multicall3 */
export const AGGREGATE3_SELECTOR = '0x82ad56cb'

const CALL3_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'target', type: 'address' },
      { name: 'allowFailure', type: 'bool' },
      { name: 'callData', type: 'bytes' },
    ],
  },
] as const

const RESULT_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'success', type: 'bool' },
      { name: 'returnData', type: 'bytes' },
    ],
  },
] as const

const UINT256 = [{ type: 'uint256' }] as const

const ADDRESS_PAIR = [{ type: 'address' }, { type: 'address' }] as const

export interface AllowanceCall {
  kind: 'allowance'
  token: string
  owner: string
  spender: string
}

export interface BatchCall {
  kind: 'batch'
  calls: ClassifiedCall[]
}

export interface OpaqueCall {
  kind: 'opaque'
}

export type ClassifiedCall = AllowanceCall | BatchCall | OpaqueCall

export type ResolveAllowanceCall = (call: AllowanceCall) => bigint

interface BatchResultSlot {
  success: boolean
  returnData: Hex
}

const OPAQUE: OpaqueCall = { kind: 'opaque' }

/**
 * Classify one `eth_call` by its calldata.
 *
 * Keyed on the selector, not on `to`: calldata that decodes as `aggregate3` is a
 * batch whatever it is addressed to, and not checking `to` avoids carrying a
 * chainId -> Multicall3-address table for no benefit.
 */
export function classifyCall(to: string, data: string): ClassifiedCall {
  const selector = data.slice(0, 10).toLowerCase()
  const payload = `0x${data.slice(10)}` as Hex

  if (selector === ALLOWANCE_SELECTOR) return classifyAllowance(to, payload)
  if (selector === AGGREGATE3_SELECTOR) return classifyBatch(payload)
  return OPAQUE
}

/** True when every leaf of `call` is an allowance call, so no upstream read is needed. */
export function isFullyMocked(call: ClassifiedCall): boolean {
  if (call.kind === 'allowance') return true
  if (call.kind === 'opaque') return false
  return call.calls.every(isFullyMocked)
}

/** Every allowance leaf, in wire order, flattening nested batches. */
export function collectAllowanceCalls(call: ClassifiedCall): AllowanceCall[] {
  if (call.kind === 'allowance') return [call]
  if (call.kind === 'opaque') return []
  return call.calls.flatMap(collectAllowanceCalls)
}

export function encodeAllowanceResult(value: bigint): Hex {
  return encodeAbiParameters(UINT256, [value])
}

/**
 * Build the `Result[]` blob for a batch.
 *
 * With `upstream`, its slots are the base and only mocked slots are overwritten —
 * that is what keeps a mixed batch's arity and ordering correct without
 * re-encoding a filtered request. Without it (a fully-mocked batch), unmocked
 * slots would not exist, so the base is an empty failure slot.
 *
 * A mocked slot is always written as `success: true`, so a fixture token that was
 * never deployed upstream resolves cleanly instead of surfacing the revert.
 */
export function resolveBatchResult(call: BatchCall, resolve: ResolveAllowanceCall, upstream?: Hex): Hex {
  const base = upstream ? decodeResultSlots(upstream) : []

  const slots = call.calls.map((inner, index) => {
    const fallback = base[index] ?? { success: false, returnData: '0x' as Hex }

    if (inner.kind === 'allowance') {
      return { success: true, returnData: encodeAllowanceResult(resolve(inner)) }
    }
    if (inner.kind === 'batch') {
      const nestedUpstream = fallback.success ? fallback.returnData : undefined
      return { success: true, returnData: resolveBatchResult(inner, resolve, nestedUpstream) }
    }
    return fallback
  })

  return encodeAbiParameters(RESULT_TUPLE, [slots])
}

function classifyAllowance(to: string, payload: Hex): ClassifiedCall {
  try {
    const [owner, spender] = decodeAbiParameters(ADDRESS_PAIR, payload)
    return {
      kind: 'allowance',
      token: to.toLowerCase(),
      owner: owner.toLowerCase(),
      spender: spender.toLowerCase(),
    }
  } catch {
    return OPAQUE
  }
}

function classifyBatch(payload: Hex): ClassifiedCall {
  try {
    const [calls] = decodeAbiParameters(CALL3_TUPLE, payload)
    return {
      kind: 'batch',
      calls: (calls as ReadonlyArray<{ target: string; callData: string }>).map((c) =>
        classifyCall(c.target, c.callData),
      ),
    }
  } catch {
    // Undecodable calldata is not something to guess at — forward it untouched.
    return OPAQUE
  }
}

function decodeResultSlots(blob: Hex): BatchResultSlot[] {
  try {
    return [...(decodeAbiParameters(RESULT_TUPLE, blob)[0] as ReadonlyArray<BatchResultSlot>)]
  } catch {
    // An upstream error body or a truncated blob must not lose the mocked slots.
    return []
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec tsx --test src/mocks/allowances/codec.test.ts
```

Expected: PASS, 17 tests.

- [ ] **Step 5: Verify the two selectors are right**

The tests build calldata with viem's `encodeFunctionData` and `AGGREGATE3_SELECTOR`, so a wrong `ALLOWANCE_SELECTOR` constant would fail `classifies a direct allowance call`, but a wrong `AGGREGATE3_SELECTOR` would be self-consistent and still pass. Check it independently:

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec tsx -e "import {toFunctionSelector} from 'viem'; console.log(toFunctionSelector('function aggregate3((address target, bool allowFailure, bytes callData)[] calls)')); console.log(toFunctionSelector('function allowance(address owner, address spender)'))"
```

Expected: `0x82ad56cb` then `0xdd62ed3e`. If either differs, fix the constant in `codec.ts` and re-run Step 4.

- [ ] **Step 6: Lint and commit**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2
pnpm nx lint cowswap-frontend-e2e-pw
git add apps/cowswap-frontend-e2e-pw/src/mocks/allowances
git commit -m "test(e2e): decode allowance and aggregate3 calldata"
```

---

## Task 4: RPC URL map

**Files:**
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/rpcUrls.ts`
- Test: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/rpcUrls.test.ts`

**Interfaces:**
- Consumes: `CHAIN_IDS` from `../../support/constants` (`{ MAINNET: 1, GNOSIS: 100, BNB: 56, ARBITRUM: 42161, BASE: 8453, SEPOLIA: 11155111 }`).
- Produces:
  - `function normalizeRpcUrl(url: string): string`
  - `function resolveRpcChainIds(env?: NodeJS.ProcessEnv): Map<string, number>` — normalized URL → chain id
  - `function unconfiguredChainIds(env?: NodeJS.ProcessEnv): number[]`

Why a separate file: it reads `process.env`, and its tests need to pass an env object rather than mutate the real one. Keeping it out of `index.ts` means no Playwright import in those tests.

- [ ] **Step 1: Write the failing tests**

Create `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/rpcUrls.test.ts`:

```ts
import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { normalizeRpcUrl, resolveRpcChainIds, unconfiguredChainIds } from './rpcUrls'

test('maps configured chains to their normalized URL', () => {
  const map = resolveRpcChainIds({
    REACT_APP_NETWORK_URL_11155111: 'https://sepolia.example/v3/key',
    REACT_APP_NETWORK_URL_100: 'https://gnosis.example/rpc',
  })

  assert.equal(map.get('https://sepolia.example/v3/key'), 11155111)
  assert.equal(map.get('https://gnosis.example/rpc'), 100)
  assert.equal(map.size, 2)
})

test('ignores unset and blank env vars', () => {
  const map = resolveRpcChainIds({ REACT_APP_NETWORK_URL_11155111: '  ' })

  assert.equal(map.size, 0)
})

test('ignores an unparseable URL rather than throwing', () => {
  const map = resolveRpcChainIds({ REACT_APP_NETWORK_URL_1: 'not a url' })

  assert.equal(map.size, 0)
})

test('normalizeRpcUrl ignores a trailing slash and preserves the key path', () => {
  assert.equal(normalizeRpcUrl('https://x.example/v3/key/'), normalizeRpcUrl('https://x.example/v3/key'))
  assert.match(normalizeRpcUrl('https://x.example/v3/key'), /v3\/key$/)
})

test('normalizeRpcUrl keeps the query string', () => {
  assert.notEqual(normalizeRpcUrl('https://x.example/rpc?k=1'), normalizeRpcUrl('https://x.example/rpc'))
})

test('unconfiguredChainIds lists the chains with no env var', () => {
  const missing = unconfiguredChainIds({ REACT_APP_NETWORK_URL_11155111: 'https://sepolia.example' })

  assert.equal(missing.includes(11155111), false)
  assert.equal(missing.includes(1), true)
  assert.equal(missing.includes(100), true)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec tsx --test src/mocks/allowances/rpcUrls.test.ts
```

Expected: FAIL — cannot resolve `./rpcUrls`.

- [ ] **Step 3: Write `rpcUrls.ts`**

```ts
import { CHAIN_IDS } from '../../support/constants'

/**
 * Compare RPC URLs by origin + path + query, ignoring a trailing slash.
 *
 * The path and query matter: providers put the API key in one or the other
 * (`.../v3/<key>`, `?apikey=<key>`), so comparing origins alone would match the
 * wrong endpoint.
 */
export function normalizeRpcUrl(url: string): string {
  const parsed = new URL(url)
  return `${parsed.origin}${parsed.pathname}${parsed.search}`.replace(/\/$/, '')
}

/**
 * Normalized RPC URL -> chain id, for the chains the app has an override for.
 *
 * Mirrors how the app resolves its transports: `RPC_URLS[chainId]` in
 * `libs/common-const/src/networks.ts` prefers `REACT_APP_NETWORK_URL_<chainId>`.
 * A chain with no override falls back to a public/Infura default in the app, which
 * this mock deliberately does not intercept — see `unconfiguredChainIds`.
 */
export function resolveRpcChainIds(env: NodeJS.ProcessEnv = process.env): Map<string, number> {
  const map = new Map<string, number>()

  for (const chainId of Object.values(CHAIN_IDS)) {
    const raw = env[`REACT_APP_NETWORK_URL_${chainId}`]?.trim()
    if (!raw) continue

    try {
      map.set(normalizeRpcUrl(raw), chainId)
    } catch {
      // A malformed env value is the app's problem, not the mock's — skip it.
    }
  }

  return map
}

/** Chains from `CHAIN_IDS` with no RPC override, and so not intercepted. */
export function unconfiguredChainIds(env: NodeJS.ProcessEnv = process.env): number[] {
  const configured = new Set(resolveRpcChainIds(env).values())
  return Object.values(CHAIN_IDS).filter((chainId) => !configured.has(chainId))
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec tsx --test src/mocks/allowances/rpcUrls.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Lint and commit**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2
pnpm nx lint cowswap-frontend-e2e-pw
git add apps/cowswap-frontend-e2e-pw/src/mocks/allowances
git commit -m "test(e2e): map app RPC urls to chain ids for the allowance mock"
```

---

## Task 5: Install the route, wire the fixture, document it

**Files:**
- Create: `apps/cowswap-frontend-e2e-pw/src/mocks/allowances/index.ts`
- Modify: `apps/cowswap-frontend-e2e-pw/src/fixtures/shared.ts` (lines 1-12 imports, 16-30 `SharedFixtures`, 59-82 the `mocks` fixture)
- Modify: `apps/cowswap-frontend-e2e-pw/README.md` (new section after "CoW Protocol API mocks"; commands table)

**Interfaces:**
- Consumes: `loadAllowancesFixture`, `parseAllowanceValue` (Task 2); `resolveAllowance`, `isOwnerConfigured`, `hasAnyEntry` (Task 2); `classifyCall`, `isFullyMocked`, `collectAllowanceCalls`, `encodeAllowanceResult`, `resolveBatchResult` (Task 3); `resolveRpcChainIds`, `normalizeRpcUrl`, `unconfiguredChainIds` (Task 4); `allowanceKey`, `AllowanceRead`, `AllowanceValue`, `AllowanceLookup` (Task 2).
- Produces:
  - `function installAllowances(context: BrowserContext): AllowancesMock`
  - `interface AllowancesMock { set(owner: string, chainId: number, allowances: Record<string, AllowanceValue>): void; clear(): void; reads(): readonly AllowanceRead[]; reportUnknownOwners(): void; reset(): void }`
  - `mocks.allowances` on the shared Playwright fixture.

- [ ] **Step 1: Write `index.ts`**

There is no unit test for this file: it is the Playwright-facing seam, and every branch it contains is already covered by the `codec`/`resolve`/`rpcUrls` tests. Task 6 verifies it against the real app, which is the only check that means anything here.

```ts
import { type Hex } from 'viem'

import {
  classifyCall,
  collectAllowanceCalls,
  encodeAllowanceResult,
  isFullyMocked,
  resolveBatchResult,
  type AllowanceCall,
  type BatchCall,
  type ClassifiedCall,
} from './codec'
import { loadAllowancesFixture, parseAllowanceValue } from './fixture'
import { hasAnyEntry, isOwnerConfigured, resolveAllowance } from './resolve'
import { normalizeRpcUrl, resolveRpcChainIds, unconfiguredChainIds } from './rpcUrls'
import { allowanceKey, type AllowanceLookup, type AllowanceRead, type AllowanceValue } from './types'

import type { BrowserContext, Route } from '@playwright/test'

export type { AllowanceRead, AllowanceValue }

export interface AllowancesMock {
  /**
   * Merge raw-atom allowances into `(owner, chainId)`, token by token.
   *
   * The supported way to key on `wallet.address`, which is not knowable when the
   * committed fixture is written. Tokens not named keep their fixture value.
   */
  set(owner: string, chainId: number, allowances: Record<string, AllowanceValue>): void
  /** Drop every override, restoring the committed fixture. */
  clear(): void
  /** Every allowance read seen on the wire this test, in order. */
  reads(): readonly AllowanceRead[]
  /** Non-fatal warning about queried-but-unconfigured owners and decode failures. */
  reportUnknownOwners(): void
  reset(): void
}

interface JsonRpcEntry {
  id?: number | string
  method?: string
  params?: unknown[]
}

export function installAllowances(context: BrowserContext): AllowancesMock {
  const fixture = loadAllowancesFixture()
  const overrides: AllowanceLookup = new Map()
  const reads: AllowanceRead[] = []
  const unknownOwners = new Set<string>()
  const problems: string[] = []

  const chainIdByUrl = resolveRpcChainIds()

  if (chainIdByUrl.size === 0) {
    console.warn(
      '[allowances mock] No REACT_APP_NETWORK_URL_<chainId> env var is set, so no RPC traffic is intercepted ' +
        'and allowances come from the real node. The suite requires REACT_APP_NETWORK_URL_11155111.',
    )
  } else {
    const missing = unconfiguredChainIds()
    if (missing.length > 0) {
      console.info(`[allowances mock] not intercepting chains without an RPC override: ${missing.join(', ')}`)
    }
  }

  function resolveFor(chainId: number, call: AllowanceCall): bigint {
    const value = resolveAllowance(fixture, overrides, call.owner, chainId, call.token)

    reads.push({ chainId, owner: call.owner, spender: call.spender, token: call.token, value })

    if (hasAnyEntry(fixture, overrides) && !isOwnerConfigured(fixture, overrides, call.owner)) {
      unknownOwners.add(call.owner)
    }

    return value
  }

  const handler = async (route: Route): Promise<void> => {
    const chainId = chainIdOf(route, chainIdByUrl)
    if (chainId === undefined) return route.continue()

    const body = parseBody(route)
    if (body === undefined) return route.continue()

    const entries = Array.isArray(body) ? (body as JsonRpcEntry[]) : [body as JsonRpcEntry]
    const classified = entries.map(classifyEntry)

    if (classified.every((call) => call === undefined || call.kind === 'opaque')) {
      return route.continue()
    }

    try {
      if (classified.every((call) => call !== undefined && isFullyMocked(call))) {
        const payload = entries.map((entry, index) => ({
          jsonrpc: '2.0',
          id: entry.id ?? null,
          result: localResult(classified[index] as ClassifiedCall, chainId, resolveFor),
        }))
        return await fulfillJson(route, Array.isArray(body) ? payload : payload[0])
      }

      const upstream = await route.fetch()
      const upstreamBody = (await upstream.json()) as unknown
      const upstreamEntries = Array.isArray(upstreamBody) ? (upstreamBody as JsonRpcEntry[]) : [upstreamBody]

      // A JSON-RPC batch response is not required to preserve request order, so match
      // by id and fall back to positional only when an id is missing.
      const byId = new Map<number | string, ClassifiedCall | undefined>()
      entries.forEach((entry, index) => {
        if (entry.id !== undefined) byId.set(entry.id, classified[index])
      })

      const payload = upstreamEntries.map((entry, index) => {
        const id = (entry as JsonRpcEntry).id
        const call = id !== undefined && byId.has(id) ? byId.get(id) : classified[index]
        return patchEntry(entry as Record<string, unknown>, call, chainId, resolveFor)
      })

      return await fulfillJson(route, Array.isArray(upstreamBody) ? payload : payload[0])
    } catch (error) {
      // Never leave the page hanging on a mock bug: the request goes through untouched
      // and the reason surfaces in the teardown report.
      problems.push(`${route.request().url()}: ${String(error)}`)
      return route.continue()
    }
  }

  void context.route((url) => chainIdByUrl.has(safeNormalize(url.href)), handler)

  return {
    set(owner, chainId, allowances) {
      for (const [token, value] of Object.entries(allowances)) {
        const where = `allowances.set("${owner}", ${chainId}, { "${token}" })`
        overrides.set(allowanceKey(owner, chainId, token), parseAllowanceValue(value, where))
      }
    },
    clear() {
      overrides.clear()
    },
    reads() {
      return reads
    },
    reportUnknownOwners() {
      if (unknownOwners.size > 0) {
        const list = [...unknownOwners].map((owner) => `  - ${owner}`).join('\n')
        console.warn(
          `[allowances mock] allowances were read for owners with no entry, so they resolved to 0:\n${list}\n` +
            `Add them to src/mocks/allowances/fixtures/allowances.json, or call ` +
            `mocks.allowances.set(wallet.address, chainId, { ... }) in the spec.`,
        )
      }

      if (problems.length > 0) {
        const list = problems.map((problem) => `  - ${problem}`).join('\n')
        console.warn(`[allowances mock] requests forwarded untouched after a mock error:\n${list}`)
      }
    },
    reset() {
      overrides.clear()
      reads.length = 0
      unknownOwners.clear()
      problems.length = 0
    },
  }
}

function classifyEntry(entry: JsonRpcEntry): ClassifiedCall | undefined {
  if (entry.method !== 'eth_call') return undefined

  const target = entry.params?.[0]
  if (typeof target !== 'object' || target === null) return undefined

  const { to, data } = target as { to?: unknown; data?: unknown }
  if (typeof to !== 'string' || typeof data !== 'string') return undefined

  return classifyCall(to, data)
}

function localResult(
  call: ClassifiedCall,
  chainId: number,
  resolve: (chainId: number, call: AllowanceCall) => bigint,
): Hex {
  if (call.kind === 'allowance') return encodeAllowanceResult(resolve(chainId, call))
  return resolveBatchResult(call as BatchCall, (inner) => resolve(chainId, inner))
}

function patchEntry(
  entry: Record<string, unknown>,
  call: ClassifiedCall | undefined,
  chainId: number,
  resolve: (chainId: number, call: AllowanceCall) => bigint,
): unknown {
  if (call === undefined || call.kind === 'opaque') return entry

  if (call.kind === 'allowance') {
    return { ...entry, error: undefined, result: encodeAllowanceResult(resolve(chainId, call)) }
  }

  const upstreamResult = typeof entry.result === 'string' ? (entry.result as Hex) : undefined

  return {
    ...entry,
    error: undefined,
    result: resolveBatchResult(call, (inner) => resolve(chainId, inner), upstreamResult),
  }
}

async function fulfillJson(route: Route, body: unknown): Promise<void> {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
}

function chainIdOf(route: Route, chainIdByUrl: Map<string, number>): number | undefined {
  return chainIdByUrl.get(safeNormalize(route.request().url()))
}

function safeNormalize(url: string): string {
  try {
    return normalizeRpcUrl(url)
  } catch {
    return url
  }
}

function parseBody(route: Route): unknown {
  try {
    return route.request().postDataJSON() as unknown
  } catch {
    return undefined
  }
}
```

Note `collectAllowanceCalls` is imported but only needed if a later spec wants call ordering without triggering resolution; if the linter flags it as unused, drop it from the import list rather than adding a suppression.

- [ ] **Step 2: Wire it into `shared.ts`**

Three edits to `apps/cowswap-frontend-e2e-pw/src/fixtures/shared.ts`.

Add the import, alphabetised among the other `../mocks/*` imports (so directly after the `bungee` line):

```ts
import { installAllowances, type AllowancesMock } from '../mocks/allowances'
```

Add the field to `SharedFixtures['mocks']`:

```ts
  mocks: {
    allowances: AllowancesMock
    cowApi: CowProtocolApiMock
    tokenLists: TokenListsMock
    safeSdk: SafeSdkMock
    bungee: BungeeMock
    nearIntents: NearIntentsMock
  }
```

Replace the body of the `mocks` fixture (currently lines 59-82) with:

```ts
  mocks: [
    async ({ context }, use) => {
      const allowances = installAllowances(context)
      const cowApi = installCowProtocolApi(context)
      const tokenLists = installTokenLists(context)
      const safeSdk = installSafeSdk(context)
      const bungee = installBungee(context)
      const nearIntents = installNearIntents(context)

      await use({ allowances, cowApi, tokenLists, safeSdk, bungee, nearIntents })

      tokenLists.reset()
      bungee.reset()
      nearIntents.reset()
      await safeSdk.disable()
      // Non-fatal, so it must run before the throwing assert below.
      allowances.reportUnknownOwners()
      allowances.reset()
      // Runs last: it throws when the test hit an un-mocked CoW API URL, and the
      // resets above must still happen.
      try {
        cowApi.assertNoUnmatched()
      } finally {
        cowApi.reset()
      }
    },
    { auto: true },
  ],
```

`installAllowances` goes first so its route is registered before the others. The patterns do not overlap (RPC URL vs `api.cow.fi` vs token lists), so ordering is not load-bearing — but Playwright matches most-recently-registered first, and registering the broadest-looking matcher first keeps it out of the way.

- [ ] **Step 3: Typecheck and lint**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec tsc --noEmit -p tsconfig.json
cd /Users/shoom/IdeaProjects/cowswap-2
pnpm nx lint cowswap-frontend-e2e-pw
```

Expected: no errors. A `noUnusedLocals`-style complaint about `collectAllowanceCalls` is resolved by removing it from the import list.

- [ ] **Step 4: Run the whole unit suite**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2
pnpm nx test cowswap-frontend-e2e-pw
```

Expected: PASS for all four new files (43 tests total across `fixture`, `resolve`, `codec`, `rpcUrls`), plus whatever Task 1 recorded about the five pre-existing files.

- [ ] **Step 5: Document it in the README**

Add this section to `apps/cowswap-frontend-e2e-pw/README.md` immediately after the "CoW Protocol API mocks" section (before "### Not yet mocked"):

````markdown
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
- **Spender is not part of the key.** Any spender gets the same value; the spender
  is recorded in `reads()` if a spec needs to assert on it.
- The committed file is `{}`. Use it for defaults tied to a fixed address.

Because the wallet address comes from `INTEGRATION_TEST_PRIVATE_KEY`, a spec
normally configures allowances at runtime instead:

```ts
test('[MO-XX] approval', async ({ wallet, mocks, swapPage }) => {
  mocks.allowances.set(wallet.address, CHAIN_IDS.SEPOLIA, {
    '0xfff9976782d46cc05630d1f6ebab18b2324d6b14': '5000000',
  })
  await wallet.openApp({ chainId: CHAIN_IDS.SEPOLIA })
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
````

Add a row to the commands table, after the `e2e:report` row:

```markdown
| `pnpm nx test cowswap-frontend-e2e-pw` | Unit tests for the mocks and support code (`node:test` via tsx) |
```

- [ ] **Step 6: Commit**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2
git add apps/cowswap-frontend-e2e-pw
git commit -m "test(e2e): mock token allowances from a JSON fixture"
```

---

## Task 6: Verify against the real app

The unit tests prove the codec is self-consistent. They cannot prove viem actually emits the calldata shape the codec expects, nor that the route matcher matches the URL the app really uses. Only a browser run shows that.

**Files:**
- Create: `apps/cowswap-frontend-e2e-pw/src/tests/allowance-mock.spec.ts` (a temporary probe — deleted in Step 5)

**Interfaces:**
- Consumes: `mocks.allowances` (Task 5); the mock-wallet entrypoint `../fixtures/mockWallet`; `CHAIN_IDS` from `../support/constants`.
- Produces: evidence, and a decision on whether the mock works.

**Prerequisites.** This task needs `INTEGRATION_TEST_PRIVATE_KEY` and `REACT_APP_NETWORK_URL_11155111` set, and a dev server Playwright can start on port 3000. It does **not** need the Synpress MetaMask cache, because it uses the mock-wallet entrypoint. If a prerequisite is missing, stop and report exactly which one — do not mark this task done, and do not claim the mock works.

- [ ] **Step 1: Write the probe spec**

Create `apps/cowswap-frontend-e2e-pw/src/tests/allowance-mock.spec.ts`:

```ts
import { expect, test } from '../fixtures/mockWallet'
import { CHAIN_IDS } from '../support/constants'

const SEPOLIA_WETH = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'

test('[probe] the allowance mock sees reads and serves the configured value', async ({ wallet, mocks }) => {
  mocks.allowances.set(wallet.address, CHAIN_IDS.SEPOLIA, { [SEPOLIA_WETH]: '123456' })

  await wallet.openApp({ chainId: CHAIN_IDS.SEPOLIA, sell: 'WETH', buy: 'COW' })

  await expect
    .poll(() => mocks.allowances.reads().length, { timeout: 20_000 })
    .toBeGreaterThan(0)

  const wethRead = mocks.allowances.reads().find((read) => read.token === SEPOLIA_WETH)

  expect(wethRead, `reads seen: ${JSON.stringify(mocks.allowances.reads().map((r) => r.token))}`).toBeDefined()
  expect(wethRead?.value).toBe(123456n)
  expect(wethRead?.owner).toBe(wallet.address.toLowerCase())
})
```

- [ ] **Step 2: Run it**

```bash
cd /Users/shoom/IdeaProjects/cowswap-2/apps/cowswap-frontend-e2e-pw
pnpm exec playwright test src/tests/allowance-mock.spec.ts --reporter=list
```

Expected: PASS.

- [ ] **Step 3: Diagnose a failure before changing anything**

Do not start editing on a red run. Establish which link is broken:

- **Zero reads.** Either the route never matched, or the calldata classified as opaque. Add `console.log` of `route.request().url()` at the top of the handler in `index.ts` and compare it to `REACT_APP_NETWORK_URL_11155111`. A mismatch is a `normalizeRpcUrl` problem; a match means the classifier is the problem — log `entry.params?.[0]` and decode the selector by hand.
- **Reads present, wrong `value`.** A `resolveAllowance`/`set` key mismatch: log `allowanceKey(...)` from both `set` and `resolveFor` and compare.
- **App errors or hangs.** The response shape is wrong. Compare a fulfilled body against a real one by temporarily returning `route.continue()` for all traffic and capturing the upstream response.
- **`reads()` grows but the UI ignores it.** Expected at this stage — this probe asserts on the mock, not on the UI.

Fix the cause in the module it belongs to, add a unit test for it in that module's test file, and re-run both the unit suite and this spec.

- [ ] **Step 4: Confirm the UI actually responds**

Reads alone do not prove the app believes the mock. Run the probe twice with different values and confirm the approve affordance differs. In the spec body, temporarily set `{ [SEPOLIA_WETH]: '0' }`, enter a sell amount above zero via `swapPage`, and check that an approve-related control appears; then set a very large value and confirm it does not.

Consult `src/pages/SwapPage.ts` for the existing locators rather than inventing selectors, and read `apps/cowswap-frontend/src/common/hooks/useNeedsApproval.ts` to see exactly what drives the branch. Record what you observed — this is the evidence that the feature works, and it belongs in the task report.

- [ ] **Step 5: Delete the probe and commit the evidence**

The probe is scaffolding, not a checklist-backed test. `pnpm e2e:report` requires every `[XX-NN]` id to reconcile against `e2e-checklist.xlsx`, and a `[probe]` test would be an unmapped stray.

```bash
cd /Users/shoom/IdeaProjects/cowswap-2
rm apps/cowswap-frontend-e2e-pw/src/tests/allowance-mock.spec.ts
pnpm nx test cowswap-frontend-e2e-pw
git status --short
```

Expected: the unit suite passes, and `git status` shows only intended changes (any fixes made in Step 3, plus their new unit tests). Commit those if there are any:

```bash
git add apps/cowswap-frontend-e2e-pw
git commit -m "fix(e2e): correct allowance mock against real app traffic"
```

If Step 3 required no fixes, there is nothing to commit — say so rather than creating an empty commit.

- [ ] **Step 6: Report**

State plainly: whether the mock served a configured allowance to the running app, what the UI did in Step 4, and anything left broken. If Step 4 could not be completed (missing locators, unclear UI state), say that instead of implying it passed.

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
| --- | --- |
| Fixture format, raw atoms, unsafe-number rejection, validation paths | Task 2 |
| Flat `Map` representation, override-then-fixture-then-0 resolution | Task 2 |
| Committed fixture ships `{}` | Task 2, Step 5 |
| Direct + wrapped + recursive classification, selector-not-`to` | Task 3 |
| Mixed-batch patching, `success: true` for mocked slots, decode tolerance | Task 3 |
| Per-chain RPC URL map from env, un-intercepted chains logged | Task 4 |
| Route handling: passthrough / local fulfil / fetch-and-patch / never hang | Task 5, Step 1 |
| `set` / `clear` / `reads` API and per-test reset | Task 5, Steps 1-2 |
| Unknown-owner diagnostic, non-fatal, silent when nothing configured | Task 5, Step 1 |
| Known gap (`tokenAllowancesFamily`) recorded in code + README | Task 5, Steps 1 and 5 |
| README section + commands row | Task 5, Step 5 |
| `test` target, five pre-existing files reported not hidden | Task 1 |
| Unit tests for codec / resolve / fixture | Tasks 2-4 |
| Spender recorded but never keyed | Task 3 (`AllowanceCall.spender`), Task 5 (`AllowanceRead.spender`) |

The spec's "Risks" entry about viem changing its batching is answered by Task 6, which is the only step that can catch it, and by `reads()` being assertable.

**Type consistency:** `AllowanceLookup`, `allowanceKey`, `ownerKeyPrefix`, `AllowanceRead`, `AllowanceValue` are defined in Task 2 `types.ts` and consumed under those names in Tasks 2, 4 (`AllowanceValue` via `parseAllowanceValue`), and 5. `ClassifiedCall` / `AllowanceCall` / `BatchCall` / `OpaqueCall`, `classifyCall`, `isFullyMocked`, `collectAllowanceCalls`, `encodeAllowanceResult`, `resolveBatchResult`, `ResolveAllowanceCall` are defined in Task 3 and consumed in Task 5 with matching signatures. `resolveAllowance` / `isOwnerConfigured` / `hasAnyEntry` are defined in Task 2 and called with the same argument order in Task 5. `resolveRpcChainIds` / `normalizeRpcUrl` / `unconfiguredChainIds` are defined in Task 4 and used in Task 5. `installAllowances` / `AllowancesMock` are defined in Task 5 and referenced by `shared.ts` in the same step.

**Placeholder scan:** no TBD/TODO steps; every code step carries full code; the one intentional judgement call (the unused-import decision for `collectAllowanceCalls`) states both branches; Task 6's diagnosis step enumerates concrete symptoms and concrete probes rather than "debug it".
