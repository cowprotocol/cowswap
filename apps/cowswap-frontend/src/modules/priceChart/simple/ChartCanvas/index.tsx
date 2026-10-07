import { type ReactNode, useEffect, useRef, useState } from 'react'

import { useLingui } from '@lingui/react/macro'
import { transparentize } from 'color2k'
import {
  AreaSeries,
  CandlestickSeries,
  createChart,
  CrosshairMode,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts'

import { useTheme } from 'common/hooks/useTheme'

import * as styledEl from './styled'

import {
  formatPriceChartAxisValue,
  mapPriceChartBarsToVolumeData,
  getCandlePriceFormat,
} from '../../lib/priceChart.utils'
import { PriceChartTooltip } from '../../pure/PriceChartTooltip'

import type { Candle, ChartMetric, ChartType } from '../../lib/priceChart.types'
import type { ChartTooltipData } from '../../pure/PriceChartTooltip'

export interface ChartCanvasProps {
  data: Candle[]
  chartType: ChartType
  metric: ChartMetric
  showTooltip: boolean
}

interface SimpleChartInstance {
  chart: IChartApi
  priceSeries: ISeriesApi<'Area' | 'Candlestick'>
  volumeSeries: ISeriesApi<'Histogram'>
}

// Adapted from Uniswap's GPL-3.0-or-later PriceChartModel and ChartModelCore.
// Source: https://github.com/Uniswap/interface/tree/main/apps/web/src/components/Charts

// eslint-disable-next-line max-lines-per-function
export function ChartCanvas({ data, chartType, metric, showTooltip }: ChartCanvasProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null)
  const { primary, text, success, danger } = useTheme()
  const { i18n } = useLingui()
  const chartRef = useRef<SimpleChartInstance | null>(null)
  const [tooltip, setTooltip] = useState<ChartTooltipData>()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      autoSize: true,
      crosshair: {
        horzLine: { labelVisible: false },
        mode: CrosshairMode.Magnet,
        vertLine: { labelVisible: false },
      },
      grid: { horzLines: { visible: false }, vertLines: { visible: false } },
      handleScroll: { horzTouchDrag: true, mouseWheel: false, pressedMouseMove: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
      layout: { background: { color: 'transparent' } },
      rightPriceScale: { borderVisible: false, scaleMargins: { bottom: 0.15, top: 0.2 } },
      timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true, timeVisible: true },
    })
    const priceSeries =
      chartType === 'line'
        ? chart.addSeries(AreaSeries, { crosshairMarkerRadius: 4, lineWidth: 2, priceLineVisible: false })
        : chart.addSeries(CandlestickSeries, { borderVisible: false, priceLineVisible: false })
    const volumeSeries = chart.addSeries(HistogramSeries, {
      lastValueVisible: false,
      priceFormat: { type: 'volume' },
      priceLineVisible: false,
      priceScaleId: '',
    })
    volumeSeries.priceScale().applyOptions({ scaleMargins: { bottom: 0, top: 0.8 } })
    chartRef.current = { chart, priceSeries, volumeSeries }

    const handleCrosshairMove = (event: MouseEventParams<Time>): void => {
      const priceData = event.seriesData.get(priceSeries)
      const price =
        priceData && ('value' in priceData ? priceData.value : 'close' in priceData ? priceData.close : undefined)
      const volumeData = event.seriesData.get(volumeSeries)
      const volume = volumeData && 'value' in volumeData ? volumeData.value : undefined

      setTooltip(
        event.point && typeof event.time === 'number' && price !== undefined
          ? {
              price,
              time: event.time,
              volume,
              x: event.point.x,
              y: event.point.y,
              chartWidth: container.clientWidth,
              chartHeight: container.clientHeight,
            }
          : undefined,
      )
    }

    chart.subscribeCrosshairMove(handleCrosshairMove)

    return () => {
      setTooltip(undefined)
      chart.unsubscribeCrosshairMove(handleCrosshairMove)
      chart.remove()
      chartRef.current = null
    }
  }, [chartType])

  useEffect(() => {
    const instance = chartRef.current
    if (!instance) return

    instance.chart.applyOptions({ layout: { textColor: text } })
    instance.priceSeries.applyOptions(
      chartType === 'line'
        ? { lineColor: primary, topColor: transparentize(primary, 0.75), bottomColor: transparentize(primary, 1) }
        : { upColor: success, downColor: danger, wickUpColor: success, wickDownColor: danger },
    )
    instance.volumeSeries.applyOptions({ color: transparentize(text, 0.75) })
  }, [chartType, primary, text, success, danger])

  useEffect(() => {
    const instance = chartRef.current
    if (!instance) return

    const { chart, priceSeries, volumeSeries } = instance
    const priceFormat = getCandlePriceFormat(data)
    chart.applyOptions({
      localization: {
        locale: i18n.locale,
        priceFormatter: (value: number) => formatPriceChartAxisValue(value, i18n.locale, priceFormat.minMove),
      },
    })
    priceSeries.applyOptions({ priceFormat })
    priceSeries.setData(
      data.map((bar) =>
        chartType === 'line'
          ? { time: bar.timestamp as UTCTimestamp, value: bar.close }
          : { time: bar.timestamp as UTCTimestamp, open: bar.open, high: bar.high, low: bar.low, close: bar.close },
      ),
    )
    volumeSeries.setData(mapPriceChartBarsToVolumeData(data))
    chart.timeScale().fitContent()
    setTooltip(undefined)
  }, [chartType, data, i18n.locale])

  return (
    <>
      <styledEl.Canvas ref={containerRef} />
      {tooltip && showTooltip ? <PriceChartTooltip data={tooltip} metric={metric} /> : null}
    </>
  )
}
