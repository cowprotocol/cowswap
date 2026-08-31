# Real Solana Quotes (Jupiter) + On-Chain CoW Order Posting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `cowswap-frontend`'s hand-rolled 1:1 Solana quote mock with a real Jupiter-sourced quote, and make `postSwapOrderFromQuote` actually build, sign, and submit a real on-chain `CreateOrder` instruction against the CoW Protocol Solana settlement program — even though the backend doesn't accept these orders yet.

**Architecture:** A new, self-contained `packages/trading/src/solana/` module in the `cow-sdk` repo ports the exact byte-level `CreateOrder` wire format from the released `cow-settlement-interface` v0.3.0 crate (order intent encoding, PDA derivation, instruction builder) and sources quote amounts from Jupiter's public quote API. `cowswap-frontend` consumes it via a local link, replacing `getSolanaMockQuote.ts` with `getSolanaJupiterQuote.ts`, and wires real wallet signing through the existing `sendSolanaTransaction` helper.

**Tech Stack:** TypeScript, `@solana/web3.js`, `@solana/spl-token`, Jest (cow-sdk), Jest (cowswap-frontend).

**Spec:** `docs/superpowers/specs/2026-08-31-solana-jupiter-quote-design.md`

## Global Constraints

- Settlement program id: `FYp8R5K4B3B1Kfr7QuWzMz4TwoT7wptjYtxgCrY5sRXb` (released `v0.3.0`, supersedes the stale `moosEjJg5mbGRPRU7Vg4AaHZLvbbgknevWR9J1bNgME` currently in `cow-sdk`).
- `SETTLEMENT_SEED` version component: `"0.3"` (major.minor of the released settlement program), must move in lockstep with the program id if it's ever bumped.
- Jupiter client is named `JupiterAPI` (not "Ultra") per explicit instruction, even though it calls the `ultra-api.jup.ag` host.
- Jupiter is a quote source only — orders are never submitted to Jupiter's `/execute`. All order posting is the on-chain `CreateOrder` instruction against the CoW settlement program.
- New Solana code lives in `packages/trading/src/solana/` in the `cow-sdk` repo, not in `cowswap-frontend` and not as a new adapter on `TradingSdk`/`AbstractProviderAdapter`.
- `@solana/web3.js` and `@solana/spl-token` are new dependencies of `packages/trading` — pin to the same versions `cowswap-frontend` already uses (`1.98.4` / `0.4.14`) to avoid version drift once both are bundled together.
- `cowswap-frontend` consumes the in-progress `cow-sdk` build via a local `pnpm link` (never committed to `package.json`) — nothing here can be published since the backend can't accept these orders yet.

---

## Task 1: Fix the stale Solana settlement program id in `packages/config`

**Files:**
- Modify: `/Users/shoom/IdeaProjects/cow-sdk/packages/config/src/chains/const/contracts.ts:26-31`

**Interfaces:**
- Produces: `SOLANA_SETTLEMENT_PROGRAM_ID: string` (updated value), `SOLANA_SETTLEMENT_PROGRAM_VERSION: string` (new) — both consumed by Task 3 (`orderPda.ts`) and Task 6 (`getSolanaQuote.ts`).

- [ ] **Step 1: Update the constant and add the version constant**

Replace lines 26-31 of `packages/config/src/chains/const/contracts.ts`:

```ts
/**
 * CoW Protocol settlement program id on Solana (base58, not an EVM address).
 * The on-chain settlement-state PDA derived from this program is the SPL delegate a sell-token account
 * is approved to — the Solana analogue of the EVM vault relayer spender.
 * Released as `cow-settlement-interface` / `solana-programs` v0.3.0.
 * @see https://github.com/cowprotocol/solana-programs/releases/tag/v0.3
 */
export const SOLANA_SETTLEMENT_PROGRAM_ID = 'FYp8R5K4B3B1Kfr7QuWzMz4TwoT7wptjYtxgCrY5sRXb'
export const SOLANA_SETTLEMENT_PROGRAM_ID_STAGING = SOLANA_SETTLEMENT_PROGRAM_ID

/**
 * Major.minor version of the deployed settlement program, embedded in every settlement-program PDA seed
 * (see `SETTLEMENT_SEED` in `cow-settlement-interface`) to keep PDAs from colliding across versions. Must
 * be bumped together with `SOLANA_SETTLEMENT_PROGRAM_ID` whenever the settlement program is redeployed.
 */
export const SOLANA_SETTLEMENT_PROGRAM_VERSION = '0.3'
```

- [ ] **Step 2: Typecheck**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-config typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/shoom/IdeaProjects/cow-sdk
git add packages/config/src/chains/const/contracts.ts
git commit -m "fix(config): correct Solana settlement program id to the released v0.3.0 address"
```

---

## Task 2: `OrderIntent` type and canonical 213-byte encoding

**Files:**
- Create: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/orderIntent.ts`
- Test: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/orderIntent.test.ts`
- Modify: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/package.json` (add dependencies)

**Interfaces:**
- Produces: `SolanaOrderIntent` type, `ENCODED_ORDER_INTENT_SIZE = 213`, `encodeOrderIntent(intent: SolanaOrderIntent): Uint8Array`, `hashOrderIntent(encoded: Uint8Array): Promise<Uint8Array>`, `toHex(bytes: Uint8Array): string` — all consumed by Task 3 (PDA), Task 4 (instruction), Task 6 (`getSolanaQuote`), Task 7 (`postSolanaSwapOrderFromQuote`).

- [ ] **Step 1: Add Solana dependencies**

In `packages/trading/package.json`, add to `"dependencies"`:

```json
    "@solana/spl-token": "0.4.14",
    "@solana/web3.js": "1.98.4",
```

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm install`
Expected: lockfile updates, no errors.

- [ ] **Step 2: Write the failing test**

Create `packages/trading/src/solana/orderIntent.test.ts`:

```ts
import { PublicKey } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { encodeOrderIntent, ENCODED_ORDER_INTENT_SIZE, hashOrderIntent, SolanaOrderIntent, toHex } from './orderIntent'

// Fixture ported verbatim from `cow-settlement-interface`'s own regression tests
// (interface/src/data/intent.rs `sample_intent` + `encoding_regression`/`uid_digest_regression`),
// so this test proves the TS port produces byte-identical output to the Rust program's own encoder.
function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

const SAMPLE_INTENT: SolanaOrderIntent = {
  owner: fillPubkey(0x11),
  buyTokenAccount: fillPubkey(0x22),
  buyMint: fillPubkey(0x33),
  sellTokenAccount: fillPubkey(0x44),
  sellMint: fillPubkey(0x55),
  sellAmount: 0x0123_4567_89ab_cdefn,
  buyAmount: 0xfedc_ba98_7654_3210n,
  validTo: 0xdead_beef,
  kind: OrderKind.BUY,
  partiallyFillable: true,
  createdOnChain: true,
  appData: new Uint8Array(32).fill(0x66),
}

describe('encodeOrderIntent', () => {
  it('produces the 213-byte canonical layout the settlement program expects', () => {
    const encoded = encodeOrderIntent(SAMPLE_INTENT)

    expect(encoded.length).toBe(ENCODED_ORDER_INTENT_SIZE)
    expect(Array.from(encoded.subarray(0, 32))).toEqual(new Array(32).fill(0x11)) // owner
    expect(Array.from(encoded.subarray(32, 64))).toEqual(new Array(32).fill(0x22)) // buy_token_account
    expect(Array.from(encoded.subarray(64, 96))).toEqual(new Array(32).fill(0x33)) // buy_mint
    expect(Array.from(encoded.subarray(96, 128))).toEqual(new Array(32).fill(0x44)) // sell_token_account
    expect(Array.from(encoded.subarray(128, 160))).toEqual(new Array(32).fill(0x55)) // sell_mint
    expect(toHex(encoded.subarray(160, 168))).toBe('efcdab8967452301') // sell_amount, LE
    expect(toHex(encoded.subarray(168, 176))).toBe('1032547698badcfe') // buy_amount, LE
    expect(toHex(encoded.subarray(176, 180))).toBe('efbeadde') // valid_to, LE
    expect(encoded[180]).toBe(0b0000_0111) // flags: created_on_chain | kind(Buy=1<<1) | partially_fillable
    expect(Array.from(encoded.subarray(181, 213))).toEqual(new Array(32).fill(0x66)) // app_data
  })

  it('rejects app_data that is not exactly 32 bytes', () => {
    expect(() => encodeOrderIntent({ ...SAMPLE_INTENT, appData: new Uint8Array(31) })).toThrow(
      'appData must be exactly 32 bytes',
    )
  })
})

describe('hashOrderIntent', () => {
  it('matches the settlement program\'s own SHA-256 digest for the sample intent', async () => {
    const encoded = encodeOrderIntent(SAMPLE_INTENT)
    const uid = await hashOrderIntent(encoded)

    expect(toHex(uid)).toBe('de4096c6c100056f1e4636ea4fafefad40fc1d0b37692fe3ca1e0db3644b86bd')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- orderIntent`
Expected: FAIL with "Cannot find module './orderIntent'"

- [ ] **Step 4: Write the implementation**

Create `packages/trading/src/solana/orderIntent.ts`:

```ts
import { PublicKey } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'

/**
 * TS port of `cow-settlement-interface`'s `OrderIntent` (interface/src/data/intent.rs, v0.3.0).
 * Every field here has a Rust counterpart with the same name; keep them in sync if the settlement
 * program's wire format changes.
 */
export interface SolanaOrderIntent {
  owner: PublicKey
  buyTokenAccount: PublicKey
  buyMint: PublicKey
  sellTokenAccount: PublicKey
  sellMint: PublicKey
  sellAmount: bigint
  buyAmount: bigint
  /** Unix timestamp seconds. */
  validTo: number
  kind: OrderKind
  partiallyFillable: boolean
  /**
   * Must be `true`: this is the flag the `CreateOrder` instruction authenticates against (the owner
   * signs the transaction themselves). The alternative — an off-chain Ed25519-presigned order anyone can
   * submit — is a different, unused authentication path.
   */
  createdOnChain: boolean
  /** Exactly 32 bytes, opaque to the settlement program. */
  appData: Uint8Array
}

/** Canonical byte size of an encoded `OrderIntent`, per `EncodedOrderIntent::SIZE` in the Rust source. */
export const ENCODED_ORDER_INTENT_SIZE = 213

const FLAG_CREATED_ON_CHAIN = 1 << 0
const FLAG_KIND_BUY = 1 << 1
const FLAG_PARTIALLY_FILLABLE = 1 << 2

/**
 * Encodes a `SolanaOrderIntent` into the 213-byte layout the settlement program reads, byte-for-byte
 * matching `EncodedOrderIntent::from(&OrderIntent)` in `cow-settlement-interface`.
 */
export function encodeOrderIntent(intent: SolanaOrderIntent): Uint8Array {
  if (intent.appData.length !== 32) {
    throw new Error('appData must be exactly 32 bytes')
  }

  const bytes = new Uint8Array(ENCODED_ORDER_INTENT_SIZE)
  const view = new DataView(bytes.buffer)
  let offset = 0

  const writePubkey = (pubkey: PublicKey): void => {
    bytes.set(pubkey.toBytes(), offset)
    offset += 32
  }
  const writeU64LE = (value: bigint): void => {
    view.setBigUint64(offset, value, true)
    offset += 8
  }

  writePubkey(intent.owner)
  writePubkey(intent.buyTokenAccount)
  writePubkey(intent.buyMint)
  writePubkey(intent.sellTokenAccount)
  writePubkey(intent.sellMint)
  writeU64LE(intent.sellAmount)
  writeU64LE(intent.buyAmount)

  view.setUint32(offset, intent.validTo, true)
  offset += 4

  let flags = 0
  if (intent.createdOnChain) flags |= FLAG_CREATED_ON_CHAIN
  if (intent.kind === OrderKind.BUY) flags |= FLAG_KIND_BUY
  if (intent.partiallyFillable) flags |= FLAG_PARTIALLY_FILLABLE
  bytes[offset] = flags
  offset += 1

  bytes.set(intent.appData, offset)

  return bytes
}

/**
 * SHA-256 of the encoded intent bytes — doubles as the order UID and the middle seed of the order PDA
 * (`OrderIntent::uid()` in the Rust source). Uses the Web Crypto API (available in both Node 20+ and
 * browsers) rather than a new hashing dependency.
 */
export async function hashOrderIntent(encoded: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return new Uint8Array(digest)
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- orderIntent`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
cd /Users/shoom/IdeaProjects/cow-sdk
git add packages/trading/package.json packages/trading/src/solana/orderIntent.ts packages/trading/src/solana/orderIntent.test.ts pnpm-lock.yaml
git commit -m "feat(trading): port cow-settlement-interface's OrderIntent encoding to TS"
```

---

## Task 3: Order PDA derivation

**Files:**
- Create: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/orderPda.ts`
- Test: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/orderPda.test.ts`

**Interfaces:**
- Consumes: none new (uses `@solana/web3.js` `PublicKey`).
- Produces: `SETTLEMENT_SEED: Uint8Array`, `ORDER_SEED: Uint8Array`, `findOrderPda(programId: PublicKey, uid: Uint8Array): [PublicKey, number]` — consumed by Task 6 (`getSolanaQuote.ts`).

- [ ] **Step 1: Write the failing test**

Create `packages/trading/src/solana/orderPda.test.ts`:

```ts
import { PublicKey } from '@solana/web3.js'

import { findOrderPda, ORDER_SEED, SETTLEMENT_SEED } from './orderPda'

describe('SETTLEMENT_SEED', () => {
  it('is the settlement-program-version-embedded seed prefix', () => {
    // "settlement v" (12 bytes) + "0.3" right-padded to a fixed 7-byte version field = 19 bytes total,
    // matching `SETTLEMENT_SEED_LEN` in cow-settlement-interface.
    expect(SETTLEMENT_SEED.length).toBe(19)
    expect(new TextDecoder().decode(SETTLEMENT_SEED)).toBe('settlement v0.3    ')
  })
})

describe('findOrderPda', () => {
  const programId = new PublicKey(new Uint8Array(32).fill(1))
  const uid = new Uint8Array(32).fill(2)

  it('is deterministic for the same program id and uid', () => {
    const [pda1, bump1] = findOrderPda(programId, uid)
    const [pda2, bump2] = findOrderPda(programId, uid)

    expect(pda1.toBase58()).toBe(pda2.toBase58())
    expect(bump1).toBe(bump2)
  })

  it('derives a different address for a different uid', () => {
    const [pda1] = findOrderPda(programId, uid)
    const [pda2] = findOrderPda(programId, new Uint8Array(32).fill(3))

    expect(pda1.toBase58()).not.toBe(pda2.toBase58())
  })

  it('derives a different address for a different program id', () => {
    const [pda1] = findOrderPda(programId, uid)
    const [pda2] = findOrderPda(new PublicKey(new Uint8Array(32).fill(9)), uid)

    expect(pda1.toBase58()).not.toBe(pda2.toBase58())
  })

  it('uses the [SETTLEMENT_SEED, uid, ORDER_SEED] seed scheme', () => {
    const [expectedPda] = PublicKey.findProgramAddressSync([SETTLEMENT_SEED, uid, ORDER_SEED], programId)
    const [pda] = findOrderPda(programId, uid)

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- orderPda`
Expected: FAIL with "Cannot find module './orderPda'"

- [ ] **Step 3: Write the implementation**

Create `packages/trading/src/solana/orderPda.ts`:

```ts
import { PublicKey } from '@solana/web3.js'
import { SOLANA_SETTLEMENT_PROGRAM_VERSION } from '@cowprotocol/sdk-config'

const SETTLEMENT_SEED_PREFIX = 'settlement v'
/** Fixed width reserved for the version string after the prefix, matching `SETTLEMENT_SEED_VERSION_LEN`
 * in cow-settlement-interface. A fixed-width seed avoids prefix collisions between versions. */
const SETTLEMENT_SEED_VERSION_LEN = 7

/**
 * Version-embedded seed shared by every settlement-program PDA (`SETTLEMENT_SEED` in
 * cow-settlement-interface). Must be regenerated if `SOLANA_SETTLEMENT_PROGRAM_VERSION` changes.
 */
export const SETTLEMENT_SEED = new TextEncoder().encode(
  SETTLEMENT_SEED_PREFIX + SOLANA_SETTLEMENT_PROGRAM_VERSION.padEnd(SETTLEMENT_SEED_VERSION_LEN, ' '),
)

/** Trailing seed identifying order PDAs (`ORDER_SEED` in cow-settlement-interface). */
export const ORDER_SEED = new TextEncoder().encode('order')

/**
 * Derives the canonical order PDA and bump for an order's `uid`, matching `find_order_pda` in
 * cow-settlement-interface.
 */
export function findOrderPda(programId: PublicKey, uid: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SETTLEMENT_SEED, uid, ORDER_SEED], programId)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- orderPda`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/shoom/IdeaProjects/cow-sdk
git add packages/trading/src/solana/orderPda.ts packages/trading/src/solana/orderPda.test.ts
git commit -m "feat(trading): derive Solana settlement order PDAs"
```

---

## Task 4: `CreateOrder` instruction builder

**Files:**
- Create: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/createOrderInstruction.ts`
- Test: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/createOrderInstruction.test.ts`

**Interfaces:**
- Consumes: `SolanaOrderIntent`, `encodeOrderIntent` (Task 2).
- Produces: `CreateOrderInstructionParams` type, `buildCreateOrderInstruction(params: CreateOrderInstructionParams): TransactionInstruction` — consumed by Task 7 (`postSolanaSwapOrderFromQuote`).

- [ ] **Step 1: Write the failing test**

Create `packages/trading/src/solana/createOrderInstruction.test.ts`:

```ts
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { buildCreateOrderInstruction } from './createOrderInstruction'
import { encodeOrderIntent, SolanaOrderIntent } from './orderIntent'

function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

const intent: SolanaOrderIntent = {
  owner: fillPubkey(0x11),
  buyTokenAccount: fillPubkey(0x22),
  buyMint: fillPubkey(0x33),
  sellTokenAccount: fillPubkey(0x44),
  sellMint: fillPubkey(0x55),
  sellAmount: 100n,
  buyAmount: 200n,
  validTo: 1_700_000_000,
  kind: OrderKind.SELL,
  partiallyFillable: false,
  createdOnChain: true,
  appData: new Uint8Array(32),
}

describe('buildCreateOrderInstruction', () => {
  const programId = fillPubkey(0x01)
  const createdBy = fillPubkey(0x66)
  const orderPda = fillPubkey(0x77)

  const instruction = buildCreateOrderInstruction({ programId, owner: intent.owner, createdBy, orderPda, intent })

  it('targets the settlement program', () => {
    expect(instruction.programId.toBase58()).toBe(programId.toBase58())
  })

  it('encodes discriminator 2 followed by the 213-byte intent', () => {
    expect(instruction.data[0]).toBe(2)
    expect(instruction.data.length).toBe(1 + 213)
    expect(Uint8Array.from(instruction.data.subarray(1))).toEqual(encodeOrderIntent(intent))
  })

  it('lists accounts in the order the settlement program expects: owner, created_by, order_pda, system program', () => {
    expect(instruction.keys).toEqual([
      { pubkey: intent.owner, isSigner: true, isWritable: false },
      { pubkey: createdBy, isSigner: true, isWritable: true },
      { pubkey: orderPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- createOrderInstruction`
Expected: FAIL with "Cannot find module './createOrderInstruction'"

- [ ] **Step 3: Write the implementation**

Create `packages/trading/src/solana/createOrderInstruction.ts`:

```ts
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'

import { encodeOrderIntent, SolanaOrderIntent } from './orderIntent'

/** Wire discriminator for `CreateOrder`, per `SettlementInstruction::CreateOrder` (= 2) in cow-settlement-interface. */
const CREATE_ORDER_DISCRIMINATOR = 2

export interface CreateOrderInstructionParams {
  programId: PublicKey
  /** Authenticates the order; must match `intent.owner` and sign the transaction. */
  owner: PublicKey
  /** Funds the new order PDA's rent; must sign the transaction. May equal `owner`. */
  createdBy: PublicKey
  /** The canonical PDA for `intent`'s uid — see `findOrderPda`. */
  orderPda: PublicKey
  intent: SolanaOrderIntent
}

/**
 * Builds the `CreateOrder` instruction, matching `CreateOrder::into::<Instruction>()` in
 * cow-settlement-interface: `data = [discriminator=2, ...213 intent bytes]`, accounts
 * `[owner (readonly signer), created_by (writable signer), order_pda (writable), system_program]`.
 */
export function buildCreateOrderInstruction(params: CreateOrderInstructionParams): TransactionInstruction {
  const intentBytes = encodeOrderIntent(params.intent)
  const data = Buffer.alloc(1 + intentBytes.length)
  data[0] = CREATE_ORDER_DISCRIMINATOR
  data.set(intentBytes, 1)

  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.owner, isSigner: true, isWritable: false },
      { pubkey: params.createdBy, isSigner: true, isWritable: true },
      { pubkey: params.orderPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- createOrderInstruction`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/shoom/IdeaProjects/cow-sdk
git add packages/trading/src/solana/createOrderInstruction.ts packages/trading/src/solana/createOrderInstruction.test.ts
git commit -m "feat(trading): build the Solana settlement program's CreateOrder instruction"
```

---

## Task 5: `JupiterAPI` quote client

**Files:**
- Create: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/jupiterApi.ts`
- Test: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/jupiterApi.test.ts`

**Interfaces:**
- Produces: `JupiterOrderRequest`, `JupiterOrderResponse` types, `class JupiterAPI { getOrder(request: JupiterOrderRequest): Promise<JupiterOrderResponse> }` — consumed by Task 6 (`getSolanaQuote.ts`).

- [ ] **Step 1: Write the failing test**

Create `packages/trading/src/solana/jupiterApi.test.ts`:

```ts
import fetchMock from 'jest-fetch-mock'

import { JupiterAPI } from './jupiterApi'

fetchMock.enableMocks()

beforeEach(() => {
  fetchMock.mockClear()
})

describe('JupiterAPI.getOrder', () => {
  const request = {
    inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    outputMint: 'So11111111111111111111111111111111111111112',
    amount: '1000000000',
    swapMode: 'ExactIn' as const,
  }

  it('calls the Jupiter order endpoint with the expected query params', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ inAmount: '1000000000', outAmount: '9707507795', swapMode: 'ExactIn', slippageBps: 50 }),
    )

    const api = new JupiterAPI()
    const order = await api.getOrder(request)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string)
    expect(calledUrl.origin + calledUrl.pathname).toBe('https://ultra-api.jup.ag/order')
    expect(calledUrl.searchParams.get('inputMint')).toBe(request.inputMint)
    expect(calledUrl.searchParams.get('outputMint')).toBe(request.outputMint)
    expect(calledUrl.searchParams.get('amount')).toBe(request.amount)
    expect(calledUrl.searchParams.get('swapMode')).toBe('ExactIn')
    expect(calledUrl.searchParams.get('clientPlatform')).toBeTruthy()

    expect(order).toEqual({ inAmount: '1000000000', outAmount: '9707507795', swapMode: 'ExactIn', slippageBps: 50 })
  })

  it('throws the API-provided error message on a non-ok response', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Invalid outputMint' }), { status: 400 })

    const api = new JupiterAPI()

    await expect(api.getOrder(request)).rejects.toThrow('Invalid outputMint')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- jupiterApi`
Expected: FAIL with "Cannot find module './jupiterApi'"

- [ ] **Step 3: Write the implementation**

Create `packages/trading/src/solana/jupiterApi.ts`:

```ts
const JUPITER_ORDER_ENDPOINT = 'https://ultra-api.jup.ag/order'
const DEFAULT_CLIENT_PLATFORM = 'cowswap'

export interface JupiterOrderRequest {
  inputMint: string
  outputMint: string
  amount: string
  swapMode: 'ExactIn' | 'ExactOut'
  clientPlatform?: string
}

/**
 * Fields of Jupiter's `/order` response this SDK actually reads. Jupiter's own swap transaction/execute
 * flow (`transaction`, `requestId`) is deliberately not modeled here — quotes are sourced from Jupiter,
 * but orders are posted through the CoW Protocol settlement program, never through Jupiter's `/execute`.
 */
export interface JupiterOrderResponse {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  swapMode: 'ExactIn' | 'ExactOut'
  slippageBps: number
}

interface JupiterErrorResponse {
  error: string
}

/** Client for Jupiter's public quote API. Quote-only: never used to submit or execute a swap. */
export class JupiterAPI {
  async getOrder(request: JupiterOrderRequest): Promise<JupiterOrderResponse> {
    const params = new URLSearchParams({
      inputMint: request.inputMint,
      outputMint: request.outputMint,
      amount: request.amount,
      swapMode: request.swapMode,
      clientPlatform: request.clientPlatform ?? DEFAULT_CLIENT_PLATFORM,
    })

    const response = await fetch(`${JUPITER_ORDER_ENDPOINT}?${params.toString()}`)
    const body = await response.json()

    if (!response.ok) {
      const message = isJupiterErrorResponse(body) ? body.error : `Jupiter quote request failed (${response.status})`
      throw new Error(message)
    }

    return body as JupiterOrderResponse
  }
}

function isJupiterErrorResponse(body: unknown): body is JupiterErrorResponse {
  return typeof body === 'object' && body !== null && typeof (body as JupiterErrorResponse).error === 'string'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- jupiterApi`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/shoom/IdeaProjects/cow-sdk
git add packages/trading/src/solana/jupiterApi.ts packages/trading/src/solana/jupiterApi.test.ts
git commit -m "feat(trading): add JupiterAPI quote client"
```

---

## Task 6: `getSolanaQuote` orchestrator

**Files:**
- Create: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/types.ts`
- Create: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/getSolanaQuote.ts`
- Test: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/getSolanaQuote.test.ts`

**Interfaces:**
- Consumes: `SolanaOrderIntent`, `encodeOrderIntent`, `hashOrderIntent` (Task 2); `findOrderPda` (Task 3); `JupiterAPI`, `JupiterOrderResponse` (Task 5); `SOLANA_SETTLEMENT_PROGRAM_ID` (`@cowprotocol/sdk-config`, Task 1).
- Produces: `SolanaQuoteParameters`, `SolanaQuote`, `SolanaSignAndSend`, `SolanaOrderPostingResult` types; `getSolanaQuote(params: SolanaQuoteParameters): Promise<SolanaQuote>` — consumed by Task 7 (`postSolanaSwapOrderFromQuote`) and by `cowswap-frontend` (Task 8).

- [ ] **Step 1: Write the failing test**

Create `packages/trading/src/solana/getSolanaQuote.test.ts`:

```ts
import fetchMock from 'jest-fetch-mock'
import { PublicKey } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { SOLANA_SETTLEMENT_PROGRAM_ID } from '@cowprotocol/sdk-config'

import { getSolanaQuote } from './getSolanaQuote'
import { findOrderPda } from './orderPda'

fetchMock.enableMocks()

beforeEach(() => {
  fetchMock.mockClear()
})

describe('getSolanaQuote', () => {
  const owner = new PublicKey(new Uint8Array(32).fill(9))
  const sellMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
  const buyMint = new PublicKey('So11111111111111111111111111111111111111112')

  it('builds a quote from real Jupiter amounts', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        inputMint: sellMint.toBase58(),
        outputMint: buyMint.toBase58(),
        inAmount: '1000000000',
        outAmount: '9707507795',
        swapMode: 'ExactIn',
        slippageBps: 50,
      }),
    )

    const quote = await getSolanaQuote({ owner, sellMint, buyMint, amount: 1_000_000_000n, kind: OrderKind.SELL })

    expect(quote.intent.sellAmount).toBe(1_000_000_000n)
    expect(quote.intent.buyAmount).toBe(9_707_507_795n)
    expect(quote.intent.kind).toBe(OrderKind.SELL)
    expect(quote.intent.createdOnChain).toBe(true)
    expect(quote.intent.owner.toBase58()).toBe(owner.toBase58())
    expect(quote.jupiterOrder.slippageBps).toBe(50)
    expect(quote.uid.length).toBe(32)

    const programId = new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID)
    const [expectedPda] = findOrderPda(programId, quote.uid)
    expect(quote.orderPda.toBase58()).toBe(expectedPda.toBase58())
    expect(quote.programId.toBase58()).toBe(programId.toBase58())
  })

  it('requests an ExactOut quote for a BUY order', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        inputMint: sellMint.toBase58(),
        outputMint: buyMint.toBase58(),
        inAmount: '1000000000',
        outAmount: '9707507795',
        swapMode: 'ExactOut',
        slippageBps: 50,
      }),
    )

    await getSolanaQuote({ owner, sellMint, buyMint, amount: 9_707_507_795n, kind: OrderKind.BUY })

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string)
    expect(calledUrl.searchParams.get('swapMode')).toBe('ExactOut')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- getSolanaQuote`
Expected: FAIL with "Cannot find module './getSolanaQuote'"

- [ ] **Step 3: Write the implementation**

Create `packages/trading/src/solana/types.ts`:

```ts
import { PublicKey, TransactionInstruction } from '@solana/web3.js'

import { JupiterOrderResponse } from './jupiterApi'
import { SolanaOrderIntent } from './orderIntent'
import { OrderKind } from '@cowprotocol/sdk-order-book'

export interface SolanaQuoteParameters {
  owner: PublicKey
  sellMint: PublicKey
  buyMint: PublicKey
  /** Sell-side amount for a SELL order, buy-side amount for a BUY order — same convention as Jupiter's `amount`. */
  amount: bigint
  kind: OrderKind
  partiallyFillable?: boolean
  /** Order lifetime from now, in seconds. Defaults to 30 minutes. */
  validForSeconds?: number
}

export interface SolanaQuote {
  intent: SolanaOrderIntent
  intentBytes: Uint8Array
  /** SHA-256 of `intentBytes`; also the order's uid and the order PDA's seed. */
  uid: Uint8Array
  orderPda: PublicKey
  programId: PublicKey
  /** The raw Jupiter response the quote was built from — real amounts/slippage for the caller to read. */
  jupiterOrder: JupiterOrderResponse
}

/** Signs and submits a `CreateOrder` instruction; supplied by the caller since this SDK has no bound
 * Solana wallet/signer (unlike the EVM adapter). */
export type SolanaSignAndSend = (instruction: TransactionInstruction) => Promise<{ signature: string }>

export interface SolanaOrderPostingResult {
  /** Hex-encoded order uid. */
  orderId: string
  /** Hex-encoded order uid — no distinct field for it exists yet, so it's used as-is instead of being invented.  */
  txHash: string
}
```

Create `packages/trading/src/solana/getSolanaQuote.ts`:

```ts
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { SOLANA_SETTLEMENT_PROGRAM_ID } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { JupiterAPI } from './jupiterApi'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent } from './orderIntent'
import { findOrderPda } from './orderPda'
import { SolanaQuote, SolanaQuoteParameters } from './types'

const DEFAULT_VALID_FOR_SECONDS = 30 * 60
/** No Solana app-data convention exists yet (confirmed absent from the settlement program's intent
 * struct beyond an opaque 32 bytes) — sent as zeroes until one is defined. */
const ZERO_APP_DATA = new Uint8Array(32)

const jupiterApi = new JupiterAPI()

export async function getSolanaQuote(params: SolanaQuoteParameters): Promise<SolanaQuote> {
  const {
    owner,
    sellMint,
    buyMint,
    amount,
    kind,
    partiallyFillable = false,
    validForSeconds = DEFAULT_VALID_FOR_SECONDS,
  } = params

  const jupiterOrder = await jupiterApi.getOrder({
    inputMint: sellMint.toBase58(),
    outputMint: buyMint.toBase58(),
    amount: amount.toString(),
    swapMode: kind === OrderKind.SELL ? 'ExactIn' : 'ExactOut',
  })

  const intent: SolanaOrderIntent = {
    owner,
    buyTokenAccount: getAssociatedTokenAddressSync(buyMint, owner),
    buyMint,
    sellTokenAccount: getAssociatedTokenAddressSync(sellMint, owner),
    sellMint,
    sellAmount: BigInt(jupiterOrder.inAmount),
    buyAmount: BigInt(jupiterOrder.outAmount),
    validTo: Math.floor(Date.now() / 1000) + validForSeconds,
    kind,
    partiallyFillable,
    createdOnChain: true,
    appData: ZERO_APP_DATA,
  }

  const intentBytes = encodeOrderIntent(intent)
  const uid = await hashOrderIntent(intentBytes)
  const programId = new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID)
  const [orderPda] = findOrderPda(programId, uid)

  return { intent, intentBytes, uid, orderPda, programId, jupiterOrder }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- getSolanaQuote`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/shoom/IdeaProjects/cow-sdk
git add packages/trading/src/solana/types.ts packages/trading/src/solana/getSolanaQuote.ts packages/trading/src/solana/getSolanaQuote.test.ts
git commit -m "feat(trading): add getSolanaQuote orchestrator (Jupiter amounts + order intent)"
```

---

## Task 7: `postSolanaSwapOrderFromQuote` + module exports + local link setup

**Files:**
- Create: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/postSwapOrderFromQuote.ts`
- Test: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/postSwapOrderFromQuote.test.ts`
- Create: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/solana/index.ts`
- Modify: `/Users/shoom/IdeaProjects/cow-sdk/packages/trading/src/index.ts`

**Interfaces:**
- Consumes: `SolanaQuote`, `SolanaSignAndSend`, `SolanaOrderPostingResult` (Task 6); `buildCreateOrderInstruction` (Task 4); `toHex` (Task 2).
- Produces: `postSolanaSwapOrderFromQuote(quote: SolanaQuote, signAndSend: SolanaSignAndSend): Promise<SolanaOrderPostingResult>`, all of `packages/trading/src/solana/*` re-exported from `@cowprotocol/sdk-trading` (and transitively `@cowprotocol/cow-sdk`) — consumed by `cowswap-frontend` (Task 9).

- [ ] **Step 1: Write the failing test**

Create `packages/trading/src/solana/postSwapOrderFromQuote.test.ts`:

```ts
import { PublicKey } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent, toHex } from './orderIntent'
import { SolanaQuote } from './types'

function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

async function buildFixtureQuote(): Promise<SolanaQuote> {
  const intent: SolanaOrderIntent = {
    owner: fillPubkey(0x11),
    buyTokenAccount: fillPubkey(0x22),
    buyMint: fillPubkey(0x33),
    sellTokenAccount: fillPubkey(0x44),
    sellMint: fillPubkey(0x55),
    sellAmount: 100n,
    buyAmount: 200n,
    validTo: 1_700_000_000,
    kind: OrderKind.SELL,
    partiallyFillable: false,
    createdOnChain: true,
    appData: new Uint8Array(32),
  }
  const intentBytes = encodeOrderIntent(intent)
  const uid = await hashOrderIntent(intentBytes)

  return {
    intent,
    intentBytes,
    uid,
    orderPda: fillPubkey(0x77),
    programId: fillPubkey(0x01),
    jupiterOrder: {
      inputMint: intent.sellMint.toBase58(),
      outputMint: intent.buyMint.toBase58(),
      inAmount: '100',
      outAmount: '200',
      swapMode: 'ExactIn',
      slippageBps: 0,
    },
  }
}

describe('postSolanaSwapOrderFromQuote', () => {
  it('signs and sends the CreateOrder instruction, returning the hex uid as orderId/txHash', async () => {
    const quote = await buildFixtureQuote()
    const signAndSend = jest.fn().mockResolvedValue({ signature: 'fake-signature' })

    const result = await postSolanaSwapOrderFromQuote(quote, signAndSend)

    expect(signAndSend).toHaveBeenCalledTimes(1)
    const instruction = signAndSend.mock.calls[0][0]
    expect(instruction.programId.toBase58()).toBe(quote.programId.toBase58())
    expect(instruction.data[0]).toBe(2)

    expect(result).toEqual({ orderId: toHex(quote.uid), txHash: 'fake-signature' })
  })

  it('propagates a signAndSend rejection', async () => {
    const quote = await buildFixtureQuote()
    const signAndSend = jest.fn().mockRejectedValue(new Error('user rejected'))

    await expect(postSolanaSwapOrderFromQuote(quote, signAndSend)).rejects.toThrow('user rejected')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- postSwapOrderFromQuote`
Expected: FAIL with "Cannot find module './postSwapOrderFromQuote'"

- [ ] **Step 3: Write the implementation**

Create `packages/trading/src/solana/postSwapOrderFromQuote.ts`:

```ts
import { buildCreateOrderInstruction } from './createOrderInstruction'
import { toHex } from './orderIntent'
import { SolanaOrderPostingResult, SolanaQuote, SolanaSignAndSend } from './types'

/**
 * Builds the real `CreateOrder` instruction for `quote` and has the caller sign and submit it. This is
 * the Solana analogue of `postSwapOrderFromQuote` in `postSwapOrder.ts` — but where the EVM version signs
 * order data and POSTs it to the CoW order-book, Solana orders are created entirely on-chain, so this
 * builds a transaction instruction instead of a signed order body. `createdBy` is always `quote.intent.owner`:
 * a single connected wallet both authenticates and funds the order's rent.
 */
export async function postSolanaSwapOrderFromQuote(
  quote: SolanaQuote,
  signAndSend: SolanaSignAndSend,
): Promise<SolanaOrderPostingResult> {
  const instruction = buildCreateOrderInstruction({
    programId: quote.programId,
    owner: quote.intent.owner,
    createdBy: quote.intent.owner,
    orderPda: quote.orderPda,
    intent: quote.intent,
  })

  const { signature } = await signAndSend(instruction)

  return { orderId: toHex(quote.uid), txHash: signature }
}
```

Create `packages/trading/src/solana/index.ts`:

```ts
export * from './types'
export { encodeOrderIntent, ENCODED_ORDER_INTENT_SIZE, hashOrderIntent, toHex } from './orderIntent'
export type { SolanaOrderIntent } from './orderIntent'
export { findOrderPda, ORDER_SEED, SETTLEMENT_SEED } from './orderPda'
export { buildCreateOrderInstruction } from './createOrderInstruction'
export type { CreateOrderInstructionParams } from './createOrderInstruction'
export { JupiterAPI } from './jupiterApi'
export type { JupiterOrderRequest, JupiterOrderResponse } from './jupiterApi'
export { getSolanaQuote } from './getSolanaQuote'
export { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
```

In `packages/trading/src/index.ts`, add at the end:

```ts
/**
 * Solana settlement support
 */
export * from './solana'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test -- postSwapOrderFromQuote`
Expected: PASS (2 tests)

- [ ] **Step 5: Run the full `packages/trading` test suite and typecheck**

Run: `cd /Users/shoom/IdeaProjects/cow-sdk && pnpm --filter @cowprotocol/sdk-trading test && pnpm --filter @cowprotocol/sdk-trading typecheck`
Expected: all tests PASS, no type errors.

- [ ] **Step 6: Build and link for local `cowswap-frontend` development**

```bash
cd /Users/shoom/IdeaProjects/cow-sdk
pnpm --filter @cowprotocol/sdk-trading build
pnpm --filter @cowprotocol/cow-sdk build
cd packages/sdk
pnpm link --global
```

This registers `@cowprotocol/cow-sdk` as a global pnpm link pointing at this checkout's build output (`dist/`). Task 9 links `cowswap-frontend` against it. Do **not** commit any `package.json` change from this step — there is none; `pnpm link --global` doesn't touch `package.json`, only the global link store.

- [ ] **Step 7: Commit**

```bash
cd /Users/shoom/IdeaProjects/cow-sdk
git add packages/trading/src/solana/postSwapOrderFromQuote.ts packages/trading/src/solana/postSwapOrderFromQuote.test.ts packages/trading/src/solana/index.ts packages/trading/src/index.ts
git commit -m "feat(trading): post real CreateOrder instructions for Solana swaps"
```

---

## Task 8: Replace the Solana quote mock with real Jupiter-sourced quotes

**Files:**
- Delete: `/Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend/src/modules/tradeQuote/services/getSolanaMockQuote.ts`
- Create: `/Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend/src/modules/tradeQuote/services/getSolanaJupiterQuote.ts`
- Test: `/Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend/src/modules/tradeQuote/services/getSolanaJupiterQuote.test.ts`
- Modify: `/Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend/src/modules/tradeQuote/services/fetchAndProcessQuote.ts`
- Test: `/Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend/src/modules/tradeQuote/services/fetchAndProcessQuote.test.ts` (append)

**Interfaces:**
- Consumes: `getSolanaQuote`, `SolanaQuote` from `@cowprotocol/cow-sdk` (Task 6, linked per Task 7 Step 6).
- Produces: `getSolanaJupiterQuote(quoteParams: QuoteBridgeRequest): Promise<QuoteAndPost>` — consumed by `fetchAndProcessQuote.ts`'s `fetchSwapQuote`, and by Task 9 (which changes its `postSwapOrderFromQuote` body).

**Before starting:** run Task 7 Step 6 if you haven't (build + `pnpm link --global` in `cow-sdk`), then link it into this repo:

```bash
cd /Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend
pnpm link --global @cowprotocol/cow-sdk
```

This is a local dev-only symlink; it does not modify `package.json` and must not be committed.

- [ ] **Step 1: Write the failing test**

Create `getSolanaJupiterQuote.test.ts`:

```ts
jest.mock('@cowprotocol/cow-sdk', () => ({
  ...jest.requireActual('@cowprotocol/cow-sdk'),
  getSolanaQuote: jest.fn(),
}))

import { PublicKey } from '@solana/web3.js'
import { getQuoteAmountsAndCosts, getSolanaQuote, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { getSolanaJupiterQuote } from './getSolanaJupiterQuote'

const mockGetSolanaQuote = getSolanaQuote as jest.MockedFunction<typeof getSolanaQuote>

const owner = new PublicKey(new Uint8Array(32).fill(9))
const sellMint = new PublicKey(new Uint8Array(32).fill(1))
const buyMint = new PublicKey(new Uint8Array(32).fill(2))

const quoteParams: QuoteBridgeRequest = {
  kind: OrderKind.SELL,
  amount: 1_000_000_000n,
  owner: owner.toBase58() as `0x${string}`,
  sellTokenChainId: SupportedChainId.SOLANA,
  sellTokenAddress: sellMint.toBase58(),
  sellTokenDecimals: 6,
  buyTokenChainId: SupportedChainId.SOLANA,
  buyTokenAddress: buyMint.toBase58(),
  buyTokenDecimals: 9,
  account: owner.toBase58() as `0x${string}`,
  appCode: 'test',
  signer: {} as never,
  receiver: null,
  validFor: 1800,
}

describe('getSolanaJupiterQuote', () => {
  beforeEach(() => {
    mockGetSolanaQuote.mockReset()
  })

  it('builds QuoteAndPost.quoteResults from real Jupiter amounts', async () => {
    mockGetSolanaQuote.mockResolvedValue({
      intent: {
        owner,
        buyTokenAccount: buyMint,
        buyMint,
        sellTokenAccount: sellMint,
        sellMint,
        sellAmount: 1_000_000_000n,
        buyAmount: 9_707_507_795n,
        validTo: 1_700_001_800,
        kind: OrderKind.SELL,
        partiallyFillable: false,
        createdOnChain: true,
        appData: new Uint8Array(32),
      },
      intentBytes: new Uint8Array(213),
      uid: new Uint8Array(32),
      orderPda: buyMint,
      programId: buyMint,
      jupiterOrder: {
        inputMint: sellMint.toBase58(),
        outputMint: buyMint.toBase58(),
        inAmount: '1000000000',
        outAmount: '9707507795',
        swapMode: 'ExactIn',
        slippageBps: 50,
      },
    })

    const quoteAndPost = await getSolanaJupiterQuote(quoteParams)

    expect(quoteAndPost.quoteResults.quoteResponse.quote.sellAmount).toBe('1000000000')
    expect(quoteAndPost.quoteResults.quoteResponse.quote.buyAmount).toBe('9707507795')
    expect(quoteAndPost.quoteResults.quoteResponse.quote.validTo).toBe(1_700_001_800)
    expect(quoteAndPost.quoteResults.suggestedSlippageBps).toBe(50)

    const expectedAmountsAndCosts = getQuoteAmountsAndCosts({
      orderParams: quoteAndPost.quoteResults.quoteResponse.quote,
      slippagePercentBps: 50,
      partnerFeeBps: 0,
      protocolFeeBps: 0,
    })
    expect(quoteAndPost.quoteResults.amountsAndCosts).toEqual(expectedAmountsAndCosts)
  })

  it('still rejects postSwapOrderFromQuote (real posting is wired in a later task)', async () => {
    mockGetSolanaQuote.mockResolvedValue({
      intent: {
        owner,
        buyTokenAccount: buyMint,
        buyMint,
        sellTokenAccount: sellMint,
        sellMint,
        sellAmount: 1n,
        buyAmount: 1n,
        validTo: 0,
        kind: OrderKind.SELL,
        partiallyFillable: false,
        createdOnChain: true,
        appData: new Uint8Array(32),
      },
      intentBytes: new Uint8Array(213),
      uid: new Uint8Array(32),
      orderPda: buyMint,
      programId: buyMint,
      jupiterOrder: {
        inputMint: sellMint.toBase58(),
        outputMint: buyMint.toBase58(),
        inAmount: '1',
        outAmount: '1',
        swapMode: 'ExactIn',
        slippageBps: 0,
      },
    })

    const quoteAndPost = await getSolanaJupiterQuote(quoteParams)

    await expect(quoteAndPost.postSwapOrderFromQuote()).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/shoom/IdeaProjects/cowswap && npx nx test cowswap-frontend --testFile=getSolanaJupiterQuote`
Expected: FAIL with "Cannot find module './getSolanaJupiterQuote'"

- [ ] **Step 3: Write the implementation**

Delete `getSolanaMockQuote.ts`.

Create `getSolanaJupiterQuote.ts`:

```ts
import {
  getQuoteAmountsAndCosts,
  getSolanaQuote,
  OrderParameters,
  OrderQuoteResponse,
  QuoteAndPost,
  QuoteResults,
} from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { PublicKey } from '@solana/web3.js'

/**
 * Real Solana swap quote: amounts come from `getSolanaQuote` (Jupiter-sourced, from `@cowprotocol/cow-sdk`),
 * the order intent/PDA are computed for real, and `postSwapOrderFromQuote` builds a real on-chain
 * `CreateOrder` instruction — see `getSolanaJupiterQuote`'s caller for how signing is wired in.
 *
 * `tradeParameters`/`orderToSign`/`appDataInfo`/`orderTypedData` stay stubbed: these are EIP-712/CoW
 * app-data concepts the Solana settlement program's order intent has no counterpart for at all.
 */
export async function getSolanaJupiterQuote(quoteParams: QuoteBridgeRequest): Promise<QuoteAndPost> {
  const { kind, amount, sellTokenAddress, buyTokenAddress, owner } = quoteParams

  const solanaQuote = await getSolanaQuote({
    owner: new PublicKey(owner),
    sellMint: new PublicKey(sellTokenAddress),
    buyMint: new PublicKey(buyTokenAddress),
    amount,
    kind,
  })

  const orderParams: OrderParameters = {
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    receiver: null,
    sellAmount: solanaQuote.intent.sellAmount.toString(),
    buyAmount: solanaQuote.intent.buyAmount.toString(),
    validTo: solanaQuote.intent.validTo,
    appData: '{}',
    feeAmount: '0',
    gasAmount: '0',
    gasPrice: '0',
    sellTokenPrice: '0',
    kind,
    partiallyFillable: false,
  }

  const quoteResponse: OrderQuoteResponse = {
    quote: orderParams,
    from: owner,
    expiration: new Date(solanaQuote.intent.validTo * 1000).toISOString(),
    verified: false,
  }

  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams,
    slippagePercentBps: solanaQuote.jupiterOrder.slippageBps,
    partnerFeeBps: 0,
    protocolFeeBps: 0,
  })

  const quoteResults: QuoteResults = {
    quoteResponse,
    amountsAndCosts,
    suggestedSlippageBps: solanaQuote.jupiterOrder.slippageBps,
    tradeParameters: {} as QuoteResults['tradeParameters'],
    orderToSign: {} as QuoteResults['orderToSign'],
    appDataInfo: {} as QuoteResults['appDataInfo'],
    orderTypedData: {} as QuoteResults['orderTypedData'],
  }

  return {
    quoteResults,
    postSwapOrderFromQuote() {
      return Promise.reject(new Error('Solana order posting is not wired up yet'))
    },
  }
}
```

In `fetchAndProcessQuote.ts`:

1. Replace the import on line 21: `import { getSolanaMockQuote } from './getSolanaMockQuote'` → `import { getSolanaJupiterQuote } from './getSolanaJupiterQuote'`.
2. Replace the `processQuoteError` body (lines 56-73) — remove the Solana-swallow branch entirely, since Solana quote errors are now real and should surface like EVM ones:

```ts
  const processQuoteError = (errorLocation: string, error: unknown): void => {
    const parsedError = parseError(errorLocation, error)

    console.error(`[fetchAndProcessQuote]:: ${errorLocation} error`, parsedError)

    tradeQuoteManager.onError(parsedError, chainId, quoteParams, fetchParams)
  }
```

3. Replace the Solana branch in `fetchSwapQuote` (lines 137-144):

```ts
  if (IS_SOLANA_ENABLED && isSolanaChain(quoteParams.sellTokenChainId)) {
    try {
      const quoteAndPost = await getSolanaJupiterQuote(quoteParams)
      tradeQuoteManager.onResponse(quoteAndPost, null, fetchParams, quoteParams)
    } catch (error) {
      processQuoteError('fetchSwapQuote', error)
    }

    return
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/shoom/IdeaProjects/cowswap && npx nx test cowswap-frontend --testFile=getSolanaJupiterQuote`
Expected: PASS (2 tests)

- [ ] **Step 5: Append Solana coverage to `fetchAndProcessQuote.test.ts`**

Add near the top, alongside the existing `jest.mock` calls:

```ts
jest.mock('@cowprotocol/common-const', () => ({
  ...jest.requireActual('@cowprotocol/common-const'),
  IS_SOLANA_ENABLED: true,
}))

jest.mock('./getSolanaJupiterQuote', () => ({
  getSolanaJupiterQuote: jest.fn(),
}))
```

Add near the other imports:

```ts
import { getSolanaJupiterQuote } from './getSolanaJupiterQuote'
```

Add a new top-level `describe` block (e.g. after the `fetchSwapQuote` block):

```ts
describe('Solana quotes', () => {
  const solanaQuoteParams: QuoteBridgeRequest = {
    ...mockQuoteParams,
    sellTokenChainId: SupportedChainId.SOLANA,
    buyTokenChainId: SupportedChainId.SOLANA,
  }
  const mockGetSolanaJupiterQuote = getSolanaJupiterQuote as jest.MockedFunction<typeof getSolanaJupiterQuote>

  it('serves a real Jupiter-sourced quote instead of calling bridgingSdk', async () => {
    const mockQuoteAndPost: QuoteAndPost = { quoteResults: {} as any, postSwapOrderFromQuote: jest.fn() }
    mockGetSolanaJupiterQuote.mockResolvedValue(mockQuoteAndPost)

    await fetchAndProcessQuote(
      mockFetchParams,
      solanaQuoteParams,
      tradeQuotePollingParameters,
      mockAppData,
      mockTradeQuoteManager,
    )

    expect(mockGetSolanaJupiterQuote).toHaveBeenCalledWith(solanaQuoteParams)
    expect(mockBridgingSdk.getQuote).not.toHaveBeenCalled()
    expect(mockTradeQuoteManager.onResponse).toHaveBeenCalledWith(
      mockQuoteAndPost,
      null,
      mockFetchParams,
      solanaQuoteParams,
    )
  })

  it('surfaces a Jupiter quote failure via onError, same as an EVM quote failure', async () => {
    mockGetSolanaJupiterQuote.mockRejectedValue(new Error('no route found'))

    await fetchAndProcessQuote(
      mockFetchParams,
      solanaQuoteParams,
      tradeQuotePollingParameters,
      mockAppData,
      mockTradeQuoteManager,
    )

    expect(mockTradeQuoteManager.onError).toHaveBeenCalled()
    expect(mockTradeQuoteManager.reset).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 6: Run the full test file**

Run: `cd /Users/shoom/IdeaProjects/cowswap && npx nx test cowswap-frontend --testFile=fetchAndProcessQuote`
Expected: PASS (all existing tests + 2 new ones)

- [ ] **Step 7: Commit**

```bash
cd /Users/shoom/IdeaProjects/cowswap
git rm apps/cowswap-frontend/src/modules/tradeQuote/services/getSolanaMockQuote.ts
git add apps/cowswap-frontend/src/modules/tradeQuote/services/getSolanaJupiterQuote.ts \
        apps/cowswap-frontend/src/modules/tradeQuote/services/getSolanaJupiterQuote.test.ts \
        apps/cowswap-frontend/src/modules/tradeQuote/services/fetchAndProcessQuote.ts \
        apps/cowswap-frontend/src/modules/tradeQuote/services/fetchAndProcessQuote.test.ts
git commit -m "feat(tradeQuote): replace the 1:1 Solana quote mock with real Jupiter-sourced quotes"
```

---

## Task 9: Wire real on-chain order posting for Solana swaps

**Files:**
- Modify: `/Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend/src/modules/tradeQuote/types.ts`
- Modify: `/Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend/src/modules/tradeQuote/services/getSolanaJupiterQuote.ts`
- Modify: `/Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend/src/modules/tradeQuote/services/fetchAndProcessQuote.ts`
- Modify: `/Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend/src/modules/tradeQuote/hooks/usePollQuoteCallback.ts`
- Test: `/Users/shoom/IdeaProjects/cowswap/apps/cowswap-frontend/src/modules/tradeQuote/services/getSolanaJupiterQuote.test.ts` (append)

**Interfaces:**
- Consumes: `postSolanaSwapOrderFromQuote` from `@cowprotocol/cow-sdk` (Task 7); `sendSolanaTransaction` from `modules/trade/services/solanaSend/sendSolanaTransaction.ts` (existing); `SigningScheme` from `@cowprotocol/cow-sdk` (existing).
- Produces: `SolanaSigningContext` type (in `modules/tradeQuote/types.ts`) — a real, working `postSwapOrderFromQuote` for Solana swaps.

- [ ] **Step 1: Add `SolanaSigningContext` to `modules/tradeQuote/types.ts`**

Append to the file:

```ts
import { Connection, PublicKey } from '@solana/web3.js'
import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

/** What `getSolanaJupiterQuote`'s `postSwapOrderFromQuote` needs to actually sign and submit a Solana
 * transaction — only available once a Solana wallet is connected, hence optional everywhere it's threaded. */
export interface SolanaSigningContext {
  owner: PublicKey
  provider: SolanaProvider
  connection: Connection
}
```

(Move the `PriceQuality` import and this new import together at the top in the usual import-grouping style used elsewhere in the file — there's no existing convention to violate here since the file only had one import before.)

- [ ] **Step 2: Write the failing test for real order posting**

Append to `getSolanaJupiterQuote.test.ts`, inside a new `describe`:

```ts
jest.mock('@cowprotocol/cow-sdk', () => ({
  ...jest.requireActual('@cowprotocol/cow-sdk'),
  getSolanaQuote: jest.fn(),
  postSolanaSwapOrderFromQuote: jest.fn(),
}))
```

(Add `postSolanaSwapOrderFromQuote: jest.fn()` to the existing top-of-file `jest.mock('@cowprotocol/cow-sdk', ...)` call from Task 8 rather than adding a second mock call for the same module.)

```ts
import { postSolanaSwapOrderFromQuote, SigningScheme } from '@cowprotocol/cow-sdk'
import { Connection } from '@solana/web3.js'
import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'
import { SolanaSigningContext } from '../types'

const mockPostSolanaSwapOrderFromQuote = postSolanaSwapOrderFromQuote as jest.MockedFunction<
  typeof postSolanaSwapOrderFromQuote
>

describe('getSolanaJupiterQuote postSwapOrderFromQuote', () => {
  const solanaQuoteFixture = {
    intent: {
      owner,
      buyTokenAccount: buyMint,
      buyMint,
      sellTokenAccount: sellMint,
      sellMint,
      sellAmount: 1_000_000_000n,
      buyAmount: 9_707_507_795n,
      validTo: 1_700_001_800,
      kind: OrderKind.SELL,
      partiallyFillable: false,
      createdOnChain: true,
      appData: new Uint8Array(32),
    },
    intentBytes: new Uint8Array(213),
    uid: new Uint8Array(32),
    orderPda: buyMint,
    programId: buyMint,
    jupiterOrder: {
      inputMint: sellMint.toBase58(),
      outputMint: buyMint.toBase58(),
      inAmount: '1000000000',
      outAmount: '9707507795',
      swapMode: 'ExactIn' as const,
      slippageBps: 50,
    },
  }

  beforeEach(() => {
    mockGetSolanaQuote.mockReset()
    mockGetSolanaQuote.mockResolvedValue(solanaQuoteFixture)
    mockPostSolanaSwapOrderFromQuote.mockReset()
  })

  it('rejects when no Solana wallet is connected', async () => {
    const quoteAndPost = await getSolanaJupiterQuote(quoteParams, undefined)

    await expect(quoteAndPost.postSwapOrderFromQuote()).rejects.toThrow('Solana wallet not connected')
    expect(mockPostSolanaSwapOrderFromQuote).not.toHaveBeenCalled()
  })

  it('signs and sends through the connected wallet when a signing context is provided', async () => {
    mockPostSolanaSwapOrderFromQuote.mockResolvedValue({ orderId: 'deadbeef', txHash: 'fake-signature' })

    const signingContext: SolanaSigningContext = {
      owner,
      provider: {} as SolanaProvider,
      connection: {} as Connection,
    }

    const quoteAndPost = await getSolanaJupiterQuote(quoteParams, signingContext)
    const result = await quoteAndPost.postSwapOrderFromQuote()

    expect(mockPostSolanaSwapOrderFromQuote).toHaveBeenCalledWith(solanaQuoteFixture, expect.any(Function))
    expect(result).toEqual({
      orderId: 'deadbeef',
      txHash: 'fake-signature',
      signingScheme: SigningScheme.PRESIGN,
      signature: 'fake-signature',
      orderToSign: {},
    })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd /Users/shoom/IdeaProjects/cowswap && npx nx test cowswap-frontend --testFile=getSolanaJupiterQuote`
Expected: FAIL — `getSolanaJupiterQuote` doesn't accept a second parameter yet, and `postSwapOrderFromQuote()` still always rejects with the old "not wired up yet" message.

- [ ] **Step 4: Implement real order posting**

Replace `getSolanaJupiterQuote.ts`'s function signature and closure (keep the quote-building body from Task 8 unchanged):

```ts
import {
  getQuoteAmountsAndCosts,
  getSolanaQuote,
  OrderParameters,
  OrderPostingResult,
  OrderQuoteResponse,
  postSolanaSwapOrderFromQuote,
  QuoteAndPost,
  QuoteResults,
  SigningScheme,
} from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { PublicKey } from '@solana/web3.js'

import { sendSolanaTransaction } from 'modules/trade/services/solanaSend/sendSolanaTransaction'

import { SolanaSigningContext } from '../types'

export async function getSolanaJupiterQuote(
  quoteParams: QuoteBridgeRequest,
  solanaSigningContext?: SolanaSigningContext,
): Promise<QuoteAndPost> {
  const { kind, amount, sellTokenAddress, buyTokenAddress, owner } = quoteParams

  const solanaQuote = await getSolanaQuote({
    owner: new PublicKey(owner),
    sellMint: new PublicKey(sellTokenAddress),
    buyMint: new PublicKey(buyTokenAddress),
    amount,
    kind,
  })

  const orderParams: OrderParameters = {
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    receiver: null,
    sellAmount: solanaQuote.intent.sellAmount.toString(),
    buyAmount: solanaQuote.intent.buyAmount.toString(),
    validTo: solanaQuote.intent.validTo,
    appData: '{}',
    feeAmount: '0',
    gasAmount: '0',
    gasPrice: '0',
    sellTokenPrice: '0',
    kind,
    partiallyFillable: false,
  }

  const quoteResponse: OrderQuoteResponse = {
    quote: orderParams,
    from: owner,
    expiration: new Date(solanaQuote.intent.validTo * 1000).toISOString(),
    verified: false,
  }

  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams,
    slippagePercentBps: solanaQuote.jupiterOrder.slippageBps,
    partnerFeeBps: 0,
    protocolFeeBps: 0,
  })

  const quoteResults: QuoteResults = {
    quoteResponse,
    amountsAndCosts,
    suggestedSlippageBps: solanaQuote.jupiterOrder.slippageBps,
    tradeParameters: {} as QuoteResults['tradeParameters'],
    orderToSign: {} as QuoteResults['orderToSign'],
    appDataInfo: {} as QuoteResults['appDataInfo'],
    orderTypedData: {} as QuoteResults['orderTypedData'],
  }

  return {
    quoteResults,
    async postSwapOrderFromQuote(): Promise<OrderPostingResult> {
      if (!solanaSigningContext) {
        throw new Error('Solana wallet not connected')
      }

      const { owner: signingOwner, provider, connection } = solanaSigningContext

      const result = await postSolanaSwapOrderFromQuote(solanaQuote, async (instruction) => {
        const { hash } = await sendSolanaTransaction(connection, provider, signingOwner, [instruction])
        return { signature: hash }
      })

      return {
        orderId: result.orderId,
        txHash: result.txHash,
        // No Solana equivalent exists for an off-chain signing scheme/signature: the order is
        // authenticated by the owner's own on-chain CreateOrder transaction instead. PRESIGN is the
        // closest EVM analogue (owner authorizes via their own on-chain action, not an EIP-712 signature)
        // — the same choice `swapFlow/index.ts` makes for EVM orders that skip off-chain signing.
        signingScheme: SigningScheme.PRESIGN,
        signature: result.txHash,
        orderToSign: {} as OrderPostingResult['orderToSign'],
      }
    },
  }
}
```

In `fetchAndProcessQuote.ts`:
1. Add `solanaSigningContext?: SolanaSigningContext` as a new trailing parameter of `fetchAndProcessQuote`, and thread it down into `fetchSwapQuote`'s parameter list and its call to `getSolanaJupiterQuote`:

```ts
export async function fetchAndProcessQuote(
  fetchParams: TradeQuoteFetchParams,
  quoteParams: QuoteBridgeRequest,
  { useSuggestedSlippageApi }: TradeQuotePollingParameters,
  appData: AppDataInfo['doc'] | undefined,
  tradeQuoteManager: TradeQuoteManager,
  getCorrelatedTokens?: SwapAdvancedSettings['getCorrelatedTokens'],
  solanaSigningContext?: SolanaSigningContext,
): Promise<void> {
```

Update the `fetchSwapQuote(...)` call inside `fetchAndProcessQuote` to pass `solanaSigningContext` through, add the parameter to `fetchSwapQuote`'s signature, and update its Solana branch:

```ts
  if (isBridge) {
    await fetchBridgingQuote(fetchParams, quoteParams, advancedSettings, tradeQuoteManager, processQuoteError)
  } else {
    await fetchSwapQuote(fetchParams, quoteParams, advancedSettings, tradeQuoteManager, processQuoteError, solanaSigningContext)
  }
```

Add `solanaSigningContext?: SolanaSigningContext` as a new trailing parameter of `fetchSwapQuote` (same signature style as the change above), and replace only its Solana branch (the `if (IS_SOLANA_ENABLED && isSolanaChain(...))` block, currently lines 137-144 after Task 8's edit) — the rest of `fetchSwapQuote` (the EVM `getOptimalQuote`/`getFastQuote` path below it) is untouched:

```ts
  if (IS_SOLANA_ENABLED && isSolanaChain(quoteParams.sellTokenChainId)) {
    try {
      const quoteAndPost = await getSolanaJupiterQuote(quoteParams, solanaSigningContext)
      tradeQuoteManager.onResponse(quoteAndPost, null, fetchParams, quoteParams)
    } catch (error) {
      processQuoteError('fetchSwapQuote', error)
    }

    return
  }
```

Add the import: `import { SolanaSigningContext } from '../types'`.

In `usePollQuoteCallback.ts`:

1. Add imports:

```ts
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'

import { SolanaSigningContext } from '../types'
```

2. Inside the hook body, alongside the other hook calls:

```ts
  const { account: walletAccount } = useWalletInfo()
  const solanaProvider = useSolanaWalletProvider()
  const { connection: solanaConnection } = useAppKitConnection()

  const solanaSigningContext: SolanaSigningContext | undefined = useMemo(() => {
    if (!walletAccount || !solanaProvider || !solanaConnection) return undefined

    return { owner: new PublicKey(walletAccount), provider: solanaProvider, connection: solanaConnection }
  }, [walletAccount, solanaProvider, solanaConnection])
```

(Add `useMemo` to the existing `import { RefObject, useCallback, useRef } from 'react'` line.)

3. Pass it through in the `fetchQuote` closure and add it to the outer `useCallback`'s dependency array:

```ts
      const fetchQuote = (fetchParams: TradeQuoteFetchParams): Promise<void> => {
        const now = Date.now()
        updatingStartTimestamp.current = now

        return fetchAndProcessQuote(
          fetchParams,
          quoteParams,
          quotePollingParams,
          appData,
          tradeQuoteManager,
          getCorrelatedTokensByChainId,
          solanaSigningContext,
        )
      }
```

Add `solanaSigningContext` to the dependency array at the bottom of the `useCallback` call (alongside `quoteParams`, `appData`, etc.).

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/shoom/IdeaProjects/cowswap && npx nx test cowswap-frontend --testFile=getSolanaJupiterQuote`
Expected: PASS (all tests from Task 8 + the 2 new ones)

- [ ] **Step 6: Run the full affected test suite and typecheck**

Run: `cd /Users/shoom/IdeaProjects/cowswap && npx nx test cowswap-frontend --testFile=fetchAndProcessQuote && npx nx typecheck cowswap-frontend`
Expected: all PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/shoom/IdeaProjects/cowswap
git add apps/cowswap-frontend/src/modules/tradeQuote/types.ts \
        apps/cowswap-frontend/src/modules/tradeQuote/services/getSolanaJupiterQuote.ts \
        apps/cowswap-frontend/src/modules/tradeQuote/services/getSolanaJupiterQuote.test.ts \
        apps/cowswap-frontend/src/modules/tradeQuote/services/fetchAndProcessQuote.ts \
        apps/cowswap-frontend/src/modules/tradeQuote/hooks/usePollQuoteCallback.ts
git commit -m "feat(tradeQuote): sign and submit real on-chain CreateOrder instructions for Solana swaps"
```

**Note:** submitting the resulting transaction will fail against any live cluster until the settlement program's backend/indexer support is live — this is expected (see spec's "Known open risks"). This task's job is to make the client-side path real and correct, not to make it succeed end-to-end yet.
