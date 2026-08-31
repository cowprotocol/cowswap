import { MutableRefObject, ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'
import { UI } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import {
  type AutoscaleInfoProvider,
  createChart,
  Coordinate,
  CrosshairMode,
  IChartApi,
  IPriceLine,
  ISeriesApi,
  MouseEventParams,
  SeriesMarker,
  Time,
  UTCTimestamp,
} from 'lightweight-charts'
import { LuCandlestickChart, LuTrendingUp } from 'react-icons/lu'

import { useTheme } from 'common/hooks/useTheme'

import * as styledEl from './PriceChart.styled'
import { PriceChartHeader } from './PriceChartHeader.pure'
import { PriceChartStatus } from './PriceChartStatus.pure'
import * as simpleStyledEl from './SimplePriceChart.styled'

import { logPriceChart } from '../../api'
import { loadPriceChartHistory, toMarketCapBars } from '../../lib/loadPriceChartHistory.service'
import {
  attachExecutionMarkersToBars,
  type AttachedPriceChartExecutionMarker,
} from '../../lib/priceChartExecutionMarker.utils'
import { getPriceChartReferenceLineAppearance } from '../../lib/priceChartReferenceLine.utils'
import { mapPriceChartBarsToVolumeData } from '../../lib/priceChartVolume.utils'
import { formatPriceChartAxisValue, formatPriceChartValue, getPriceChartSummary } from '../../lib/priceSummary.utils'
import {
  getSimplePriceChartPeriodConfig,
  getSimplePriceChartPriceFormat,
  SIMPLE_PRICE_CHART_PERIODS,
} from '../../lib/simplePriceChart.utils'

import type {
  PriceChartBar,
  PriceChartMetric,
  PriceChartSupplyBasis,
  SimplePriceChartPeriod,
} from '../../lib/priceChart.types'
import type {
  PriceChartHistoryStatus,
  PriceChartPureProps,
  PriceChartSymbolDescriptor,
} from '../../lib/tradingView.types'

const DEFAULT_PERIOD: SimplePriceChartPeriod = '1D'
const TOOLTIP_HEIGHT = 88
const TOOLTIP_HEIGHT_WITH_VOLUME = 115
const TOOLTIP_EXECUTION_HEIGHT = 27
const TOOLTIP_EXECUTION_SPACING = 16
const TOOLTIP_OFFSET = 12
const TOOLTIP_WIDTH = 280

export interface SimplePriceChartTooltipData {
  executions: AttachedPriceChartExecutionMarker[]
  placement: 'left' | 'right'
  price: number
  time: number
  volume?: number
  x: number
  y: number
}

export interface SimplePriceChartTooltipProps {
  data: SimplePriceChartTooltipData
  metric: PriceChartMetric
}

interface CachedSimplePriceHistory {
  key: string
  marketCap: Partial<Record<PriceChartSupplyBasis, Promise<PriceChartBar[]>>>
  price: Promise<PriceChartBar[]>
}

interface ChartTypeControlProps {
  chartType: SimplePriceChartType
  onChange: (chartType: SimplePriceChartType) => void
}

interface SimplePriceChartControlsProps {
  chartType: SimplePriceChartType
  onChartTypeChange: (chartType: SimplePriceChartType) => void
  onPeriodChange: (period: SimplePriceChartPeriod) => void
  period: SimplePriceChartPeriod
}

type SimplePriceChartType = 'candles' | 'line'

interface SimplePriceHistory {
  data: PriceChartBar[]
  historyStatus: PriceChartHistoryStatus
}

export function getSimpleSeriesMarkers(
  markers: AttachedPriceChartExecutionMarker[],
  darkMode: boolean,
): SeriesMarker<Time>[] {
  return markers.map((marker) => ({
    color:
      marker.side === 'buy'
        ? getCssVar(UI.COLOR_SUCCESS, darkMode ? '#4ade80' : '#16a34a')
        : getCssVar(UI.COLOR_DANGER, darkMode ? '#f87171' : '#dc2626'),
    id: marker.id,
    position: marker.side === 'buy' ? 'belowBar' : 'aboveBar',
    shape: marker.side === 'buy' ? 'arrowUp' : 'arrowDown',
    time: marker.barTimestamp as UTCTimestamp,
  }))
}

// Adapted from Uniswap's GPL-3.0-or-later PriceChartModel and ChartModelCore.
// Source: https://github.com/Uniswap/interface/tree/main/apps/web/src/components/Charts
// eslint-disable-next-line max-lines-per-function
export function SimplePriceChartPure({
  activeSymbol,
  executionMarkers,
  metric,
  onSelectMetric,
  onSelectPrice,
  onSelectSelection,
  referenceLines,
  sizeControl,
  symbols,
  supplyBasis = 'circulating',
}: PriceChartPureProps): ReactNode {
  const { darkMode } = useTheme()
  const { i18n, t } = useLingui()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const priceLinesRef = useRef<Map<string, IPriceLine>>(new Map())
  const latestOnSelectPriceRef = useRef(onSelectPrice)
  const [period, setPeriod] = useState<SimplePriceChartPeriod>(DEFAULT_PERIOD)
  const [chartType, setChartType] = useState<SimplePriceChartType>('line')
  const [tooltip, setTooltip] = useState<SimplePriceChartTooltipData>()
  const { data, historyStatus } = usePriceChartHistory(activeSymbol, period, metric, supplyBasis)
  const attachedExecutionMarkers = useMemo(
    () => attachExecutionMarkersToBars(executionMarkers, data),
    [data, executionMarkers],
  )
  const latestExecutionMarkersRef = useRef(attachedExecutionMarkers)
  const priceSummary = useMemo(() => getPriceChartSummary(data), [data])
  const isSelectingPrice = !!onSelectPrice

  useEffect(() => {
    if (historyStatus) setTooltip(undefined)
  }, [historyStatus])

  useEffect(() => {
    latestOnSelectPriceRef.current = onSelectPrice
  }, [onSelectPrice])

  useEffect(() => {
    latestExecutionMarkersRef.current = attachedExecutionMarkers
  }, [attachedExecutionMarkers])

  useSimpleChart(
    chartContainerRef,
    chartRef,
    areaSeriesRef,
    candlestickSeriesRef,
    volumeSeriesRef,
    priceLinesRef,
    latestOnSelectPriceRef,
    latestExecutionMarkersRef,
    setTooltip,
    chartType,
    darkMode,
    metric,
    i18n.locale,
  )

  useEffect(() => {
    if (isSelectingPrice) setTooltip(undefined)

    chartRef.current?.applyOptions({
      crosshair: {
        horzLine: { labelVisible: isSelectingPrice },
        mode: isSelectingPrice ? CrosshairMode.Normal : CrosshairMode.Magnet,
        vertLine: { labelVisible: false, visible: !isSelectingPrice },
      },
    })
    areaSeriesRef.current?.applyOptions({ crosshairMarkerVisible: !isSelectingPrice })
  }, [chartType, darkMode, i18n.locale, isSelectingPrice])

  useEffect(() => {
    const priceFormat = getSimplePriceChartPriceFormat(data)

    chartRef.current?.applyOptions({
      localization: {
        locale: i18n.locale,
        priceFormatter: (value: number) => formatPriceChartAxisValue(value, i18n.locale, priceFormat.minMove),
      },
    })

    if (chartType === 'line') {
      areaSeriesRef.current?.applyOptions({ priceFormat })
      areaSeriesRef.current?.setData(data.map((bar) => ({ time: bar.timestamp as UTCTimestamp, value: bar.close })))
      areaSeriesRef.current?.setMarkers(getSimpleSeriesMarkers(attachedExecutionMarkers, darkMode))
    } else {
      candlestickSeriesRef.current?.applyOptions({ priceFormat })
      candlestickSeriesRef.current?.setData(
        data.map((bar) => ({
          close: bar.close,
          high: bar.high,
          low: bar.low,
          open: bar.open,
          time: bar.timestamp as UTCTimestamp,
        })),
      )
      candlestickSeriesRef.current?.setMarkers(getSimpleSeriesMarkers(attachedExecutionMarkers, darkMode))
    }

    volumeSeriesRef.current?.setData(mapPriceChartBarsToVolumeData(data))

    chartRef.current?.timeScale().fitContent()
  }, [attachedExecutionMarkers, chartType, darkMode, data, i18n.locale])

  useEffect(() => {
    const series = chartType === 'line' ? areaSeriesRef.current : candlestickSeriesRef.current

    if (!series) return

    const autoscaleInfoProvider: AutoscaleInfoProvider | undefined = referenceLines.length
      ? (original) => {
          const info = original()

          if (!info) return info

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

    syncSimplePriceLines(series, priceLinesRef.current, referenceLines)
  }, [chartType, darkMode, referenceLines])

  if (!symbols.length) return <styledEl.EmptyState>Select both tokens to load the price chart.</styledEl.EmptyState>

  return (
    <styledEl.PanelWrapper>
      <PriceChartHeader
        activeSymbol={activeSymbol}
        change={priceSummary?.change}
        metric={metric}
        onSelectMetric={onSelectMetric}
        onSelectSelection={onSelectSelection}
        price={priceSummary?.price}
        sizeControl={sizeControl}
        symbols={symbols}
      />
      <styledEl.ChartFrame>
        <simpleStyledEl.ChartCanvas $canSelectPrice={isSelectingPrice} ref={chartContainerRef} />
        {isSelectingPrice && !historyStatus ? (
          <simpleStyledEl.SelectionHint>{t`Click chart to set limit price`}</simpleStyledEl.SelectionHint>
        ) : null}
        {tooltip && !historyStatus && !isSelectingPrice ? (
          <SimplePriceChartTooltip data={tooltip} metric={metric} />
        ) : null}
        {historyStatus ? (
          <styledEl.OverlayState>
            <PriceChartStatus assetSymbol={activeSymbol?.baseAsset.symbol} kind={historyStatus} />
          </styledEl.OverlayState>
        ) : null}
      </styledEl.ChartFrame>
      <SimplePriceChartControls
        chartType={chartType}
        onChartTypeChange={setChartType}
        onPeriodChange={setPeriod}
        period={period}
      />
    </styledEl.PanelWrapper>
  )
}

export function SimplePriceChartTooltip({ data, metric }: SimplePriceChartTooltipProps): ReactNode {
  const { i18n, t } = useLingui()

  return (
    <simpleStyledEl.Tooltip $placement={data.placement} $width={TOOLTIP_WIDTH} $x={data.x} $y={data.y} role="tooltip">
      <simpleStyledEl.TooltipRow>
        <simpleStyledEl.TooltipLabel>{metric === 'marketCap' ? t`Market Cap` : t`Price`}</simpleStyledEl.TooltipLabel>
        <simpleStyledEl.TooltipValue>{formatPriceChartValue(data.price, i18n.locale)}</simpleStyledEl.TooltipValue>
      </simpleStyledEl.TooltipRow>
      {data.volume === undefined ? null : (
        <simpleStyledEl.TooltipRow>
          <simpleStyledEl.TooltipLabel>{t`Volume`}</simpleStyledEl.TooltipLabel>
          <simpleStyledEl.TooltipValue>{formatPriceChartValue(data.volume, i18n.locale)}</simpleStyledEl.TooltipValue>
        </simpleStyledEl.TooltipRow>
      )}
      {data.executions.length > 0 ? (
        <simpleStyledEl.TooltipExecutions>
          {data.executions.map((execution) => (
            <simpleStyledEl.TooltipExecution key={execution.id}>
              <simpleStyledEl.TooltipExecutionSide $side={execution.side}>
                {execution.side === 'buy' ? t`BUY` : t`SELL`}
              </simpleStyledEl.TooltipExecutionSide>
              <simpleStyledEl.TooltipExecutionText>
                <Trans>
                  <simpleStyledEl.TooltipExecutionAmount>
                    {execution.activeAmount}
                  </simpleStyledEl.TooltipExecutionAmount>{' '}
                  {execution.activeTokenSymbol}
                  {/* for {execution.counterAmount} {execution.counterTokenSymbol} */}
                </Trans>
              </simpleStyledEl.TooltipExecutionText>
            </simpleStyledEl.TooltipExecution>
          ))}
        </simpleStyledEl.TooltipExecutions>
      ) : null}
      <simpleStyledEl.TooltipTime $hasExecutions={data.executions.length > 0}>
        {new Intl.DateTimeFormat(i18n.locale, { dateStyle: 'medium', timeStyle: 'short' }).format(data.time * 1000)}
      </simpleStyledEl.TooltipTime>
    </simpleStyledEl.Tooltip>
  )
}

export function syncSimplePriceLines(
  series: ISeriesApi<'Area'> | ISeriesApi<'Candlestick'>,
  priceLines: Map<string, IPriceLine>,
  referenceLines: PriceChartPureProps['referenceLines'],
): void {
  const visibleLineIds = new Set(referenceLines.map((line) => line.id))

  priceLines.forEach((line, id) => {
    if (visibleLineIds.has(id)) return

    series.removePriceLine(line)
    priceLines.delete(id)
  })

  referenceLines.forEach((referenceLine) => {
    const appearance = getPriceChartReferenceLineAppearance(referenceLine.variant)
    const options = {
      axisLabelVisible: true,
      color: getCssVar(appearance.colorToken, appearance.colorFallback),
      lineStyle: appearance.lineStyle,
      lineWidth: appearance.lineWidth,
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

function ChartTypeControl({ chartType, onChange }: ChartTypeControlProps): ReactNode {
  const { t } = useLingui()

  return (
    <simpleStyledEl.ChartTypeControls aria-label={t`Price chart type`} role="group">
      <simpleStyledEl.ChartTypeButton
        $isActive={chartType === 'line'}
        aria-label={t`Area chart`}
        aria-pressed={chartType === 'line'}
        onClick={() => onChange('line')}
        type="button"
      >
        <LuTrendingUp aria-hidden="true" />
      </simpleStyledEl.ChartTypeButton>
      <simpleStyledEl.ChartTypeButton
        $isActive={chartType === 'candles'}
        aria-label={t`Candlestick chart`}
        aria-pressed={chartType === 'candles'}
        onClick={() => onChange('candles')}
        type="button"
      >
        <LuCandlestickChart aria-hidden="true" />
      </simpleStyledEl.ChartTypeButton>
    </simpleStyledEl.ChartTypeControls>
  )
}

function createAreaSeries(chart: IChartApi, primaryColor: string): ISeriesApi<'Area'> {
  return chart.addAreaSeries({
    bottomColor: 'rgba(59, 130, 246, 0)',
    crosshairMarkerRadius: 4,
    lastValueVisible: true,
    lineColor: primaryColor,
    lineWidth: 2,
    priceLineVisible: false,
    topColor: getCssVar(UI.COLOR_PRIMARY_OPACITY_25, 'rgba(59, 130, 246, 0.25)'),
  })
}

function createSimpleChart(container: HTMLDivElement, darkMode: boolean, locale: string): IChartApi {
  return createChart(container, {
    autoSize: true,
    crosshair: {
      horzLine: { labelVisible: false },
      mode: CrosshairMode.Magnet,
      vertLine: { labelVisible: false },
    },
    grid: { horzLines: { visible: false }, vertLines: { visible: false } },
    handleScroll: { horzTouchDrag: true, mouseWheel: false, pressedMouseMove: true, vertTouchDrag: false },
    handleScale: { axisPressedMouseMove: true, mouseWheel: false, pinch: true },
    layout: {
      background: { color: 'transparent' },
      textColor: getCssVar(UI.COLOR_TEXT, darkMode ? '#f8fafc' : '#111827'),
    },
    localization: {
      locale,
      priceFormatter: (value: number) => formatPriceChartValue(value, locale),
    },
    rightPriceScale: { borderVisible: false, scaleMargins: { bottom: 0.15, top: 0.2 } },
    timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true, timeVisible: true },
  })
}

function getCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback

  return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

function getSimplePriceChartTooltipData(
  point: { x: number; y: number },
  container: HTMLDivElement,
  price: number,
  time: number,
  volume?: number,
  executions: AttachedPriceChartExecutionMarker[] = [],
): SimplePriceChartTooltipData {
  const placeOnLeft = point.x + TOOLTIP_OFFSET + TOOLTIP_WIDTH > container.clientWidth
  const baseHeight = volume === undefined ? TOOLTIP_HEIGHT : TOOLTIP_HEIGHT_WITH_VOLUME
  const executionHeight = executions.length
    ? executions.length * TOOLTIP_EXECUTION_HEIGHT + TOOLTIP_EXECUTION_SPACING
    : 0
  const halfTooltipHeight = (baseHeight + executionHeight) / 2

  return {
    executions,
    placement: placeOnLeft ? 'left' : 'right',
    price,
    time,
    volume,
    x: point.x + (placeOnLeft ? -TOOLTIP_OFFSET : TOOLTIP_OFFSET),
    y: Math.max(halfTooltipHeight, Math.min(point.y, container.clientHeight - halfTooltipHeight)),
  }
}

function SimplePriceChartControls({
  chartType,
  onChartTypeChange,
  onPeriodChange,
  period,
}: SimplePriceChartControlsProps): ReactNode {
  return (
    <simpleStyledEl.FooterControls>
      <ChartTypeControl chartType={chartType} onChange={onChartTypeChange} />
      <simpleStyledEl.Controls aria-label="Price chart period" role="group">
        {SIMPLE_PRICE_CHART_PERIODS.map((item) => (
          <styledEl.SegmentedControlButton
            $isActive={item === period}
            aria-pressed={item === period}
            key={item}
            onClick={() => onPeriodChange(item)}
            type="button"
          >
            {item}
          </styledEl.SegmentedControlButton>
        ))}
      </simpleStyledEl.Controls>
    </simpleStyledEl.FooterControls>
  )
}

function usePriceChartHistory(
  symbol: PriceChartSymbolDescriptor | undefined,
  period: SimplePriceChartPeriod,
  metric: PriceChartMetric,
  supplyBasis: PriceChartSupplyBasis,
): SimplePriceHistory {
  const [data, setData] = useState<PriceChartBar[]>([])
  const [historyStatus, setHistoryStatus] = useState<PriceChartHistoryStatus>(null)
  const historyCacheRef = useRef<CachedSimplePriceHistory | undefined>(undefined)
  const hasRequestedHistoryRef = useRef(false)

  useEffect(() => {
    if (!symbol) {
      historyCacheRef.current = undefined
      hasRequestedHistoryRef.current = false
      setData([])
      setHistoryStatus(null)
      return
    }

    let isCancelled = false
    const { from, resolution, to } = getSimplePriceChartPeriodConfig(period, Date.now() / 1000)
    const historyKey = `${symbol.ticker}:${period}`
    const history: CachedSimplePriceHistory =
      historyCacheRef.current?.key === historyKey
        ? historyCacheRef.current
        : {
            key: historyKey,
            marketCap: {},
            price: loadPriceChartHistory(symbol, from, to, resolution, 'price', supplyBasis),
          }
    historyCacheRef.current = history

    if (!hasRequestedHistoryRef.current) {
      hasRequestedHistoryRef.current = true
      setHistoryStatus('loading')
    }

    const request =
      metric === 'price'
        ? history.price
        : (history.marketCap[supplyBasis] ??= history.price.then((bars) => toMarketCapBars(symbol, bars, supplyBasis)))

    void request
      .then((bars) => {
        if (isCancelled) return

        setData(bars)
        setHistoryStatus(bars.length ? null : 'empty')
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        const error = normalizeError(err)
        logPriceChart.warn('Failed to load simple chart history', error, { period, ticker: symbol.ticker })
        setData([])
        setHistoryStatus('error')
      })

    return () => {
      isCancelled = true
    }
  }, [metric, period, supplyBasis, symbol])

  return { data, historyStatus }
}

// eslint-disable-next-line max-lines-per-function
function useSimpleChart(
  chartContainerRef: MutableRefObject<HTMLDivElement | null>,
  chartRef: MutableRefObject<IChartApi | null>,
  areaSeriesRef: MutableRefObject<ISeriesApi<'Area'> | null>,
  candlestickSeriesRef: MutableRefObject<ISeriesApi<'Candlestick'> | null>,
  volumeSeriesRef: MutableRefObject<ISeriesApi<'Histogram'> | null>,
  priceLinesRef: MutableRefObject<Map<string, IPriceLine>>,
  latestOnSelectPriceRef: MutableRefObject<((price: number) => void) | undefined>,
  latestExecutionMarkersRef: MutableRefObject<AttachedPriceChartExecutionMarker[]>,
  onTooltipChange: (tooltip: SimplePriceChartTooltipData | undefined) => void,
  chartType: SimplePriceChartType,
  darkMode: boolean,
  metric: PriceChartMetric,
  locale: string,
): void {
  useEffect(() => {
    const container = chartContainerRef.current
    const priceLines = priceLinesRef.current

    if (!container) return

    const primaryColor = getCssVar(UI.COLOR_PRIMARY, '#3b82f6')
    const chart = createSimpleChart(container, darkMode, locale)
    const volumeSeries = chart.addHistogramSeries({
      color: getCssVar(UI.COLOR_TEXT_OPACITY_25, 'rgba(17, 24, 39, 0.25)'),
      lastValueVisible: false,
      priceFormat: { type: 'volume' },
      priceLineVisible: false,
      priceScaleId: '',
    })
    volumeSeries.priceScale().applyOptions({ scaleMargins: { bottom: 0, top: 0.8 } })
    volumeSeriesRef.current = volumeSeries
    let coordinateToPrice: (coordinate: Coordinate) => number | null
    let getCrosshairPrice: (event: MouseEventParams<Time>) => number | undefined
    if (chartType === 'line') {
      const series = createAreaSeries(chart, primaryColor)
      areaSeriesRef.current = series
      coordinateToPrice = (coordinate) => series.coordinateToPrice(coordinate)
      getCrosshairPrice = (event) => {
        const seriesData = event.seriesData.get(series)
        return seriesData && 'value' in seriesData ? seriesData.value : undefined
      }
    } else {
      const series = chart.addCandlestickSeries({
        borderVisible: false,
        downColor: getCssVar(UI.COLOR_DANGER, '#ef4444'),
        priceLineVisible: false,
        upColor: getCssVar(UI.COLOR_SUCCESS, '#22c55e'),
        wickDownColor: getCssVar(UI.COLOR_DANGER, '#ef4444'),
        wickUpColor: getCssVar(UI.COLOR_SUCCESS, '#22c55e'),
      })

      candlestickSeriesRef.current = series
      coordinateToPrice = (coordinate) => series.coordinateToPrice(coordinate)
      getCrosshairPrice = (event) => {
        const seriesData = event.seriesData.get(series)
        return seriesData && 'close' in seriesData ? seriesData.close : undefined
      }
    }

    const handleClick = (event: MouseEventParams<Time>): void => {
      if (!event.point || !latestOnSelectPriceRef.current) return

      const price = coordinateToPrice(event.point.y)

      if (price !== null && Number.isFinite(price) && price > 0) {
        latestOnSelectPriceRef.current(price)
      }
    }

    const handleCrosshairMove = (event: MouseEventParams<Time>): void => {
      if (latestOnSelectPriceRef.current) {
        onTooltipChange(undefined)
        return
      }

      const price = getCrosshairPrice(event)
      const volumeData = event.seriesData.get(volumeSeries)
      const volume = volumeData && 'value' in volumeData ? volumeData.value : undefined

      if (!event.point || typeof event.time !== 'number' || price === undefined) {
        onTooltipChange(undefined)
        return
      }

      const executions = latestExecutionMarkersRef.current.filter((marker) => marker.barTimestamp === event.time)

      onTooltipChange(getSimplePriceChartTooltipData(event.point, container, price, event.time, volume, executions))
    }

    chart.subscribeClick(handleClick)
    chart.subscribeCrosshairMove(handleCrosshairMove)
    chartRef.current = chart

    return () => {
      onTooltipChange(undefined)
      chart.unsubscribeClick(handleClick)
      chart.unsubscribeCrosshairMove(handleCrosshairMove)
      chart.remove()
      chartRef.current = null
      areaSeriesRef.current = null
      candlestickSeriesRef.current = null
      volumeSeriesRef.current = null
      priceLines.clear()
    }
  }, [
    areaSeriesRef,
    candlestickSeriesRef,
    chartContainerRef,
    chartRef,
    chartType,
    darkMode,
    latestOnSelectPriceRef,
    latestExecutionMarkersRef,
    locale,
    metric,
    onTooltipChange,
    priceLinesRef,
    volumeSeriesRef,
  ])
}
