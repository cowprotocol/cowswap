import JSBI from 'jsbi'

import { Fraction } from './fraction'

import { BigintIsh, Rounding } from '../constants'

const ONE_HUNDRED = new Fraction(JSBI.BigInt(100))

export class Percent extends Fraction {
  /**
   * This boolean prevents a fraction from being interpreted as a Percent
   */
  readonly isPercent: true = true

  override add(other: Fraction | BigintIsh): Percent {
    return toPercent(super.add(other))
  }

  override subtract(other: Fraction | BigintIsh): Percent {
    return toPercent(super.subtract(other))
  }

  override multiply(other: Fraction | BigintIsh): Percent {
    return toPercent(super.multiply(other))
  }

  override divide(other: Fraction | BigintIsh): Percent {
    return toPercent(super.divide(other))
  }

  override toSignificant(significantDigits: number = 5, format?: object, rounding?: Rounding): string {
    return super.multiply(ONE_HUNDRED).toSignificant(significantDigits, format, rounding)
  }

  override toFixed(decimalPlaces: number = 2, format?: object, rounding?: Rounding): string {
    return super.multiply(ONE_HUNDRED).toFixed(decimalPlaces, format, rounding)
  }
}

/**
 * Converts a fraction to a percent
 * @param fraction the fraction to convert
 */
function toPercent(fraction: Fraction): Percent {
  return new Percent(fraction.numerator, fraction.denominator)
}
