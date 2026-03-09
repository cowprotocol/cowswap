import { stripTrailingZeros } from './applyFormat'
import { toFixed } from './toFixed'

import { Rounding } from '../entities/constants'

/**
 * Divides numerator by denominator and returns a string rounded to the given
 * number of significant digits, using the given rounding mode.
 * Never returns scientific notation.
 */
export function toSignificant(
  numerator: string,
  denominator: string,
  significantDigits: number,
  rounding: Rounding,
): string {
  let num = BigInt(numerator)
  let den = BigInt(denominator)

  if (num === 0n) return '0'

  // Determine sign and work with absolute values
  const negative = num < 0n !== den < 0n
  if (num < 0n) num = -num
  if (den < 0n) den = -den

  // Number of decimal places needed to express significantDigits sig figs
  const e = findExponent(num, den)
  const logicalDp = significantDigits - 1 - e

  let result: string
  if (logicalDp >= 0) {
    result = stripTrailingZeros(toFixed(num.toString(), den.toString(), logicalDp, rounding))
  } else {
    // Round at integer level (e.g. 12345 → 12300 for 3 sig figs)
    const shift = -logicalDp
    const scaledDen = den * 10n ** BigInt(shift)
    const quotient = calculateQuotient(num, scaledDen, rounding)
    result = quotient.toString() + '0'.repeat(shift)
  }

  return negative ? '-' + result : result
}

function calculateQuotient(numerator: bigint, scaledDen: bigint, rounding: Rounding): bigint {
  const quotient = numerator / scaledDen
  const rem = numerator % scaledDen
  const isRoundingUp = rounding === Rounding.ROUND_UP || rounding === Rounding.ROUND_HALF_UP
  if (isRoundingUp && rem > 0n) {
    return quotient + 1n
  } else if (isRoundingUp && rem * 2n >= scaledDen) {
    return quotient + 1n
  }

  return quotient
}

// Returns floor(log10(num/den)), assuming num and den are positive.
function findExponent(num: bigint, den: bigint): number {
  if (num >= den) return (num / den).toString().length - 1
  // num < den → e < 0; find smallest k such that num * 10^k >= den
  const lenDiff = den.toString().length - num.toString().length
  let k = lenDiff
  while (num * 10n ** BigInt(k) < den) k++
  return -k
}
