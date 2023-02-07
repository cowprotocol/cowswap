import { CurrencyAmount, Fraction, Price, BigintIsh } from '@uniswap/sdk-core'
import { FractionLike, Nullish } from '@cow/types'
import { FULL_PRICE_PRECISION } from 'constants/index'
import { trimTrailingZeros } from '@cow/utils/trimTrailingZeros'

export class FractionUtils {
  static serializeFractionToJSON(fraction: Nullish<Fraction>): string {
    if (!fraction) return ''
    const { numerator, denominator } = fraction
    return JSON.stringify({ numerator: numerator + '', denominator: denominator + '' })
  }

  static parseFractionFromJSON(s: Nullish<string>): Fraction | null {
    if (!s) return null

    try {
      const { numerator, denominator } = JSON.parse(s)
      return new Fraction(numerator, denominator)
    } catch (e: any) {
      return null
    }
  }

  static fractionLikeToExactString(amount: Nullish<FractionLike>, max = FULL_PRICE_PRECISION): string {
    if (!amount) return ''

    if (amount.equalTo(0)) return '0'

    return trimTrailingZeros(
      (() => {
        if (amount instanceof CurrencyAmount) {
          return amount.toFixed(amount.currency.decimals) || ''
        }

        if (amount instanceof Price) {
          const decimals = amount.quoteCurrency.decimals === 0 ? max : amount.quoteCurrency.decimals
          return amount.toFixed(decimals) || ''
        }

        return amount.toFixed(max) || ''
      })()
    )
  }

  static fractionLikeToFraction(amount: FractionLike): Fraction {
    if (amount instanceof CurrencyAmount) return new Fraction(amount.quotient, amount.decimalScale)
    if (amount instanceof Price) return amount.asFraction.multiply(amount.scalar)
    return amount
  }

  static gte(fraction: Fraction, value: BigintIsh): boolean {
    return fraction.equalTo(value) || fraction.greaterThan(value)
  }

  static lte(fraction: Fraction, value: BigintIsh): boolean {
    return fraction.equalTo(value) || fraction.lessThan(value)
  }
}
