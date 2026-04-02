import JSBI from 'jsbi'

import { CurrencyAmount } from './currencyAmount'
import { Fraction } from './fraction'

import { BigintIsh, Rounding } from '../constants'
import { Currency } from '../currency'

export class Price<TBase extends Currency, TQuote extends Currency> extends Fraction {
  readonly baseCurrency: TBase // input i.e. denominator
  readonly quoteCurrency: TQuote // output i.e. numerator
  readonly scalar: Fraction // used to adjust the raw fraction w/r/t the decimals of the {base,quote}Token

  /**
   * Construct a price, either with the base and quote currency amount, or the
   * @param args
   */
  constructor(
    ...args:
      | [TBase, TQuote, BigintIsh, BigintIsh]
      | [{ baseAmount: CurrencyAmount<TBase>; quoteAmount: CurrencyAmount<TQuote> }]
  ) {
    let baseCurrency: TBase, quoteCurrency: TQuote, denominator: BigintIsh, numerator: BigintIsh

    if (args.length === 4) {
      ;[baseCurrency, quoteCurrency, denominator, numerator] = args
    } else {
      const result = args[0].quoteAmount.divide(args[0].baseAmount)
      ;[baseCurrency, quoteCurrency, denominator, numerator] = [
        args[0].baseAmount.currency,
        args[0].quoteAmount.currency,
        result.denominator,
        result.numerator,
      ]
    }
    super(numerator, denominator)

    this.baseCurrency = baseCurrency
    this.quoteCurrency = quoteCurrency
    this.scalar = new Fraction(
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(baseCurrency.decimals)),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(quoteCurrency.decimals)),
    )
  }

  /**
   * Flip the price, switching the base and quote currency
   */
  override invert(): Price<TQuote, TBase> {
    return new Price(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator)
  }

  /**
   * Multiply the price by another price, returning a new price. The other price must have the same base currency as this price's quote currency
   * @param other the other price
   */
  override multiply<TOtherQuote extends Currency>(other: Price<TQuote, TOtherQuote>): Price<TBase, TOtherQuote> {
    if (!this.quoteCurrency.equals(other.baseCurrency)) throw new Error('TOKEN')
    const fraction = super.multiply(other)
    return new Price(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator)
  }

  /**
   * Return the amount of quote currency corresponding to a given amount of the base currency
   * @param currencyAmount the amount of base currency to quote against the price
   */
  quote(currencyAmount: CurrencyAmount<TBase>): CurrencyAmount<TQuote> {
    if (!currencyAmount.currency.equals(this.baseCurrency)) throw new Error('TOKEN')
    const result = super.multiply(currencyAmount)
    return CurrencyAmount.fromFractionalAmount(this.quoteCurrency, result.numerator, result.denominator)
  }

  /**
   * Get the value scaled by decimals for formatting
   */
  private get adjustedForDecimals(): Fraction {
    return super.multiply(this.scalar)
  }

  override toSignificant(significantDigits: number = 6, format?: object, rounding?: Rounding): string {
    return this.adjustedForDecimals.toSignificant(significantDigits, format, rounding)
  }

  override toFixed(decimalPlaces: number = 4, format?: object, rounding?: Rounding): string {
    return this.adjustedForDecimals.toFixed(decimalPlaces, format, rounding)
  }
}
