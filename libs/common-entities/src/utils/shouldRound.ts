import { Rounding } from '../constants'

export function shouldRound(guardDigit: number, negative: boolean, rounding: Rounding): boolean {
  if (rounding === Rounding.ROUND_UP) return guardDigit > 0 && !negative
  if (rounding === Rounding.ROUND_DOWN) return guardDigit > 0 && negative
  // ROUND_HALF_UP
  return guardDigit >= 5
}
