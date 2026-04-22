import { MAX_UINT256 } from '@cowprotocol/cow-sdk'

import { Fraction } from './fraction'

import { applyFormat, FormatOptions, stripTrailingZeros } from '../../utils/applyFormat'
import { toFixed as divToFixed } from '../../utils/toFixed'
import { BigintIsh, Rounding } from '../constants'
import { Currency } from '../currency'
import { Token } from '../token'

export class CurrencyAmount<T extends Currency> extends Fraction {
  readonly currency: T
  readonly decimalScale: bigint

  /**
   * Returns a new currency amount instance from the unitless amount of token, i.e. the raw amount
   * @param currency the currency in the amount
   * @param rawAmount the raw token or ether amount
   */
  static fromRawAmount<T extends Currency>(currency: T, rawAmount: BigintIsh): CurrencyAmount<T> {
    return new CurrencyAmount(currency, rawAmount)
  }

  /**
   * Construct a currency amount with a denominator that is not equal to 1
   * @param currency the currency
   * @param numerator the numerator of the fractional token amount
   * @param denominator the denominator of the fractional token amount
   */
  static fromFractionalAmount<T extends Currency>(
    currency: T,
    numerator: BigintIsh,
    denominator: BigintIsh,
  ): CurrencyAmount<T> {
    return new CurrencyAmount(currency, numerator, denominator)
  }

  protected constructor(currency: T, numerator: BigintIsh, denominator?: BigintIsh) {
    super(numerator, denominator)
    if (this.quotient > MAX_UINT256) throw new Error('AMOUNT')
    this.currency = currency
    this.decimalScale = 10n ** BigInt(currency.decimals)
  }

  override add(other: CurrencyAmount<T>): CurrencyAmount<T> {
    if (!this.currency.equals(other.currency)) throw new Error('CURRENCY')
    const added = super.add(other)
    return CurrencyAmount.fromFractionalAmount(this.currency, added.numerator, added.denominator)
  }

  override subtract(other: CurrencyAmount<T>): CurrencyAmount<T> {
    if (!this.currency.equals(other.currency)) throw new Error('CURRENCY')
    const subtracted = super.subtract(other)
    return CurrencyAmount.fromFractionalAmount(this.currency, subtracted.numerator, subtracted.denominator)
  }

  override multiply(other: Fraction | BigintIsh): CurrencyAmount<T> {
    const multiplied = super.multiply(other)
    return CurrencyAmount.fromFractionalAmount(this.currency, multiplied.numerator, multiplied.denominator)
  }

  override divide(other: Fraction | BigintIsh): CurrencyAmount<T> {
    const divided = super.divide(other)
    return CurrencyAmount.fromFractionalAmount(this.currency, divided.numerator, divided.denominator)
  }

  override toSignificant(
    significantDigits: number = 6,
    format?: FormatOptions,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ): string {
    return super.divide(this.decimalScale).toSignificant(significantDigits, format, rounding)
  }

  override toFixed(
    decimalPlaces: number = this.currency.decimals,
    format?: FormatOptions,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ): string {
    if (decimalPlaces > this.currency.decimals) throw new Error('DECIMALS')
    return super.divide(this.decimalScale).toFixed(decimalPlaces, format, rounding)
  }

  toExact(format: FormatOptions = { groupSeparator: '' }): string {
    return applyFormat(
      stripTrailingZeros(
        divToFixed(this.quotient.toString(), this.decimalScale.toString(), this.currency.decimals, Rounding.ROUND_DOWN),
      ),
      format,
    )
  }

  get wrapped(): CurrencyAmount<Token> {
    if (this.currency.isToken) return this as CurrencyAmount<Token>
    return CurrencyAmount.fromFractionalAmount(this.currency.wrapped, this.numerator, this.denominator)
  }
}
