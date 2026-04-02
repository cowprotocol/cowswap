import { formatDateWithTimezone, formatShortDate } from './time'

describe('time', () => {
  describe('formatShortDate', () => {
    it('treats 0 (unix epoch) as a valid timestamp', () => {
      expect(formatShortDate(0)).toEqual(expect.any(String))
    })

    it('returns undefined for nullish values', () => {
      expect(formatShortDate(undefined)).toBeUndefined()
      expect(formatShortDate(null)).toBeUndefined()
    })

    it('returns undefined for invalid dates', () => {
      expect(formatShortDate('')).toBeUndefined()
      expect(formatShortDate('not-a-date')).toBeUndefined()
    })
  })

  describe('formatDateWithTimezone', () => {
    it('treats 0 (unix epoch) as a valid timestamp', () => {
      expect(formatDateWithTimezone(0)).toEqual(expect.any(String))
    })
  })
})
