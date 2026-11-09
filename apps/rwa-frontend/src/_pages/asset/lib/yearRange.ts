import type { RwaChartPoint } from '@/entities/asset'

const SECONDS_PER_DAY = 24 * 60 * 60
const YEAR_DAYS = 364
/** CoinGecko's daily points start up to a day after `days=365` asks for */
const YEAR_START_TOLERANCE_DAYS = 2

export interface YearRange {
  /** USD */
  low: number
  /** USD */
  high: number
  /** Unix seconds of the first point when the series covers less than 52 weeks, `null` for a full year */
  since: number | null
}

/** Over the 52 weeks before the last point, which is the latest price. `null` without points */
export function getYearRange(points: RwaChartPoint[]): YearRange | null {
  const first = points[0]
  const last = points.at(-1)

  if (!first || !last) return null

  const values = points.map(({ value }) => value)
  const yearStart = last.time - (YEAR_DAYS - YEAR_START_TOLERANCE_DAYS) * SECONDS_PER_DAY

  return { low: Math.min(...values), high: Math.max(...values), since: first.time > yearStart ? first.time : null }
}
