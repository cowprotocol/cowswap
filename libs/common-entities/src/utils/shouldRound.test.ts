import { shouldRound } from './shouldRound'

import { Rounding } from '../constants'

describe('shouldRound', () => {
  describe('ROUND_UP', () => {
    it('returns true when guard digit > 0 and positive', () => {
      expect(shouldRound(1, false, Rounding.ROUND_UP)).toBe(true)
      expect(shouldRound(9, false, Rounding.ROUND_UP)).toBe(true)
    })

    it('returns false when guard digit is 0', () => {
      expect(shouldRound(0, false, Rounding.ROUND_UP)).toBe(false)
    })

    it('returns false for negative numbers (truncate toward zero)', () => {
      expect(shouldRound(5, true, Rounding.ROUND_UP)).toBe(false)
      expect(shouldRound(9, true, Rounding.ROUND_UP)).toBe(false)
    })
  })

  describe('ROUND_DOWN', () => {
    it('returns false for positive numbers', () => {
      expect(shouldRound(9, false, Rounding.ROUND_DOWN)).toBe(false)
      expect(shouldRound(1, false, Rounding.ROUND_DOWN)).toBe(false)
    })

    it('returns true when guard digit > 0 and negative', () => {
      expect(shouldRound(1, true, Rounding.ROUND_DOWN)).toBe(true)
      expect(shouldRound(9, true, Rounding.ROUND_DOWN)).toBe(true)
    })

    it('returns false when guard digit is 0 and negative', () => {
      expect(shouldRound(0, true, Rounding.ROUND_DOWN)).toBe(false)
    })
  })

  describe('ROUND_HALF_UP', () => {
    it('returns true when guard digit >= 5', () => {
      expect(shouldRound(5, false, Rounding.ROUND_HALF_UP)).toBe(true)
      expect(shouldRound(6, false, Rounding.ROUND_HALF_UP)).toBe(true)
      expect(shouldRound(9, false, Rounding.ROUND_HALF_UP)).toBe(true)
    })

    it('returns false when guard digit < 5', () => {
      expect(shouldRound(4, false, Rounding.ROUND_HALF_UP)).toBe(false)
      expect(shouldRound(0, false, Rounding.ROUND_HALF_UP)).toBe(false)
    })

    it('behaves the same for negative numbers', () => {
      expect(shouldRound(5, true, Rounding.ROUND_HALF_UP)).toBe(true)
      expect(shouldRound(4, true, Rounding.ROUND_HALF_UP)).toBe(false)
    })
  })
})
