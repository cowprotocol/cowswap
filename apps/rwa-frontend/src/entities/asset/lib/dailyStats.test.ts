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
