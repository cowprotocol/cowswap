import { Nullish } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { FractionUtils } from './fractionUtils'

export function currencyAmountToRawString(amount: Nullish<CurrencyAmount<Currency>>): string | undefined {
  return amount ? amount.quotient.toString() : undefined
}

// Use for analytics/logging where we need exact units and to omit missing values.
export function currencyAmountToExactString(amount: Nullish<CurrencyAmount<Currency>>): string | undefined {
  const exact = FractionUtils.fractionLikeToExactString(amount)
  return exact || undefined
}
