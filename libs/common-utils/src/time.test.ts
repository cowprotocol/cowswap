import { formatDateTime, formatDateWithTimezone, formatShortDate } from './time'

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

describe('formatDateTime', () => {
  it.each([
    ['en-US', 'Oct 7, 2026, 1:05 PM'],
    ['de-DE', '07.10.2026, 13:05'],
  ])('formats Date and millisecond inputs using %s', (locale, expected) => {
    const date = new Date(2026, 9, 7, 13, 5)

    expect(formatDateTime(date, locale)).toBe(expected)
    expect(formatDateTime(date.getTime(), locale)).toBe(expected)
  })
})
