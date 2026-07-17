# Solana Order Creation in Limit Orders — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working prototype that creates a CoW Protocol order on Solana mainnet from the Limit Orders UI, with a manually entered price (no backend quote).

**Architecture:** A third order-placement strategy inside `modules/limitOrders`: a pure transaction builder (intent encoding → SHA-256 UID → PDA derivation → 3 instructions), a `solanaOrderFlow` service that sends the transaction via the Reown AppKit Solana provider, and a dedicated `SolanaTradeButtons` container rendered by the existing `TradeButtons` when the wallet is on Solana. EVM flows are untouched except two guarded one-liners.

**Tech Stack:** React + jotai (existing app), `@solana/web3.js@1.98.4`, `@solana/spl-token@0.4.14`, `@noble/hashes@1.4.0` (sync SHA-256), Reown AppKit Solana adapter (already integrated), Jest 30 via Nx.

**Spec:** `docs/superpowers/specs/2026-07-16-solana-limit-orders-design.md` — read it first.

## Global Constraints

- Settlement program ID (mainnet): `moosEjJg5mbGRPRU7Vg4AaHZLvbbgknevWR9J1bNgME`. Mainnet only.
- Intent wire format (150 bytes, little-endian numbers): `owner(32) ‖ buy_token_account(32) ‖ sell_token_account(32) ‖ sell_amount(u64) ‖ buy_amount(u64) ‖ valid_to(u32) ‖ kind(u8: 0=sell,1=buy) ‖ partially_fillable(u8) ‖ app_data(32)`. `CreateOrder` instruction data = `[2, ...intent]` (151 bytes).
- PDA seeds: state PDA `["settlement"]`, order PDA `["settlement", sha256(intent), "order"]`.
- Only these new dependencies, in `apps/cowswap-frontend/package.json`: `@solana/web3.js@1.98.4`, `@solana/spl-token@0.4.14`, `@noble/hashes@1.4.0`. Package manager is **pnpm**.
- Test runner is Jest 30 through Nx: `pnpm exec nx test cowswap-frontend --testPathPatterns=<pattern>` (note: `--testPathPatterns`, plural — Jest 30 renamed the flag).
- Other Nx targets: `pnpm exec nx typecheck cowswap-frontend`, `pnpm exec nx lint cowswap-frontend`, `pnpm exec nx serve cowswap-frontend`.
- User-facing strings use Lingui macros (`<Trans>` from `@lingui/react/macro`), matching the surrounding code.
- Prototype scope: SPL tokens only (no native-SOL wrapping), recipient = owner, `app_data` = 32 zero bytes, no orders-table integration, no cancellation.
- Do not modify EVM behavior. The only shared files touched are `TradeButtons` (limit orders) and `useQuoteParams`, both with `isSolanaChain` guards.
- Commit style: conventional commits, e.g. `feat(solana): …` (matches recent history).

## File Structure

| File | Responsibility |
| --- | --- |
| `apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/const.ts` | Program ID, seeds, discriminator, sizes, Solscan URL |
| `.../solanaOrderFlow/orderIntent.ts` | Intent type, 150-byte encoding, UID hashing, PDA derivation (pure) |
| `.../solanaOrderFlow/orderIntent.test.ts` | Regression vectors from the Rust repo + mainnet example tx |
| `.../solanaOrderFlow/buildCreateOrderInstructions.ts` | ATA derivation + the 3 instructions (pure) |
| `.../solanaOrderFlow/buildCreateOrderInstructions.test.ts` | Reconstructs the mainnet example tx |
| `.../solanaOrderFlow/types.ts` | `SolanaOrderFlowContext`, `SolanaOrderFlowResult` |
| `.../solanaOrderFlow/index.ts` | `solanaOrderFlow()`: validTo calc, build tx, send, confirm |
| `.../solanaOrderFlow/solanaOrderFlow.test.ts` | Flow test with mocked connection/provider |
| `apps/cowswap-frontend/src/modules/limitOrders/hooks/useSolanaOrderFlowContext.ts` | Assembles the context from wallet/derived state/settings |
| `apps/cowswap-frontend/src/modules/limitOrders/containers/SolanaTradeButtons/index.tsx` | Validation ladder + place-order button + snackbars |
| `apps/cowswap-frontend/src/modules/limitOrders/containers/TradeButtons/index.tsx` (modify) | Render `SolanaTradeButtons` when on Solana |
| `apps/cowswap-frontend/src/modules/tradeQuote/hooks/useQuoteParams.ts` (modify) | Skip quote polling for Solana |
| `apps/cowswap-frontend/package.json` (modify) | New dependencies |

## Verified test vectors (do not re-derive — these are confirmed against mainnet)

From mainnet tx `4hy8scaTfLNyJiAPbF47k4YWyWmE2CFfvLj6zkTUibpknEcNfjWWDyCT185qDbRYYLMtdDzGkVtuNXJEE2oXE6JG` (decoded from the raw instruction data via RPC):

- Owner / fee payer: `54o2XBzBTkP7tmQSLu3Um9oDvLdNVrbMyQxqiYVKALLN`
- Sell token account (owner's WSOL ATA): `cEDc7aAMaCqBX546QWCVxnvfMLUUV3JETQ6qnpeLUaY`
- Buy token account (owner's USDC ATA): `E9xwK5SDXSJLW1A4WRyVT1FzVpt8gREGMVibVW9A8xX5`
- Intent fields: `sell_amount=0`, `buy_amount=10000000`, `valid_to=1783575524`, `kind=1` (buy), `partially_fillable=0`, `app_data=32×0x00`
- Order UID: `f41a85a660c71b6fac30d024d29df733b8b101f931e30fbf8c37f5a0f2d42b2f`
- Order PDA: `AmtUsUoFuGtRpxeQnQEFR83xyeqTrPH8Z4y9twso26Lv`
- Approve delegate (= settlement state PDA): `3PYmNPBdoFBGqtAeopGMS5YvnQnfxh8J9sNS3jjzKhb8`

From the Rust repo (`interface/src/data/intent.rs`, tests `encoding_regression` / `uid_digest_regression`): the sample intent (fields repeated in Task 2's test code) encodes to a pinned byte string and hashes to UID `7ce7c6a74671090771fa33851387444064aca759ce55b80708723076722f5e00`.

---

### Task 1: Add Solana dependencies to cowswap-frontend

**Files:**
- Modify: `apps/cowswap-frontend/package.json`

**Interfaces:**
- Consumes: nothing
- Produces: `@solana/web3.js`, `@solana/spl-token`, `@noble/hashes` importable from `apps/cowswap-frontend` sources (Tasks 2–4 import them)

- [ ] **Step 1: Add dependencies**

In `apps/cowswap-frontend/package.json`, add to the `dependencies` object (keep alphabetical order; `@reown/appkit` etc. are already there — `@solana/web3.js` and `@solana/spl-token` versions match the ones already used by `libs/wallet` and `libs/balances-and-allowances`):

```json
"@noble/hashes": "1.4.0",
"@solana/spl-token": "0.4.14",
"@solana/web3.js": "1.98.4",
```

- [ ] **Step 2: Install**

Run: `pnpm install`
Expected: lockfile updates (or is already satisfied — these exact versions are in `pnpm-lock.yaml` as transitive deps), exit code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/cowswap-frontend/package.json pnpm-lock.yaml
git commit -m "chore(solana): add web3.js, spl-token and noble/hashes to cowswap-frontend"
```

---

### Task 2: Order intent encoding, UID and PDA derivation

**Files:**
- Create: `apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/const.ts`
- Create: `apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/orderIntent.ts`
- Test: `apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/orderIntent.test.ts`

**Interfaces:**
- Consumes: `@solana/web3.js` (`PublicKey`), `@noble/hashes/sha256`, `OrderKind` from `@cowprotocol/cow-sdk` (string enum: `OrderKind.SELL = 'sell'`, `OrderKind.BUY = 'buy'`)
- Produces (used by Task 3):
  - `interface SolanaOrderIntent { owner: PublicKey; buyTokenAccount: PublicKey; sellTokenAccount: PublicKey; sellAmount: bigint; buyAmount: bigint; validTo: number; kind: OrderKind; partiallyFillable: boolean; appData: Uint8Array }`
  - `encodeOrderIntent(intent: SolanaOrderIntent): Uint8Array` (150 bytes)
  - `computeOrderUid(intentBytes: Uint8Array): Uint8Array` (32 bytes)
  - `findStatePda(): PublicKey`
  - `findOrderPda(orderUid: Uint8Array): PublicKey`
  - Constants: `SOLANA_SETTLEMENT_PROGRAM_ID: PublicKey`, `CREATE_ORDER_DISCRIMINATOR = 2`, `ORDER_INTENT_SIZE = 150`, `SOLANA_APP_DATA` (32 zero bytes), `SOLSCAN_TX_URL`

- [ ] **Step 1: Write the constants file**

`apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/const.ts`:

```ts
import { PublicKey } from '@solana/web3.js'

// CoW Protocol settlement program on Solana mainnet
// https://github.com/cowprotocol/solana-programs
export const SOLANA_SETTLEMENT_PROGRAM_ID = new PublicKey('moosEjJg5mbGRPRU7Vg4AaHZLvbbgknevWR9J1bNgME')

// PDA seed scheme: every PDA starts with SETTLEMENT_SEED; order PDAs append the order UID and ORDER_SEED
export const SETTLEMENT_SEED = new TextEncoder().encode('settlement')
export const ORDER_SEED = new TextEncoder().encode('order')

export const CREATE_ORDER_DISCRIMINATOR = 2
export const ORDER_INTENT_SIZE = 150

// Opaque 32 bytes; the settlement program does not interpret them. Zeroed for the prototype.
export const SOLANA_APP_DATA = new Uint8Array(32)

export const SOLSCAN_TX_URL = 'https://solscan.io/tx/'
```

- [ ] **Step 2: Write the failing test**

`apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/orderIntent.test.ts`:

```ts
import { OrderKind } from '@cowprotocol/cow-sdk'

import { PublicKey } from '@solana/web3.js'

import { computeOrderUid, encodeOrderIntent, findOrderPda, findStatePda, SolanaOrderIntent } from './orderIntent'

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Mirrors `sample_intent(OrderKind::Buy, true)` from cowprotocol/solana-programs
// interface/src/data/intent.rs (tests `encoding_regression` and `uid_digest_regression`)
const RUST_SAMPLE_INTENT: SolanaOrderIntent = {
  owner: new PublicKey(new Uint8Array(32).fill(0x11)),
  buyTokenAccount: new PublicKey(new Uint8Array(32).fill(0x22)),
  sellTokenAccount: new PublicKey(new Uint8Array(32).fill(0x33)),
  sellAmount: 0x0123456789abcdefn,
  buyAmount: 0xfedcba9876543210n,
  validTo: 0xdeadbeef,
  kind: OrderKind.BUY,
  partiallyFillable: true,
  appData: new Uint8Array(32).fill(0x44),
}

const RUST_SAMPLE_ENCODING =
  '11'.repeat(32) + // owner
  '22'.repeat(32) + // buy_token_account
  '33'.repeat(32) + // sell_token_account
  'efcdab8967452301' + // sell_amount LE
  '1032547698badcfe' + // buy_amount LE
  'efbeadde' + // valid_to LE
  '01' + // kind: buy
  '01' + // partially_fillable: true
  '44'.repeat(32) // app_data

const RUST_SAMPLE_UID = '7ce7c6a74671090771fa33851387444064aca759ce55b80708723076722f5e00'

// Decoded from the raw CreateOrder instruction of mainnet tx
// 4hy8scaTfLNyJiAPbF47k4YWyWmE2CFfvLj6zkTUibpknEcNfjWWDyCT185qDbRYYLMtdDzGkVtuNXJEE2oXE6JG
const MAINNET_INTENT: SolanaOrderIntent = {
  owner: new PublicKey('54o2XBzBTkP7tmQSLu3Um9oDvLdNVrbMyQxqiYVKALLN'),
  buyTokenAccount: new PublicKey('E9xwK5SDXSJLW1A4WRyVT1FzVpt8gREGMVibVW9A8xX5'),
  sellTokenAccount: new PublicKey('cEDc7aAMaCqBX546QWCVxnvfMLUUV3JETQ6qnpeLUaY'),
  sellAmount: 0n,
  buyAmount: 10_000_000n,
  validTo: 1783575524,
  kind: OrderKind.BUY,
  partiallyFillable: false,
  appData: new Uint8Array(32),
}
const MAINNET_UID = 'f41a85a660c71b6fac30d024d29df733b8b101f931e30fbf8c37f5a0f2d42b2f'

describe('encodeOrderIntent', () => {
  it('produces 150 bytes', () => {
    expect(encodeOrderIntent(RUST_SAMPLE_INTENT)).toHaveLength(150)
  })

  it('matches the Rust encoding_regression vector', () => {
    expect(toHex(encodeOrderIntent(RUST_SAMPLE_INTENT))).toBe(RUST_SAMPLE_ENCODING)
  })

  it('encodes a sell fill-or-kill order with zero flag bytes', () => {
    const encoded = encodeOrderIntent({ ...RUST_SAMPLE_INTENT, kind: OrderKind.SELL, partiallyFillable: false })
    expect(encoded[116]).toBe(0)
    expect(encoded[117]).toBe(0)
  })
})

describe('computeOrderUid', () => {
  it('matches the Rust uid_digest_regression vector', () => {
    expect(toHex(computeOrderUid(encodeOrderIntent(RUST_SAMPLE_INTENT)))).toBe(RUST_SAMPLE_UID)
  })

  it('matches the mainnet example order UID', () => {
    expect(toHex(computeOrderUid(encodeOrderIntent(MAINNET_INTENT)))).toBe(MAINNET_UID)
  })
})

describe('PDA derivation', () => {
  it('derives the settlement state PDA seen as the approve delegate on mainnet', () => {
    expect(findStatePda().toBase58()).toBe('3PYmNPBdoFBGqtAeopGMS5YvnQnfxh8J9sNS3jjzKhb8')
  })

  it('derives the order PDA of the mainnet example order', () => {
    const uid = computeOrderUid(encodeOrderIntent(MAINNET_INTENT))
    expect(findOrderPda(uid).toBase58()).toBe('AmtUsUoFuGtRpxeQnQEFR83xyeqTrPH8Z4y9twso26Lv')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec nx test cowswap-frontend --testPathPatterns=solanaOrderFlow`
Expected: FAIL — cannot find module `./orderIntent`.

- [ ] **Step 4: Write the implementation**

`apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/orderIntent.ts`:

```ts
import { OrderKind } from '@cowprotocol/cow-sdk'

import { sha256 } from '@noble/hashes/sha256'
import { PublicKey } from '@solana/web3.js'

import { ORDER_INTENT_SIZE, ORDER_SEED, SETTLEMENT_SEED, SOLANA_SETTLEMENT_PROGRAM_ID } from './const'

export interface SolanaOrderIntent {
  owner: PublicKey
  /** SPL token account (not mint) receiving the buy-side proceeds */
  buyTokenAccount: PublicKey
  /** SPL token account (not mint) the sell funds are pulled from; must be owned by `owner` */
  sellTokenAccount: PublicKey
  sellAmount: bigint
  buyAmount: bigint
  /** Unix timestamp (seconds) after which the order expires */
  validTo: number
  kind: OrderKind
  partiallyFillable: boolean
  /** Opaque 32 bytes */
  appData: Uint8Array
}

/**
 * Canonical 150-byte encoding, the wire format and the UID preimage.
 * Layout: owner(32) ‖ buy(32) ‖ sell(32) ‖ sellAmount(u64 LE) ‖ buyAmount(u64 LE)
 *         ‖ validTo(u32 LE) ‖ kind(u8) ‖ partiallyFillable(u8) ‖ appData(32)
 */
export function encodeOrderIntent(intent: SolanaOrderIntent): Uint8Array {
  const bytes = new Uint8Array(ORDER_INTENT_SIZE)
  const view = new DataView(bytes.buffer)

  bytes.set(intent.owner.toBytes(), 0)
  bytes.set(intent.buyTokenAccount.toBytes(), 32)
  bytes.set(intent.sellTokenAccount.toBytes(), 64)
  view.setBigUint64(96, intent.sellAmount, true)
  view.setBigUint64(104, intent.buyAmount, true)
  view.setUint32(112, intent.validTo, true)
  bytes[116] = intent.kind === OrderKind.BUY ? 1 : 0
  bytes[117] = intent.partiallyFillable ? 1 : 0
  bytes.set(intent.appData, 118)

  return bytes
}

/** Order UID = SHA-256 of the canonical intent bytes; also the middle seed of the order PDA */
export function computeOrderUid(intentBytes: Uint8Array): Uint8Array {
  return sha256(intentBytes)
}

/** Settlement state PDA: the SPL delegate that pulls sell funds at execution time */
export function findStatePda(): PublicKey {
  return PublicKey.findProgramAddressSync([SETTLEMENT_SEED], SOLANA_SETTLEMENT_PROGRAM_ID)[0]
}

export function findOrderPda(orderUid: Uint8Array): PublicKey {
  return PublicKey.findProgramAddressSync([SETTLEMENT_SEED, orderUid, ORDER_SEED], SOLANA_SETTLEMENT_PROGRAM_ID)[0]
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec nx test cowswap-frontend --testPathPatterns=solanaOrderFlow`
Expected: PASS (7 tests). If the UID tests pass but PDA tests fail, the seeds are wrong; if encoding fails at offset 96+, check little-endian writes.

- [ ] **Step 6: Commit**

```bash
git add apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow
git commit -m "feat(solana): order intent encoding, UID and PDA derivation"
```

---

### Task 3: Build the create-order instructions

**Files:**
- Create: `apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/buildCreateOrderInstructions.ts`
- Test: `apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/buildCreateOrderInstructions.test.ts`

**Interfaces:**
- Consumes: Task 2's `encodeOrderIntent`, `computeOrderUid`, `findOrderPda`, `findStatePda`, constants
- Produces (used by Task 4):
  - `interface SolanaTokenParams { address: string; isToken2022: boolean }` (address = base58 mint)
  - `interface BuildCreateOrderParams { account: string; sellToken: SolanaTokenParams; buyToken: SolanaTokenParams; sellAmount: bigint; buyAmount: bigint; validTo: number; kind: OrderKind; partiallyFillable: boolean }`
  - `buildCreateOrderInstructions(params: BuildCreateOrderParams): { instructions: TransactionInstruction[]; orderUid: Uint8Array; orderPda: PublicKey; sellTokenAccount: PublicKey; buyTokenAccount: PublicKey }`

- [ ] **Step 1: Write the failing test**

`apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/buildCreateOrderInstructions.test.ts`:

```ts
import { OrderKind } from '@cowprotocol/cow-sdk'

import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SystemProgram } from '@solana/web3.js'

import { buildCreateOrderInstructions } from './buildCreateOrderInstructions'
import { SOLANA_SETTLEMENT_PROGRAM_ID } from './const'

// Reconstructs the order of mainnet tx
// 4hy8scaTfLNyJiAPbF47k4YWyWmE2CFfvLj6zkTUibpknEcNfjWWDyCT185qDbRYYLMtdDzGkVtuNXJEE2oXE6JG
// (buy 10 USDC paying with WSOL, fill-or-kill)
const PARAMS = {
  account: '54o2XBzBTkP7tmQSLu3Um9oDvLdNVrbMyQxqiYVKALLN',
  sellToken: { address: 'So11111111111111111111111111111111111111112', isToken2022: false }, // WSOL
  buyToken: { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', isToken2022: false }, // USDC
  sellAmount: 0n,
  buyAmount: 10_000_000n,
  validTo: 1783575524,
  kind: OrderKind.BUY,
  partiallyFillable: false,
}

describe('buildCreateOrderInstructions', () => {
  it('derives the same accounts and instructions as the mainnet example tx', () => {
    const { instructions, orderPda, sellTokenAccount, buyTokenAccount } = buildCreateOrderInstructions(PARAMS)

    // ATAs of the owner, as seen on-chain
    expect(sellTokenAccount.toBase58()).toBe('cEDc7aAMaCqBX546QWCVxnvfMLUUV3JETQ6qnpeLUaY')
    expect(buyTokenAccount.toBase58()).toBe('E9xwK5SDXSJLW1A4WRyVT1FzVpt8gREGMVibVW9A8xX5')
    expect(orderPda.toBase58()).toBe('AmtUsUoFuGtRpxeQnQEFR83xyeqTrPH8Z4y9twso26Lv')

    expect(instructions).toHaveLength(3)
    const [createBuyAta, approve, createOrder] = instructions

    // buy ATA idempotent creation: account 1 is the ATA being created
    expect(createBuyAta.keys[1].pubkey.equals(buyTokenAccount)).toBe(true)

    // approve: keys are [source token account, delegate, owner]; delegate is the settlement state PDA
    expect(approve.programId.equals(TOKEN_PROGRAM_ID)).toBe(true)
    expect(approve.keys[0].pubkey.equals(sellTokenAccount)).toBe(true)
    expect(approve.keys[1].pubkey.toBase58()).toBe('3PYmNPBdoFBGqtAeopGMS5YvnQnfxh8J9sNS3jjzKhb8')

    // createOrder data: [discriminator=2, ...150 intent bytes]
    expect(createOrder.programId.equals(SOLANA_SETTLEMENT_PROGRAM_ID)).toBe(true)
    expect(createOrder.data).toHaveLength(151)
    expect(createOrder.data[0]).toBe(2)

    // createOrder accounts: owner (signer, ro), created_by = owner (signer, writable),
    // order PDA (writable), system program (ro)
    expect(createOrder.keys).toHaveLength(4)
    expect(createOrder.keys[0].pubkey.toBase58()).toBe(PARAMS.account)
    expect(createOrder.keys[0].isSigner).toBe(true)
    expect(createOrder.keys[0].isWritable).toBe(false)
    expect(createOrder.keys[1].pubkey.toBase58()).toBe(PARAMS.account)
    expect(createOrder.keys[1].isSigner).toBe(true)
    expect(createOrder.keys[1].isWritable).toBe(true)
    expect(createOrder.keys[2].pubkey.equals(orderPda)).toBe(true)
    expect(createOrder.keys[2].isSigner).toBe(false)
    expect(createOrder.keys[2].isWritable).toBe(true)
    expect(createOrder.keys[3].pubkey.equals(SystemProgram.programId)).toBe(true)
    expect(createOrder.keys[3].isSigner).toBe(false)
    expect(createOrder.keys[3].isWritable).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec nx test cowswap-frontend --testPathPatterns=buildCreateOrderInstructions`
Expected: FAIL — cannot find module `./buildCreateOrderInstructions`.

- [ ] **Step 3: Write the implementation**

`apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/buildCreateOrderInstructions.ts`:

```ts
import { OrderKind } from '@cowprotocol/cow-sdk'

import {
  createApproveInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'

import { CREATE_ORDER_DISCRIMINATOR, SOLANA_APP_DATA, SOLANA_SETTLEMENT_PROGRAM_ID } from './const'
import { computeOrderUid, encodeOrderIntent, findOrderPda, findStatePda } from './orderIntent'

export interface SolanaTokenParams {
  /** base58 mint address */
  address: string
  /** Token-2022 mints live under a different token program (see TOKEN_2022_TAG in the token lists) */
  isToken2022: boolean
}

export interface BuildCreateOrderParams {
  /** base58 wallet address: order owner, rent payer and fee payer */
  account: string
  sellToken: SolanaTokenParams
  buyToken: SolanaTokenParams
  sellAmount: bigint
  buyAmount: bigint
  /** Unix timestamp (seconds) */
  validTo: number
  kind: OrderKind
  partiallyFillable: boolean
}

export interface CreateOrderInstructions {
  instructions: TransactionInstruction[]
  orderUid: Uint8Array
  orderPda: PublicKey
  sellTokenAccount: PublicKey
  buyTokenAccount: PublicKey
}

export function buildCreateOrderInstructions(params: BuildCreateOrderParams): CreateOrderInstructions {
  const owner = new PublicKey(params.account)
  const sellMint = new PublicKey(params.sellToken.address)
  const buyMint = new PublicKey(params.buyToken.address)
  const sellTokenProgram = params.sellToken.isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
  const buyTokenProgram = params.buyToken.isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID

  const sellTokenAccount = getAssociatedTokenAddressSync(sellMint, owner, false, sellTokenProgram)
  const buyTokenAccount = getAssociatedTokenAddressSync(buyMint, owner, false, buyTokenProgram)

  // The buy-side token account must exist for the order to be settleable
  const createBuyAta = createAssociatedTokenAccountIdempotentInstruction(
    owner,
    buyTokenAccount,
    owner,
    buyMint,
    buyTokenProgram,
  )

  // The settlement state PDA pulls the sell funds via SPL delegation at execution time.
  // NOTE (accepted prototype limitation): SPL token accounts have a single delegate,
  // so a second order on the same sell token overwrites the previous delegated amount.
  const approve = createApproveInstruction(
    sellTokenAccount,
    findStatePda(),
    owner,
    params.sellAmount,
    [],
    sellTokenProgram,
  )

  const intentBytes = encodeOrderIntent({
    owner,
    buyTokenAccount,
    sellTokenAccount,
    sellAmount: params.sellAmount,
    buyAmount: params.buyAmount,
    validTo: params.validTo,
    kind: params.kind,
    partiallyFillable: params.partiallyFillable,
    appData: SOLANA_APP_DATA,
  })
  const orderUid = computeOrderUid(intentBytes)
  const orderPda = findOrderPda(orderUid)

  const data = Buffer.alloc(1 + intentBytes.length)
  data[0] = CREATE_ORDER_DISCRIMINATOR
  data.set(intentBytes, 1)

  const createOrder = new TransactionInstruction({
    programId: SOLANA_SETTLEMENT_PROGRAM_ID,
    keys: [
      // owner: authenticates the order
      { pubkey: owner, isSigner: true, isWritable: false },
      // created_by: funds the order PDA's rent (same as owner here)
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: orderPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  })

  return {
    instructions: [createBuyAta, approve, createOrder],
    orderUid,
    orderPda,
    sellTokenAccount,
    buyTokenAccount,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec nx test cowswap-frontend --testPathPatterns=buildCreateOrderInstructions`
Expected: PASS. (If only the `buyTokenAccount` assertion fails, verify with `getAssociatedTokenAddressSync` inputs — the mainnet example's buy account is the owner's canonical USDC ATA.)

- [ ] **Step 5: Commit**

```bash
git add apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow
git commit -m "feat(solana): create-order instruction building"
```

---

### Task 4: The solanaOrderFlow service

**Files:**
- Create: `apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/types.ts`
- Create: `apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/index.ts`
- Test: `apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/solanaOrderFlow.test.ts`

**Interfaces:**
- Consumes: Task 3's `buildCreateOrderInstructions`, `BuildCreateOrderParams`
- Produces (used by Tasks 5–6):
  - `interface SolanaOrderFlowContext extends Omit<BuildCreateOrderParams, 'validTo'> { connection: Connection; walletProvider: SolanaProvider; customDeadlineTimestamp: number | null; deadlineMilliseconds: number }`
  - `interface SolanaOrderFlowResult { signature: string; orderUid: string; orderPda: string }`
  - `solanaOrderFlow(ctx: SolanaOrderFlowContext): Promise<SolanaOrderFlowResult>`

- [ ] **Step 1: Write the types**

`apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/types.ts`:

```ts
import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'
import type { Connection } from '@solana/web3.js'

import type { BuildCreateOrderParams } from './buildCreateOrderInstructions'

// validTo is intentionally not part of the context: like the EVM flow, it is
// computed just before sending so the deadline is relative to the send time.
export interface SolanaOrderFlowContext extends Omit<BuildCreateOrderParams, 'validTo'> {
  connection: Connection
  walletProvider: SolanaProvider
  /** Limit-orders settings: fixed deadline (unix seconds) when the user picked a custom date */
  customDeadlineTimestamp: number | null
  /** Limit-orders settings: relative deadline duration */
  deadlineMilliseconds: number
}

export interface SolanaOrderFlowResult {
  signature: string
  /** hex-encoded 32-byte order UID */
  orderUid: string
  /** base58 order PDA address */
  orderPda: string
}
```

Note: if `Provider` is not exported from `@reown/appkit-adapter-solana/react`, import it from `@reown/appkit-adapter-solana` instead (both are documented Reown entry points).

- [ ] **Step 2: Write the failing test**

`apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/solanaOrderFlow.test.ts`:

```ts
import { OrderKind } from '@cowprotocol/cow-sdk'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'
import type { Connection, Transaction } from '@solana/web3.js'

import { solanaOrderFlow } from './index'
import type { SolanaOrderFlowContext } from './types'

const OWNER = '54o2XBzBTkP7tmQSLu3Um9oDvLdNVrbMyQxqiYVKALLN'
// Any well-formed base58 32-byte value works as a fake blockhash
const BLOCKHASH = 'EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N'

function buildContext(): SolanaOrderFlowContext & {
  connection: { getLatestBlockhash: jest.Mock; confirmTransaction: jest.Mock }
  walletProvider: { sendTransaction: jest.Mock }
} {
  const connection = {
    getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: BLOCKHASH, lastValidBlockHeight: 100 }),
    confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
  }
  const walletProvider = {
    sendTransaction: jest.fn().mockResolvedValue('mockSignature'),
  }

  return {
    account: OWNER,
    sellToken: { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', isToken2022: false },
    buyToken: { address: 'So11111111111111111111111111111111111111112', isToken2022: false },
    sellAmount: 1_000_000n,
    buyAmount: 5_000_000n,
    kind: OrderKind.SELL,
    partiallyFillable: true,
    customDeadlineTimestamp: null,
    deadlineMilliseconds: 3_600_000,
    connection: connection as unknown as Connection,
    walletProvider: walletProvider as unknown as SolanaProvider,
  } as never
}

describe('solanaOrderFlow', () => {
  it('sends a 3-instruction transaction and returns signature, UID and PDA', async () => {
    const ctx = buildContext()

    const result = await solanaOrderFlow(ctx)

    expect(result.signature).toBe('mockSignature')
    expect(result.orderUid).toMatch(/^[0-9a-f]{64}$/)
    expect(result.orderPda).toBeTruthy()

    expect(ctx.walletProvider.sendTransaction).toHaveBeenCalledTimes(1)
    const [tx] = ctx.walletProvider.sendTransaction.mock.calls[0] as [Transaction]
    expect(tx.instructions).toHaveLength(3)
    expect(tx.feePayer?.toBase58()).toBe(OWNER)
    expect(tx.recentBlockhash).toBe(BLOCKHASH)

    expect(ctx.connection.confirmTransaction).toHaveBeenCalledWith(
      { signature: 'mockSignature', blockhash: BLOCKHASH, lastValidBlockHeight: 100 },
      'confirmed',
    )
  })

  it('uses the custom deadline timestamp as validTo when set', async () => {
    const ctx = buildContext()
    ctx.customDeadlineTimestamp = 1893456000

    await solanaOrderFlow(ctx)

    const [tx] = ctx.walletProvider.sendTransaction.mock.calls[0] as [Transaction]
    const createOrderData = tx.instructions[2].data
    // valid_to is a u32 LE at intent offset 112, i.e. data offset 113 (after the discriminator)
    expect(createOrderData.readUInt32LE(113)).toBe(1893456000)
  })

  it('throws when on-chain confirmation reports an error', async () => {
    const ctx = buildContext()
    ctx.connection.confirmTransaction.mockResolvedValue({ value: { err: { InstructionError: [2, 'Custom'] } } })

    await expect(solanaOrderFlow(ctx)).rejects.toThrow('Solana transaction failed')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec nx test cowswap-frontend --testPathPatterns=solanaOrderFlow.test`
Expected: FAIL — `solanaOrderFlow` is not exported from `./index`.

- [ ] **Step 4: Write the implementation**

`apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow/index.ts`:

```ts
import { PublicKey, Transaction } from '@solana/web3.js'

import { buildCreateOrderInstructions } from './buildCreateOrderInstructions'
import type { SolanaOrderFlowContext, SolanaOrderFlowResult } from './types'

export type { SolanaOrderFlowContext, SolanaOrderFlowResult } from './types'

export async function solanaOrderFlow(ctx: SolanaOrderFlowContext): Promise<SolanaOrderFlowResult> {
  const { connection, walletProvider, customDeadlineTimestamp, deadlineMilliseconds, ...orderParams } = ctx

  // Deadline is relative to the send time, mirroring the EVM flow where
  // validTo is calculated just before signing
  const validTo = customDeadlineTimestamp ?? Math.floor((Date.now() + deadlineMilliseconds) / 1000)

  const { instructions, orderUid, orderPda } = buildCreateOrderInstructions({ ...orderParams, validTo })

  const transaction = new Transaction().add(...instructions)
  transaction.feePayer = new PublicKey(ctx.account)

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  const signature = await walletProvider.sendTransaction(transaction, connection)

  const confirmation = await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')

  if (confirmation.value.err) {
    throw new Error(`Solana transaction failed: ${JSON.stringify(confirmation.value.err)}`)
  }

  return {
    signature,
    orderUid: uint8ArrayToHex(orderUid),
    orderPda: orderPda.toBase58(),
  }
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
```

- [ ] **Step 5: Run all solanaOrderFlow tests**

Run: `pnpm exec nx test cowswap-frontend --testPathPatterns=solanaOrderFlow`
Expected: PASS (all three test files).

- [ ] **Step 6: Commit**

```bash
git add apps/cowswap-frontend/src/modules/limitOrders/services/solanaOrderFlow
git commit -m "feat(solana): solanaOrderFlow service sending the create-order tx"
```

---

### Task 5: Context hook — useSolanaOrderFlowContext

**Files:**
- Create: `apps/cowswap-frontend/src/modules/limitOrders/hooks/useSolanaOrderFlowContext.ts`

**Interfaces:**
- Consumes: `useWalletInfo` (`@cowprotocol/wallet`; on Solana, `account` is the base58 address and `chainId === SupportedChainId.SOLANA`), `useAppKitConnection` (`@reown/appkit-adapter-solana/react`), `useAppKitProvider` (`@reown/appkit/react`), `useLimitOrdersDerivedState`, `limitOrdersSettingsAtom`, `getIsToken2022` (`@cowprotocol/common-const`), `getCurrencyAddress` (`@cowprotocol/common-utils`), `isSolanaChain` (`@cowprotocol/cow-sdk`), Task 4's `SolanaOrderFlowContext`
- Produces (used by Task 6): `useSolanaOrderFlowContext(): SolanaOrderFlowContext | null` — null while not on Solana or the form/wallet is incomplete

No unit test for this hook (pure glue over already-tested pieces; AppKit hooks would need heavy mocking). It is exercised by the Task 8 smoke test.

- [ ] **Step 1: Write the hook**

`apps/cowswap-frontend/src/modules/limitOrders/hooks/useSolanaOrderFlowContext.ts`:

```ts
import { useAtomValue } from 'jotai'

import { getIsToken2022 } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { useAppKitProvider } from '@reown/appkit/react'

import { SolanaOrderFlowContext } from 'modules/limitOrders/services/solanaOrderFlow'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

export function useSolanaOrderFlowContext(): SolanaOrderFlowContext | null {
  const { chainId, account } = useWalletInfo()
  const { connection } = useAppKitConnection()
  const { walletProvider } = useAppKitProvider<SolanaProvider>('solana')
  const { customDeadlineTimestamp, deadlineMilliseconds, partialFillsEnabled } = useAtomValue(limitOrdersSettingsAtom)
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, orderKind } =
    useLimitOrdersDerivedState()

  return useSafeMemo(() => {
    if (!isSolanaChain(chainId) || !account || !connection || !walletProvider) return null
    if (!inputCurrency || !outputCurrency || !inputCurrencyAmount || !outputCurrencyAmount) return null

    return {
      account,
      connection,
      walletProvider,
      sellToken: {
        address: getCurrencyAddress(inputCurrency),
        isToken2022: getIsToken2022(inputCurrency as { tags?: string[] }),
      },
      buyToken: {
        address: getCurrencyAddress(outputCurrency),
        isToken2022: getIsToken2022(outputCurrency as { tags?: string[] }),
      },
      sellAmount: BigInt(inputCurrencyAmount.quotient.toString()),
      buyAmount: BigInt(outputCurrencyAmount.quotient.toString()),
      kind: orderKind,
      partiallyFillable: partialFillsEnabled,
      customDeadlineTimestamp,
      deadlineMilliseconds,
    }
  }, [
    chainId,
    account,
    connection,
    walletProvider,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    orderKind,
    partialFillsEnabled,
    customDeadlineTimestamp,
    deadlineMilliseconds,
  ])
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec nx typecheck cowswap-frontend`
Expected: exit 0. If `useAppKitConnection`'s `connection` is typed as possibly `undefined`, the null guard already covers it. If `getIsToken2022` complains about the cast, keep the cast — `TokenWithLogo` carries `tags: string[]` at runtime.

- [ ] **Step 3: Commit**

```bash
git add apps/cowswap-frontend/src/modules/limitOrders/hooks/useSolanaOrderFlowContext.ts
git commit -m "feat(solana): limit orders Solana flow context hook"
```

---

### Task 6: SolanaTradeButtons container + TradeButtons wiring

**Files:**
- Create: `apps/cowswap-frontend/src/modules/limitOrders/containers/SolanaTradeButtons/index.tsx`
- Modify: `apps/cowswap-frontend/src/modules/limitOrders/containers/TradeButtons/index.tsx`

**Interfaces:**
- Consumes: Task 5's `useSolanaOrderFlowContext`, Task 4's `solanaOrderFlow`, `TradeFormBlankButton` (exported from `modules/tradeFormValidation`; props: `{ id?, children, disabled?, loading?, onClick? }`), `useAddSnackbar` (`@cowprotocol/snackbars`; takes `{ id: string; icon?: 'success' | 'alert'; content: ReactNode }`), `ExternalLink` (`@cowprotocol/ui`), `isRejectRequestProviderError` + `isFractionFalsy` (`@cowprotocol/common-utils`), `getSwapErrorMessage` (`common/utils/getSwapErrorMessage`), `limitRateAtom`
- Produces: `SolanaTradeButtons(): ReactNode`, rendered by `TradeButtons` when `isSolanaChain(chainId)`

- [ ] **Step 1: Write the container**

`apps/cowswap-frontend/src/modules/limitOrders/containers/SolanaTradeButtons/index.tsx`:

```tsx
import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useState } from 'react'

import { isFractionFalsy, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { ExternalLink } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useSolanaOrderFlowContext } from 'modules/limitOrders/hooks/useSolanaOrderFlowContext'
import { solanaOrderFlow } from 'modules/limitOrders/services/solanaOrderFlow'
import { SOLSCAN_TX_URL } from 'modules/limitOrders/services/solanaOrderFlow/const'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { TradeFormBlankButton } from 'modules/tradeFormValidation'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

/**
 * Prototype placement flow for Solana limit orders: no quote, no confirm modal.
 * The button sends the create-order transaction directly and reports the
 * result in a snackbar with a Solscan link.
 */
// eslint-disable-next-line max-lines-per-function
export function SolanaTradeButtons(): ReactNode {
  const { account } = useWalletInfo()
  const solanaContext = useSolanaOrderFlowContext()
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, inputCurrencyBalance } =
    useLimitOrdersDerivedState()
  const { activeRate } = useAtomValue(limitRateAtom)
  const addSnackbar = useAddSnackbar()
  const [isPending, setIsPending] = useState(false)

  const placeOrder = useCallback(async () => {
    if (!solanaContext) return

    setIsPending(true)
    try {
      const { signature, orderUid } = await solanaOrderFlow(solanaContext)

      addSnackbar({
        id: `solana-order-${signature}`,
        icon: 'success',
        content: (
          <span>
            <Trans>Solana limit order created</Trans> (UID {orderUid.slice(0, 8)}…){' '}
            <ExternalLink href={`${SOLSCAN_TX_URL}${signature}`}>
              <Trans>View on Solscan</Trans>
            </ExternalLink>
          </span>
        ),
      })
    } catch (error) {
      if (!isRejectRequestProviderError(error)) {
        addSnackbar({
          id: 'solana-order-error',
          icon: 'alert',
          content: <span>{getSwapErrorMessage(error)}</span>,
        })
      }
    } finally {
      setIsPending(false)
    }
  }, [solanaContext, addSnackbar])

  if (!account) {
    return (
      <TradeFormBlankButton id="solana-connect-wallet" disabled>
        <Trans>Connect wallet</Trans>
      </TradeFormBlankButton>
    )
  }

  if (!inputCurrency || !outputCurrency) {
    return (
      <TradeFormBlankButton id="solana-select-token" disabled>
        <Trans>Select a token</Trans>
      </TradeFormBlankButton>
    )
  }

  if (isFractionFalsy(inputCurrencyAmount) || isFractionFalsy(outputCurrencyAmount)) {
    return (
      <TradeFormBlankButton id="solana-enter-amount" disabled>
        <Trans>Enter an amount</Trans>
      </TradeFormBlankButton>
    )
  }

  if (!activeRate) {
    return (
      <TradeFormBlankButton id="solana-enter-price" disabled>
        <Trans>Enter a price</Trans>
      </TradeFormBlankButton>
    )
  }

  // The sell token account must exist and hold the funds for the order to be settleable
  if (!inputCurrencyBalance || (inputCurrencyAmount && inputCurrencyBalance.lessThan(inputCurrencyAmount))) {
    return (
      <TradeFormBlankButton id="solana-insufficient-balance" disabled>
        <Trans>Insufficient balance</Trans>
      </TradeFormBlankButton>
    )
  }

  return (
    <TradeFormBlankButton
      id="solana-place-limit-order"
      onClick={placeOrder}
      disabled={isPending || !solanaContext}
      loading={isPending}
    >
      <Trans>Place limit order</Trans>
    </TradeFormBlankButton>
  )
}
```

- [ ] **Step 2: Wire into TradeButtons**

Modify `apps/cowswap-frontend/src/modules/limitOrders/containers/TradeButtons/index.tsx`. Add the imports:

```tsx
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
```

and (with the relative imports at the bottom of the import block):

```tsx
import { SolanaTradeButtons } from '../SolanaTradeButtons'
```

Inside the component, add the hook next to the other hook calls (after `const { i18n, t } = useLingui()`):

```tsx
  const { chainId } = useWalletInfo()
```

Then, after the `const tradeFormButtonContext = useTradeFormButtonContext(...)` line and its neighboring hook calls, but **before** `if (!tradeFormButtonContext) return null`, add:

```tsx
  // Solana limit orders use a dedicated on-chain placement flow (prototype);
  // the shared validation/quote/approve pipeline is EVM-only
  if (isSolanaChain(chainId)) {
    return <SolanaTradeButtons />
  }
```

(All hooks must still be called unconditionally above this early return.)

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm exec nx typecheck cowswap-frontend && pnpm exec nx lint cowswap-frontend`
Expected: both exit 0 (pre-existing warnings are fine).

- [ ] **Step 4: Commit**

```bash
git add apps/cowswap-frontend/src/modules/limitOrders/containers
git commit -m "feat(solana): Solana trade buttons for limit orders"
```

---

### Task 7: Skip quote polling on Solana

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/tradeQuote/hooks/useQuoteParams.ts`

**Interfaces:**
- Consumes: `isSolanaChain` from `@cowprotocol/cow-sdk`
- Produces: `useQuoteParams` returns `undefined` for Solana sell tokens, so no quote request is ever fired (the backend cannot quote Solana pairs; the QuoteErrors/QuoteLoading validations never apply because the Solana button ladder bypasses them)

- [ ] **Step 1: Add the guard**

In `apps/cowswap-frontend/src/modules/tradeQuote/hooks/useQuoteParams.ts`, extend the existing cow-sdk import (line 6):

```ts
import { getGlobalAdapter, isSolanaChain, OrderKind } from '@cowprotocol/cow-sdk'
```

Inside the `useSafeMemo` callback, after the line `if (!inputCurrency || !outputCurrency || !orderKind) return`, add:

```ts
    // No backend quote exists for Solana pairs; the limit-orders prototype uses a manually entered price
    if (isSolanaChain(inputCurrency.chainId)) return
```

(`inputCurrency` is already in the memo's dependency list — no dep changes needed.)

- [ ] **Step 2: Verify nothing broke**

Run: `pnpm exec nx test cowswap-frontend --testPathPatterns=tradeQuote`
Expected: PASS (existing tests unaffected — they use EVM chain ids).

- [ ] **Step 3: Commit**

```bash
git add apps/cowswap-frontend/src/modules/tradeQuote/hooks/useQuoteParams.ts
git commit -m "feat(solana): skip quote polling for solana sell tokens"
```

---

### Task 8: Full verification + mainnet smoke test

**Files:** none (verification only)

- [ ] **Step 1: Run the full local gates**

```bash
pnpm exec nx typecheck cowswap-frontend
pnpm exec nx lint cowswap-frontend
pnpm exec nx test cowswap-frontend
```

Expected: all exit 0. Fix anything that fails before proceeding.

- [ ] **Step 2: Manual smoke test on mainnet (REQUIRED — this is the acceptance test)**

Prerequisites: a Solana wallet (e.g. Phantom) holding a little SOL for fees/rent and a small SPL balance (e.g. ≥ 0.1 USDC — mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`).

1. `pnpm exec nx serve cowswap-frontend`
2. Open `http://localhost:3000/#/1/limit?IS_SOLANA_ENABLED=true` — the hash query param persists the `IS_SOLANA_ENABLED` localStorage flag (see `libs/common-const/src/featureFlags.ts`).
3. Connect the Solana wallet through the wallet modal; switch the network selector to Solana.
4. In the Limit form: sell token USDC, buy token WSOL (`So11111111111111111111111111111111111111112`), sell amount `0.1`, and type a limit price.
5. Expect the button to read **Place limit order** (walk the ladder first if you want: disconnected → "Connect wallet", empty amount → "Enter an amount", amount > balance → "Insufficient balance").
6. Click it, approve the transaction in the wallet.
7. Expect a success snackbar: "Solana limit order created (UID …) View on Solscan".
8. Open the Solscan link. Verify the tx succeeded and contains: `createIdempotent` (buy ATA), `approve` with delegate `3PYmNPBdoFBGqtAeopGMS5YvnQnfxh8J9sNS3jjzKhb8` and amount = sell amount, and an instruction to program `moosEjJg5mbGRPRU7Vg4AaHZLvbbgknevWR9J1bNgME` — same shape as the reference tx `4hy8scaTfLNyJiAPbF47k4YWyWmE2CFfvLj6zkTUibpknEcNfjWWDyCT185qDbRYYLMtdDzGkVtuNXJEE2oXE6JG`.
9. Also verify the EVM path still works: switch back to an EVM network, confirm the Limit form still quotes and the "Review limit order" button appears.

- [ ] **Step 3: Final commit (if smoke test required fixes)**

```bash
git add -A && git commit -m "fix(solana): smoke test fixes for solana limit order placement"
```

---

## Known accepted limitations (do not "fix" these)

- One live approve per sell token: a second order overwrites the previous delegated allowance.
- Orders don't appear in the orders table; the snackbar + Solscan link is the entire post-create UX.
- `app_data` is zeroed; recipient is always the owner; native SOL cannot be sold.
- No priority fees / versioned transactions; `confirmed` commitment is enough for the prototype.
