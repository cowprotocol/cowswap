import type { PublicKey, TransactionInstruction } from '@solana/web3.js'

// One action (wrap, delegate, ...) contributing instructions to a bundled tx; `sendSolanaFlow` only flattens and sends these, agnostic to what each step means.
export interface SolanaFlowStep {
  instructions: TransactionInstruction[]
  // Joined with the other steps' summaries into one transaction-history entry.
  summary: string
  // Required rather than optional so a step creating an account cannot silently skip the pre-flight
  // balance check: `getSolanaTradeOverhead` prices whatever the steps declare and nothing else.
  fundedAccounts: SolanaFundedAccount[]
  // Set by the step contributing the `CreateOrder` instruction. `sendSolanaFlow` forwards it as the
  // transaction's `solanaOrderCreation` tag, so the tag follows what was actually bundled rather than
  // an assumption about the caller — steps here are assembled conditionally and can be skipped.
  createsOrder?: boolean
}

// An account a step creates, whose rent-exempt deposit the fee payer funds.
export interface SolanaFundedAccount {
  // Omitted when the account is new by construction (a fresh PDA per order), so rent always applies.
  address?: PublicKey
  // A token account's size depends on the mint's extensions, which only the chain knows.
  size: number | { mint: PublicKey; tokenProgramId: PublicKey }
}
