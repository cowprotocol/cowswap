import { shouldRound } from './shouldRound'

import { Rounding } from '../constants'

/**
 * Rounds to `sigDigits` significant figures from a full decimal string.
 */
export function roundToSignificant(decimalStr: string, sigDigits: number, rounding: Rounding): string {
  const negative = decimalStr.startsWith('-')
  const abs = negative ? decimalStr.slice(1) : decimalStr
  const [intPart, fracPart = ''] = abs.split('.')
  const sign = negative ? '-' : ''

  const sigValue = computeSigValue(intPart, fracPart, sigDigits, negative, rounding)

  if (intPart !== '0') {
    return reconstructFromInt(sign, intPart, sigValue, sigDigits)
  }

  return reconstructFromFrac(sign, fracPart, sigValue, sigDigits)
}

function computeSigValue(
  intPart: string,
  fracPart: string,
  sigDigits: number,
  negative: boolean,
  rounding: Rounding,
): string {
  const allDigits = intPart === '0' ? fracPart : intPart + fracPart
  const leadingZeros = intPart === '0' ? (fracPart.match(/^0*/)?.[0].length ?? 0) : 0
  const firstSigIdx = leadingZeros
  const guardIdx = firstSigIdx + sigDigits
  const guardDigit = Number(allDigits[guardIdx] ?? '0')
  const sigSlice = allDigits.slice(firstSigIdx, guardIdx).padEnd(sigDigits, '0')
  const roundUp = shouldRound(guardDigit, negative, rounding)
  return roundUp ? (BigInt(sigSlice) + 1n).toString().padStart(sigDigits, '0') : sigSlice
}

function reconstructFromInt(sign: string, intPart: string, sigValue: string, sigDigits: number): string {
  const intDigits = intPart.length
  if (sigDigits < intDigits) {
    return `${sign}${sigValue.padEnd(intDigits, '0')}`
  }
  const fracDigits = sigDigits - intDigits
  const newInt = sigValue.slice(0, intDigits)
  const newFrac = sigValue.slice(intDigits).padEnd(fracDigits, '0')
  return fracDigits > 0 ? `${sign}${newInt}.${newFrac}` : `${sign}${newInt}`
}

function reconstructFromFrac(sign: string, fracPart: string, sigValue: string, sigDigits: number): string {
  const leadingZeros = fracPart.match(/^0*/)?.[0].length ?? 0
  const zeros = '0'.repeat(leadingZeros)
  return `${sign}0.${zeros}${sigValue.slice(0, sigDigits)}`
}
