/* eslint-disable max-lines-per-function */
import { type ReactNode, useEffect, useId, useRef } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'

import { useTheme } from 'common/hooks/useTheme'

import * as styledEl from './AdvancedChartCanvas.styled'

import { ADVANCED_CHART_CONTAINER_ID, ADVANCED_CHART_OPTIONS } from '../config/priceChartAdvanced.constants'
import { formatPriceChartValue, logPriceChart } from '../lib/priceChart.utils'
import { loadChartLayout, saveChartLayout } from '../lib/priceChartAdvancedLayout.utils'
import { loadAdvancedChartWidget } from '../lib/priceChartAdvancedWidget.service'

import type { ChartSymbol } from '../lib/priceChartAdvancedSymbols.utils'
import type { ChartPropertiesOverrides, IBasicDataFeed, IChartingLibraryWidget, Overrides } from 'charting_library'

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

      const currentTheme = themeRef.current
      const overrides = getThemeOverrides(currentTheme)
      widget = new TradingViewWidget({
        ...ADVANCED_CHART_OPTIONS,
        container: containerId,
        custom_css_url: new URL('/tv.css', window.location.href).href,
        custom_formatters: {
          priceFormatterFactory: () => ({
            format: (value: number) => formatPriceChartValue(value, locale),
          }),
        },
        datafeed,
        loading_screen: {
          backgroundColor: currentTheme.paper,
          foregroundColor: currentTheme.primary,
        },
        overrides,
        settings_overrides: overrides,
        saved_data: loadChartLayout(overrides),
        symbol: initialTickerRef.current || symbols[0].ticker,
        theme: currentTheme.darkMode ? 'dark' : 'light',
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

        if (currentTheme.darkMode !== themeRef.current.darkMode) {
          widget.changeTheme(themeRef.current.darkMode ? 'dark' : 'light').then(() => {
            if (!isCancelled && widget) widget.applyOverrides(getThemeOverrides(themeRef.current))
          })
        } else {
          widget.applyOverrides(getThemeOverrides(themeRef.current))
        }
        widget.activeChart().setSymbol(nextTicker, () => {
          if (widget && hasVolumeRef.current !== undefined) {
            syncTradingViewVolumeStudy(widget, hasVolumeRef.current)
          }
        })
      })

      widgetRef.current = widget
    }

    setup().catch((err: unknown) => {
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

    widget.changeTheme(theme.darkMode ? 'dark' : 'light').then(() => {
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

function getThemeOverrides(theme: ReturnType<typeof useTheme>): Partial<ChartPropertiesOverrides> & Overrides {
  const { paper: backgroundColor, primary: primaryColor, text: textColor, border: gridColor } = theme

  return {
    ...ADVANCED_CHART_OPTIONS.overrides,
    'paneProperties.background': backgroundColor,
    'paneProperties.backgroundType': 'solid',
    'paneProperties.vertGridProperties.color': gridColor,
    'paneProperties.horzGridProperties.color': gridColor,
    'scalesProperties.textColor': textColor,
    'scalesProperties.lineColor': gridColor,
    'symbolWatermarkProperties.color': primaryColor,
  }
}

const VOLUME_STUDY_NAME = 'Volume'

function syncTradingViewVolumeStudy(widget: IChartingLibraryWidget, hasVolume: boolean): void {
  const chart = widget.activeChart()
  const volumeStudies = chart.getAllStudies().filter((study) => study.name === VOLUME_STUDY_NAME)

  if (hasVolume) {
    if (!volumeStudies.length) {
      chart.createStudy(VOLUME_STUDY_NAME, true, false)
    }

    volumeStudies.forEach((study) => chart.getStudyById(study.id).mergeUp())
    return
  }

  volumeStudies.forEach((study) => chart.removeEntity(study.id, { disableUndo: true }))
}
