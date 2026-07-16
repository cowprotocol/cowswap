import { Connection, PublicKey, Transaction, TransactionError } from '@solana/web3.js'

import { buildCreateOrderInstructions } from './buildCreateOrderInstructions'

import type { SolanaOrderFlowContext, SolanaOrderFlowResult } from './types'

export type { SolanaOrderFlowContext, SolanaOrderFlowResult } from './types'

const CONFIRMATION_TIMEOUT_MS = 60_000
const CONFIRMATION_POLL_INTERVAL_MS = 2_000

export async function solanaOrderFlow(ctx: SolanaOrderFlowContext): Promise<SolanaOrderFlowResult> {
  const { connection, walletProvider, customDeadlineTimestamp, deadlineMilliseconds, ...orderParams } = ctx

  // Deadline is relative to the send time, mirroring the EVM flow where
  // validTo is calculated just before signing
  const validTo = customDeadlineTimestamp ?? Math.floor((Date.now() + deadlineMilliseconds) / 1000)

  const { instructions, orderUid, orderPda } = buildCreateOrderInstructions({ ...orderParams, validTo })

  const transaction = new Transaction().add(...instructions)
  transaction.feePayer = new PublicKey(ctx.account)

  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  const signature = await walletProvider.sendTransaction(transaction, connection)

  const err = await confirmOrder(connection, signature)

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
 * Wait for the transaction to land by polling its signature status.
 *
 * We deliberately avoid `connection.confirmTransaction`'s blockhash strategy: it throws
 * `TransactionExpiredBlockheightExceededError` ("block height exceeded") whenever the blockhash
 * validity window passes before it observes confirmation — which happens routinely here because
 * the wallet-signing prompt ages the blockhash before the tx even broadcasts, so the tx lands
 * right at the edge of the window and is reported as a failure despite succeeding. Polling the
 * signature status instead reflects what actually happened on-chain.
 *
 * Returns the on-chain error (null on success); throws only if the tx never lands within the timeout.
 */
async function confirmOrder(connection: Connection, signature: string): Promise<TransactionError | null> {
  const deadline = Date.now() + CONFIRMATION_TIMEOUT_MS

  do {
    const { value } = await connection.getSignatureStatus(signature, { searchTransactionHistory: true })

    if (value) {
      if (value.err) return value.err
      if (value.confirmationStatus === 'confirmed' || value.confirmationStatus === 'finalized') return null
    }

    await sleep(CONFIRMATION_POLL_INTERVAL_MS)
  } while (Date.now() < deadline)

  throw new Error(`Solana transaction ${signature} was not confirmed within ${CONFIRMATION_TIMEOUT_MS / 1000}s`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
