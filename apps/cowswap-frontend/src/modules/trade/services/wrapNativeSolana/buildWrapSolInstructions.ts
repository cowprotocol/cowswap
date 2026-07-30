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
  lamports: bigint
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
  lamports,
}: BuildWrapSolInstructionsParams): TransactionInstruction[] {
  if (lamports <= 0n) {
    throw new Error('Wrap amount must be positive')
  }

  const associatedTokenAccount = getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)

  return [
    createAssociatedTokenAccountIdempotentInstruction(owner, associatedTokenAccount, owner, WSOL_MINT),
    SystemProgram.transfer({ fromPubkey: owner, toPubkey: associatedTokenAccount, lamports }),
    createSyncNativeInstruction(associatedTokenAccount, TOKEN_PROGRAM_ID),
  ]
}
