import Big, { RoundingMode } from 'big.js'
import JSBI from 'jsbi'

import { applyFormat, FormatOptions } from '../../utils/applyFormat'
import { toSignificant } from '../../utils/toSignificant'
import { BigintIsh, Rounding } from '../constants'

// big.js rounding modes: 0 = round down, 1 = round half up, 3 = round up
const toFixedRounding: Record<Rounding, RoundingMode> = {
  [Rounding.ROUND_DOWN]: 0,
  [Rounding.ROUND_HALF_UP]: 1,
  [Rounding.ROUND_UP]: 3,
}

export class Fraction {
  readonly numerator: JSBI
  readonly denominator: JSBI

  constructor(numerator: BigintIsh, denominator: BigintIsh = JSBI.BigInt(1)) {
    this.numerator = JSBI.BigInt(numerator)
    this.denominator = JSBI.BigInt(denominator)
  }

  private static tryParseFraction(fractionish: BigintIsh | Fraction): Fraction {
    if (fractionish instanceof JSBI || typeof fractionish === 'number' || typeof fractionish === 'string')
      return new Fraction(fractionish)

    if ('numerator' in fractionish && 'denominator' in fractionish) return fractionish
    throw new Error('Could not parse fraction')
  }

  // performs floor division
  get quotient(): JSBI {
    return JSBI.divide(this.numerator, this.denominator)
  }

  // remainder after floor division
  get remainder(): Fraction {
    return new Fraction(JSBI.remainder(this.numerator, this.denominator), this.denominator)
  }

  invert(): Fraction {
    return new Fraction(this.denominator, this.numerator)
  }

  add(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.add(this.numerator, otherParsed.numerator), this.denominator)
    }
    return new Fraction(
      JSBI.add(
        JSBI.multiply(this.numerator, otherParsed.denominator),
        JSBI.multiply(otherParsed.numerator, this.denominator),
      ),
      JSBI.multiply(this.denominator, otherParsed.denominator),
    )
  }

  subtract(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.subtract(this.numerator, otherParsed.numerator), this.denominator)
    }
    return new Fraction(
      JSBI.subtract(
        JSBI.multiply(this.numerator, otherParsed.denominator),
        JSBI.multiply(otherParsed.numerator, this.denominator),
      ),
      JSBI.multiply(this.denominator, otherParsed.denominator),
    )
  }

  lessThan(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other)
    return JSBI.lessThan(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(otherParsed.numerator, this.denominator),
    )
  }

  equalTo(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other)
    return JSBI.equal(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(otherParsed.numerator, this.denominator),
    )
  }

  greaterThan(other: Fraction | BigintIsh): boolean {
    const otherParsed = Fraction.tryParseFraction(other)
    return JSBI.greaterThan(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(otherParsed.numerator, this.denominator),
    )
  }

  multiply(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    return new Fraction(
      JSBI.multiply(this.numerator, otherParsed.numerator),
      JSBI.multiply(this.denominator, otherParsed.denominator),
    )
  }

  divide(other: Fraction | BigintIsh): Fraction {
    const otherParsed = Fraction.tryParseFraction(other)
    return new Fraction(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(this.denominator, otherParsed.numerator),
    )
  }

  toSignificant(
    significantDigits: number,
    format: FormatOptions = { groupSeparator: '' },
    rounding: Rounding = Rounding.ROUND_HALF_UP,
  ): string {
    if (!Number.isInteger(significantDigits)) throw new Error(`${significantDigits} is not an integer.`)
    if (!(significantDigits > 0)) throw new Error(`${significantDigits} is not positive.`)

    return applyFormat(
      toSignificant(
        this.numerator.toString(),
        this.denominator.toString(),
        significantDigits,
        toFixedRounding[rounding],
      ),
      format,
    )
  }

  toFixed(
    decimalPlaces: number,
    format: FormatOptions = { groupSeparator: '' },
    rounding: Rounding = Rounding.ROUND_HALF_UP,
  ): string {
    if (!Number.isInteger(decimalPlaces)) throw new Error(`${decimalPlaces} is not an integer.`)
    if (!(decimalPlaces >= 0)) throw new Error(`${decimalPlaces} is negative.`)

    Big.DP = decimalPlaces
    Big.RM = toFixedRounding[rounding]
    return applyFormat(
      new Big(this.numerator.toString()).div(this.denominator.toString()).toFixed(decimalPlaces),
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
