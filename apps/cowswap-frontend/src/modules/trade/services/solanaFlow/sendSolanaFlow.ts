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

// Sends whatever steps a flow assembled as one transaction; deliberately has no idea what "wrap" or "delegate" means, so it serves any combination of steps.
export async function sendSolanaFlow(context: SolanaFlowContext, steps: SolanaFlowStep[]): Promise<{ hash: string }> {
  if (steps.length === 0) {
    throw new Error('sendSolanaFlow: no steps to send')
  }

  const { connection, provider, owner, addTransaction } = context
  const instructions = steps.flatMap((step) => step.instructions)
  const summary = steps.map((step) => step.summary).join(', ')

  const { hash, lastValidBlockHeight } = await sendSolanaTransaction(connection, provider, owner, instructions)

  // Tagged so the activity list hides this transaction and shows the order it created instead — see
  // `isNotSolanaOrderCreationTx`. Every flow bundled here always ends in a `CreateOrder` instruction
  // (see `solanaFlow`), so the resulting transaction is always the order's creation tx.
  addTransaction({ hash, summary, solanaOrderCreation: true, data: { lastValidBlockHeight } })

  return { hash }
}
