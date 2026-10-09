import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { SolanaQuote } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'
import { createAssociatedTokenAccountIdempotentInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'
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

// Empty for a native-SOL buy — the skip lives here, not only in the step, so the pre-flight
// `planSolanaTradeFundedAccounts` never prices a buy account the bundle won't create (the native
// sentinel is the System Program address, which `getSolanaTradeOverhead` cannot unpack as a mint).
export function getCreateBuyAtaFundedAccounts(quote: BuyAtaQuote): SolanaFundedAccount[] {
  const { intent, buyTokenProgramId } = quote

  if (getIsNativeToken(SupportedChainId.SOLANA, intent.buyMint.toBase58())) {
    return []
  }

  return [
    {
      address: intent.buyTokenAccount,
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
  const fundedAccounts = getCreateBuyAtaFundedAccounts(quote)

  if (fundedAccounts.length === 0) {
    return null
  }

  return {
    instructions: [
      createAssociatedTokenAccountIdempotentInstruction(
        payer,
        intent.buyTokenAccount,
        receiver,
        intent.buyMint,
        buyTokenProgramId,
      ),
    ],
    summary: t`Create ${buySymbol} account`,
    fundedAccounts,
  }
}
