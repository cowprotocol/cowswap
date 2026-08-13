import type { TransactionInstruction } from '@solana/web3.js'

// One action (wrap, delegate, ...) contributing instructions to a bundled tx; `sendSolanaFlow` only flattens and sends these, agnostic to what each step means.
export interface SolanaFlowStep {
  instructions: TransactionInstruction[]
  // Joined with the other steps' summaries into one transaction-history entry.
  summary: string
}
