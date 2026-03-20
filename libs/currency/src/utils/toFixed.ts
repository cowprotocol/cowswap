import { Rounding } from '../entities/constants'

/**
 * Divides numerator by denominator and returns a string rounded to the given
 * number of decimal places, using the given rounding mode.
 * Never returns scientific notation.
 */
export function toFixed(numerator: string, denominator: string, decimalPlaces: number, rounding: Rounding): string {
  const rawNum = BigInt(numerator)
  const rawDen = BigInt(denominator)

  const negative = rawNum < 0n !== rawDen < 0n
  const num = rawNum < 0n ? -rawNum : rawNum
  const den = rawDen < 0n ? -rawDen : rawDen

  // scale numerator by 10^decimalPlaces, then floor-divide
  const scale = 10n ** BigInt(decimalPlaces)
  const scaledNum = num * scale
  const quotient = scaledNum / den
  const rem = scaledNum % den

  const hasRemainder = rem > 0n
  const isHalfOrMore = rem * 2n >= den

  // round-down: floor is already correct
  const rounded =
    rounding === Rounding.ROUND_UP && hasRemainder
      ? quotient + 1n
      : rounding === Rounding.ROUND_HALF_UP && isHalfOrMore
        ? quotient + 1n
        : quotient

  const digits = rounded.toString()
  const padded = digits.padStart(decimalPlaces + 1, '0')
  const intPart = padded.slice(0, padded.length - decimalPlaces)
  const fracPart = padded.slice(padded.length - decimalPlaces)
  const result = decimalPlaces === 0 ? digits : intPart + '.' + fracPart

  return negative && rounded > 0n ? '-' + result : result
}
