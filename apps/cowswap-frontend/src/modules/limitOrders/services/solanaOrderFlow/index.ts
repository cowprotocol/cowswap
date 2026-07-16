import { Connection, PublicKey, Transaction, TransactionError } from '@solana/web3.js'

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

  const err = await confirmOrder(connection, signature, blockhash, lastValidBlockHeight)

  if (err) {
    throw new Error(`Solana transaction failed: ${JSON.stringify(err)}`)
  }

  return {
    signature,
    orderUid: uint8ArrayToHex(orderUid),
    orderPda: orderPda.toBase58(),
  }
}

/**
 * Confirm the transaction, tolerating the block-height-exceeded timeout.
 *
 * `confirmTransaction` throws `TransactionExpiredBlockheightExceededError` when the blockhash
 * validity window passes before it observes confirmation — but the transaction has usually landed
 * right at the edge of that window, because the wallet-signing prompt ages the blockhash before
 * the tx even broadcasts. On any confirmation error we re-check the signature status before
 * deciding the order failed. Returns the on-chain error (null on success); rethrows only when the
 * transaction is genuinely not found after the timeout.
 */
async function confirmOrder(
  connection: Connection,
  signature: string,
  blockhash: string,
  lastValidBlockHeight: number,
): Promise<TransactionError | null> {
  try {
    const { value } = await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
    return value.err
  } catch (error) {
    const { value } = await connection.getSignatureStatus(signature, { searchTransactionHistory: true })
    const landed = value?.confirmationStatus === 'confirmed' || value?.confirmationStatus === 'finalized'

    if (landed) {
      return value?.err ?? null
    }

    throw error
  }
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
