import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { deriveAta } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

import { BuyAtaQuote } from './planCreateBuyAtaStep'

export class IntentReceiverMismatchError extends Error {
  constructor(credited: PublicKey, expected: PublicKey) {
    super(`The order would credit ${credited.toBase58()} instead of the recipient's ${expected.toBase58()}`)
    this.name = 'IntentReceiverMismatchError'
  }
}

/**
 * Proves the intent about to be signed pays out where the confirmation screen said it would, before any
 * of it reaches the wallet.
 *
 * Nothing else can: `buyTokenAccount` is signed as a bare address, and an associated token address
 * cannot be inverted back to the wallet it belongs to, so a wrong one is indistinguishable from a right
 * one by inspection — on screen, in the wallet prompt, or on chain until it has settled. The quote, the
 * rebuilt limit intent and the resolved recipient each reach this point separately, so re-deriving the
 * address from the recipient is the only thing that ties them together.
 *
 * Settlement credits a native-SOL buy as lamports to the receiver itself, so there is no token account
 * to derive — see `buildSolanaOrderIntent`, which rebuilds the same pair.
 */
export function assertIntentCreditsReceiver(quote: BuyAtaQuote, receiver: PublicKey): void {
  const { intent, buyTokenProgramId } = quote

  const credited = getIsNativeToken(SupportedChainId.SOLANA, intent.buyMint.toBase58())
    ? receiver
    : deriveAta(intent.buyMint, receiver, buyTokenProgramId)

  if (!intent.buyTokenAccount.equals(credited)) {
    throw new IntentReceiverMismatchError(intent.buyTokenAccount, credited)
  }
}
