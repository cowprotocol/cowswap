import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { PublicKey } from '@solana/web3.js'

/**
 * Wrapped SOL mint. Taken from the SDK rather than hardcoded so it cannot drift from the token the
 * rest of the app trades against.
 *
 * WSOL is a classic SPL mint (not Token-2022), so every instruction here uses `TOKEN_PROGRAM_ID`.
 */
export const WSOL_MINT = new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)
