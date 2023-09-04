import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

/**
 * Parses a CurrencyAmount from the passed string.
 * Returns the CurrencyAmount, or undefined if parsing fails.
 */
export default function tryParseCurrencyAmount<T extends Currency>(value: string, currency: T): CurrencyAmount<T>
export default function tryParseCurrencyAmount<T extends Currency>(
  value?: string,
  currency?: T
): CurrencyAmount<T> | undefined
export default function tryParseCurrencyAmount<T extends Currency>(
  value?: string,
  currency?: T
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const [quotient, remainder] = value.split('.')
    const fixedNumber = remainder ? quotient + '.' + remainder.slice(0, currency.decimals) : quotient
    const typedValueParsed = parseUnits(fixedNumber, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed))
    }
  } catch (error: any) {
    // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  return undefined
}
