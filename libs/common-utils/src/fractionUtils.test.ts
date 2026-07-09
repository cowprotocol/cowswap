import { Fraction } from '@cowprotocol/currency'

import { FractionUtils } from './fractionUtils'

// TODO: Break down this large function into smaller functions

describe('Fraction utils', () => {
  describe('fromNumber', () => {
    it('should create a fraction from integer', () => {
      const fraction = FractionUtils.fromNumber(1)
      expect(fraction.numerator).toBe(1n)
      expect(fraction.denominator).toBe(1n)
    })

    it('should return a fraction from 0', () => {
      const fraction = FractionUtils.fromNumber(0)
      expect(fraction.numerator).toBe(0n)
      expect(fraction.denominator).toBe(1n)

      expect(fraction.equalTo(0)).toBe(true)
    })

    it('should create a fraction from float', () => {
      const fraction = FractionUtils.fromNumber(1.5)
      expect(fraction.numerator).toBe(15n)
      expect(fraction.denominator).toBe(10n)
    })

    it('should create a fraction from a tiny number', () => {
      const fraction = FractionUtils.fromNumber(0.000000001)
      expect(fraction.numerator).toBe(1n)
      expect(fraction.denominator).toBe(1000000000n)
    })

    it('should create a fraction from negative float', () => {
      const fraction = FractionUtils.fromNumber(-1.5)
      expect(fraction.numerator).toBe(-15n)
      expect(fraction.denominator).toBe(10n)
    })

    it('should create a fraction from scientific notation', () => {
      const fraction = FractionUtils.fromNumber(1e-5)
      expect(fraction.numerator).toBe(1n)
      expect(fraction.denominator).toBe(100000n)
    })
  })

  describe('simplify', () => {
    it('should simplify a small fraction', () => {
      const fraction = FractionUtils.fromNumber(15)
      const simplified = FractionUtils.simplify(fraction)
      expect(simplified.numerator).toBe(15n)
      expect(simplified.denominator).toBe(1n)
    })
    it('should simplify a large fraction with zeros', () => {
      const fraction = new Fraction(3000000n, 2000000n)
      const simplified = FractionUtils.simplify(fraction)
      expect(simplified.numerator).toBe(3n)
      expect(simplified.denominator).toBe(2n)
    })
    it('should not simplify a fraction with large denominator already in the simplest form', () => {
      const fraction = new Fraction(1n, 1000000n)
      const simplified = FractionUtils.simplify(fraction)
      expect(simplified.numerator).toBe(1n)
      expect(simplified.denominator).toBe(1000000n)
    })
    it('should not simplify a fraction with a large numerator already in the simplest form', () => {
      const fraction = new Fraction(1000000n, 1n)
      const simplified = FractionUtils.simplify(fraction)
      expect(simplified.numerator).toBe(1000000n)
      expect(simplified.denominator).toBe(1n)
    })
    it('should simplify a fraction with zeros and that can be further simplified', () => {
      const fraction = new Fraction(3000000n, 9000000n)
      const simplified = FractionUtils.simplify(fraction)
      expect(simplified.numerator).toBe(1n)
      expect(simplified.denominator).toBe(3n)
    })
    it('should avoid division by 0', () => {
      const fraction = new Fraction(0n, 0n)
      const simplified = FractionUtils.simplify(fraction)
      expect(simplified.numerator).toBe(0n)
      expect(simplified.denominator).toBe(1n)
    })
  })
})
