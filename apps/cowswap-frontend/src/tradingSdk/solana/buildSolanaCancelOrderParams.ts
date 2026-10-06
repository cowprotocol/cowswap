import { hexToBytes } from 'viem'

import { CowEnv } from '@cowprotocol/cow-sdk'
import { CancelOrderParams, findOrderPda, getSolanaSettlementProgramId } from '@cowprotocol/sdk-trading-solana'

import { Connection, PublicKey } from '@solana/web3.js'

import { buildSolanaOrderIntent, SolanaIntentOrder } from './buildSolanaOrderIntent'

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
): Promise<CancelOrderParams[]> {
  const programId = getSolanaSettlementProgramId(env)
  const orderPdas = orders.map(({ id }) => findOrderPda(programId, hexToBytes(id as `0x${string}`), env)[0])
  const orderAccounts = await connection.getMultipleAccountsInfo(orderPdas)

  return Promise.all(
    orders.map(async ({ order }, index) => {
      const orderPda = orderPdas[index]
      const isOnChain = !!orderAccounts[index]
      const intent = !isOnChain && order ? await buildSolanaOrderIntent(order) : undefined

      return { ownerAddress: owner, orderPda, intent }
    }),
  )
}
