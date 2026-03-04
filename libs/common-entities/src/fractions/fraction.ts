import { BigintIsh, Rounding } from '../constants'
import { applyFormat } from '../utils/applyFormat'
import { divideToDecimalString } from '../utils/divideToDecimalString'
import { roundToFixed } from '../utils/roundToFixed'
import { roundToSignificant } from '../utils/roundToSignificant'

export class Fraction {
  public readonly numerator: bigint
  public readonly denominator: bigint

  public constructor(numerator: BigintIsh, denominator: BigintIsh = 1n) {
    this.numerator = BigInt(numerator)
    this.denominator = BigInt(denominator)
  }

  private static tryParseFraction(fractionish: BigintIsh | Fraction): Fraction {
    if (typeof fractionish === 'bigint' || typeof fractionish === 'number' || typeof fractionish === 'string') {
      return new Fraction(fractionish)
    }

    if ('numerator' in fractionish && 'denominator' in fractionish) return fractionish
    throw new Error('Could not parse fraction')
  }

  // performs floor division
  public get quotient(): bigint {
    return this.numerator / this.denominator
  }

  public get remainder(): Fraction {
    return new Fraction(this.numerator % this.denominator, this.denominator)
  }

  public invert(): Fraction {
    return new Fraction(this.denominator, this.numerator)
  }

  public add(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    if (this.denominator === otherParsed.denominator) {
      return new Fraction(this.numerator + otherParsed.numerator, this.denominator)
    }
    return new Fraction(
      this.numerator * otherParsed.denominator + otherParsed.numerator * this.denominator,
      this.denominator * otherParsed.denominator,
    )
  }

  public subtract(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    if (this.denominator === otherParsed.denominator) {
      return new Fraction(this.numerator - otherParsed.numerator, this.denominator)
    }
    return new Fraction(
      this.numerator * otherParsed.denominator - otherParsed.numerator * this.denominator,
      this.denominator * otherParsed.denominator,
    )
  }

  public lessThan(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other)
    return this.numerator * otherParsed.denominator < otherParsed.numerator * this.denominator
  }

  public equalTo(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other)
    return this.numerator * otherParsed.denominator === otherParsed.numerator * this.denominator
  }

  public greaterThan(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other)
    return this.numerator * otherParsed.denominator > otherParsed.numerator * this.denominator
  }

  public multiply(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    return new Fraction(this.numerator * otherParsed.numerator, this.denominator * otherParsed.denominator)
  }

  public divide(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    return new Fraction(this.numerator * otherParsed.denominator, this.denominator * otherParsed.numerator)
  }

  public toSignificant(
    significantDigits: number,
    format: object = { groupSeparator: '' },
    rounding: Rounding = Rounding.ROUND_HALF_UP,
  ): string {
    if (!Number.isInteger(significantDigits)) throw new Error(`${significantDigits} is not an integer.`)
    if (significantDigits <= 0) throw new Error(`${significantDigits} is not positive.`)

    const raw = divideToDecimalString(this.numerator, this.denominator, significantDigits + 1)
    const rounded = roundToSignificant(raw, significantDigits, rounding)
    return applyFormat(rounded, format)
  }

  public toFixed(
    decimalPlaces: number,
    format: object = { groupSeparator: '' },
    rounding: Rounding = Rounding.ROUND_HALF_UP,
  ): string {
    if (!Number.isInteger(decimalPlaces)) throw new Error(`${decimalPlaces} is not an integer.`)
    if (decimalPlaces < 0) throw new Error(`${decimalPlaces} is negative.`)

    const raw = divideToDecimalString(this.numerator, this.denominator, decimalPlaces + 1)
    const rounded = roundToFixed(raw, decimalPlaces, rounding)
    return applyFormat(rounded, format)
  }

  /**
   * Helper method for converting any super class back to a fraction
   */
  public get asFraction(): Fraction {
    return new Fraction(this.numerator, this.denominator)
  }
}
