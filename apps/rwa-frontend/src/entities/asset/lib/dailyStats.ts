import type { RwaChartPoint, RwaMarketData } from '../model/types'

export type RwaDailyStats = Pick<RwaMarketData, 'change24h' | 'dayLow' | 'dayHigh'>

export function getDailyStats(points: RwaChartPoint[]): RwaDailyStats | null {
  const first = points[0]
  const last = points[points.length - 1]

  if (points.length < 2 || !first || !last || first.value <= 0) return null

  const values = points.map(({ value }) => value)

  return {
    change24h: ((last.value - first.value) / first.value) * 100,
    dayLow: Math.min(...values),
    dayHigh: Math.max(...values),
  }
}
