import { MutableRefObject, ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'
import { UI } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import {
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  Time,
  UTCTimestamp,
} from 'lightweight-charts'
import { LuCandlestickChart, LuTrendingUp } from 'react-icons/lu'

import { useTheme } from 'common/hooks/useTheme'

import { mapPriceChartBarsToVolumeData } from './priceChartVolume.utils'
import * as styledEl from './SimplePriceChart.styled'
import {
  getSimplePriceChartPeriodConfig,
  getSimplePriceChartPriceFormat,
  SIMPLE_PRICE_CHART_PERIODS,
} from './simplePriceChart.utils'

import { logPriceChart } from '../api'
import { getChartAssetKey } from '../lib/chartAssets.utils'
import { loadPriceChartHistory, toMarketCapBars } from '../lib/loadPriceChartHistory'
import { formatPriceChartAxisValue, formatPriceChartValue, getPriceChartSummary } from '../lib/priceSummary.utils'
import { PriceChartHeader } from '../pure/PriceChartHeader'
import { PriceChartStatus } from '../pure/PriceChartStatus'

import type {
  PriceChartBar,
  PriceChartMetric,
  PriceChartSupplyBasis,
  SimplePriceChartPeriod,
  PriceChartHistoryStatus,
  PriceChartPureProps,
  PriceChartAsset,
} from '../lib/priceChart.types'

const DEFAULT_PERIOD: SimplePriceChartPeriod = '1D'
const TOOLTIP_HEIGHT = 88
const TOOLTIP_HEIGHT_WITH_VOLUME = 115
const TOOLTIP_OFFSET = 12
const TOOLTIP_WIDTH = 280

export interface SimplePriceChartTooltipData {
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

// Adapted from Uniswap's GPL-3.0-or-later PriceChartModel and ChartModelCore.
// Source: https://github.com/Uniswap/interface/tree/main/apps/web/src/components/Charts

export function SimplePriceChart({
  activeAsset,
  metric,
  onSelectMetric,
  onSelectSelection,
  sizeControl,
  assets,
  supplyBasis = 'circulating',
}: PriceChartPureProps): ReactNode {
  const { darkMode } = useTheme()
  const { i18n } = useLingui()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const [period, setPeriod] = useState<SimplePriceChartPeriod>(DEFAULT_PERIOD)
  const [chartType, setChartType] = useState<SimplePriceChartType>('line')
  const [tooltip, setTooltip] = useState<SimplePriceChartTooltipData>()
  const { data, historyStatus } = usePriceChartHistory(activeAsset, period, metric, supplyBasis)
  const priceSummary = useMemo(() => getPriceChartSummary(data), [data])

  useEffect(() => {
    if (historyStatus) setTooltip(undefined)
  }, [historyStatus])

  useSimpleChart(
    chartContainerRef,
    chartRef,
    areaSeriesRef,
    candlestickSeriesRef,
    volumeSeriesRef,
    setTooltip,
    chartType,
    darkMode,
    metric,
    i18n.locale,
  )

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
    }

    volumeSeriesRef.current?.setData(mapPriceChartBarsToVolumeData(data))

    chartRef.current?.timeScale().fitContent()
  }, [chartType, darkMode, data, i18n.locale])

  if (!assets.length) return <styledEl.EmptyState>Select both tokens to load the price chart.</styledEl.EmptyState>

  return (
    <styledEl.PanelWrapper>
      <PriceChartHeader
        activeAsset={activeAsset}
        change={priceSummary?.change}
        metric={metric}
        onSelectMetric={onSelectMetric}
        onSelectSelection={onSelectSelection}
        price={priceSummary?.price}
        sizeControl={sizeControl}
        assets={assets}
      />
      <styledEl.ChartFrame>
        <styledEl.ChartCanvas ref={chartContainerRef} />
        {tooltip && !historyStatus ? <SimplePriceChartTooltip data={tooltip} metric={metric} /> : null}
        {historyStatus ? (
          <styledEl.OverlayState>
            <PriceChartStatus assetSymbol={activeAsset?.symbol} kind={historyStatus} />
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
    <styledEl.Tooltip $placement={data.placement} $width={TOOLTIP_WIDTH} $x={data.x} $y={data.y} role="tooltip">
      <styledEl.TooltipRow>
        <styledEl.TooltipLabel>{metric === 'marketCap' ? t`Market Cap` : t`Price`}</styledEl.TooltipLabel>
        <styledEl.TooltipValue>{formatPriceChartValue(data.price, i18n.locale)}</styledEl.TooltipValue>
      </styledEl.TooltipRow>
      {data.volume === undefined ? null : (
        <styledEl.TooltipRow>
          <styledEl.TooltipLabel>{t`Volume`}</styledEl.TooltipLabel>
          <styledEl.TooltipValue>{formatPriceChartValue(data.volume, i18n.locale)}</styledEl.TooltipValue>
        </styledEl.TooltipRow>
      )}
      <styledEl.TooltipTime>
        {new Intl.DateTimeFormat(i18n.locale, { dateStyle: 'medium', timeStyle: 'short' }).format(data.time * 1000)}
      </styledEl.TooltipTime>
    </styledEl.Tooltip>
  )
}

function ChartTypeControl({ chartType, onChange }: ChartTypeControlProps): ReactNode {
  const { t } = useLingui()

  return (
    <styledEl.ChartTypeControls aria-label={t`Price chart type`} role="group">
      <styledEl.ChartTypeButton
        $isActive={chartType === 'line'}
        aria-label={t`Area chart`}
        aria-pressed={chartType === 'line'}
        onClick={() => onChange('line')}
        type="button"
      >
        <LuTrendingUp aria-hidden="true" />
      </styledEl.ChartTypeButton>
      <styledEl.ChartTypeButton
        $isActive={chartType === 'candles'}
        aria-label={t`Candlestick chart`}
        aria-pressed={chartType === 'candles'}
        onClick={() => onChange('candles')}
        type="button"
      >
        <LuCandlestickChart aria-hidden="true" />
      </styledEl.ChartTypeButton>
    </styledEl.ChartTypeControls>
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
): SimplePriceChartTooltipData {
  const placeOnLeft = point.x + TOOLTIP_OFFSET + TOOLTIP_WIDTH > container.clientWidth
  const baseHeight = volume === undefined ? TOOLTIP_HEIGHT : TOOLTIP_HEIGHT_WITH_VOLUME
  const halfTooltipHeight = baseHeight / 2

  return {
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
    <styledEl.FooterControls>
      <ChartTypeControl chartType={chartType} onChange={onChartTypeChange} />
      <styledEl.Controls aria-label="Price chart period" role="group">
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
      </styledEl.Controls>
    </styledEl.FooterControls>
  )
}

function usePriceChartHistory(
  asset: PriceChartAsset | undefined,
  period: SimplePriceChartPeriod,
  metric: PriceChartMetric,
  supplyBasis: PriceChartSupplyBasis,
): SimplePriceHistory {
  const [data, setData] = useState<PriceChartBar[]>([])
  const [historyStatus, setHistoryStatus] = useState<PriceChartHistoryStatus>(null)
  const historyCacheRef = useRef<CachedSimplePriceHistory | undefined>(undefined)
  const hasRequestedHistoryRef = useRef(false)

  useEffect(() => {
    if (!asset) {
      historyCacheRef.current = undefined
      hasRequestedHistoryRef.current = false
      setData([])
      setHistoryStatus(null)
      return
    }

    let isCancelled = false
    const { from, resolution, to } = getSimplePriceChartPeriodConfig(period, Date.now() / 1000)
    const historyKey = `${getChartAssetKey(asset)}:${period}`
    const history: CachedSimplePriceHistory =
      historyCacheRef.current?.key === historyKey
        ? historyCacheRef.current
        : {
            key: historyKey,
            marketCap: {},
            price: loadPriceChartHistory(asset, from, to, resolution, 'price', supplyBasis),
          }
    historyCacheRef.current = history

    if (!hasRequestedHistoryRef.current) {
      hasRequestedHistoryRef.current = true
      setHistoryStatus('loading')
    }

    const request =
      metric === 'price'
        ? history.price
        : (history.marketCap[supplyBasis] ??= history.price.then((bars) => toMarketCapBars(asset, bars, supplyBasis)))

    void request
      .then((bars) => {
        if (isCancelled) return

        setData(bars)
        setHistoryStatus(bars.length ? null : 'empty')
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        const error = normalizeError(err)
        logPriceChart.warn('Failed to load simple chart history', error, { period, asset: getChartAssetKey(asset) })
        setData([])
        setHistoryStatus('error')
      })

    return () => {
      isCancelled = true
    }
  }, [metric, period, supplyBasis, asset])

  return { data, historyStatus }
}

function useSimpleChart(
  chartContainerRef: MutableRefObject<HTMLDivElement | null>,
  chartRef: MutableRefObject<IChartApi | null>,
  areaSeriesRef: MutableRefObject<ISeriesApi<'Area'> | null>,
  candlestickSeriesRef: MutableRefObject<ISeriesApi<'Candlestick'> | null>,
  volumeSeriesRef: MutableRefObject<ISeriesApi<'Histogram'> | null>,
  onTooltipChange: (tooltip: SimplePriceChartTooltipData | undefined) => void,
  chartType: SimplePriceChartType,
  darkMode: boolean,
  metric: PriceChartMetric,
  locale: string,
): void {
  useEffect(() => {
    const container = chartContainerRef.current

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
    let getCrosshairPrice: (event: MouseEventParams<Time>) => number | undefined
    if (chartType === 'line') {
      const series = createAreaSeries(chart, primaryColor)
      areaSeriesRef.current = series
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
      getCrosshairPrice = (event) => {
        const seriesData = event.seriesData.get(series)
        return seriesData && 'close' in seriesData ? seriesData.close : undefined
      }
    }

    const handleCrosshairMove = (event: MouseEventParams<Time>): void => {
      const price = getCrosshairPrice(event)
      const volumeData = event.seriesData.get(volumeSeries)
      const volume = volumeData && 'value' in volumeData ? volumeData.value : undefined

      if (!event.point || typeof event.time !== 'number' || price === undefined) {
        onTooltipChange(undefined)
        return
      }

      onTooltipChange(getSimplePriceChartTooltipData(event.point, container, price, event.time, volume))
    }

    chart.subscribeCrosshairMove(handleCrosshairMove)
    chartRef.current = chart

    return () => {
      onTooltipChange(undefined)
      chart.unsubscribeCrosshairMove(handleCrosshairMove)
      chart.remove()
      chartRef.current = null
      areaSeriesRef.current = null
      candlestickSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [
    areaSeriesRef,
    candlestickSeriesRef,
    chartContainerRef,
    chartRef,
    chartType,
    darkMode,
    locale,
    metric,
    onTooltipChange,
    volumeSeriesRef,
  ])
}
