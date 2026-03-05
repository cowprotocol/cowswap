import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

import { FractionUtils } from './fractionUtils'

// Use for analytics/logging where we need exact units and to omit missing values.
export function currencyAmountToExactString(amount: Nullish<CurrencyAmount<Currency>>): string | undefined {
  const exact = FractionUtils.fractionLikeToExactString(amount)
  return exact || undefined
}

export function currencyAmountToRawString(amount: Nullish<CurrencyAmount<Currency>>): string | undefined {
  return amount ? amount.quotient.toString() : undefined
}
