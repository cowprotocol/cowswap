import type { SolanaQuote } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'
import { createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { SolanaFlowStep } from './types'

export interface PlanCreateBuyAtaStepParams {
  /** Funds the rent — the user, not the solver. */
  payer: PublicKey
  /** Owner of the created account: the order's receiver, which is not always the payer. */
  receiver: PublicKey
  quote: Pick<SolanaQuote, 'intent' | 'buyTokenProgramId'>
  buySymbol: string
}

/**
 * Without this, an order buying a token the receiver has never held can never settle: `FinalizeSettle`
 * credits an account that was never created, and SPL Token answers `InvalidAccountData`.
 * Idempotent, so an existing account costs a little compute instead of an RPC check before signing.
 */
export function planCreateBuyAtaStep({
  payer,
  receiver,
  quote,
  buySymbol,
}: PlanCreateBuyAtaStepParams): SolanaFlowStep {
  const { intent, buyTokenProgramId } = quote

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
  }
}
