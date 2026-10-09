/* eslint-disable max-lines-per-function */
import { type ReactNode, useEffect, useId, useRef } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'

import { useTheme } from 'common/hooks/useTheme'

import * as styledEl from './AdvancedChartCanvas.styled'

import {
  ADVANCED_CHART_CONTAINER_ID,
  ADVANCED_CHART_CSS_PATH,
  ADVANCED_CHART_DEFAULT_INTERVAL,
  ADVANCED_CHART_FAVORITE_INTERVALS,
  ADVANCED_CHART_LIBRARY_PATH,
  ADVANCED_CHART_TIME_FRAMES,
} from '../config/priceChartAdvanced.constants'
import { formatPriceChartValue, logPriceChart } from '../lib/priceChart.utils'
import { loadChartLayout, saveChartLayout } from '../lib/priceChartAdvancedLayout.utils'
import { loadAdvancedChartWidget } from '../lib/priceChartAdvancedWidget.service'

import type {
  ChartPropertiesOverrides,
  IBasicDataFeed,
  IChartingLibraryWidget,
} from '../lib/priceChartAdvancedApi.types'
import type { ChartSymbol } from '../lib/priceChartAdvancedSymbols.utils'

export interface AdvancedChartCanvasProps {
  activeTicker: string
  datafeed: IBasicDataFeed
  hasVolume: boolean | undefined
  symbols: ChartSymbol[]
  locale: string
  onError: (error: boolean) => void
}

export function AdvancedChartCanvas({
  activeTicker,
  datafeed,
  hasVolume,
  symbols,
  locale,
  onError,
}: AdvancedChartCanvasProps): ReactNode {
  const chartId = useId().replace(/:/g, '')
  const containerId = `${ADVANCED_CHART_CONTAINER_ID}-${chartId}`
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
    const savedChartState = loadChartLayout()
    let widget: IChartingLibraryWidget | null = null
    let isCancelled = false
    const handleAutoSaveNeeded = (): void => {
      widget?.save((state) => {
        saveChartLayout(state)
      })
    }
    const setup = async (): Promise<void> => {
      const TradingViewWidget = await loadAdvancedChartWidget()

      if (isCancelled) return

      widget = new TradingViewWidget({
        autosize: true,
        container: containerId,
        custom_css_url: ADVANCED_CHART_CSS_PATH,
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
          intervals: ADVANCED_CHART_FAVORITE_INTERVALS,
        },
        auto_save_delay: 5,
        interval: ADVANCED_CHART_DEFAULT_INTERVAL,
        library_path: ADVANCED_CHART_LIBRARY_PATH,
        loading_screen: {
          backgroundColor,
          foregroundColor: currentTheme.primary,
        },
        locale: 'en',
        overrides: getThemeOverrides(currentTheme),
        saved_data: savedChartState,
        symbol: initialTickerRef.current || symbols[0].ticker,
        theme: currentTheme.darkMode ? 'dark' : 'light',
        time_frames: ADVANCED_CHART_TIME_FRAMES,
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

        // Saved layouts can restore a different theme than the constructor option.
        void widget.changeTheme(themeRef.current.darkMode ? 'dark' : 'light').then(() => {
          if (!isCancelled) widget?.applyOverrides(getThemeOverrides(themeRef.current))
        })
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
      if (!isCancelled) onError(true)
    })

    return () => {
      isCancelled = true

      try {
        const wasWidgetReady = isWidgetReadyRef.current
        isWidgetReadyRef.current = false
        if (wasWidgetReady) {
          widget?.save((state) => {
            saveChartLayout(state)
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
  }, [containerId, datafeed, locale, symbols, onError])

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

  return <styledEl.ChartContainer id={containerId} />
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

const VOLUME_STUDY_NAME = 'Volume'

function syncTradingViewVolumeStudy(widget: IChartingLibraryWidget, hasVolume: boolean): void {
  const chart = widget.activeChart()
  const volumeStudies = chart.getAllStudies().filter((study) => study.name === VOLUME_STUDY_NAME)

  if (hasVolume) {
    if (!volumeStudies.length) {
      void chart.createStudy(VOLUME_STUDY_NAME, true, false)
    }

    volumeStudies.forEach((study) => chart.getStudyById(study.id).mergeUp())
    return
  }

  volumeStudies.forEach((study) => chart.removeEntity(study.id, { disableUndo: true }))
}
