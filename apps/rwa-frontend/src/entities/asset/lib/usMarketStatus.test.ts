import { getMinutesToUsMarketChange, isUsMarketOpen } from './usMarketStatus'

const US_HOURS = { title: 'US market open', start: '09:30', end: '16:00', timeZone: 'America/New_York' }

describe('isUsMarketOpen', () => {
  it.each([
    ['2026-10-01T14:00:00Z', true],
    ['2026-10-01T13:30:00Z', true],
    ['2026-10-01T13:29:59Z', false],
    ['2026-10-01T19:59:00Z', true],
    ['2026-10-01T20:00:00Z', false],
    ['2026-10-03T15:00:00Z', false],
    ['2026-11-03T13:30:00Z', false],
    ['2026-11-03T14:29:00Z', false],
    ['2026-11-03T14:30:00Z', true],
    ['2026-11-03T20:30:00Z', true],
    ['2026-11-03T21:00:00Z', false],
    ['2026-11-26T15:00:00Z', false],
    ['2026-11-27T17:59:00Z', true],
    ['2026-11-27T18:00:00Z', false],
  ])('%s → %s', (now, expected) => {
    expect(isUsMarketOpen(US_HOURS, new Date(now))).toBe(expected)
  })

  it('is closed for an unparsable trading time', () => {
    expect(isUsMarketOpen({ ...US_HOURS, start: '9am' }, new Date('2026-10-01T14:00:00Z'))).toBe(false)
  })

  it('is closed for an unknown time zone', () => {
    expect(isUsMarketOpen({ ...US_HOURS, timeZone: 'Mars/Olympus' }, new Date('2026-10-01T14:00:00Z'))).toBe(false)
  })
})

describe('getMinutesToUsMarketChange', () => {
  it.each([
    ['until the close while open', '2026-10-01T14:00:00Z', 360],
    ['until the open later the same day', '2026-10-01T12:30:00Z', 60],
    ['until the next day open after the close', '2026-10-01T20:00:00Z', 1050],
    ['over the weekend from a Friday close', '2026-10-02T20:00:00Z', 2 * 1440 + 1050],
    ['over the rest of the weekend on a Sunday', '2026-10-04T13:30:00Z', 1440],
    ['until the close in standard time', '2026-11-03T15:00:00Z', 360],
    ['until the open in standard time', '2026-11-03T13:40:00Z', 50],
    ['over a weekend when daylight saving time ends', '2026-10-30T20:00:00Z', 2 * 1440 + 1050 + 60],
    ['over a weekend when daylight saving time starts', '2026-03-06T21:00:00Z', 2 * 1440 + 1050 - 60],
    ['over Thanksgiving', '2026-11-25T21:00:00Z', 1440 + 1050],
    ['until an early close', '2026-11-27T15:00:00Z', 180],
    ['over a Good Friday weekend', '2026-04-02T20:00:00Z', 3 * 1440 + 1050],
  ])('counts %s', (_case, now, expected) => {
    expect(getMinutesToUsMarketChange(US_HOURS, new Date(now))).toBe(expected)
  })

  it('skips an early-close day that closes before the session starts', () => {
    const afternoonHours = { ...US_HOURS, start: '14:00' }
    const earlyCloseNoon = new Date('2026-11-27T17:00:00Z')

    expect(isUsMarketOpen(afternoonHours, earlyCloseNoon)).toBe(false)
    expect(getMinutesToUsMarketChange(afternoonHours, earlyCloseNoon)).toBe(3 * 1440 + 120)
  })

  it('is null for an unparsable trading time', () => {
    expect(getMinutesToUsMarketChange({ ...US_HOURS, end: '4pm' }, new Date('2026-10-01T14:00:00Z'))).toBeNull()
  })
})
