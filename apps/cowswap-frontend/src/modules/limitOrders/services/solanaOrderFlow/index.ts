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
