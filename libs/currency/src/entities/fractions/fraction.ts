import JSBI from 'jsbi'

import { applyFormat, FormatOptions } from '../../utils/applyFormat'
import { toFixed as divToFixed } from '../../utils/toFixed'
import { toSignificant } from '../../utils/toSignificant'
import { BigintIsh, Rounding } from '../constants'

function toBigInt(value: BigintIsh): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(value)
  if (typeof value === 'string') return BigInt(value)
  // JSBI instance
  return BigInt(value.toString())
}

export class Fraction {
  readonly numerator: bigint
  readonly denominator: bigint

  constructor(numerator: BigintIsh, denominator: BigintIsh = 1) {
    this.numerator = toBigInt(numerator)
    this.denominator = toBigInt(denominator)
  }

  private static tryParseFraction(fractionish: BigintIsh | Fraction): Fraction {
    if (
      fractionish instanceof JSBI ||
      typeof fractionish === 'bigint' ||
      typeof fractionish === 'number' ||
      typeof fractionish === 'string'
    )
      return new Fraction(fractionish)

    if ('numerator' in fractionish && 'denominator' in fractionish) return fractionish
    throw new Error('Could not parse fraction')
  }

  // performs floor division
  get quotient(): bigint {
    return this.numerator / this.denominator
  }

  // remainder after floor division
  get remainder(): Fraction {
    return new Fraction(this.numerator % this.denominator, this.denominator)
  }

  invert(): Fraction {
    return new Fraction(this.denominator, this.numerator)
  }

  add(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    if (this.denominator === otherParsed.denominator) {
      return new Fraction(this.numerator + otherParsed.numerator, this.denominator)
    }
    return new Fraction(
      this.numerator * otherParsed.denominator + otherParsed.numerator * this.denominator,
      this.denominator * otherParsed.denominator,
    )
  }

  subtract(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    if (this.denominator === otherParsed.denominator) {
      return new Fraction(this.numerator - otherParsed.numerator, this.denominator)
    }
    return new Fraction(
      this.numerator * otherParsed.denominator - otherParsed.numerator * this.denominator,
      this.denominator * otherParsed.denominator,
    )
  }

  lessThan(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other)
    return this.numerator * otherParsed.denominator < otherParsed.numerator * this.denominator
  }

  equalTo(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other)
    return this.numerator * otherParsed.denominator === otherParsed.numerator * this.denominator
  }

  greaterThan(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other)
    return this.numerator * otherParsed.denominator > otherParsed.numerator * this.denominator
  }

  multiply(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    return new Fraction(this.numerator * otherParsed.numerator, this.denominator * otherParsed.denominator)
  }

  divide(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    return new Fraction(this.numerator * otherParsed.denominator, this.denominator * otherParsed.numerator)
  }

  toSignificant(
    significantDigits: number,
    format: FormatOptions = { groupSeparator: '' },
    rounding: Rounding = Rounding.ROUND_HALF_UP,
  ): string {
    if (!Number.isInteger(significantDigits)) throw new Error(`${significantDigits} is not an integer.`)
    if (!(significantDigits > 0)) throw new Error(`${significantDigits} is not positive.`)

    const significant = toSignificant(
      this.numerator.toString(),
      this.denominator.toString(),
      significantDigits,
      rounding,
    )
    return applyFormat(significant, format)
  }

  toFixed(
    decimalPlaces: number,
    format: FormatOptions = { groupSeparator: '' },
    rounding: Rounding = Rounding.ROUND_HALF_UP,
  ): string {
    if (!Number.isInteger(decimalPlaces)) throw new Error(`${decimalPlaces} is not an integer.`)
    if (!(decimalPlaces >= 0)) throw new Error(`${decimalPlaces} is negative.`)

    return applyFormat(
      divToFixed(this.numerator.toString(), this.denominator.toString(), decimalPlaces, rounding),
      format,
    )
  }

  /**
   * Helper method for converting any super class back to a fraction
   */
  get asFraction(): Fraction {
    return new Fraction(this.numerator, this.denominator)
  }
}
