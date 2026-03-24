import { ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react'

import { UI } from '@cowprotocol/ui'

import * as styledEl from './PriceChart.styled'

import {
  type ChartPropertiesOverrides,
  type IChartingLibraryWidget,
  loadChartingLibraryWidget,
} from '../../lib/charting_library'
import { findChartSymbol } from '../../lib/symbolCatalog'
import {
  PRO_CHART_CONTAINER_ID,
  PRO_CHART_CSS_PATH,
  PRO_CHART_DEFAULT_INTERVAL,
  PRO_CHART_FAVORITE_INTERVALS,
  PRO_CHART_LIBRARY_PATH,
  PRO_CHART_TIME_FRAMES,
} from '../../lib/tradingView.constants'
import { createPriceChartDatafeed } from '../../lib/tradingViewDatafeed.service'

import type {
  PriceChartHistoryStatus,
  PriceChartPureProps,
  PriceChartSymbolDescriptor,
} from '../../lib/tradingView.types'

function getCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback

  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  return value || fallback
}

function getThemeOverrides(): Partial<ChartPropertiesOverrides> {
  const backgroundColor = getCssVar(UI.COLOR_PAPER, '#111827')
  const primaryColor = getCssVar(UI.COLOR_PRIMARY, '#3b82f6')
  const textColor = getCssVar(UI.COLOR_TEXT, '#f8fafc')
  const gridColor = getCssVar(UI.COLOR_BORDER, '#243041')
  const upColor = getCssVar(UI.COLOR_SUCCESS, '#22c55e')
  const downColor = getCssVar(UI.COLOR_DANGER, '#ef4444')

  return {
    'mainSeriesProperties.candleStyle.borderDownColor': downColor,
    'mainSeriesProperties.candleStyle.borderUpColor': upColor,
    'mainSeriesProperties.candleStyle.downColor': downColor,
    'mainSeriesProperties.candleStyle.upColor': upColor,
    'mainSeriesProperties.candleStyle.wickDownColor': downColor,
    'mainSeriesProperties.candleStyle.wickUpColor': upColor,
    'paneProperties.background': backgroundColor,
    'paneProperties.backgroundType': 'solid',
    'paneProperties.vertGridProperties.color': gridColor,
    'paneProperties.horzGridProperties.color': gridColor,
    'scalesProperties.textColor': textColor,
    'scalesProperties.lineColor': gridColor,
    'symbolWatermarkProperties.color': primaryColor,
  }
}

function isDarkColor(hexOrRgb: string): boolean {
  const rgb = hexOrRgb.match(/\d+/g)

  if (rgb && rgb.length >= 3) {
    const [red, green, blue] = rgb.slice(0, 3).map(Number)
    return red * 0.299 + green * 0.587 + blue * 0.114 < 160
  }

  const normalized = hexOrRgb.replace('#', '')

  if (normalized.length === 6) {
    const red = parseInt(normalized.slice(0, 2), 16)
    const green = parseInt(normalized.slice(2, 4), 16)
    const blue = parseInt(normalized.slice(4, 6), 16)
    return red * 0.299 + green * 0.587 + blue * 0.114 < 160
  }

  return true
}

function getSubtitle(
  activeSymbol: PriceChartSymbolDescriptor | undefined,
  historyStatus: PriceChartHistoryStatus,
): string {
  if (!activeSymbol) {
    return 'Select both tokens to load Codex-backed price history.'
  }

  if (historyStatus.kind === 'ready' && historyStatus.message) {
    return historyStatus.message
  }

  if (activeSymbol.quoteAsset.kind === 'usd') {
    return `Codex-backed ${activeSymbol.ticker} history inside TradingView.`
  }

  return `Codex-backed ${activeSymbol.baseAsset.symbol} history, with USD fallback when direct ${activeSymbol.ticker} bars are unavailable.`
}

function getVisibleHistoryStatus(activeTicker: string, historyStatus: PriceChartHistoryStatus): PriceChartHistoryStatus {
  if (!activeTicker || !historyStatus.ticker || historyStatus.ticker === activeTicker) {
    return historyStatus
  }

  return { kind: 'idle' }
}

function useTradingViewWidget(
  activeTicker: string,
  containerId: string,
  datafeed: ReturnType<typeof createPriceChartDatafeed>['datafeed'],
  symbols: PriceChartSymbolDescriptor[],
): void {
  const widgetRef = useRef<IChartingLibraryWidget | null>(null)
  const initialTickerRef = useRef(activeTicker)
  const isWidgetReadyRef = useRef(false)

  initialTickerRef.current = activeTicker

  useEffect(() => {
    if (!symbols.length) return

    const backgroundColor = getCssVar(UI.COLOR_PAPER, '#111827')
    let widget: IChartingLibraryWidget | null = null
    let isCancelled = false

    const setup = async (): Promise<void> => {
      const TradingViewWidget = await loadChartingLibraryWidget()

      if (isCancelled) return

      widget = new TradingViewWidget({
        autosize: true,
        container: containerId,
        custom_css_url: PRO_CHART_CSS_PATH,
        custom_font_family: 'ui-monospace, SFMono-Regular, monospace',
        datafeed,
        disabled_features: [
          'display_market_status',
          'header_compare',
          'header_symbol_search',
          'show_symbol_logo_in_legend',
          'symbol_search_hot_key',
        ],
        enabled_features: ['hide_resolution_in_legend', 'timeframes_toolbar'],
        favorites: {
          chartTypes: ['Candles', 'LineWithMarkers', 'Baseline'],
          intervals: PRO_CHART_FAVORITE_INTERVALS,
        },
        interval: PRO_CHART_DEFAULT_INTERVAL,
        library_path: PRO_CHART_LIBRARY_PATH,
        loading_screen: {
          backgroundColor,
          foregroundColor: getCssVar(UI.COLOR_PRIMARY, '#3b82f6'),
        },
        locale: 'en',
        overrides: getThemeOverrides(),
        symbol: initialTickerRef.current || symbols[0].ticker,
        theme: isDarkColor(backgroundColor) ? 'dark' : 'light',
        time_frames: PRO_CHART_TIME_FRAMES,
        timezone: 'Etc/UTC',
      })

      widget.onChartReady(() => {
        isWidgetReadyRef.current = true

        const nextTicker = initialTickerRef.current || symbols[0].ticker

        if (widget && widget.activeChart().symbol() !== nextTicker) {
          widget.activeChart().setSymbol(nextTicker)
        }
      })

      widgetRef.current = widget
    }

    void setup()

    return () => {
      isCancelled = true

      try {
        isWidgetReadyRef.current = false
        widget?.remove()
      } catch {
      } finally {
        widgetRef.current = null
      }
    }
  }, [containerId, datafeed, symbols])

  useEffect(() => {
    const widget = widgetRef.current

    if (!widget || !activeTicker || !isWidgetReadyRef.current) return

    if (widget.activeChart().symbol() !== activeTicker) {
      widget.activeChart().setSymbol(activeTicker)
    }
  }, [activeTicker])
}

export function PriceChartPure({ activeTicker, onSelectTicker, symbols }: PriceChartPureProps): ReactNode {
  const chartId = useId().replace(/:/g, '')
  const containerId = `${PRO_CHART_CONTAINER_ID}-${chartId}`
  const [historyStatus, setHistoryStatus] = useState<PriceChartHistoryStatus>({ kind: 'idle' })
  const datafeedController = useMemo(
    () =>
      createPriceChartDatafeed({
        onStatusChange: setHistoryStatus,
        symbols,
      }),
    [symbols],
  )
  const activeSymbol = useMemo(() => findChartSymbol(symbols, activeTicker) || symbols[0], [activeTicker, symbols])
  const visibleHistoryStatus = useMemo(
    () => getVisibleHistoryStatus(activeTicker, historyStatus),
    [activeTicker, historyStatus],
  )
  const subtitle = useMemo(() => getSubtitle(activeSymbol, visibleHistoryStatus), [activeSymbol, visibleHistoryStatus])

  useEffect(() => {
    return () => {
      datafeedController.dispose()
    }
  }, [datafeedController])

  useEffect(() => {
    if (!activeTicker) {
      setHistoryStatus({ kind: 'idle' })
      return
    }

    setHistoryStatus((currentStatus) => {
      if (currentStatus.ticker === activeTicker) {
        return currentStatus
      }

      return { kind: 'idle', ticker: activeTicker }
    })
  }, [activeTicker])

  useTradingViewWidget(activeTicker, containerId, datafeedController.datafeed, symbols)

  if (!symbols.length) {
    return <styledEl.EmptyState>Select both tokens to load the TradingView chart.</styledEl.EmptyState>
  }

  return (
    <styledEl.PanelWrapper>
      <styledEl.Header>
        <styledEl.Heading>
          <styledEl.Title>Price chart</styledEl.Title>
          <styledEl.Subtitle>{subtitle}</styledEl.Subtitle>
        </styledEl.Heading>
        <styledEl.SymbolList>
          {symbols.map((symbol) => (
            <styledEl.SymbolButton
              $isActive={symbol.ticker === activeTicker}
              key={symbol.ticker}
              onClick={() => onSelectTicker(symbol.ticker)}
              type="button"
            >
              {symbol.ticker}
            </styledEl.SymbolButton>
          ))}
        </styledEl.SymbolList>
      </styledEl.Header>
      {visibleHistoryStatus.kind !== 'idle' && visibleHistoryStatus.message ? (
        <styledEl.StatusBanner
          $kind={visibleHistoryStatus.kind === 'ready' ? 'ready' : visibleHistoryStatus.kind}
        >
          {visibleHistoryStatus.message}
        </styledEl.StatusBanner>
      ) : null}
      <styledEl.ChartFrame>
        <styledEl.ChartContainer id={containerId} />
        {visibleHistoryStatus.kind === 'loading' ||
        visibleHistoryStatus.kind === 'empty' ||
        visibleHistoryStatus.kind === 'error' ? (
          <styledEl.OverlayState>{visibleHistoryStatus.message}</styledEl.OverlayState>
        ) : null}
      </styledEl.ChartFrame>
    </styledEl.PanelWrapper>
  )
}
