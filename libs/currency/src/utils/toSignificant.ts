import { stripTrailingZeros } from './applyFormat'
import { toFixed } from './toFixed'

import { Rounding } from '../entities/constants'

/**
 * Divides numerator by denominator and returns a string rounded to the given
 * number of significant digits, using the given rounding mode.
 * Never returns scientific notation.
 */
export function toSignificant(
  numeratorStr: string,
  denominatorStr: string,
  significantDigits: number,
  rounding: Rounding,
): string {
  let numerator = BigInt(numeratorStr)
  let denominator = BigInt(denominatorStr)

  if (numerator === 0n) return '0'

  // Determine sign and work with absolute values
  const negative = numerator < 0n !== denominator < 0n
  if (numerator < 0n) numerator = -numerator
  if (denominator < 0n) denominator = -denominator

  // number of decimal places needed to express significantDigits sig figs
  const exponent = findExponent(numerator, denominator)
  const logicalDp = significantDigits - 1 - exponent

  let result: string
  if (logicalDp >= 0) {
    result = stripTrailingZeros(toFixed(numerator.toString(), denominator.toString(), logicalDp, rounding))
  } else {
    // round at integer level (e.g. 12345 → 12300 for 3 sig figs)
    const shift = -logicalDp
    const scaledDen = denominator * 10n ** BigInt(shift)
    const quotient = calculateQuotient(numerator, scaledDen, rounding)
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

// returns floor(log10(num/den)), assuming numerator and denominator are positive.
function findExponent(numerator: bigint, denominator: bigint): number {
  if (numerator >= denominator) return (numerator / denominator).toString().length - 1
  // num < den → e < 0; find smallest k such that num * 10^k >= den
  const lenDiff = denominator.toString().length - numerator.toString().length
  let k = lenDiff
  while (numerator * 10n ** BigInt(k) < denominator) k++
  return -k
}
