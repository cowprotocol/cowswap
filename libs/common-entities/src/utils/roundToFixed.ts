import { shouldRound } from './shouldRound'

import { Rounding } from '../constants'

/**
 * Rounds a full decimal string to `places` fractional digits using the given
 * Rounding mode, then returns it with exactly `places` decimal digits.
 */
export function roundToFixed(decimalStr: string, places: number, rounding: Rounding): string {
  const negative = decimalStr.startsWith('-')
  const abs = negative ? decimalStr.slice(1) : decimalStr
  const [intPart, fracPart = ''] = abs.split('.')

  // Pad/truncate to places+1 digits so we have a guard digit
  const extended = fracPart.padEnd(places + 1, '0').slice(0, places + 1)
  const guardDigit = Number(extended[places] ?? '0')
  let fracSlice = extended.slice(0, places)

  const roundUp = shouldRound(guardDigit, negative, rounding)

  if (roundUp) {
    // Add 1 to the last digit position using bigint
    const combined = BigInt(intPart + fracSlice) + 1n
    const combinedStr = combined.toString().padStart(intPart.length + places, '0')
    const newIntLen = combinedStr.length - places
    const newInt = combinedStr.slice(0, newIntLen) || '0'
    fracSlice = combinedStr.slice(newIntLen).padStart(places, '0')
    const sign = negative ? '-' : ''
    return places === 0 ? `${sign}${newInt}` : `${sign}${newInt}.${fracSlice}`
  }

  const sign = negative ? '-' : ''
  return places === 0 ? `${sign}${intPart}` : `${sign}${intPart}.${fracSlice}`
}
