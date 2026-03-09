import Big, { RoundingMode } from 'big.js'

import { stripTrailingZeros } from './applyFormat'

/**
 * Divides numerator by denominator and returns a string rounded to the given
 * number of significant digits, using the given big.js rounding mode.
 * Never returns scientific notation.
 */
export function toSignificant(
  numerator: string,
  denominator: string,
  significantDigits: number,
  roundingMode: RoundingMode,
): string {
  const prevDP = Big.DP
  const prevRM = Big.RM

  // Set both DP and RM before division so intermediate value has enough
  // precision and the correct rounding mode propagates through toFixed.
  Big.DP = significantDigits + 20
  Big.RM = roundingMode

  const value = new Big(numerator).div(denominator)

  // Number of decimal places needed to express `significantDigits` sig figs:
  // e.g. 0.666 (e=-1) with 4 sig figs → dp = 4-1-(-1) = 4
  //      1234.5 (e=3) with 5 sig figs → dp = 5-1-3 = 1
  //      12345 (e=4) with 3 sig figs → dp = 3-1-4 = -2 (integer rounding)
  const logicalDp = significantDigits - 1 - value.e

  let result: string
  if (logicalDp >= 0) {
    result = stripTrailingZeros(value.toFixed(logicalDp))
  } else {
    // Round to nearest 10^shift (e.g. nearest 100 for shift=2)
    const shift = -logicalDp
    const scaled = value.div(new Big(10).pow(shift))
    result = scaled.toFixed(0) + '0'.repeat(shift)
  }

  Big.DP = prevDP
  Big.RM = prevRM
  return result
}
