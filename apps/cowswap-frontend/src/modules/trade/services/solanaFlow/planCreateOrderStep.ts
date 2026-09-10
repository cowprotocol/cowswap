import { buildSolanaSwapOrder, SolanaSwapOrder, SolanaSwapOrderQuote } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'

import { SolanaFlowStep } from './types'

export interface PlanCreateOrderStepParams extends SolanaSwapOrderQuote {
  sellSymbol: string
  buySymbol: string
}

export interface PlannedCreateOrderStep {
  step: SolanaFlowStep
  orderId: string
  signingScheme: SolanaSwapOrder['signingScheme']
}

/**
 * The SDK owns the order's identity as well as its instruction: overriding `receiver`/`validTo` re-derives
 * `uid` and the order PDA, so `orderId` has to come from the same call that built the instruction rather
 * than from the quoted `solanaQuote.uid`.
 */
export async function planCreateOrderStep({
  quoteResults,
  solanaQuote,
  sellSymbol,
  buySymbol,
}: PlanCreateOrderStepParams): Promise<PlannedCreateOrderStep> {
  const { instruction, orderId, signingScheme } = await buildSolanaSwapOrder({ quoteResults, solanaQuote })

  return {
    step: {
      instructions: [instruction],
      summary: t`Swap ${sellSymbol} for ${buySymbol}`,
    },
    orderId,
    signingScheme,
  }
}
