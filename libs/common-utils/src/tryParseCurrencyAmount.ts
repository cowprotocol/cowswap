import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

/**
 * Parses a CurrencyAmount from the passed string.
 * Returns the CurrencyAmount, or undefined if parsing fails.
 */
export function tryParseCurrencyAmount<T extends Currency>(value: string, currency: T): CurrencyAmount<T>
export function tryParseCurrencyAmount<T extends Currency>(value: Fraction, currency: T): CurrencyAmount<T>
export function tryParseCurrencyAmount<T extends Currency>(value?: string, currency?: T): CurrencyAmount<T> | undefined
export function tryParseCurrencyAmount<T extends Currency>(
  value?: string | Fraction,
  currency?: T,
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    if (value instanceof Fraction) {
      const decimalAdjusted = new Fraction(10 ** currency.decimals).multiply(value)
      return CurrencyAmount.fromFractionalAmount(currency, decimalAdjusted.numerator, decimalAdjusted.denominator)
    }

    const [quotient, remainder] = value.split('.')
    const fixedNumber = remainder ? quotient + '.' + remainder.slice(0, currency.decimals) : quotient
    const typedValueParsed = parseUnits(fixedNumber, currency.decimals).toString()

    return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed))
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  return undefined
}
