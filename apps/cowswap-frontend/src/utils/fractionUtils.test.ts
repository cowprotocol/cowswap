import JSBI from 'jsbi'

import { FractionUtils } from './fractionUtils'

describe('Fraction utils', () => {
  describe('fromNumber', () => {
    it('should create a fraction from integer', () => {
      const fraction = FractionUtils.fromNumber(1)
      expect(JSBI.toNumber(fraction.numerator)).toBe(1)
      expect(JSBI.toNumber(fraction.denominator)).toBe(1)
    })

    it('should return a fraction from 0', () => {
      const fraction = FractionUtils.fromNumber(0)
      expect(JSBI.toNumber(fraction.numerator)).toBe(0)
      expect(JSBI.toNumber(fraction.denominator)).toBe(1)

      expect(fraction.equalTo(0)).toBe(true)
    })

    it('should create a fraction from float', () => {
      const fraction = FractionUtils.fromNumber(1.5)
      expect(JSBI.toNumber(fraction.numerator)).toBe(15)
      expect(JSBI.toNumber(fraction.denominator)).toBe(10)
    })

    it('should create a fraction from a tiny number', () => {
      const fraction = FractionUtils.fromNumber(0.000000001)
      expect(JSBI.toNumber(fraction.numerator)).toBe(1)
      expect(JSBI.toNumber(fraction.denominator)).toBe(1000000000)
    })

    it('should create a fraction from negative float', () => {
      const fraction = FractionUtils.fromNumber(-1.5)
      expect(JSBI.toNumber(fraction.numerator)).toBe(-15)
      expect(JSBI.toNumber(fraction.denominator)).toBe(10)
    })

    it('should create a fraction from scientific notation', () => {
      const fraction = FractionUtils.fromNumber(1e-5)
      expect(JSBI.toNumber(fraction.numerator)).toBe(1)
      expect(JSBI.toNumber(fraction.denominator)).toBe(100000)
    })
  })
})
