import {
  createAssociatedTokenAccountIdempotentInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'

import { WSOL_MINT } from './const'

export interface BuildUnwrapSolInstructionsParams {
  owner: PublicKey
  lamports: bigint
  /** Current WSOL balance of the owner's associated token account, read fresh from the chain. */
  wsolBalance: bigint
}

/**
 * Instructions converting WSOL back into native SOL.
 *
 * Solana has no partial-unwrap primitive: a WSOL balance *is* the lamports held by the associated token
 * account, and the only way to get them back is `closeAccount`, which returns the entire balance and
 * deallocates the account. To still honour the exact amount the user asked for, we close the account and
 * — when a remainder is left over — re-create it and re-wrap the remainder in the same transaction.
 * Solana executes instructions sequentially, so closing and re-creating one address in a single
 * transaction is valid.
 *
 * The rent-exempt reserve is refunded by the close and re-paid by the re-creation, so the owner's net
 * SOL change is `+lamports` minus the transaction fee.
 */
export function buildUnwrapSolInstructions({
  owner,
  lamports,
  wsolBalance,
}: BuildUnwrapSolInstructionsParams): TransactionInstruction[] {
  if (lamports <= 0n) {
    throw new Error('Unwrap amount must be positive')
  }

  if (lamports > wsolBalance) {
    throw new Error('Unwrap amount exceeds wrapped balance')
  }

  const associatedTokenAccount = getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)

  const instructions = [createCloseAccountInstruction(associatedTokenAccount, owner, owner, [], TOKEN_PROGRAM_ID)]

  const remainder = wsolBalance - lamports

  if (remainder > 0n) {
    instructions.push(
      createAssociatedTokenAccountIdempotentInstruction(owner, associatedTokenAccount, owner, WSOL_MINT),
      SystemProgram.transfer({ fromPubkey: owner, toPubkey: associatedTokenAccount, lamports: remainder }),
      createSyncNativeInstruction(associatedTokenAccount, TOKEN_PROGRAM_ID),
    )
  }

  return instructions
}
