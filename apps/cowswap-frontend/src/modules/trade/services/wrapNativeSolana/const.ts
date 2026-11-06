import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

/**
 * Wrapped SOL mint. Taken from the SDK rather than hardcoded so it cannot drift from the token the
 * rest of the app trades against.
 *
 * WSOL is a classic SPL mint (not Token-2022), so every instruction here uses `TOKEN_PROGRAM_ID`.
 */
export const WSOL_MINT = new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)

/** Where `owner`'s wrapped SOL lives: the address every wrap, unwrap and native-sell trade derives. */
export function getWsolAssociatedTokenAccount(owner: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)
}
