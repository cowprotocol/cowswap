import { getMinutesToUsMarketChange, isUsMarketOpen } from './usMarketStatus'

const US_HOURS = { title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' }

describe('isUsMarketOpen', () => {
  it.each([
    ['2026-10-01T14:00:00Z', true],
    ['2026-10-01T13:30:00Z', true],
    ['2026-10-01T13:29:59Z', false],
    ['2026-10-01T19:59:00Z', true],
    ['2026-10-01T20:00:00Z', false],
    ['2026-10-03T15:00:00Z', false],
  ])('%s → %s', (now, expected) => {
    expect(isUsMarketOpen(US_HOURS, new Date(now))).toBe(expected)
  })

  it('is closed for an unparsable trading time', () => {
    expect(isUsMarketOpen({ ...US_HOURS, start: '9am' }, new Date('2026-10-01T14:00:00Z'))).toBe(false)
  })
})

describe('getMinutesToUsMarketChange', () => {
  it.each([
    ['until the close while open', '2026-10-01T14:00:00Z', 360],
    ['until the open later the same day', '2026-10-01T12:30:00Z', 60],
    ['until the next day open after the close', '2026-10-01T20:00:00Z', 1050],
    ['over the weekend from a Friday close', '2026-10-02T20:00:00Z', 2 * 1440 + 1050],
    ['over the rest of the weekend on a Sunday', '2026-10-04T13:30:00Z', 1440],
  ])('counts %s', (_case, now, expected) => {
    expect(getMinutesToUsMarketChange(US_HOURS, new Date(now))).toBe(expected)
  })

  it('is null for an unparsable trading time', () => {
    expect(getMinutesToUsMarketChange({ ...US_HOURS, end: '4pm' }, new Date('2026-10-01T14:00:00Z'))).toBeNull()
  })
})
