import { shouldRound } from './shouldRound'

import { Rounding } from '../constants'

describe('shouldRound', () => {
  describe('ROUND_UP (away from zero)', () => {
    it('returns true when guard digit > 0, regardless of sign', () => {
      expect(shouldRound(1, false, Rounding.ROUND_UP)).toBe(true)
      expect(shouldRound(9, false, Rounding.ROUND_UP)).toBe(true)
      expect(shouldRound(5, true, Rounding.ROUND_UP)).toBe(true)
      expect(shouldRound(9, true, Rounding.ROUND_UP)).toBe(true)
    })

    it('returns false when guard digit is 0', () => {
      expect(shouldRound(0, false, Rounding.ROUND_UP)).toBe(false)
      expect(shouldRound(0, true, Rounding.ROUND_UP)).toBe(false)
    })
  })

  describe('ROUND_DOWN (toward zero - always truncate)', () => {
    it('always returns false regardless of digit or sign', () => {
      expect(shouldRound(9, false, Rounding.ROUND_DOWN)).toBe(false)
      expect(shouldRound(1, false, Rounding.ROUND_DOWN)).toBe(false)
      expect(shouldRound(9, true, Rounding.ROUND_DOWN)).toBe(false)
      expect(shouldRound(1, true, Rounding.ROUND_DOWN)).toBe(false)
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
