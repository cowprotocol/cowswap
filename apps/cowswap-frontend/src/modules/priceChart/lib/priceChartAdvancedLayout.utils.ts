import { isRecord } from '@cowprotocol/common-utils'

import type { ChartPropertiesOverrides } from 'charting_library'

const PRICE_CHART_STATE_STORAGE_KEY = 'priceChartState:v0'

export function loadChartLayout(overrides: Partial<ChartPropertiesOverrides>): object | undefined {
  if (typeof window === 'undefined') return undefined

  const rawValue = window.localStorage.getItem(PRICE_CHART_STATE_STORAGE_KEY)

  if (!rawValue) return undefined

  try {
    const parsedValue = JSON.parse(rawValue)

    if (!isRecord(parsedValue)) {
      window.localStorage.removeItem(PRICE_CHART_STATE_STORAGE_KEY)
      return undefined
    }

    removeSavedChartAppearance(parsedValue, overrides)

    return parsedValue
  } catch {
    window.localStorage.removeItem(PRICE_CHART_STATE_STORAGE_KEY)
    return undefined
  }
}

export function saveChartLayout(state: object): void {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(PRICE_CHART_STATE_STORAGE_KEY, JSON.stringify(state))
}

function removeLayoutOverrides(properties: unknown, overrides: Partial<ChartPropertiesOverrides>): void {
  for (const path of Object.keys(overrides)) {
    const keys = path.split('.')
    const field = keys.pop()
    const parent = keys.reduce<unknown>((value, key) => (isRecord(value) ? value[key] : undefined), properties)
    if (field && isRecord(parent)) delete parent[field]
  }
}

function removeSavedChartAppearance(
  layout: Record<string, unknown>,
  overrides: Partial<ChartPropertiesOverrides>,
): void {
  // Saved chart colors take precedence over constructor overrides in TradingView.
  const charts = Array.isArray(layout.charts) ? layout.charts : [layout]
  for (const chart of charts) {
    if (!isRecord(chart)) continue

    removeLayoutOverrides(chart.chartProperties, overrides)
    if (!Array.isArray(chart.panes)) continue

    const sources = chart.panes.flatMap((pane: unknown): unknown[] =>
      isRecord(pane) && Array.isArray(pane.sources) ? pane.sources : [],
    )
    for (const source of sources) {
      if (isRecord(source) && source.type === 'MainSeries') {
        removeLayoutOverrides({ mainSeriesProperties: source.state }, overrides)
      }
    }
  }
}
