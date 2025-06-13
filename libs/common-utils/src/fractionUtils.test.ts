import { Fraction } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import { FractionUtils } from './fractionUtils'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
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

  describe('simplify', () => {
    it('should simplify a small fraction', () => {
      const fraction = FractionUtils.fromNumber(15)
      const simplified = FractionUtils.simplify(fraction)
      expect(JSBI.toNumber(simplified.numerator)).toBe(15)
      expect(JSBI.toNumber(simplified.denominator)).toBe(1)
    })
    it('should simplify a large fraction with zeros', () => {
      const fraction = new Fraction(JSBI.BigInt(3000000), JSBI.BigInt(2000000))
      const simplified = FractionUtils.simplify(fraction)
      expect(JSBI.toNumber(simplified.numerator)).toBe(3)
      expect(JSBI.toNumber(simplified.denominator)).toBe(2)
    })
    it('should not simplify a fraction with large denominator already in the simplest form', () => {
      const fraction = new Fraction(JSBI.BigInt(1), JSBI.BigInt(1000000))
      const simplified = FractionUtils.simplify(fraction)
      expect(JSBI.toNumber(simplified.numerator)).toBe(1)
      expect(JSBI.toNumber(simplified.denominator)).toBe(1000000)
    })
    it('should not simplify a fraction with a large numerator already in the simplest form', () => {
      const fraction = new Fraction(JSBI.BigInt(1000000), JSBI.BigInt(1))
      const simplified = FractionUtils.simplify(fraction)
      expect(JSBI.toNumber(simplified.numerator)).toBe(1000000)
      expect(JSBI.toNumber(simplified.denominator)).toBe(1)
    })
    it('should simplify a fraction with zeros and that can be further simplified', () => {
      const fraction = new Fraction(JSBI.BigInt(3000000), JSBI.BigInt(9000000))
      const simplified = FractionUtils.simplify(fraction)
      expect(JSBI.toNumber(simplified.numerator)).toBe(1)
      expect(JSBI.toNumber(simplified.denominator)).toBe(3)
    })
    it('should avoid division by 0', () => {
      const fraction = new Fraction(JSBI.BigInt(0), JSBI.BigInt(0))
      const simplified = FractionUtils.simplify(fraction)
      expect(JSBI.toNumber(simplified.numerator)).toBe(0)
      expect(JSBI.toNumber(simplified.denominator)).toBe(1)
    })
  })
})
