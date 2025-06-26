import { FULL_PRICE_PRECISION } from '@cowprotocol/common-const'
import { Nullish } from '@cowprotocol/types'
import { BigintIsh, Currency, CurrencyAmount, Fraction, Price, Rounding, Token } from '@uniswap/sdk-core'

import { BigNumber } from 'bignumber.js'
import JSBI from 'jsbi'

import { trimTrailingZeros } from './trimTrailingZeros'
import { FractionLike } from './types'

export class FractionUtils {
  static serializeFractionToJSON(amount: Nullish<CurrencyAmount<Currency>>): string {
    if (!amount) return ''

    const { numerator, denominator } = amount
    return JSON.stringify({
      numerator: numerator.toString(),
      denominator: denominator.toString(),
      decimals: amount.currency.decimals,
    })
  }

  static parseFractionFromJSON(s: Nullish<string>): { value: Fraction; decimals: number | undefined } | null {
    if (!s) return null

    try {
      const { numerator, denominator, decimals } = JSON.parse(s)
      return { value: new Fraction(numerator, denominator), decimals }
    } catch {
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
      })(),
    )
  }

  static fractionLikeToFraction(amount: FractionLike): Fraction {
    if (amount instanceof CurrencyAmount) return new Fraction(amount.quotient, amount.decimalScale)
    if (amount instanceof Price) return FractionUtils.fromPrice(amount)
    return amount
  }

  static round(value: FractionLike, rounding: Rounding = Rounding.ROUND_UP): Fraction {
    const { quotient, remainder } = FractionUtils.fractionLikeToFraction(value)

    return new Fraction(JSBI.add(quotient, JSBI.BigInt(remainder.toFixed(0, undefined, rounding))), 1)
  }

  static gte(fraction: Fraction, value: Fraction | BigintIsh): boolean {
    return fraction.equalTo(value) || fraction.greaterThan(value)
  }

  static lte(fraction: Fraction, value: Fraction | BigintIsh): boolean {
    return fraction.equalTo(value) || fraction.lessThan(value)
  }

  /**
   * Converts a Fraction (which has no units, therefore is not decimal aware) into a price of tokens (which it is)
   *
   * Since the price stores internally the amount in atoms, this method will take care of making sure the price is
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
    const adjustedFraction = FractionUtils.adjustDecimalsAtoms(
      fraction,
      inputCurrency.decimals,
      outputCurrency.decimals,
    )

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
    // Simplify the input fraction
    const simplifiedPrice = FractionUtils.simplify(price)
    // Adjust the fraction to consider the decimals
    const decimalAdjustedFraction = FractionUtils.adjustDecimalsAtoms(
      new Fraction(simplifiedPrice.numerator, simplifiedPrice.denominator),
      price.quoteCurrency.decimals,
      price.baseCurrency.decimals,
    )
    // Simplify the output fraction
    return FractionUtils.simplify(decimalAdjustedFraction)
  }

  /**
   * Adjust a fraction defined in units for both token to consider the decimals.
   * For example, a fraction like 1.1/1 representing the price of USDC, DAI in units, will be turned into
   * 1.1/1000000000000 in atoms
   */
  static adjustDecimalsAtoms(
    value: CurrencyAmount<Currency>,
    decimalsA: number,
    decimalsB: number,
  ): CurrencyAmount<Currency>
  static adjustDecimalsAtoms(value: Fraction, decimalsA: number, decimalsB: number): Fraction
  static adjustDecimalsAtoms(
    value: Fraction | CurrencyAmount<Currency>,
    decimalsA: number,
    decimalsB: number,
  ): Fraction | CurrencyAmount<Currency> {
    if (decimalsA === decimalsB) {
      return value
    }

    const decimalsShift = JSBI.BigInt(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(Math.abs(decimalsA - decimalsB))))

    return decimalsA < decimalsB ? value.multiply(decimalsShift) : value.divide(decimalsShift)
  }

  /**
   * Converts a number into a Fraction
   *
   * @param n
   */
  static fromNumber(n: number): Fraction {
    const bigNumber = new BigNumber(n)
    const decimalPlaces = bigNumber.decimalPlaces()

    if (!decimalPlaces) {
      return new Fraction(JSBI.BigInt(n))
    }

    const denominator = Math.pow(10, decimalPlaces)

    const numerator = bigNumber.times(denominator).decimalPlaces(0).toFixed()

    return new Fraction(JSBI.BigInt(numerator), JSBI.BigInt(denominator))
  }

  /**
   * When an amount equals zero, return 1 wei, otherwise return amount
   *
   * @param amount
   */
  static amountToAtLeastOneWei<T extends Currency>(amount: Nullish<CurrencyAmount<T>>): Nullish<CurrencyAmount<T>> {
    if (!amount) return null

    return amount.equalTo(0) ? CurrencyAmount.fromRawAmount(amount.currency, 1) : amount
  }

  static simplify(fraction: Fraction): Fraction {
    return reduce(trimZeros(fraction))
  }
}

const ZERO = JSBI.BigInt(0)

/**
 * Use GCD to reduce the fraction to the smallest possible
 *
 * From https://stackoverflow.com/a/65927538
 *
 * @param fraction
 */
function reduce(fraction: Fraction): Fraction {
  let numerator = fraction.numerator
  let denominator = fraction.denominator
  let rest: JSBI

  if (JSBI.equal(denominator, ZERO)) {
    return new Fraction(JSBI.BigInt(0), JSBI.BigInt(1))
  }

  while (JSBI.notEqual(denominator, ZERO)) {
    rest = JSBI.remainder(numerator, denominator)
    numerator = denominator
    denominator = rest
  }
  return new Fraction(JSBI.divide(fraction.numerator, numerator), JSBI.divide(fraction.denominator, numerator))
}

/**
 * Remove trailing zeros from a fraction
 * @param fraction
 */
function trimZeros(fraction: Fraction): Fraction {
  const numerator = fraction.numerator.toString()
  const denominator = fraction.denominator.toString()

  const numeratorZeros = numerator.match(/0+$/)?.[0].length || 0
  const denominatorZeros = denominator.match(/0+$/)?.[0].length || 0

  const zeros = Math.min(numeratorZeros, denominatorZeros)

  return new Fraction(numerator.slice(0, numerator.length - zeros), denominator.slice(0, denominator.length - zeros))
}
