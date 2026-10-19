import { getDailyStats } from './dailyStats'

describe('getDailyStats', () => {
  it('derives the change from the first and last points and the range from every point', () => {
    const points = [
      { time: 1, value: 400 },
      { time: 2, value: 410 },
      { time: 3, value: 395 },
      { time: 4, value: 404 },
    ]

    expect(getDailyStats(points)).toEqual({ change24h: 1, dayLow: 395, dayHigh: 410 })
  })

  it('returns null without enough points', () => {
    expect(getDailyStats([])).toBeNull()
    expect(getDailyStats([{ time: 1, value: 400 }])).toBeNull()
  })

  it('returns null when the first price is not positive', () => {
    expect(
      getDailyStats([
        { time: 1, value: 0 },
        { time: 2, value: 400 },
      ]),
    ).toBeNull()
  })
})
