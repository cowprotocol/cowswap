import { formatUsMarketSession } from './formatUsMarketSession'

const US_HOURS = { title: 'US market open', start: '09:30', end: '16:00', timeZone: 'America/New_York' }

describe('formatUsMarketSession', () => {
  it.each([
    ['Lisbon in summer time', '2026-10-01T12:00:00Z', 'Europe/Lisbon', '14:30 – 21:00', '14:30 – 18:00', 'Lisbon'],
    [
      'Lisbon in the week only New York is in summer time',
      '2026-10-27T12:00:00Z',
      'Europe/Lisbon',
      '13:30 – 20:00',
      '13:30 – 17:00',
      'Lisbon',
    ],
    [
      'Lisbon on the weekend before New York starts summer time',
      '2026-03-07T12:00:00Z',
      'Europe/Lisbon',
      '13:30 – 20:00',
      '13:30 – 17:00',
      'Lisbon',
    ],
    [
      'Lisbon on the weekend before New York ends summer time',
      '2026-10-31T12:00:00Z',
      'Europe/Lisbon',
      '14:30 – 21:00',
      '14:30 – 18:00',
      'Lisbon',
    ],
    ['Lisbon in standard time', '2026-11-19T12:00:00Z', 'Europe/Lisbon', '14:30 – 21:00', '14:30 – 18:00', 'Lisbon'],
    ['New York', '2026-11-19T12:00:00Z', 'America/New_York', '09:30 – 16:00', '09:30 – 13:00', 'New York'],
    [
      'Tokyo, closing the next day',
      '2026-11-19T12:00:00Z',
      'Asia/Tokyo',
      '23:30 – 06:00 next day',
      '23:30 – 03:00 next day',
      'Tokyo',
    ],
    ['Los Angeles', '2026-11-19T12:00:00Z', 'America/Los_Angeles', '06:30 – 13:00', '06:30 – 10:00', 'Los Angeles'],
  ])('in %s', (_case, now, timeZone, regular, earlyClose, city) => {
    expect(formatUsMarketSession(US_HOURS, new Date(now), timeZone)).toEqual({ regular, earlyClose, city })
  })

  it('is null for an unparsable trading time', () => {
    expect(formatUsMarketSession({ ...US_HOURS, start: '9am' }, new Date(), 'Europe/Lisbon')).toBeNull()
  })
})
