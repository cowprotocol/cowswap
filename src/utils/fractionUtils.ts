import { CurrencyAmount, Fraction, Price, BigintIsh, Rounding, Token, Currency } from '@uniswap/sdk-core'
import { FractionLike, Nullish } from 'types'
import { FULL_PRICE_PRECISION } from 'constants/index'
import { trimTrailingZeros } from 'utils/trimTrailingZeros'
import JSBI from 'jsbi'
import { adjustDecimalsAtoms } from 'modules/limitOrders/utils/calculateAmountForRate'

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

  static round(value: FractionLike, rounding: Rounding = Rounding.ROUND_UP): Fraction {
    const { quotient, remainder } = FractionUtils.fractionLikeToFraction(value)

    return new Fraction(JSBI.add(quotient, JSBI.BigInt(remainder.toFixed(0, undefined, rounding))), 1)
  }

  static gte(fraction: Fraction, value: BigintIsh): boolean {
    return fraction.equalTo(value) || fraction.greaterThan(value)
  }

  static lte(fraction: Fraction, value: BigintIsh): boolean {
    return fraction.equalTo(value) || fraction.lessThan(value)
  }

  /**
   * Converts a Fraction (which has no units, therefore is not decimal aware) into a price of tokens (which it is)
   *
   * Sice the price stores internally the amount in atoms, this method will take care of making sure the price is
   * decimal aware.
   *
   *
   * @param fraction
   * @param inputCurrency
   * @param outputCurrency
   * @returns
   */
  static toPrice(fraction: Fraction, inputCurrency: Token, outputCurrency: Token): Price<Token, Token> {
    // Note that here the fraction shows the price in units (for both tokens). The Price class is decimals aware, so we need to adapt it
    const adjustedFraction = adjustDecimalsAtoms(fraction, inputCurrency.decimals, outputCurrency.decimals)

    return new Price({
      quoteAmount: CurrencyAmount.fromRawAmount(outputCurrency, adjustedFraction.numerator),
      baseAmount: CurrencyAmount.fromRawAmount(inputCurrency, adjustedFraction.denominator),
    })
  }

  /**
   * Converts a Price into a Fraction
   *
   * Since Prices are currency aware (therefore decimal aware), this method will make sure they are taken into account
   * to transform to the Fraction (which has no information about the currencies, so is not decimals aware),
   *
   * @param price
   * @returns
   */
  static fromPrice(price: Price<Currency, Currency>): Fraction {
    return adjustDecimalsAtoms(
      new Fraction(price.numerator, price.denominator),
      price.quoteCurrency.decimals,
      price.baseCurrency.decimals
    )
  }
}
