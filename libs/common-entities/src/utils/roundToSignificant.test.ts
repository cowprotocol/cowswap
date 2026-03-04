import { roundToSignificant } from './roundToSignificant'

import { Rounding } from '../constants'

describe('roundToSignificant', () => {
  describe('basic rounding', () => {
    it('rounds integer values to sig figs', () => {
      expect(roundToSignificant('12345.678', 3, Rounding.ROUND_HALF_UP)).toBe('12300')
    })

    it('rounds decimal values to sig figs', () => {
      expect(roundToSignificant('123.456', 5, Rounding.ROUND_HALF_UP)).toBe('123.46')
    })

    it('rounds up when guard digit >= 5', () => {
      expect(roundToSignificant('1.2350', 3, Rounding.ROUND_HALF_UP)).toBe('1.24')
    })

    it('does not round up when guard digit < 5', () => {
      expect(roundToSignificant('1.2344', 4, Rounding.ROUND_HALF_UP)).toBe('1.234')
    })
  })

  describe('values < 1 with leading zeros', () => {
    it('preserves leading zeros', () => {
      expect(roundToSignificant('0.00123456', 3, Rounding.ROUND_HALF_UP)).toBe('0.00123')
    })

    it('handles single leading zero', () => {
      expect(roundToSignificant('0.0567', 2, Rounding.ROUND_HALF_UP)).toBe('0.057')
    })

    it('handles value without leading zeros', () => {
      expect(roundToSignificant('0.5678', 2, Rounding.ROUND_HALF_UP)).toBe('0.57')
    })
  })

  describe('ROUND_DOWN', () => {
    it('truncates positive', () => {
      expect(roundToSignificant('1.999', 3, Rounding.ROUND_DOWN)).toBe('1.99')
    })

    it('truncates small decimals', () => {
      expect(roundToSignificant('0.009999', 2, Rounding.ROUND_DOWN)).toBe('0.0099')
    })
  })

  describe('ROUND_UP', () => {
    it('rounds up when guard digit > 0', () => {
      expect(roundToSignificant('1.051', 2, Rounding.ROUND_UP)).toBe('1.1')
    })

    it('does not round up when guard digit is 0', () => {
      // 1.001 to 2 sig figs: guard digit is 0 → no rounding
      expect(roundToSignificant('1.001', 2, Rounding.ROUND_UP)).toBe('1.0')
      expect(roundToSignificant('1.500', 2, Rounding.ROUND_UP)).toBe('1.5')
    })
  })

  describe('negative values', () => {
    it('handles negative with leading zeros', () => {
      expect(roundToSignificant('-0.004567', 2, Rounding.ROUND_HALF_UP)).toBe('-0.0046')
    })

    it('handles negative integer', () => {
      expect(roundToSignificant('-12345.6', 3, Rounding.ROUND_HALF_UP)).toBe('-12300')
    })
  })

  describe('edge cases', () => {
    it('handles exactly 1 sig digit', () => {
      expect(roundToSignificant('1234.5', 1, Rounding.ROUND_DOWN)).toBe('1000')
    })

    it('handles value that is a power of 10', () => {
      expect(roundToSignificant('1000.0', 1, Rounding.ROUND_DOWN)).toBe('1000')
    })
  })
})
