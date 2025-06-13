import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { FractionUtils } from './fractionUtils'

export function tryParseFractionalAmount(
  currency: Currency | null,
  amount: string | null
): CurrencyAmount<Currency> | null {
  if (!amount || !currency) return null

  try {
    const parsed = FractionUtils.parseFractionFromJSON(amount)

    if (!parsed) return null

    const fraction =
      typeof parsed.decimals === 'number'
        ? FractionUtils.adjustDecimalsAtoms(parsed.value, parsed.decimals, currency.decimals)
        : parsed.value

    return currency ? CurrencyAmount.fromFractionalAmount(currency, fraction.numerator, fraction.denominator) : null
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Failed to parse fractional amount', error, amount, currency?.symbol)
    return null
  }
}
