import { buildSolanaSwapOrder, SolanaSwapOrder, SolanaSwapOrderQuote } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'

import { SolanaFlowStep } from './types'

export interface PlanCreateOrderStepParams extends SolanaSwapOrderQuote {
  sellSymbol: string
  buySymbol: string
  /** The user's deadline setting, which the quote knows nothing about — it carries the quote's own TTL. */
  validTo: number
}

export interface PlannedCreateOrderStep {
  step: SolanaFlowStep
  orderId: string
  signingScheme: SolanaSwapOrder['signingScheme']
}

/**
 * `validTo` has to reach the instruction, not just the local order: the quoted intent carries the quote's
 * own TTL rather than the user's deadline, so an order built straight from the quote expires at a time the
 * UI never showed.
 *
 * The SDK owns the order's identity as well as its instruction: overriding `validTo` re-derives `uid` and
 * the order PDA, so `orderId` has to come from the same call that built the instruction rather than from
 * the quoted `solanaQuote.uid`.
 */
export async function planCreateOrderStep({
  quoteResults,
  solanaQuote,
  sellSymbol,
  buySymbol,
  validTo,
}: PlanCreateOrderStepParams): Promise<PlannedCreateOrderStep> {
  const { instruction, orderId, signingScheme } = await buildSolanaSwapOrder(
    { quoteResults, solanaQuote },
    { quoteRequest: { validTo } },
  )

  return {
    step: {
      instructions: [instruction],
      summary: t`Swap ${sellSymbol} for ${buySymbol}`,
      createsOrder: true,
    },
    orderId,
    signingScheme,
  }
}
