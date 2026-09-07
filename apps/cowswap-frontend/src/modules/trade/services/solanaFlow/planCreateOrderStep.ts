import { buildCreateOrderInstruction, SolanaQuote } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'

import { SolanaFlowStep } from './types'

export interface PlanCreateOrderStepParams {
  solanaQuote: SolanaQuote
  sellSymbol: string
  buySymbol: string
}

// `createdBy` is always the owner: one connected wallet both authenticates the order and funds the order
// PDA's rent, matching `postSolanaSwapOrderFromQuote` in the SDK.
export function planCreateOrderStep({ solanaQuote, sellSymbol, buySymbol }: PlanCreateOrderStepParams): SolanaFlowStep {
  const { programId, orderPda, intent } = solanaQuote

  return {
    instructions: [
      buildCreateOrderInstruction({
        programId,
        owner: intent.owner,
        createdBy: intent.owner,
        orderPda,
        intent,
      }),
    ],
    summary: t`Swap ${sellSymbol} for ${buySymbol}`,
  }
}
