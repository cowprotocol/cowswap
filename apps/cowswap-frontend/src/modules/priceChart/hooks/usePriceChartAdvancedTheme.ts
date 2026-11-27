import { useEffect } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'

import { useTheme } from 'common/hooks/useTheme'

import { logPriceChart } from '../lib/priceChart.utils'
import { getThemeOverrides } from '../lib/priceChartAdvancedWidget.utils'

import type { IChartingLibraryWidget } from 'charting_library'

export function usePriceChartAdvancedTheme(widget: IChartingLibraryWidget | null): void {
  const theme = useTheme()

  useEffect(() => {
    if (!widget) return
    let cancelled = false
    widget
      .changeTheme(theme.darkMode ? 'dark' : 'light')
      .then(() => {
        if (!cancelled) widget.applyOverrides(getThemeOverrides(theme))
      })
      .catch((err: unknown) => {
        const error = normalizeError(err)
        if (!cancelled) logPriceChart.warn('Failed to update Advanced chart theme', error)
      })
    return () => {
      cancelled = true
    }
  }, [widget, theme])
}
