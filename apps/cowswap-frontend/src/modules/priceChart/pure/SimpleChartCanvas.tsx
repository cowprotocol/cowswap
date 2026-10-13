import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { useLingui } from '@lingui/react/macro'
import { CrosshairMode, type IPriceLine, type MouseEventParams, type Time } from 'lightweight-charts'

import { PriceChartTooltip } from './PriceChartTooltip'
import * as styledEl from './SimpleChartCanvas.styled'

import { attachExecutionMarkersToBars } from '../lib/priceChartExecutionMarker.utils'
import {
  applySimpleChartTheme,
  createSimpleChartInstance,
  getSimpleChartTooltipData,
  setSimpleChartData,
} from '../lib/priceChartSimpleCanvas.utils'
import { getSimpleExecutionMarkers } from '../lib/priceChartSimpleExecutionMarkers.utils'
import { syncSimplePriceLines } from '../lib/priceChartSimpleReferenceLines.utils'

import type { ChartTooltipData } from './PriceChartTooltip'
import type {
  Candle,
  ChartMetric,
  ChartType,
  PriceChartReferenceLine,
  PriceChartExecutionMarker,
} from '../lib/priceChart.types'
import type { SimpleChartInstance } from '../lib/priceChartSimpleCanvas.utils'

export interface SimpleChartCanvasProps {
  data: Candle[]
  executionMarkers?: PriceChartExecutionMarker[]
  onSelectPrice?: (price: number) => void
  referenceLines: PriceChartReferenceLine<number>[]
  chartType: ChartType
  metric: ChartMetric
  showTooltip: boolean
  locale: string
  colors: {
    primary: string
    text: string
    warning: string
  }
}

const EMPTY_EXECUTION_MARKERS: PriceChartExecutionMarker[] = []

// eslint-disable-next-line max-lines-per-function
export function SimpleChartCanvas({
  data,
  executionMarkers = EMPTY_EXECUTION_MARKERS,
  onSelectPrice,
  referenceLines,
  chartType,
  metric,
  showTooltip,
  locale,
  colors: { primary, text, warning },
}: SimpleChartCanvasProps): ReactNode {
  const { t } = useLingui()
  const attachedMarkers = useMemo(() => attachExecutionMarkersToBars(executionMarkers, data), [executionMarkers, data])
  const attachedMarkersRef = useRef(attachedMarkers)
  useEffect(() => {
    attachedMarkersRef.current = attachedMarkers
  }, [attachedMarkers])
  const priceLinesRef = useRef(new Map<string, IPriceLine>())
  const onSelectPriceRef = useRef(onSelectPrice)
  useEffect(() => {
    onSelectPriceRef.current = onSelectPrice
  }, [onSelectPrice])
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<SimpleChartInstance | null>(null)
  const [tooltip, setTooltip] = useState<ChartTooltipData>()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const instance = createSimpleChartInstance(container, chartType)
    const { chart, priceSeries, markers } = instance
    chartRef.current = instance

    const handleClick = (event: MouseEventParams<Time>): void => {
      if (!onSelectPriceRef.current) {
        handleCrosshairMove(event)
        return
      }
      if (!event.point) return
      const price = priceSeries.coordinateToPrice(event.point.y)
      if (price !== null && Number.isFinite(price) && price > 0) onSelectPriceRef.current(price)
    }
    const handleCrosshairMove = (event: MouseEventParams<Time>): void => {
      if (onSelectPriceRef.current) {
        setTooltip(undefined)
        return
      }
      setTooltip(getSimpleChartTooltipData(event, instance, container, attachedMarkersRef.current))
    }

    chart.subscribeCrosshairMove(handleCrosshairMove)
    chart.subscribeClick(handleClick)

    const priceLines = priceLinesRef.current
    return () => {
      priceLines.clear()
      setTooltip(undefined)
      chart.unsubscribeCrosshairMove(handleCrosshairMove)
      chart.unsubscribeClick(handleClick)
      markers.detach()
      chart.remove()
      chartRef.current = null
    }
  }, [chartType])

  useEffect(() => {
    const instance = chartRef.current
    if (!instance) return

    applySimpleChartTheme(instance, chartType, primary, text)
  }, [chartType, primary, text])

  useEffect(() => {
    const instance = chartRef.current
    if (!instance) return

    setSimpleChartData(instance, chartType, data, locale)
    setTooltip(undefined)
  }, [chartType, data, locale])

  useEffect(() => {
    const instance = chartRef.current
    if (!instance) return
    const selecting = !!onSelectPrice
    instance.chart.applyOptions({
      crosshair: {
        mode: selecting ? CrosshairMode.Normal : CrosshairMode.Magnet,
        horzLine: { labelVisible: selecting },
        vertLine: { labelVisible: false, visible: !selecting },
      },
    })
    if (chartType === 'line') instance.priceSeries.applyOptions({ crosshairMarkerVisible: !selecting })
    if (selecting) setTooltip(undefined)
  }, [chartType, onSelectPrice])

  useEffect(() => {
    const instance = chartRef.current
    if (!instance) return
    syncSimplePriceLines(instance.priceSeries, priceLinesRef.current, referenceLines, warning, text)
  }, [chartType, referenceLines, warning, text])

  useEffect(() => {
    chartRef.current?.markers.setMarkers(getSimpleExecutionMarkers(attachedMarkers))
  }, [chartType, attachedMarkers])

  return (
    <>
      <styledEl.Canvas ref={containerRef} $canSelectPrice={!!onSelectPrice} />
      {onSelectPrice ? <styledEl.SelectionHint>{t`Click chart to set limit price`}</styledEl.SelectionHint> : null}
      {tooltip && showTooltip && !onSelectPrice ? (
        <PriceChartTooltip data={tooltip} metric={metric} locale={locale} />
      ) : null}
    </>
  )
}
