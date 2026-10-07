import { t } from '@lingui/core/macro'
import { Connection, PublicKey } from '@solana/web3.js'

import { SolanaFlowStep } from './types'

import { buildSolanaTransaction } from '../solanaSend/buildSolanaTransaction'
import { signSolanaTransaction } from '../solanaSend/signSolanaTransaction'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

export interface SignedSolanaFlow {
  /** The owner-signed transaction as base64, ready for the order book's sponsored endpoint. */
  transaction: string
  lastValidBlockHeight: number
  /** Epoch ms when the wallet returned the signature. */
  signedAtMs: number
}

export interface SignSolanaFlowContext {
  connection: Connection
  provider: SolanaProvider
  /** The sponsor, not the owner: it pays, and the order book fills its signature slot. */
  feePayer: PublicKey
  onDeadline?: (lastValidBlockHeight: number) => void
}

export function getSigningWindowClosedError(): Error {
  return new Error(t`The signing window closed before the transaction was signed. Please try again.`)
}

/**
 * Sponsored counterpart to `sendSolanaFlow`: assembles the steps into one transaction and has the
 * wallet sign it, but never broadcasts — the order book does that after countersigning as fee payer.
 */
export async function signSolanaFlow(
  { connection, provider, feePayer, onDeadline }: SignSolanaFlowContext,
  steps: SolanaFlowStep[],
): Promise<SignedSolanaFlow> {
  if (steps.length === 0) {
    throw new Error('signSolanaFlow: no steps to sign')
  }

  const { transaction, lastValidBlockHeight } = await buildSolanaTransaction({
    connection,
    instructions: steps.flatMap((step) => step.instructions),
    feePayer,
  })

  onDeadline?.(lastValidBlockHeight)

  const signed = await signSolanaTransaction(provider, transaction)
  const signedAtMs = Date.now()

  return { transaction: signed, lastValidBlockHeight, signedAtMs }
}
