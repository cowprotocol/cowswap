import { getReferenceLineColor } from './priceChartReferenceLine.utils'

import { BASE_LINE_STYLES } from '../config/priceChart.constants'

import type { PriceChartReferenceLine } from './priceChart.types'
import type { AutoscaleInfoProvider, IPriceLine, ISeriesApi } from 'lightweight-charts'
import type { DefaultTheme } from 'styled-components'

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
        const prices = referenceLines.map((line) => line.price)
        return {
          ...info,
          priceRange: {
            maxValue: Math.max(info.priceRange.maxValue, ...prices),
            minValue: Math.min(info.priceRange.minValue, ...prices),
          },
        }
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
