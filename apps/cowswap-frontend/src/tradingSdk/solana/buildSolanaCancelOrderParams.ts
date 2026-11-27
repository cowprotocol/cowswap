import { CowEnv } from '@cowprotocol/cow-sdk'
import { CancelOrderParams, ReclaimOrderParams } from '@cowprotocol/sdk-trading-solana'

import { Connection, PublicKey } from '@solana/web3.js'

import { buildSolanaOrderIntent, SolanaIntentOrder } from './buildSolanaOrderIntent'
import { fetchSolanaOrderAccounts } from './fetchSolanaOrderAccounts'

export interface SolanaCancellationParams {
  cancelParams: CancelOrderParams[]
  /**
   * Closing the order PDA is a separate instruction, so a cancellation that doesn't carry one leaves the
   * rent locked until the order expires. Only live orders are reclaimed — on-chain and not yet
   * cancelled. A PDA that already reads as cancelled may be one an earlier attempt created just to
   * record the cancellation, and that must stay until `validTo` or a creation still in flight could
   * bring the order back; the orders table offers those separately, once they are old enough to be safe.
   */
  reclaimParams: ReclaimOrderParams[]
}

export interface SolanaOrderToCancel {
  id: string
  /** The stored order, to rebuild its intent from. */
  order: SolanaIntentOrder | undefined
}

/**
 * The intent is attached only for orders whose PDA isn't on-chain yet: each one adds ~214 bytes, which a
 * batch of already-created orders would otherwise spend against the 1232-byte transaction limit for nothing.
 */
export async function buildSolanaCancelOrderParams(
  connection: Connection,
  owner: PublicKey,
  orders: SolanaOrderToCancel[],
  env: CowEnv,
): Promise<SolanaCancellationParams> {
  const entries = await fetchSolanaOrderAccounts(
    connection,
    orders.map(({ id }) => id),
    env,
  )

  const cancelParams = await Promise.all(
    orders.map(async ({ order }, index) => {
      const { orderPda, exists } = entries[index]
      const intent = !exists && order ? await buildSolanaOrderIntent(order) : undefined

      return { ownerAddress: owner, orderPda, intent }
    }),
  )

  const reclaimParams = entries
    .filter(({ account }) => account && !account.cancelled && account.createdBy.equals(owner))
    .map(({ orderPda }) => ({ ownerAddress: owner, orderPda }))

  return { cancelParams, reclaimParams }
}
