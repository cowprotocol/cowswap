/**
 * Divides numerator/denominator and returns a decimal string with `extraDigits`
 * extra fractional digits beyond what will be needed, so callers can round.
 * Handles negative values by tracking sign separately.
 */
export function divideToDecimalString(numerator: bigint, denominator: bigint, extraDigits: number): string {
  const negative = numerator < 0n !== denominator < 0n
  const num = numerator < 0n ? -numerator : numerator
  const den = denominator < 0n ? -denominator : denominator

  const intPart = num / den
  let rem = num % den

  const fracDigits = extraDigits + 1
  let frac = ''
  for (let i = 0; i < fracDigits; i++) {
    rem *= 10n
    frac += (rem / den).toString()
    rem = rem % den
  }

  const raw = `${intPart}.${frac}`
  return negative && numerator !== 0n ? `-${raw}` : raw
}
