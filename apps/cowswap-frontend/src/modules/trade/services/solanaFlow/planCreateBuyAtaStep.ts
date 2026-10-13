import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { SolanaQuote } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'
import {
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { SolanaFlowStep, SolanaFundedAccount } from './types'

export type BuyAtaQuote = Pick<SolanaQuote, 'intent' | 'buyTokenProgramId'>

export interface PlanCreateBuyAtaStepParams {
  /** Funds the rent: the owner, or the sponsor on a sponsored order. Never the solver. */
  payer: PublicKey
  /** Owner of the created account: the order's receiver, which is not always the payer. */
  receiver: PublicKey
  quote: BuyAtaQuote
  buySymbol: string
}

/**
 * The account the buy side is credited to, derived from the order's receiver rather than read from
 * `quote.intent.buyTokenAccount`.
 *
 * The quoted account belongs to whoever the quote named as receiver, which is not the order's receiver:
 * a limit order builds its own intent from the user's price and recipient without consulting the quote.
 * Hand the ATA program an address it does not derive from the owner it was given and it rejects the
 * instruction, taking the whole transaction with it — the order is left in the book with nothing on
 * chain. This is what `SolanaQuote.buyTokenProgramId` is documented to exist for.
 *
 * `allowOwnerOffCurve` so a recipient that is itself a PDA still resolves.
 */
export function getBuyTokenAccount(quote: BuyAtaQuote, receiver: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(
    quote.intent.buyMint,
    receiver,
    true,
    quote.buyTokenProgramId ?? TOKEN_PROGRAM_ID,
  )
}

// Empty for a native-SOL buy — the skip lives here, not only in the step, so the pre-flight
// `planSolanaTradeFundedAccounts` never prices a buy account the bundle won't create (the native
// sentinel is the System Program address, which `getSolanaTradeOverhead` cannot unpack as a mint).
export function getCreateBuyAtaFundedAccounts(quote: BuyAtaQuote, receiver: PublicKey): SolanaFundedAccount[] {
  const { intent, buyTokenProgramId } = quote

  if (getIsNativeToken(SupportedChainId.SOLANA, intent.buyMint.toBase58())) {
    return []
  }

  return [
    {
      address: getBuyTokenAccount(quote, receiver),
      // A Token-2022 mint's extensions decide how large its accounts are, so the size is resolved from
      // the mint rather than assumed. A quote without a program id means the classic SPL token program,
      // matching the default `createAssociatedTokenAccountIdempotentInstruction` applies below.
      size: { mint: intent.buyMint, tokenProgramId: buyTokenProgramId ?? TOKEN_PROGRAM_ID },
    },
  ]
}

/**
 * Without this, an order buying a token the receiver has never held can never settle: `FinalizeSettle`
 * credits an account that was never created, and SPL Token answers `InvalidAccountData`.
 * Idempotent, so an existing account costs a little compute instead of an RPC check before signing.
 *
 * Skipped for a native-SOL buy: settlement pays that out as lamports, so there is no token account.
 */
export function planCreateBuyAtaStep({
  payer,
  receiver,
  quote,
  buySymbol,
}: PlanCreateBuyAtaStepParams): SolanaFlowStep | null {
  const { intent, buyTokenProgramId } = quote
  const fundedAccounts = getCreateBuyAtaFundedAccounts(quote, receiver)

  if (fundedAccounts.length === 0) {
    return null
  }

  return {
    instructions: [
      createAssociatedTokenAccountIdempotentInstruction(
        payer,
        getBuyTokenAccount(quote, receiver),
        receiver,
        intent.buyMint,
        buyTokenProgramId,
      ),
    ],
    summary: t`Create ${buySymbol} account`,
    fundedAccounts,
  }
}
