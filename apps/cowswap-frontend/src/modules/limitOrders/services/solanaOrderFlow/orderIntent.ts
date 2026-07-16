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

/** Order UID = SHA-256 of the canonical intent bytes; also the middle seed of the order PDA */
export function computeOrderUid(intentBytes: Uint8Array): Uint8Array {
  return sha256(intentBytes)
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

export function findOrderPda(orderUid: Uint8Array): PublicKey {
  return PublicKey.findProgramAddressSync([SETTLEMENT_SEED, orderUid, ORDER_SEED], SOLANA_SETTLEMENT_PROGRAM_ID)[0]
}

/** Settlement state PDA: the SPL delegate that pulls sell funds at execution time */
export function findStatePda(): PublicKey {
  return PublicKey.findProgramAddressSync([SETTLEMENT_SEED], SOLANA_SETTLEMENT_PROGRAM_ID)[0]
}
