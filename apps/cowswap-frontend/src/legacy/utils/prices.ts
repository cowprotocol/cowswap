import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
} from '@cowprotocol/common-const'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'
import { Field } from 'legacy/state/types'

const IMPACT_TIERS = [
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  ALLOWED_PRICE_IMPACT_LOW,
]

export type WarningSeverity = -1 | 0 | 1 | 2 | 3 | 4

export function warningSeverity(priceImpact: Percent | undefined): WarningSeverity {
  if (!priceImpact) return 4
  if (priceImpact.lessThan(0)) return -1

  let impact: WarningSeverity = IMPACT_TIERS.length as WarningSeverity
  for (const impactLevel of IMPACT_TIERS) {
    if (impactLevel.lessThan(priceImpact)) return impact
    impact--
  }
  return 0
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bps
export function computeSlippageAdjustedAmounts(
  //   trade: Trade | undefined,
  trade: TradeGp | undefined,
  allowedSlippage: Percent
): { [field in Field]?: CurrencyAmount<Currency> } {
  return {
    [Field.INPUT]: trade?.maximumAmountIn(allowedSlippage),
    [Field.OUTPUT]: trade?.minimumAmountOut(allowedSlippage),
  }
}
