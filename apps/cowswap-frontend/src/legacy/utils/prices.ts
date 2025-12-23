import { Percent } from '@uniswap/sdk-core'

import { PRICE_IMPACT_TIERS } from 'common/constants/priceImpact'

export type WarningSeverity = -1 | 0 | 1 | 2 | 3 | 4

export function warningSeverity(priceImpact: Percent | undefined): WarningSeverity {
  if (!priceImpact) return 4
  if (priceImpact.lessThan(0)) return -1

  let impact: WarningSeverity = PRICE_IMPACT_TIERS.length as WarningSeverity
  for (const impactLevel of PRICE_IMPACT_TIERS) {
    if (impactLevel.lessThan(priceImpact)) return impact
    impact--
  }
  return 0
}
