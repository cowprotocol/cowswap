import { CowEnv } from '@cowprotocol/cow-sdk'
import { ReclaimOrderParams } from '@cowprotocol/sdk-trading-solana'

import { Connection, PublicKey } from '@solana/web3.js'
import ms from 'ms.macro'

import { fetchSolanaOrderAccounts } from './fetchSolanaOrderAccounts'

/**
 * Cancelling an order that never reached the chain creates its PDA just to record the cancellation, and
 * closing that PDA would let a creation transaction still held elsewhere land and bring the order back.
 * Nothing on-chain tells that PDA apart from a normally cancelled one, but a signed transaction dies with
 * its blockhash, so an order this much older than its placement can no longer be created by anyone.
 */
export const SAFE_TO_RECLAIM_AFTER = ms`5m`

export interface SolanaOrderToReclaim {
  id: string
  /** When the order was placed, as epoch milliseconds. */
  placedAt: number
}

export interface SolanaReclaimableOrder {
  id: string
  params: ReclaimOrderParams
}

/**
 * Picks out the orders whose rent `owner` can still take back: placed long enough ago to be safe to
 * close, with the PDA on-chain, cancelled, and its rent funded by `owner` rather than by a sponsor,
 * which is the only account the program pays.
 */
export async function buildSolanaReclaimOrderParams(
  connection: Connection,
  owner: PublicKey,
  orders: SolanaOrderToReclaim[],
  env: CowEnv,
): Promise<SolanaReclaimableOrder[]> {
  const settled = orders.filter(({ placedAt }) => Date.now() - placedAt > SAFE_TO_RECLAIM_AFTER)
  const entries = await fetchSolanaOrderAccounts(
    connection,
    settled.map(({ id }) => id),
    env,
  )

  return entries
    .filter(({ account }) => account?.cancelled && account.createdBy.equals(owner))
    .map(({ id, orderPda }) => ({ id, params: { ownerAddress: owner, orderPda } }))
}
