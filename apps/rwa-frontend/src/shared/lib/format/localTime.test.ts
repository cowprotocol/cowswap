import { formatLocalTime } from './localTime'

describe('formatLocalTime', () => {
  it.each([
    ['UTC', '14:00 UTC'],
    ['Asia/Tokyo', '23:00 GMT+9'],
    ['America/Los_Angeles', '07:00 PDT'],
    ['Europe/Lisbon', '15:00 GMT+1'],
  ])('formats in %s', (timeZone, expected) => {
    expect(formatLocalTime(Date.parse('2026-10-01T14:00:00Z'), timeZone)).toBe(expected)
  })

  it('writes midnight as 00', () => {
    expect(formatLocalTime(Date.parse('2026-10-01T00:00:00Z'), 'UTC')).toBe('00:00 UTC')
  })
})
