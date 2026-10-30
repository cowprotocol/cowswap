import { getDailyStats } from './dailyStats'

const POINTS = [
  { time: 1, value: 400 },
  { time: 2, value: 410 },
  { time: 3, value: 395 },
  { time: 4, value: 404 },
]

describe('getDailyStats', () => {
  it('measures the change from the first point to the price', () => {
    expect(getDailyStats(POINTS, 406)).toEqual({ change24h: 1.5, dayLow: 395, dayHigh: 410 })
  })

  it('widens the range to a price outside the points', () => {
    expect(getDailyStats(POINTS, 390)).toEqual({ change24h: -2.5, dayLow: 390, dayHigh: 410 })
    expect(getDailyStats(POINTS, 420)).toEqual({ change24h: 5, dayLow: 395, dayHigh: 420 })
  })

  it('uses the last point without a price', () => {
    expect(getDailyStats(POINTS, null)).toEqual({ change24h: 1, dayLow: 395, dayHigh: 410 })
  })

  it('returns null without enough points', () => {
    expect(getDailyStats([], 400)).toBeNull()
    expect(getDailyStats([{ time: 1, value: 400 }], 400)).toBeNull()
  })

  describe('with the price update time', () => {
    const DAY = 24 * 3600
    const UPDATED_AT = '2026-10-28T11:00:00.000Z'
    const updated = Date.parse(UPDATED_AT) / 1000
    const HOURLY = [
      { time: updated - DAY - 1800, value: 380 },
      { time: updated - DAY + 1800, value: 400 },
      { time: updated - 3600, value: 410 },
    ]

    it('starts the day 24h before it, interpolated between the points around it', () => {
      expect(getDailyStats(HOURLY, 390, UPDATED_AT)).toEqual({ change24h: 0, dayLow: 390, dayHigh: 410 })
    })

    it('keeps every point of a chart starting after it', () => {
      expect(getDailyStats(HOURLY.slice(1), 420, UPDATED_AT)).toEqual({ change24h: 5, dayLow: 400, dayHigh: 420 })
    })

    it('returns null for a chart ending before the day', () => {
      expect(getDailyStats(HOURLY.slice(0, 1), 390, UPDATED_AT)).toBeNull()
      expect(getDailyStats(HOURLY, 390, '2026-10-30T11:00:00.000Z')).toBeNull()
    })
  })

  it('returns null when the first price is not positive', () => {
    expect(
      getDailyStats(
        [
          { time: 1, value: 0 },
          { time: 2, value: 400 },
        ],
        400,
      ),
    ).toBeNull()
  })
})
