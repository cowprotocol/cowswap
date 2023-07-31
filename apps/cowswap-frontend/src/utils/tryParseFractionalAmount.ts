import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { FractionUtils } from './fractionUtils'

export function tryParseFractionalAmount(
  currency: Currency | null,
  amount: string | null
): CurrencyAmount<Currency> | null {
  if (!amount || !currency) return null

  try {
    const fraction = FractionUtils.parseFractionFromJSON(amount)

    if (!fraction) return null

    return currency ? CurrencyAmount.fromFractionalAmount(currency, fraction.numerator, fraction.denominator) : null
  } catch (e: any) {
    return null
  }
}
