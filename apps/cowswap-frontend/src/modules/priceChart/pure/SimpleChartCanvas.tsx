import { type ReactNode, useEffect, useRef, useState } from 'react'

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

import { PriceChartTooltip } from './PriceChartTooltip'
import * as styledEl from './SimpleChartCanvas.styled'

import { formatPriceChartValue, getCandlePriceFormat } from '../lib/priceChart.utils'

import type { ChartTooltipData } from './PriceChartTooltip'
import type { Candle, ChartMetric, ChartType } from '../lib/priceChart.types'

export interface SimpleChartCanvasProps {
  data: Candle[]
  chartType: ChartType
  metric: ChartMetric
  showTooltip: boolean
  locale: string
  colors: {
    primary: string
    text: string
    success: string
    danger: string
  }
}

interface SimpleChartInstance {
  chart: IChartApi
  priceSeries: ISeriesApi<'Area' | 'Candlestick'>
  volumeSeries: ISeriesApi<'Histogram'>
}

// eslint-disable-next-line max-lines-per-function
export function SimpleChartCanvas({
  data,
  chartType,
  metric,
  showTooltip,
  locale,
  colors: { primary, text, success, danger },
}: SimpleChartCanvasProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null)
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
              ohlc:
                priceData && 'open' in priceData
                  ? { open: priceData.open, high: priceData.high, low: priceData.low, close: priceData.close }
                  : undefined,
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
        locale,
        priceFormatter: (value: number) =>
          formatPriceChartValue(Math.abs(value) < priceFormat.minMove / 2 ? 0 : value, locale),
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
    volumeSeries.setData(
      data.flatMap((bar) =>
        bar.volume === undefined ? [] : [{ time: bar.timestamp as UTCTimestamp, value: bar.volume }],
      ),
    )
    chart.timeScale().fitContent()
    setTooltip(undefined)
  }, [chartType, data, locale])

  return (
    <>
      <styledEl.Canvas ref={containerRef} />
      {tooltip && showTooltip ? <PriceChartTooltip data={tooltip} metric={metric} locale={locale} /> : null}
    </>
  )
}
