import { formatRefTime } from './formatRefTime'

describe('formatRefTime', () => {
  it.each([
    ['Europe/Lisbon', '15:00 Lisbon'],
    ['America/New_York', '10:00 New York'],
    ['UTC', '14:00 UTC'],
  ])('formats in %s', (timeZone, expected) => {
    expect(formatRefTime('2026-10-01T14:00:00.000Z', timeZone)).toBe(expected)
  })

  it('returns null for an invalid date', () => {
    expect(formatRefTime('not a date', 'UTC')).toBeNull()
  })
})
