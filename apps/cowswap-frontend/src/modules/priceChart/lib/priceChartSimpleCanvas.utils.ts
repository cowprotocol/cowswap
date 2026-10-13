import { transparentize } from 'color2k'
import {
  AreaSeries,
  CandlestickSeries,
  createChart,
  createSeriesMarkers,
  CrosshairMode,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts'

import { formatPriceChartValue, getPriceChartPriceFormat } from './priceChart.utils'
import { createPriceChartTimeFormatters } from './priceChartTime.utils'

import { CANDLE_DOWN_COLOR, CANDLE_UP_COLOR } from '../config/priceChart.constants'

import type { Candle, ChartType } from './priceChart.types'
import type { AttachedPriceChartExecutionMarker } from './priceChartExecutionMarker.utils'
import type { ChartTooltipData } from '../pure/PriceChartTooltip'

export interface SimpleChartInstance {
  chart: IChartApi
  priceSeries: ISeriesApi<'Area' | 'Candlestick'>
  volumeSeries: ISeriesApi<'Histogram'>
  markers: ISeriesMarkersPluginApi<Time>
}

export function applySimpleChartTheme(
  instance: SimpleChartInstance,
  chartType: ChartType,
  primary: string,
  text: string,
): void {
  instance.chart.applyOptions({ layout: { textColor: text } })
  instance.priceSeries.applyOptions(
    chartType === 'line'
      ? { lineColor: primary, topColor: transparentize(primary, 0.75), bottomColor: transparentize(primary, 1) }
      : {
          upColor: CANDLE_UP_COLOR,
          downColor: CANDLE_DOWN_COLOR,
          wickUpColor: CANDLE_UP_COLOR,
          wickDownColor: CANDLE_DOWN_COLOR,
        },
  )
  instance.volumeSeries.applyOptions({ color: transparentize(text, 0.75) })
}

export function createSimpleChartInstance(container: HTMLElement, chartType: ChartType): SimpleChartInstance {
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
      ? chart.addSeries(AreaSeries, { crosshairMarkerRadius: 4, lineWidth: 1, priceLineVisible: false })
      : chart.addSeries(CandlestickSeries, { borderVisible: false, priceLineVisible: false })
  const volumeSeries = chart.addSeries(HistogramSeries, {
    lastValueVisible: false,
    priceFormat: { type: 'volume' },
    priceLineVisible: false,
    priceScaleId: '',
  })
  volumeSeries.priceScale().applyOptions({ scaleMargins: { bottom: 0, top: 0.8 } })
  const markers = createSeriesMarkers(priceSeries)
  return { chart, priceSeries, volumeSeries, markers }
}

export function getSimpleChartTooltipData(
  event: MouseEventParams<Time>,
  instance: SimpleChartInstance,
  container: HTMLElement,
  markers: AttachedPriceChartExecutionMarker[],
): ChartTooltipData | undefined {
  const { priceSeries, volumeSeries } = instance
  const priceData = event.seriesData.get(priceSeries)
  if (!event.point || typeof event.time !== 'number' || !priceData) return undefined
  const price = 'value' in priceData ? priceData.value : 'close' in priceData ? priceData.close : undefined
  const volumeData = event.seriesData.get(volumeSeries)
  const volume = volumeData && 'value' in volumeData ? volumeData.value : undefined

  if (price === undefined) return undefined
  return {
    price,
    ohlc:
      'open' in priceData
        ? { open: priceData.open, high: priceData.high, low: priceData.low, close: priceData.close }
        : undefined,
    time: event.time,
    volume,
    executions: markers.filter((marker) => marker.barTimestamp === event.time),
    x: event.point.x,
    y: event.point.y,
    chartWidth: container.clientWidth,
    chartHeight: container.clientHeight,
  }
}

export function setSimpleChartData(
  instance: SimpleChartInstance,
  chartType: ChartType,
  data: Candle[],
  locale: string,
): void {
  const { chart, priceSeries, volumeSeries } = instance
  const priceFormat = getPriceChartPriceFormat(data)
  const { tickMarkFormatter, timeFormatter } = createPriceChartTimeFormatters(locale)
  chart.applyOptions({
    timeScale: { tickMarkFormatter },
    localization: {
      locale,
      timeFormatter,
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
}

export function setSimpleChartSelection(instance: SimpleChartInstance, chartType: ChartType, selecting: boolean): void {
  instance.chart.applyOptions({
    crosshair: {
      mode: selecting ? CrosshairMode.Normal : CrosshairMode.Magnet,
      horzLine: { labelVisible: selecting },
      vertLine: { labelVisible: false, visible: !selecting },
    },
  })
  if (chartType === 'line') instance.priceSeries.applyOptions({ crosshairMarkerVisible: !selecting })
}
