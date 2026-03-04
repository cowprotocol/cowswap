import { Fraction } from '@cowprotocol/common-entities'

import { FractionUtils } from './fractionUtils'

// TODO: Break down this large function into smaller functions

describe('Fraction utils', () => {
  describe('fromNumber', () => {
    it('should create a fraction from integer', () => {
      const fraction = FractionUtils.fromNumber(1)
      expect(Number(fraction.numerator)).toBe(1)
      expect(Number(fraction.denominator)).toBe(1)
    })

    it('should return a fraction from 0', () => {
      const fraction = FractionUtils.fromNumber(0)
      expect(Number(fraction.numerator)).toBe(0)
      expect(Number(fraction.denominator)).toBe(1)

      expect(fraction.equalTo(0)).toBe(true)
    })

    it('should create a fraction from float', () => {
      const fraction = FractionUtils.fromNumber(1.5)
      expect(Number(fraction.numerator)).toBe(15)
      expect(Number(fraction.denominator)).toBe(10)
    })

    it('should create a fraction from a tiny number', () => {
      const fraction = FractionUtils.fromNumber(0.000000001)
      expect(Number(fraction.numerator)).toBe(1)
      expect(Number(fraction.denominator)).toBe(1000000000)
    })

    it('should create a fraction from negative float', () => {
      const fraction = FractionUtils.fromNumber(-1.5)
      expect(Number(fraction.numerator)).toBe(-15)
      expect(Number(fraction.denominator)).toBe(10)
    })

    it('should create a fraction from scientific notation', () => {
      const fraction = FractionUtils.fromNumber(1e-5)
      expect(Number(fraction.numerator)).toBe(1)
      expect(Number(fraction.denominator)).toBe(100000)
    })
  })

  describe('simplify', () => {
    it('should simplify a small fraction', () => {
      const fraction = FractionUtils.fromNumber(15)
      const simplified = FractionUtils.simplify(fraction)
      expect(Number(simplified.numerator)).toBe(15)
      expect(Number(simplified.denominator)).toBe(1)
    })
    it('should simplify a large fraction with zeros', () => {
      const fraction = new Fraction(3000000n, 2000000n)
      const simplified = FractionUtils.simplify(fraction)
      expect(Number(simplified.numerator)).toBe(3)
      expect(Number(simplified.denominator)).toBe(2)
    })
    it('should not simplify a fraction with large denominator already in the simplest form', () => {
      const fraction = new Fraction(1n, 1000000n)
      const simplified = FractionUtils.simplify(fraction)
      expect(Number(simplified.numerator)).toBe(1)
      expect(Number(simplified.denominator)).toBe(1000000)
    })
    it('should not simplify a fraction with a large numerator already in the simplest form', () => {
      const fraction = new Fraction(1000000n, 1n)
      const simplified = FractionUtils.simplify(fraction)
      expect(Number(simplified.numerator)).toBe(1000000)
      expect(Number(simplified.denominator)).toBe(1)
    })
    it('should simplify a fraction with zeros and that can be further simplified', () => {
      const fraction = new Fraction(3000000n, 9000000n)
      const simplified = FractionUtils.simplify(fraction)
      expect(Number(simplified.numerator)).toBe(1)
      expect(Number(simplified.denominator)).toBe(3)
    })
    it('should avoid division by 0', () => {
      const fraction = new Fraction(0n, 0n)
      const simplified = FractionUtils.simplify(fraction)
      expect(Number(simplified.numerator)).toBe(0)
      expect(Number(simplified.denominator)).toBe(1)
    })
  })
})
