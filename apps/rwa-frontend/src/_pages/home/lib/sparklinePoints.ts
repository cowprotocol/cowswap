import type { RwaChartPoint } from '@/entities/asset'

/** SVG polyline `points` filling `width` × `height`, `null` with less than two points */
export function toSparklinePoints(series: RwaChartPoint[], width: number, height: number): string | null {
  if (series.length < 2) return null

  const times = series.map(({ time }) => time)
  const values = series.map(({ value }) => value)
  const minTime = Math.min(...times)
  const minValue = Math.min(...values)
  const timeSpan = Math.max(...times) - minTime || 1
  const valueSpan = Math.max(...values) - minValue

  return series
    .map(({ time, value }) => {
      const x = ((time - minTime) / timeSpan) * width
      const y = valueSpan ? height - ((value - minValue) / valueSpan) * height : height / 2

      return `${round(x)},${round(y)}`
    })
    .join(' ')
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
