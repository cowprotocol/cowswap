'use client'

import { type ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from 'react'

import { normalizeError } from '@cowprotocol/common-utils/errors'

import styles from './PriceChart.module.css'

import { alignCandles, CHART_RESOLUTIONS } from '../lib/chartBars'

import type { RwaCandle, RwaChartRange, RwaChartType } from '../model/types'
import type {
  ChartingLibraryFeatureset,
  IBasicDataFeed,
  IChartingLibraryWidget,
  LibrarySymbolInfo,
  Overrides,
  ResolutionString,
  SeriesType,
} from 'charting_library'

import { useIsDarkTheme } from '@/shared/lib/theme'
import { loadTradingView, toTradingViewColor, TRADING_VIEW_LIBRARY_PATH } from '@/shared/lib/trading-view'
import { Loader } from '@/shared/ui/loader'

const CHART_HEIGHT = 300
// `SeriesType` and `LineStyle` values: the types package has no runtime enums
const CANDLE_SERIES: SeriesType = 1
const AREA_SERIES: SeriesType = 3
const DASHED_LINE = 2
const SUPPORTED_RESOLUTIONS = [
  ...new Set(Object.values(CHART_RESOLUTIONS).flatMap(Object.values)),
] as ResolutionString[]

const DISABLED_FEATURES: ChartingLibraryFeatureset[] = [
  'header_widget',
  'left_toolbar',
  'timeframes_toolbar',
  'control_bar',
  'pane_context_menu',
  'scales_context_menu',
  'legend_context_menu',
  'main_series_scale_menu',
  'display_market_status',
  'symbol_info',
  'legend_inplace_edit',
  'edit_buttons_in_legend',
  'show_symbol_logo_in_legend',
  'create_volume_indicator_by_default',
  'show_interval_dialog_on_key_press',
  'symbol_search_hot_key',
  'mouse_wheel_scroll',
  'mouse_wheel_scale',
  // CoW Swap's chart shares the origin, so its saved settings must not leak into this one or back
  'use_localstorage_for_settings',
  'save_chart_properties_to_local_storage',
]

interface AppliedSeries {
  bars: RwaCandle[]
  resolution: string
  chartType: RwaChartType
}

interface PriceChartProps {
  ticker: string
  /** Ascending, flat ones for a line */
  candles: RwaCandle[]
  chartType: RwaChartType
  range: RwaChartRange
  /** Shows a loader instead of an empty chart */
  loading: boolean
}

export function PriceChart({ ticker, candles, chartType, range, loading }: PriceChartProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null)
  const resolution = CHART_RESOLUTIONS[chartType][range]
  const bars = useMemo(() => alignCandles(candles, resolution), [candles, resolution])
  const barsRef = useRef(bars)
  const resolutionRef = useRef(resolution)
  const chartTypeRef = useRef(chartType)
  const appliedRef = useRef<AppliedSeries | null>(null)
  const [widget, setWidget] = useState<IChartingLibraryWidget | null>(null)
  const [hasData, setHasData] = useState(!loading)
  const [failed, setFailed] = useState(false)

  if (!loading && !hasData) setHasData(true)

  // A widget created before the data shows "No data here" until the bars are reset
  useEffect(() => {
    const container = containerRef.current

    if (!container || !hasData) return

    let cancelled = false
    let created: IChartingLibraryWidget | null = null

    loadTradingView()
      .then((TradingViewWidget) => {
        if (cancelled) return

        const overrides = {
          ...getThemeOverrides(container),
          'mainSeriesProperties.style': getSeriesType(chartTypeRef.current),
        }
        const chartWidget = new TradingViewWidget({
          container,
          datafeed: createDatafeed(ticker, barsRef),
          library_path: TRADING_VIEW_LIBRARY_PATH,
          locale: 'en',
          symbol: ticker,
          interval: resolutionRef.current as ResolutionString,
          autosize: true,
          theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
          timezone: 'Etc/UTC',
          overrides,
          loading_screen: { backgroundColor: readColor(container, '--color-bg') },
          disabled_features: DISABLED_FEATURES,
          enabled_features: ['iframe_loading_compatibility_mode'],
        })

        created = chartWidget
        appliedRef.current = {
          bars: barsRef.current,
          resolution: resolutionRef.current,
          chartType: chartTypeRef.current,
        }
        chartWidget.onChartReady(() => {
          if (cancelled) return

          const chart = chartWidget.activeChart()
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
          const timezoneApi = chart.getTimezoneApi()
          const timezone = timezoneApi.availableTimezones().find(({ id }) => id === userTimezone)

          if (timezone) timezoneApi.setTimezone(timezone.id)

          chart.onDataLoaded().subscribe(null, () => fitBars(chartWidget, barsRef.current))
          setWidget(chartWidget)
        })
      })
      .catch((err: unknown) => {
        const error = normalizeError(err)
        console.error('[rwa] Failed to load the price chart', error)

        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      appliedRef.current = null
      setWidget(null)
      created?.remove()
    }
  }, [ticker, hasData])

  useEffect(() => {
    if (loading) return

    barsRef.current = bars
    resolutionRef.current = resolution
    chartTypeRef.current = chartType

    const applied = appliedRef.current

    if (!widget || !applied) return

    appliedRef.current = { bars, resolution, chartType }

    const chart = widget.activeChart()

    if (applied.chartType !== chartType) chart.setChartType(getSeriesType(chartType)).catch(logChartError)

    if (applied.resolution !== resolution) {
      chart.setResolution(resolution as ResolutionString).catch(logChartError)
    } else if (applied.bars !== bars) {
      widget.resetCache()
      chart.resetData()
    }
  }, [widget, bars, resolution, chartType, loading])

  useChartTheme(widget, containerRef)

  if (failed) return <p className={styles.status}>Chart is unavailable</p>

  return (
    <div className={styles.frame} style={{ height: CHART_HEIGHT }}>
      <div ref={containerRef} className={styles.chart} />
      {(loading || !widget) && (
        <div className={styles.loading}>
          <Loader size={32} label="Loading chart" />
        </div>
      )}
    </div>
  )
}

function createDatafeed(ticker: string, barsRef: { readonly current: RwaCandle[] }): IBasicDataFeed {
  const symbolInfo: LibrarySymbolInfo = {
    name: ticker,
    ticker,
    description: ticker,
    type: 'stock',
    session: '24x7',
    exchange: '',
    listed_exchange: '',
    timezone: 'Etc/UTC',
    format: 'price',
    pricescale: 100,
    minmov: 1,
    has_intraday: true,
    intraday_multipliers: SUPPORTED_RESOLUTIONS.filter((resolution) => !resolution.endsWith('D')),
    has_daily: true,
    daily_multipliers: ['1'],
    supported_resolutions: SUPPORTED_RESOLUTIONS,
    visible_plots_set: 'ohlc',
    data_status: 'endofday',
  }

  return {
    onReady: (callback) => setTimeout(() => callback({ supported_resolutions: SUPPORTED_RESOLUTIONS }), 0),
    resolveSymbol: (_name, onResolve) => setTimeout(() => onResolve(symbolInfo), 0),
    searchSymbols: (_input, _exchange, _type, onResult) => onResult([]),
    getBars: (_symbolInfo, _resolution, { firstDataRequest }, onResult) => {
      const bars = firstDataRequest ? barsRef.current : []

      setTimeout(
        () =>
          onResult(
            bars.map((bar) => ({ ...bar, time: bar.time * 1000 })),
            { noData: !bars.length },
          ),
        0,
      )
    },
    subscribeBars: () => undefined,
    unsubscribeBars: () => undefined,
  }
}

function fitBars(widget: IChartingLibraryWidget, bars: RwaCandle[]): void {
  const first = bars[0]
  const last = bars[bars.length - 1]

  if (!first || !last) return

  widget.activeChart().setVisibleRange({ from: first.time, to: last.time }).catch(logChartError)
}

function getSeriesType(chartType: RwaChartType): SeriesType {
  return chartType === 'candles' ? CANDLE_SERIES : AREA_SERIES
}

function getThemeOverrides(element: HTMLElement): Overrides {
  const border = readColor(element, '--color-border')
  const positive = readColor(element, '--color-positive')
  const negative = readColor(element, '--color-negative')

  return {
    'paneProperties.background': readColor(element, '--color-bg'),
    'paneProperties.backgroundType': 'solid',
    'paneProperties.vertGridProperties.color': 'rgba(0, 0, 0, 0)',
    'paneProperties.horzGridProperties.color': border,
    'paneProperties.horzGridProperties.style': DASHED_LINE,
    'paneProperties.legendProperties.showSeriesTitle': false,
    'scalesProperties.textColor': readColor(element, '--color-text-secondary'),
    'scalesProperties.lineColor': border,
    'mainSeriesProperties.areaStyle.linecolor': readColor(element, '--color-accent'),
    'mainSeriesProperties.areaStyle.linewidth': 2,
    'mainSeriesProperties.areaStyle.color1': readColor(element, '--color-accent', 0.33),
    'mainSeriesProperties.areaStyle.color2': readColor(element, '--color-accent', 0),
    'mainSeriesProperties.candleStyle.upColor': positive,
    'mainSeriesProperties.candleStyle.downColor': negative,
    'mainSeriesProperties.candleStyle.borderUpColor': positive,
    'mainSeriesProperties.candleStyle.borderDownColor': negative,
    'mainSeriesProperties.candleStyle.wickUpColor': positive,
    'mainSeriesProperties.candleStyle.wickDownColor': negative,
  }
}

function logChartError(err: unknown): void {
  const error = normalizeError(err)
  console.error('[rwa] Price chart update failed', error)
}

function readColor(element: HTMLElement, name: string, alpha?: number): string {
  return toTradingViewColor(getComputedStyle(element).getPropertyValue(name).trim(), alpha)
}

function useChartTheme(widget: IChartingLibraryWidget | null, containerRef: RefObject<HTMLDivElement | null>): void {
  const isDark = useIsDarkTheme()

  useEffect(() => {
    const container = containerRef.current

    if (!widget || !container) return

    let cancelled = false

    widget
      .changeTheme(isDark ? 'dark' : 'light')
      .then(() => {
        if (!cancelled) widget.applyOverrides(getThemeOverrides(container))
      })
      .catch(logChartError)

    return () => {
      cancelled = true
    }
  }, [widget, containerRef, isDark])
}
