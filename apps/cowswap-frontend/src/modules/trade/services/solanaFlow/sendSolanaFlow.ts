import { Connection, PublicKey } from '@solana/web3.js'

import { TransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { SolanaFlowStep } from './types'

import { sendSolanaTransaction } from '../solanaSend/sendSolanaTransaction'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

export interface SolanaFlowContext {
  connection: Connection
  provider: SolanaProvider
  owner: PublicKey
  addTransaction: TransactionAdder
}

/**
 * Sends whichever steps a concrete flow (native-SOL swap, SPL delegate+order, ...) assembled, as a
 * single transaction. Deliberately has no idea what a "wrap" or "delegate" is — that lets the same
 * function serve every combination of steps without growing a branch per combination.
 */
export async function sendSolanaFlow(context: SolanaFlowContext, steps: SolanaFlowStep[]): Promise<{ hash: string }> {
  if (steps.length === 0) {
    throw new Error('sendSolanaFlow: no steps to send')
  }

  const { connection, provider, owner, addTransaction } = context
  const instructions = steps.flatMap((step) => step.instructions)
  const summary = steps.map((step) => step.summary).join(', ')

  const { hash, lastValidBlockHeight } = await sendSolanaTransaction(connection, provider, owner, instructions)

  addTransaction({ hash, summary, data: { lastValidBlockHeight } })

  return { hash }
}
