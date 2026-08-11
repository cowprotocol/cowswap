import {
  createApproveInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

import type { PublicKey, TransactionInstruction } from '@solana/web3.js'

export interface BuildApproveInstructionParams {
  owner: PublicKey
  mint: PublicKey
  isToken2022: boolean
  /** The CoW settlement-state PDA that becomes the token account's SPL delegate. */
  delegate: PublicKey
  /** Amount to delegate. Pass `SOLANA_MAX_APPROVE_AMOUNT` for an unlimited approval. */
  amount: bigint
}

/**
 * SPL `approve` instruction delegating `delegate` (the CoW settlement-state PDA) on the owner's
 * associated token account for `mint`, up to `amount`.
 *
 * The token program (classic vs Token-2022, taken from `isToken2022`) selects both the ATA address and
 * the instruction encoding, avoiding an extra RPC read of the mint. The ATA is derived the same way as
 * the delegation read (`readSolanaTokenAccounts`), so the approval lands on the exact account the
 * delegation is read from.
 */
export function buildApproveInstruction({
  owner,
  mint,
  isToken2022,
  delegate,
  amount,
}: BuildApproveInstructionParams): TransactionInstruction {
  const programId = isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
  const associatedTokenAccount = getAssociatedTokenAddressSync(mint, owner, false, programId)

  return createApproveInstruction(associatedTokenAccount, delegate, owner, amount, [], programId)
}
