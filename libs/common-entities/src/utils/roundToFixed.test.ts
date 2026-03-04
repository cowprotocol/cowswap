import { roundToFixed } from './roundToFixed'

import { Rounding } from '../constants'

describe('roundToFixed', () => {
  describe('ROUND_HALF_UP', () => {
    it('does not round up when guard digit < 5', () => {
      expect(roundToFixed('1.234', 2, Rounding.ROUND_HALF_UP)).toBe('1.23')
    })

    it('rounds up when guard digit >= 5', () => {
      expect(roundToFixed('1.235', 2, Rounding.ROUND_HALF_UP)).toBe('1.24')
      expect(roundToFixed('1.239', 2, Rounding.ROUND_HALF_UP)).toBe('1.24')
    })

    it('handles 0 decimal places', () => {
      expect(roundToFixed('3.7', 0, Rounding.ROUND_HALF_UP)).toBe('4')
      expect(roundToFixed('3.4', 0, Rounding.ROUND_HALF_UP)).toBe('3')
    })

    it('carries over when rounding causes digit overflow', () => {
      expect(roundToFixed('9.99', 1, Rounding.ROUND_HALF_UP)).toBe('10.0')
      expect(roundToFixed('9.95', 1, Rounding.ROUND_HALF_UP)).toBe('10.0')
    })

    it('pads trailing zeros to exact decimal places', () => {
      expect(roundToFixed('1.5', 4, Rounding.ROUND_HALF_UP)).toBe('1.5000')
    })
  })

  describe('ROUND_DOWN', () => {
    it('always truncates (positive)', () => {
      expect(roundToFixed('1.999', 2, Rounding.ROUND_DOWN)).toBe('1.99')
      expect(roundToFixed('1.001', 2, Rounding.ROUND_DOWN)).toBe('1.00')
    })

    it('truncates negative numbers toward zero (not away)', () => {
      expect(roundToFixed('-1.999', 2, Rounding.ROUND_DOWN)).toBe('-1.99')
      expect(roundToFixed('-1.001', 2, Rounding.ROUND_DOWN)).toBe('-1.00')
    })
  })

  describe('ROUND_UP', () => {
    it('always rounds up (positive)', () => {
      expect(roundToFixed('1.001', 2, Rounding.ROUND_UP)).toBe('1.01')
      expect(roundToFixed('1.000', 2, Rounding.ROUND_UP)).toBe('1.00')
    })

    it('rounds away from zero for negative numbers', () => {
      expect(roundToFixed('-1.999', 2, Rounding.ROUND_UP)).toBe('-2.00')
      expect(roundToFixed('-1.001', 2, Rounding.ROUND_UP)).toBe('-1.01')
    })
  })

  describe('negative numbers', () => {
    it('handles negative with ROUND_HALF_UP', () => {
      expect(roundToFixed('-1.235', 2, Rounding.ROUND_HALF_UP)).toBe('-1.24')
    })

    it('truncates -0.001 toward zero', () => {
      expect(roundToFixed('-0.001', 2, Rounding.ROUND_DOWN)).toBe('-0.00')
    })
  })
})
