import { getReferenceLineColor } from './priceChartReferenceLine.utils'

import { BASE_LINE_STYLES } from '../config/priceChart.constants'

import type { PriceChartReferenceLine } from './priceChart.types'
import type { AutoscaleInfoProvider, IPriceLine, ISeriesApi } from 'lightweight-charts'
import type { DefaultTheme } from 'styled-components'

// A line far outside a tight series (stablecoins move by a fraction of a percent) would flatten the candles.
const MAX_REFERENCE_LINE_RANGE_EXPANSION = 8

export function priceRangeWithReferenceLines(
  dataMin: number,
  dataMax: number,
  linePrices: number[],
): { maxValue: number; minValue: number } {
  const dataSpan = dataMax - dataMin

  if (dataSpan <= 0) return { maxValue: dataMax, minValue: dataMin }

  // How far a line may pull the axis relative to the candle range:
  const maxSpan = dataSpan * MAX_REFERENCE_LINE_RANGE_EXPANSION

  // Closest lines first so nearby ones claim the budget before distant outliers.
  const midpoint = (dataMin + dataMax) / 2
  const ranked = [...linePrices].sort((left, right) => Math.abs(left - midpoint) - Math.abs(right - midpoint))

  let minValue = dataMin
  let maxValue = dataMax

  ranked.forEach((price) => {
    const nextMin = Math.min(minValue, price)
    const nextMax = Math.max(maxValue, price)

    // Skip lines that would stretch the axis beyond the expansion budget.
    if (nextMax - nextMin <= maxSpan) {
      minValue = nextMin
      maxValue = nextMax
    }
  })

  return { maxValue, minValue }
}

export function syncSimplePriceLines(
  series: ISeriesApi<'Area' | 'Candlestick'>,
  priceLines: Map<string, IPriceLine>,
  referenceLines: PriceChartReferenceLine<number>[],
  theme: DefaultTheme,
): void {
  const autoscaleInfoProvider: AutoscaleInfoProvider | undefined = referenceLines.length
    ? (original) => {
        const info = original()
        if (!info?.priceRange) return info
        const linePrices = referenceLines.map((line) => line.price)
        const priceRange = priceRangeWithReferenceLines(info.priceRange.minValue, info.priceRange.maxValue, linePrices)
        return { ...info, priceRange }
      }
    : undefined
  series.applyOptions({ autoscaleInfoProvider })

  const visibleLineIds = new Set(referenceLines.map((line) => line.id))

  priceLines.forEach((line, id) => {
    if (visibleLineIds.has(id)) return

    series.removePriceLine(line)
    priceLines.delete(id)
  })

  referenceLines.forEach((referenceLine) => {
    const options = {
      axisLabelVisible: true,
      color: getReferenceLineColor(referenceLine.variant, theme),
      ...BASE_LINE_STYLES,
      price: referenceLine.price,
      title: referenceLine.label,
    }
    const existingLine = priceLines.get(referenceLine.id)

    if (existingLine) {
      existingLine.applyOptions(options)
    } else {
      priceLines.set(referenceLine.id, series.createPriceLine(options))
    }
  })
}
