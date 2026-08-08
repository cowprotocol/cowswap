import type { TransactionInstruction } from '@solana/web3.js'

/**
 * One logical action (wrap, delegate, create-order, ...) contributing instructions to a bundled
 * Solana transaction. Planners produce these; `sendSolanaFlow` only knows how to flatten and send
 * them, not what any particular step means.
 */
export interface SolanaFlowStep {
  instructions: TransactionInstruction[]
  /** Joined with other steps' summaries into the single recorded transaction's history entry. */
  summary: string
}
