import type { RwaChartPoint, RwaMarketData } from '../model/types'

export type RwaDailyStats = Pick<RwaMarketData, 'change24h' | 'dayLow' | 'dayHigh'>

/** `price` is the current price, which can be fresher than the last point; `null` falls back to the last point */
export function getDailyStats(points: RwaChartPoint[], price: number | null): RwaDailyStats | null {
  const first = points[0]
  const last = points[points.length - 1]

  if (points.length < 2 || !first || !last || first.value <= 0) return null

  const current = price ?? last.value
  const values = [...points.map(({ value }) => value), current]

  return {
    change24h: ((current - first.value) / first.value) * 100,
    dayLow: Math.min(...values),
    dayHigh: Math.max(...values),
  }
}
