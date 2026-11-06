import type { RwaChartPoint, RwaMarketData } from '../model/types'

export type RwaDailyStats = Pick<RwaMarketData, 'change24h' | 'dayLow' | 'dayHigh'>

const DAY_SECONDS = 24 * 3600

/**
 * `price` is the current price, which can be fresher than the last point; `null` falls back to the last point.
 * With `updatedAt`, the time of `price`, the day starts 24h before it: a cached chart starts earlier.
 * `null` when the points don't reach into that day
 */
export function getDailyStats(
  points: RwaChartPoint[],
  price: number | null,
  updatedAt: string | null = null,
): RwaDailyStats | null {
  const updatedSeconds = updatedAt ? Date.parse(updatedAt) / 1000 : NaN
  const dayPoints = Number.isFinite(updatedSeconds) ? sliceFrom(points, updatedSeconds - DAY_SECONDS) : points
  const first = dayPoints[0]
  const last = dayPoints[dayPoints.length - 1]

  if (dayPoints.length < 2 || !first || !last || first.value <= 0) return null

  const current = price ?? last.value
  const values = [...dayPoints.map(({ value }) => value), current]

  return {
    change24h: ((current - first.value) / first.value) * 100,
    dayLow: Math.min(...values),
    dayHigh: Math.max(...values),
  }
}

/** Points from `start`, the first one interpolated at `start` when an earlier point exists */
function sliceFrom(points: RwaChartPoint[], start: number): RwaChartPoint[] {
  const index = points.findIndex(({ time }) => time >= start)
  const next = points[index]
  const previous = points[index - 1]

  if (!next) return []
  if (!previous) return points

  const value = previous.value + ((next.value - previous.value) * (start - previous.time)) / (next.time - previous.time)

  return [{ time: start, value }, ...points.slice(index)]
}
