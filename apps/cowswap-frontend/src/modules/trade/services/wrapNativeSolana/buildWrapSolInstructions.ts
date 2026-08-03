import {
  createAssociatedTokenAccountIdempotentInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'

import { WSOL_MINT } from './const'

export interface BuildWrapSolInstructionsParams {
  owner: PublicKey
  /**
   * Lamports moved into the WSOL account by the transfer instruction. This is the owner's *total*
   * spend (`lamports` typed in the form) only when the associated token account already exists; when
   * it doesn't, the idempotent create instruction also draws the account's rent-exempt reserve from
   * the owner as part of this same transaction, so the transfer itself must be reduced by that amount
   * to keep the owner's total spend equal to what they typed — see `getSolanaWrapPreview`.
   */
  transferLamports: bigint
}

/**
 * Instructions converting native SOL into WSOL.
 *
 * A WSOL balance is just lamports parked in the owner's associated token account, so wrapping is a
 * plain lamport transfer into that account followed by `syncNative`, which is what actually updates
 * the SPL token amount to match the lamports the account now holds.
 *
 * The *idempotent* create instruction is used deliberately: it makes the "does the ATA already exist"
 * question the runtime's problem, avoiding both an extra RPC round-trip and the race where the account
 * appears between our check and the send.
 */
export function buildWrapSolInstructions({
  owner,
  transferLamports,
}: BuildWrapSolInstructionsParams): TransactionInstruction[] {
  if (transferLamports <= 0n) {
    throw new Error('Wrap amount must be positive')
  }

  const associatedTokenAccount = getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)

  return [
    createAssociatedTokenAccountIdempotentInstruction(owner, associatedTokenAccount, owner, WSOL_MINT),
    SystemProgram.transfer({ fromPubkey: owner, toPubkey: associatedTokenAccount, lamports: transferLamports }),
    createSyncNativeInstruction(associatedTokenAccount, TOKEN_PROGRAM_ID),
  ]
}
