import { findExponent } from './toSignificant'

describe('findExponent', () => {
  describe('num >= den (e >= 0)', () => {
    it('returns 0 for num === den', () => {
      expect(findExponent(1n, 1n)).toBe(0)
      expect(findExponent(5n, 5n)).toBe(0)
      expect(findExponent(100n, 100n)).toBe(0)
    })

    it('returns 0 for values in [1, 10)', () => {
      expect(findExponent(1n, 1n)).toBe(0)
      expect(findExponent(9n, 1n)).toBe(0)
      expect(findExponent(3n, 2n)).toBe(0) // 1.5
    })

    it('returns 1 for values in [10, 100)', () => {
      expect(findExponent(10n, 1n)).toBe(1)
      expect(findExponent(99n, 1n)).toBe(1)
    })

    it('returns correct exponent for large integers', () => {
      expect(findExponent(1234n, 1n)).toBe(3)
      expect(findExponent(10n ** 18n, 1n)).toBe(18)
    })
  })

  describe('num < den (e < 0)', () => {
    it('returns -1 for values in [0.1, 1)', () => {
      expect(findExponent(1n, 10n)).toBe(-1) // 0.1
      expect(findExponent(9n, 10n)).toBe(-1) // 0.9
      expect(findExponent(1n, 9n)).toBe(-1) // ~0.111
      expect(findExponent(1n, 2n)).toBe(-1) // 0.5
    })

    it('returns -2 for values in [0.01, 0.1)', () => {
      expect(findExponent(1n, 100n)).toBe(-2) // 0.01
      expect(findExponent(9n, 100n)).toBe(-2) // 0.09
      expect(findExponent(1n, 11n)).toBe(-2) // ~0.0909
    })

    it('returns correct exponent for very small values', () => {
      expect(findExponent(1n, 10n ** 17n)).toBe(-17)
      expect(findExponent(1n, 10n ** 18n)).toBe(-18)
      expect(findExponent(25000n, 10n ** 18n)).toBe(-14) // 2.5e-14
    })

    it('handles boundary values correctly', () => {
      expect(findExponent(999n, 1000n)).toBe(-1) // 0.999 → floor(log10) = -1
      expect(findExponent(1n, 1000n)).toBe(-3) // 0.001
    })
  })
})
