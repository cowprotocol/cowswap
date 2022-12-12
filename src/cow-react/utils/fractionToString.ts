import { Fraction } from '@uniswap/sdk-core'

export function fractionToString(f: Fraction | null | undefined): string {
  if (!f) return ''
  const { numerator, denominator } = f
  return JSON.stringify({ numerator, denominator })
}

export function stringToFraction(s: string | null | undefined): Fraction | null {
  if (!s) return null

  try {
    const { numerator, denominator } = JSON.parse(s)
    return new Fraction(numerator, denominator)
  } catch (e) {
    return null
  }
}
