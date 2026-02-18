import { formatQuoteIdReference, getQuoteExpiresInLabel, getQuoteIdString } from './quoteId'

describe('RowQuoteId', () => {
  describe('formatQuoteIdReference()', () => {
    it('formats UUID-like ids into support-friendly references', () => {
      expect(formatQuoteIdReference('a3f2b91e-4d7c-8f21-b0c1-5f31e29b1111')).toBe('Q-A3F2B91E')
    })

    it('works with short ids', () => {
      expect(formatQuoteIdReference('abc')).toBe('Q-ABC')
    })
  })

  describe('getQuoteIdString()', () => {
    it('returns null for nullish or empty values', () => {
      expect(getQuoteIdString(undefined)).toBeNull()
      expect(getQuoteIdString(null)).toBeNull()
      expect(getQuoteIdString('')).toBeNull()
      expect(getQuoteIdString('  ')).toBeNull()
    })

    it('normalizes ids into a string', () => {
      expect(getQuoteIdString(12345678)).toBe('12345678')
      expect(getQuoteIdString(' a3f2b91e ')).toBe('a3f2b91e')
    })
  })

  describe('getQuoteExpiresInLabel()', () => {
    it('returns null for invalid inputs', () => {
      expect(getQuoteExpiresInLabel(undefined)).toBeNull()
      expect(getQuoteExpiresInLabel(null)).toBeNull()
      expect(getQuoteExpiresInLabel('not-a-date')).toBeNull()
    })

    it('formats remaining seconds and minutes', () => {
      const now = Date.parse('2026-02-18T12:00:00.000Z')
      expect(getQuoteExpiresInLabel('2026-02-18T12:00:30.000Z', now)).toBe('30s')
      expect(getQuoteExpiresInLabel('2026-02-18T12:02:10.000Z', now)).toBe('2m 10s')
    })
  })
})
