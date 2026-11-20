import { formatLocalTime, getLocalTimeParts } from './localTime'

describe('formatLocalTime', () => {
  it.each([
    ['UTC', '14:00'],
    ['Asia/Tokyo', '23:00'],
    ['America/Los_Angeles', '07:00'],
    ['Europe/Lisbon', '15:00'],
  ])('formats in %s', (timeZone, expected) => {
    expect(formatLocalTime(Date.parse('2026-10-01T14:00:00Z'), timeZone)).toBe(expected)
  })

  it('writes midnight as 00', () => {
    expect(formatLocalTime(Date.parse('2026-10-01T00:00:00Z'), 'UTC')).toBe('00:00')
  })
})

describe('getLocalTimeParts', () => {
  it('takes the date of the time zone', () => {
    expect(getLocalTimeParts(Date.parse('2025-12-31T23:30:00Z'), 'Asia/Tokyo')).toEqual({
      day: '1',
      month: 'Jan',
      year: '2026',
      time: '08:30',
    })
  })
})
