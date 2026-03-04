import { Rounding } from '../constants'

export function shouldRound(guardDigit: number, negative: boolean, rounding: Rounding): boolean {
  if (rounding === Rounding.ROUND_UP) return guardDigit > 0
  if (rounding === Rounding.ROUND_DOWN) return false
  return guardDigit >= 5
}
