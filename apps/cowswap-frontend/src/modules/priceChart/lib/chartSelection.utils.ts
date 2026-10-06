import type { ChartPair } from './chart.types'

const PRICE_CHART_SELECTION_STORAGE_KEY = 'priceChartSelection:v0'
const LEGACY_PRICE_CHART_FORMAT_STORAGE_KEY = 'priceChartFormat:v0'

export function loadSavedChartPair(): ChartPair | undefined {
  if (typeof window === 'undefined') return undefined

  const savedPair = readSavedChartPair()

  if (savedPair) return savedPair

  return migrateSavedPriceChartFormat()
}

export function saveChartPair(pair: ChartPair): void {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(PRICE_CHART_SELECTION_STORAGE_KEY, JSON.stringify(pair))
}

function isChartPair(value: unknown): value is ChartPair {
  return value === 'sell-usd' || value === 'buy-usd'
}

function migrateSavedPriceChartFormat(): ChartPair | undefined {
  const rawValue = window.localStorage.getItem(LEGACY_PRICE_CHART_FORMAT_STORAGE_KEY)

  if (!rawValue) return undefined

  window.localStorage.removeItem(LEGACY_PRICE_CHART_FORMAT_STORAGE_KEY)

  try {
    const value: unknown = JSON.parse(rawValue)
    const pair = value === 1 ? 'sell-usd' : value === 2 ? 'buy-usd' : undefined

    if (pair) {
      saveChartPair(pair)
    }

    return pair
  } catch {
    return undefined
  }
}

function readSavedChartPair(): ChartPair | undefined {
  const rawValue = window.localStorage.getItem(PRICE_CHART_SELECTION_STORAGE_KEY)

  if (!rawValue) return undefined

  try {
    const value: unknown = JSON.parse(rawValue)
    const pair = value === 'sell' ? 'sell-usd' : value === 'buy' ? 'buy-usd' : value

    if (!isChartPair(pair)) {
      window.localStorage.removeItem(PRICE_CHART_SELECTION_STORAGE_KEY)
      return undefined
    }

    if (pair !== value) saveChartPair(pair)

    return pair
  } catch {
    window.localStorage.removeItem(PRICE_CHART_SELECTION_STORAGE_KEY)
    return undefined
  }
}
