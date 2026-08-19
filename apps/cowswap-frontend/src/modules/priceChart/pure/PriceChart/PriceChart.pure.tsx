/* eslint-disable max-lines-per-function */
import { MutableRefObject, ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react'

import { UI } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'

import { useTheme } from 'common/hooks/useTheme'

import * as styledEl from './PriceChart.styled'
import { PriceChartHeader } from './PriceChartHeader.pure'
import { PriceChartStatus } from './PriceChartStatus.pure'

import { logPriceChart } from '../../api'
import {
  type ChartPropertiesOverrides,
  type CustomFormatters,
  type IChartingLibraryWidget,
  loadChartingLibraryWidget,
} from '../../lib/charting_library'
import { formatPriceChartValue, getPriceChartSummary } from '../../lib/priceSummary.utils'
import {
  PRO_CHART_CONTAINER_ID,
  PRO_CHART_CSS_PATH,
  PRO_CHART_DEFAULT_INTERVAL,
  PRO_CHART_FAVORITE_INTERVALS,
  PRO_CHART_LIBRARY_PATH,
  PRO_CHART_TIME_FRAMES,
} from '../../lib/tradingView.constants'
import { createPriceChartDatafeed } from '../../lib/tradingViewDatafeed.service'
import { loadSavedPriceChartState, savePriceChartState } from '../../lib/tradingViewPersistence.utils'

import type { PriceChartSummary } from '../../lib/priceChart.types'
import type {
  PriceChartHistoryStatus,
  PriceChartPureProps,
  PriceChartSymbolDescriptor,
} from '../../lib/tradingView.types'

type PriceChartShapeId = ReturnType<ReturnType<IChartingLibraryWidget['activeChart']>['createShape']>

interface SyncHorizontalLineParams {
  color: string
  entityIdRef: MutableRefObject<PriceChartShapeId>
  logKey: string
  price: number | null | undefined
  style: 0 | 1 | 2
  ticker: string
  widget: IChartingLibraryWidget | null
}

export function PriceChartPure({
  activeSymbol,
  limitLinePrice,
  metric,
  onSelectMetric,
  onSelectPrice,
  onSelectSelection,
  sizeControl,
  symbols,
}: PriceChartPureProps): ReactNode {
  const { darkMode } = useTheme()
  const { i18n } = useLingui()
  const chartId = useId().replace(/:/g, '')
  const containerId = `${PRO_CHART_CONTAINER_ID}-${chartId}`
  const [historyStatus, setHistoryStatus] = useState<PriceChartHistoryStatus>(null)
  const [priceSummary, setPriceSummary] = useState<PriceChartSummary>()
  const activeTicker = activeSymbol?.ticker || ''
  const datafeedController = useMemo(
    () =>
      createPriceChartDatafeed({
        metric,
        onHistoryLoaded: (bars) => setPriceSummary(getPriceChartSummary(bars)),
        onStatusChange: setHistoryStatus,
        symbols,
      }),
    [metric, symbols],
  )

  useEffect(() => {
    return () => {
      datafeedController.dispose()
    }
  }, [datafeedController])

  useEffect(() => {
    setHistoryStatus(null)
    setPriceSummary(undefined)
  }, [activeTicker, metric])

  useTradingViewWidget(
    activeTicker,
    containerId,
    datafeedController.datafeed,
    darkMode,
    metric === 'price' ? limitLinePrice : null,
    metric === 'price' ? onSelectPrice : undefined,
    symbols,
    metric,
    i18n.locale,
  )

  if (!symbols.length) {
    return <styledEl.EmptyState>Select both tokens to load the TradingView chart.</styledEl.EmptyState>
  }

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
        <styledEl.ChartContainer id={containerId} />
        {historyStatus ? (
          <styledEl.OverlayState>
            <PriceChartStatus assetSymbol={activeSymbol?.baseAsset.symbol} kind={historyStatus} />
          </styledEl.OverlayState>
        ) : null}
      </styledEl.ChartFrame>
    </styledEl.PanelWrapper>
  )
}

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

function removeHorizontalLine(
  widget: IChartingLibraryWidget | null,
  entityIdRef: MutableRefObject<PriceChartShapeId>,
): void {
  if (!widget || !entityIdRef.current) {
    return
  }

  widget.activeChart().removeEntity(entityIdRef.current, { disableUndo: true })
  entityIdRef.current = null
}

function syncHorizontalLine({
  color,
  entityIdRef,
  logKey,
  price,
  style,
  ticker,
  widget,
}: SyncHorizontalLineParams): void {
  removeHorizontalLine(widget, entityIdRef)

  if (!widget || price === null || price === undefined) {
    logPriceChart.debug(logKey, { price: null, ticker })
    return
  }

  const entityId = widget.activeChart().createShape(
    {
      price,
      time: Math.floor(Date.now() / 1000),
    },
    {
      disableSave: true,
      disableSelection: true,
      disableUndo: true,
      lock: true,
      overrides: {
        'linetoolhorzline.linecolor': color,
        'linetoolhorzline.linestyle': style,
        'linetoolhorzline.linewidth': 2,
        'linetoolhorzline.showPrice': true,
      },
      shape: 'horizontal_line',
      showInObjectsTree: false,
      zOrder: 'top',
    },
  )

  entityIdRef.current = entityId
  logPriceChart.debug(logKey, { created: !!entityId, price, ticker })
}

function useTradingViewWidget(
  activeTicker: string,
  containerId: string,
  datafeed: ReturnType<typeof createPriceChartDatafeed>['datafeed'],
  darkMode: boolean,
  limitLinePrice: number | null | undefined,
  onSelectPrice: ((price: number) => void) | undefined,
  symbols: PriceChartSymbolDescriptor[],
  metric: PriceChartPureProps['metric'],
  locale: string,
): void {
  const widgetRef = useRef<IChartingLibraryWidget | null>(null)
  const initialTickerRef = useRef(activeTicker)
  const isWidgetReadyRef = useRef(false)
  const limitLineEntityIdRef = useRef<PriceChartShapeId>(null)
  const latestCrosshairPriceRef = useRef<number | null>(null)
  const latestOnSelectPriceRef = useRef<typeof onSelectPrice>(onSelectPrice)

  initialTickerRef.current = activeTicker
  latestOnSelectPriceRef.current = onSelectPrice

  useEffect(() => {
    if (!symbols.length) return

    const backgroundColor = getCssVar(UI.COLOR_PAPER, '#111827')
    const savedChartState = loadSavedPriceChartState()
    let widget: IChartingLibraryWidget | null = null
    let isCancelled = false
    let isCrosshairSubscribed = false
    const handleAutoSaveNeeded = (): void => {
      widget?.save((state) => {
        savePriceChartState(state)
      })
    }
    const handleCrossHairMoved = ({ price }: { price: number }): void => {
      latestCrosshairPriceRef.current = Number.isFinite(price) ? price : null
    }
    const handleChartMouseUp = (): void => {
      if (!latestOnSelectPriceRef.current || latestCrosshairPriceRef.current === null) {
        return
      }

      logPriceChart.debug('Selected limit price from chart click', {
        price: latestCrosshairPriceRef.current,
        ticker: initialTickerRef.current || symbols[0]?.ticker,
      })

      latestOnSelectPriceRef.current(latestCrosshairPriceRef.current)
    }

    const setup = async (): Promise<void> => {
      const TradingViewWidget = await loadChartingLibraryWidget()

      if (isCancelled) return

      widget = new TradingViewWidget({
        autosize: true,
        container: containerId,
        custom_css_url: PRO_CHART_CSS_PATH,
        // TradingView accepts partial custom formatters, but its bundled type requires date and time formatters.
        custom_formatters: {
          priceFormatterFactory: () => ({
            format: (value: number) => formatPriceChartValue(value, locale),
          }),
        } as unknown as CustomFormatters,
        datafeed,
        disabled_features: [
          'display_market_status',
          'header_compare',
          'header_symbol_search',
          'show_symbol_logo_in_legend',
          'symbol_search_hot_key',
        ],
        enabled_features: ['hide_resolution_in_legend', 'iframe_loading_compatibility_mode', 'timeframes_toolbar'],
        favorites: {
          chartTypes: ['Candles', 'LineWithMarkers', 'Baseline'],
          intervals: PRO_CHART_FAVORITE_INTERVALS,
        },
        auto_save_delay: 5,
        interval: PRO_CHART_DEFAULT_INTERVAL,
        library_path: PRO_CHART_LIBRARY_PATH,
        loading_screen: {
          backgroundColor,
          foregroundColor: getCssVar(UI.COLOR_PRIMARY, '#3b82f6'),
        },
        locale: 'en',
        overrides: getThemeOverrides(),
        saved_data: savedChartState,
        symbol: initialTickerRef.current || symbols[0].ticker,
        theme: isDarkColor(backgroundColor) ? 'dark' : 'light',
        time_frames: PRO_CHART_TIME_FRAMES,
        timezone: 'Etc/UTC',
      })

      widget.subscribe('onAutoSaveNeeded', handleAutoSaveNeeded)
      widget.subscribe('mouse_up', handleChartMouseUp)

      widget.onChartReady(() => {
        if (isCancelled) {
          widget?.remove()
          widget = null
          return
        }

        isWidgetReadyRef.current = true

        const nextTicker = initialTickerRef.current || symbols[0].ticker

        if (!widget) {
          return
        }

        widget.activeChart().crossHairMoved().subscribe(null, handleCrossHairMoved)
        isCrosshairSubscribed = true
        widget.activeChart().setSymbol(nextTicker, () => {
          syncHorizontalLine({
            color: getCssVar(UI.COLOR_WARNING, '#f59e0b'),
            entityIdRef: limitLineEntityIdRef,
            logKey: 'Sync limit price line',
            price: limitLinePrice,
            style: 2,
            ticker: nextTicker,
            widget,
          })
        })
      })

      widgetRef.current = widget
    }

    void setup()

    return () => {
      isCancelled = true

      try {
        const wasWidgetReady = isWidgetReadyRef.current
        isWidgetReadyRef.current = false
        removeHorizontalLine(widget, limitLineEntityIdRef)
        if (widget && isCrosshairSubscribed) {
          widget.activeChart().crossHairMoved().unsubscribe(null, handleCrossHairMoved)
        }
        widget?.unsubscribe('mouse_up', handleChartMouseUp)
        if (wasWidgetReady) {
          widget?.save((state) => {
            savePriceChartState(state)
          })
        }
        widget?.unsubscribe('onAutoSaveNeeded', handleAutoSaveNeeded)
        if (wasWidgetReady) {
          widget?.remove()
          widget = null
        }
      } catch {
      } finally {
        widgetRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, datafeed, locale, metric, symbols])

  useEffect(() => {
    const widget = widgetRef.current

    if (!widget || !activeTicker || !isWidgetReadyRef.current) return

    if (widget.activeChart().symbol() !== activeTicker) {
      widget.activeChart().setSymbol(activeTicker, () => {
        syncHorizontalLine({
          color: getCssVar(UI.COLOR_WARNING, '#f59e0b'),
          entityIdRef: limitLineEntityIdRef,
          logKey: 'Sync limit price line',
          price: limitLinePrice,
          style: 2,
          ticker: activeTicker,
          widget,
        })
      })
      return
    }

    syncHorizontalLine({
      color: getCssVar(UI.COLOR_WARNING, '#f59e0b'),
      entityIdRef: limitLineEntityIdRef,
      logKey: 'Sync limit price line',
      price: limitLinePrice,
      style: 2,
      ticker: activeTicker,
      widget,
    })
  }, [activeTicker, limitLinePrice])

  useEffect(() => {
    const widget = widgetRef.current

    if (!widget || !isWidgetReadyRef.current) {
      return
    }

    void widget.changeTheme(darkMode ? 'dark' : 'light').then(() => {
      widget.applyOverrides(getThemeOverrides())
    })
  }, [darkMode])
}
