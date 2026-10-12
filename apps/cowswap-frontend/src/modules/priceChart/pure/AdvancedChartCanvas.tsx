import { type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'

import { useTheme } from 'common/hooks/useTheme'

import * as styledEl from './AdvancedChartCanvas.styled'

import { ADVANCED_CHART_CONTAINER_ID, ADVANCED_CHART_OPTIONS } from '../config/priceChartAdvanced.constants'
import { usePriceChartAdvancedPriceSelection } from '../hooks/usePriceChartAdvancedPriceSelection'
import { usePriceChartAdvancedReferenceLines } from '../hooks/usePriceChartAdvancedReferenceLines'
import { usePriceChartAdvancedSeries } from '../hooks/usePriceChartAdvancedSeries'
import { usePriceChartAdvancedTheme } from '../hooks/usePriceChartAdvancedTheme'
import { formatPriceChartValue, logPriceChart } from '../lib/priceChart.utils'
import { loadChartLayout, saveChartLayout } from '../lib/priceChartAdvancedLayout.utils'
import { loadAdvancedChartWidget } from '../lib/priceChartAdvancedWidget.service'
import { getThemeOverrides } from '../lib/priceChartAdvancedWidget.utils'

import type { PriceChartReferenceLine } from '../lib/priceChart.types'
import type { ChartSymbol } from '../lib/priceChartAdvancedSymbols.utils'
import type { IBasicDataFeed, IChartingLibraryWidget, Timezone } from 'charting_library'

export interface AdvancedChartCanvasProps {
  activeTicker: string
  onSelectPrice?: (price: number) => void
  referenceLines: PriceChartReferenceLine<number>[]
  datafeed: IBasicDataFeed
  hasVolume: boolean | undefined
  symbols: ChartSymbol[]
  locale: string
  onError: (error: boolean) => void
}

export function AdvancedChartCanvas({
  activeTicker,
  onSelectPrice,
  referenceLines,
  datafeed,
  hasVolume,
  symbols,
  locale,
  onError,
}: AdvancedChartCanvasProps): ReactNode {
  const chartId = useId().replace(/:/g, '')
  const containerId = `${ADVANCED_CHART_CONTAINER_ID}-${chartId}`
  const theme = useTheme()
  const latestRef = useRef({ theme, activeTicker })
  const [readyWidget, setReadyWidget] = useState<IChartingLibraryWidget | null>(null)

  useEffect(() => {
    latestRef.current = { theme, activeTicker }
  }, [theme, activeTicker])

  useEffect(() => {
    if (!symbols.length) return

    let widget: IChartingLibraryWidget | null = null
    let cancelled = false
    let ready = false
    const saveLayout = (): Promise<void> => widget?.save().then(saveChartLayout) ?? Promise.resolve()
    const handleSaveError = (err: unknown): void => {
      const error = normalizeError(err)
      logPriceChart.warn('Failed to save Advanced chart layout', error)
    }
    const handleAutoSaveNeeded = (): void => {
      saveLayout().catch(handleSaveError)
    }

    async function setup(): Promise<void> {
      const TradingViewWidget = await loadAdvancedChartWidget()
      if (cancelled) return

      const { theme: currentTheme, activeTicker: currentTicker } = latestRef.current
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone
      const overrides = { ...getThemeOverrides(currentTheme), timezone }
      widget = new TradingViewWidget({
        ...ADVANCED_CHART_OPTIONS,
        container: containerId,
        custom_css_url: new URL('/tv.css', window.location.href).href,
        custom_formatters: {
          priceFormatterFactory: () => ({ format: (value: number) => formatPriceChartValue(value, locale) }),
        },
        datafeed,
        loading_screen: { backgroundColor: currentTheme.paper, foregroundColor: currentTheme.primary },
        overrides,
        settings_overrides: overrides,
        saved_data: loadChartLayout(overrides),
        symbol: currentTicker || symbols[0].ticker,
        theme: currentTheme.darkMode ? 'dark' : 'light',
        timezone,
      })
      widget.subscribe('onAutoSaveNeeded', handleAutoSaveNeeded)
      await widget.chartReady()

      if (cancelled) {
        widget.remove()
        widget = null
        return
      }
      widget.activeChart().getTimezoneApi().setTimezone(timezone)
      ready = true
      setReadyWidget(widget)
    }

    setup().catch((err: unknown) => {
      const error = normalizeError(err)
      logPriceChart.warn('Failed to load Advanced chart', error)
      if (!cancelled) onError(true)
    })

    return () => {
      cancelled = true
      setReadyWidget(null)
      try {
        widget?.unsubscribe('onAutoSaveNeeded', handleAutoSaveNeeded)
        if (ready) {
          saveLayout()
            .finally(() => {
              widget?.remove()
              widget = null
            })
            .catch(handleSaveError)
        }
      } catch {}
    }
  }, [containerId, datafeed, locale, symbols, onError])

  usePriceChartAdvancedTheme(readyWidget)
  usePriceChartAdvancedSeries(readyWidget, activeTicker, hasVolume)

  usePriceChartAdvancedReferenceLines(readyWidget, activeTicker, referenceLines, theme.warning)
  usePriceChartAdvancedPriceSelection(readyWidget, activeTicker, onSelectPrice)

  return <styledEl.ChartContainer id={containerId} />
}
