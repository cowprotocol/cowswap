import { Rounding } from '../constants'

export function shouldRound(guardDigit: number, negative: boolean, rounding: Rounding): boolean {
  // ROUND_UP: away from zero - increase magnitude whenever there are remaining digits
  if (rounding === Rounding.ROUND_UP) return guardDigit > 0
  // ROUND_DOWN: toward zero - always truncate, never increase magnitude
  if (rounding === Rounding.ROUND_DOWN) return false
  // ROUND_HALF_UP: standard rounding, sign-independent
  return guardDigit >= 5
}
