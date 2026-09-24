import { Connection, PublicKey } from '@solana/web3.js'

import { SolanaFlowStep } from './types'

import { buildSolanaTransaction } from '../solanaSend/buildSolanaTransaction'
import { signSolanaTransaction } from '../solanaSend/signSolanaTransaction'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

/** A slow approval can outlast the blockhash, and nothing here sends the transaction to notice. */
const MAX_SIGN_ATTEMPTS = 3

export interface SignedSolanaFlow {
  /** The owner-signed transaction as base64, ready for the order book's sponsored endpoint. */
  transaction: string
  lastValidBlockHeight: number
}

export interface SignSolanaFlowContext {
  connection: Connection
  provider: SolanaProvider
  /** The sponsor, not the owner: it pays, and the order book fills its signature slot. */
  feePayer: PublicKey
  /** Called with the deadline of the transaction about to be signed, before the wallet is asked —
   * the countdown has to start when the blockhash is taken, not when the signature comes back. */
  onDeadline?: (lastValidBlockHeight: number) => void
}

/**
 * Sponsored counterpart to `sendSolanaFlow`: assembles the same steps into one transaction and has the
 * wallet sign it, but never broadcasts — the order book does that after countersigning as fee payer.
 *
 * Nothing is recorded in the transaction list here. There is no signature to watch until the order book
 * submits, so the order is tracked by its uid instead.
 */
export async function signSolanaFlow(
  context: SignSolanaFlowContext,
  steps: SolanaFlowStep[],
  attemptsLeft = MAX_SIGN_ATTEMPTS,
): Promise<SignedSolanaFlow> {
  if (steps.length === 0) {
    throw new Error('signSolanaFlow: no steps to sign')
  }

  const { connection, provider, feePayer, onDeadline } = context

  const { transaction, lastValidBlockHeight } = await buildSolanaTransaction({
    connection,
    instructions: steps.flatMap((step) => step.instructions),
    feePayer,
  })

  onDeadline?.(lastValidBlockHeight)

  const signed = await signSolanaTransaction(provider, transaction)

  // A dead blockhash wastes the signature: the order book accepts it, nobody can ever submit it, and
  // it sits until `validTo` while the user believes the order is live.
  if ((await connection.getBlockHeight()) <= lastValidBlockHeight) {
    return { transaction: signed, lastValidBlockHeight }
  }

  if (attemptsLeft <= 1) {
    throw new Error('The order expired before it was signed. Please try again.')
  }

  return signSolanaFlow(context, steps, attemptsLeft - 1)
}
