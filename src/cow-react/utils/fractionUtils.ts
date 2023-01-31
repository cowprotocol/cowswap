import { Fraction } from '@uniswap/sdk-core'

export class FractionUtils {
  static serializeFractionToJSON(fraction: Fraction | null | undefined): string {
    if (!fraction) return ''
    const { numerator, denominator } = fraction
    return JSON.stringify({ numerator: numerator + '', denominator: denominator + '' })
  }

  static parseFractionFromJSON(s: string | null | undefined): Fraction | null {
    if (!s) return null

    try {
      const { numerator, denominator } = JSON.parse(s)
      return new Fraction(numerator, denominator)
    } catch (e: any) {
      return null
    }
  }
}
