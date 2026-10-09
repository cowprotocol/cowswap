import { useAtomValue } from 'jotai'
/* eslint-disable max-lines-per-function */
import { ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { normalizeError } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import { useTheme } from 'common/hooks/useTheme'

import {
  type ChartPropertiesOverrides,
  type IChartingLibraryWidget,
  loadChartingLibraryWidget,
} from '../lib/loadChartingLibrary'
import { formatPriceChartValue, getPriceChartSummary, logPriceChart } from '../lib/priceChart.utils'
import { hasPriceChartVolume, syncTradingViewVolumeStudy } from '../lib/priceChartVolume.utils'
import { createChartSymbols } from '../lib/symbolCatalog'
import {
  PRO_CHART_CONTAINER_ID,
  PRO_CHART_CSS_PATH,
  PRO_CHART_DEFAULT_INTERVAL,
  PRO_CHART_FAVORITE_INTERVALS,
  PRO_CHART_LIBRARY_PATH,
  PRO_CHART_TIME_FRAMES,
} from '../lib/tradingView.constants'
import { createPriceChartDatafeed } from '../lib/tradingViewDatafeed.service'
import { loadSavedPriceChartState, savePriceChartState } from '../lib/tradingViewPersistence.utils'
import { PanelWrapper, ChartContainer } from '../pure/AdvancedPriceChart.styled'
import { PriceChartHeader } from '../pure/PriceChartHeader'
import { PriceChartStatus } from '../pure/PriceChartStatus'
import * as styledEl from '../pure/SimplePriceChart.styled'
import { priceChartAutoRefreshAtom } from '../state/priceChartAutoRefreshAtom'

import type { SimplePriceChartProps } from './SimplePriceChart.container'
import type { PriceChartSymbolDescriptor } from '../lib/tradingView.types'

export function AdvancedPriceChart({
  activeCurrency,
  metric,
  onSelectMetric,
  onSelectCurrency,
  onClose,
  sizeControl,
  currencies,
  supplyVariant,
}: SimplePriceChartProps): ReactNode {
  const autoRefresh = useAtomValue(priceChartAutoRefreshAtom)
  const symbols = useMemo(() => createChartSymbols(currencies), [currencies])
  const queryClient = useQueryClient()
  const activeSymbol = symbols.find(
    (symbol) =>
      activeCurrency?.equals(symbol.currency) &&
      symbol.metric === metric &&
      (metric === 'price' || symbol.supplyVariant === supplyVariant),
  )
  const { i18n } = useLingui()
  const chartId = useId().replace(/:/g, '')
  const containerId = `${PRO_CHART_CONTAINER_ID}-${chartId}`
  const [widgetError, setWidgetError] = useState(false)
  const [priceSummary, setPriceSummary] = useState<ReturnType<typeof getPriceChartSummary>>()
  const [hasVolume, setHasVolume] = useState<boolean>()
  const activeTicker = activeSymbol?.ticker || ''
  const datafeedController = useMemo(
    () =>
      createPriceChartDatafeed({
        queryClient,
        onHistoryLoaded: (bars) => {
          setPriceSummary(getPriceChartSummary(bars))
          setHasVolume(hasPriceChartVolume(bars))
        },
        symbols,
      }),
    [queryClient, symbols],
  )

  useEffect(() => {
    datafeedController.setAutoRefreshEnabled(autoRefresh)
  }, [autoRefresh, datafeedController])

  useEffect(() => {
    return () => {
      datafeedController.dispose()
    }
  }, [datafeedController])

  useEffect(() => {
    setPriceSummary(undefined)
    setHasVolume(undefined)
    datafeedController.setActiveTicker(activeTicker)
  }, [activeTicker, datafeedController])

  useTradingViewWidget(
    activeTicker,
    containerId,
    datafeedController.datafeed,
    hasVolume,
    symbols,
    i18n.locale,
    setWidgetError,
  )

  return (
    <PanelWrapper>
      <PriceChartHeader
        activeCurrency={activeCurrency}
        change={priceSummary?.change}
        metric={metric}
        onSelectMetric={onSelectMetric}
        onSelectCurrency={onSelectCurrency}
        onClose={onClose}
        price={priceSummary?.price}
        sizeControl={sizeControl}
        currencies={currencies}
      />
      <styledEl.ChartFrame>
        <ChartContainer id={containerId} />
        {widgetError ? (
          <styledEl.OverlayState>
            <PriceChartStatus assetSymbol={activeCurrency?.symbol} isPending={false} isError />
          </styledEl.OverlayState>
        ) : null}
      </styledEl.ChartFrame>
    </PanelWrapper>
  )
}

function getThemeOverrides(theme: ReturnType<typeof useTheme>): Partial<ChartPropertiesOverrides> {
  const {
    paper: backgroundColor,
    primary: primaryColor,
    text: textColor,
    border: gridColor,
    success: upColor,
    danger: downColor,
  } = theme

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
    'mainSeriesProperties.statusViewStyle.symbolTextSource': 'description',
    'mainSeriesProperties.statusViewStyle.showExchange': false,
  }
}

function useTradingViewWidget(
  activeTicker: string,
  containerId: string,
  datafeed: ReturnType<typeof createPriceChartDatafeed>['datafeed'],
  hasVolume: boolean | undefined,
  symbols: PriceChartSymbolDescriptor[],
  locale: string,
  setWidgetError: (error: boolean) => void,
): void {
  const theme = useTheme()
  const themeRef = useRef(theme)
  const hasVolumeRef = useRef(hasVolume)
  hasVolumeRef.current = hasVolume
  themeRef.current = theme
  const widgetRef = useRef<IChartingLibraryWidget | null>(null)
  const initialTickerRef = useRef(activeTicker)
  const isWidgetReadyRef = useRef(false)

  initialTickerRef.current = activeTicker

  useEffect(() => {
    if (!symbols.length) return

    const currentTheme = themeRef.current
    const backgroundColor = currentTheme.paper
    const savedChartState = loadSavedPriceChartState()
    let widget: IChartingLibraryWidget | null = null
    let isCancelled = false
    const handleAutoSaveNeeded = (): void => {
      widget?.save((state) => {
        savePriceChartState(state)
      })
    }
    const setup = async (): Promise<void> => {
      const TradingViewWidget = await loadChartingLibraryWidget()

      if (isCancelled) return

      widget = new TradingViewWidget({
        autosize: true,
        container: containerId,
        custom_css_url: PRO_CHART_CSS_PATH,
        custom_formatters: {
          priceFormatterFactory: () => ({
            format: (value: number) => formatPriceChartValue(value, locale),
          }),
        },
        datafeed,
        disabled_features: [
          'create_volume_indicator_by_default',
          'display_market_status',
          'header_compare',
          'header_symbol_search',
          'show_symbol_logo_in_legend',
          'symbol_search_hot_key',
        ],
        enabled_features: [
          'hide_resolution_in_legend',
          'iframe_loading_compatibility_mode',
          'timeframes_toolbar',
          'header_in_fullscreen_mode',
          'side_toolbar_in_fullscreen_mode',
        ],
        favorites: {
          chartTypes: ['Candles', 'LineWithMarkers', 'Baseline'],
          intervals: PRO_CHART_FAVORITE_INTERVALS,
        },
        auto_save_delay: 5,
        interval: PRO_CHART_DEFAULT_INTERVAL,
        library_path: PRO_CHART_LIBRARY_PATH,
        loading_screen: {
          backgroundColor,
          foregroundColor: currentTheme.primary,
        },
        locale: 'en',
        overrides: getThemeOverrides(currentTheme),
        saved_data: savedChartState,
        symbol: initialTickerRef.current || symbols[0].ticker,
        theme: currentTheme.darkMode ? 'dark' : 'light',
        time_frames: PRO_CHART_TIME_FRAMES,
        timezone: 'Etc/UTC',
      })

      widget.subscribe('onAutoSaveNeeded', handleAutoSaveNeeded)

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

        widget.applyOverrides(getThemeOverrides(themeRef.current))
        widget.activeChart().setSymbol(nextTicker, () => {
          if (widget && hasVolumeRef.current !== undefined) {
            syncTradingViewVolumeStudy(widget, hasVolumeRef.current)
          }
        })
      })

      widgetRef.current = widget
    }

    void setup().catch((err: unknown) => {
      const error = normalizeError(err)
      logPriceChart.warn('Failed to load Advanced chart', error)
      if (!isCancelled) setWidgetError(true)
    })

    return () => {
      isCancelled = true

      try {
        const wasWidgetReady = isWidgetReadyRef.current
        isWidgetReadyRef.current = false
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
  }, [containerId, datafeed, locale, symbols, setWidgetError])

  useEffect(() => {
    const widget = widgetRef.current

    if (!widget || !activeTicker || !isWidgetReadyRef.current) return

    if (widget.activeChart().symbol() !== activeTicker) {
      widget.activeChart().setSymbol(activeTicker, () => {})
      return
    }
  }, [activeTicker])

  useEffect(() => {
    const widget = widgetRef.current

    if (!widget || !isWidgetReadyRef.current) {
      return
    }

    void widget.changeTheme(theme.darkMode ? 'dark' : 'light').then(() => {
      widget.applyOverrides(getThemeOverrides(theme))
    })
  }, [theme])

  useEffect(() => {
    const widget = widgetRef.current

    if (!widget || !isWidgetReadyRef.current || hasVolume === undefined) {
      return
    }

    syncTradingViewVolumeStudy(widget, hasVolume)
  }, [hasVolume])
}
