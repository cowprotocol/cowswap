import { formatRwaWeekendEnd } from './formatRwaWeekendEnd.utils'

describe('formatRwaWeekendEnd', () => {
  it.each([
    ['on Saturday in UTC', '2026-11-21T10:00:00Z', 'UTC', 'Sunday 23:59 UTC'],
    ['on Sunday in UTC', '2026-11-22T23:00:00Z', 'UTC', 'Sunday 23:59 UTC'],
    ['ahead of UTC', '2026-11-21T10:00:00Z', 'Asia/Tokyo', 'Monday 08:59 GMT+9'],
    ['behind UTC', '2026-11-21T10:00:00Z', 'America/Los_Angeles', 'Sunday 15:59 PST'],
    ['in summer time', '2026-06-20T10:00:00Z', 'Europe/Berlin', 'Monday 01:59 GMT+2'],
    ['when the local day is still Friday', '2026-11-21T02:00:00Z', 'America/Los_Angeles', 'Sunday 15:59 PST'],
  ])('formats the weekend end %s', (_case, now, timeZone, expected) => {
    expect(formatRwaWeekendEnd(new Date(now), timeZone)).toBe(expected)
  })
})
