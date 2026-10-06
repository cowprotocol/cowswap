import type { PriceChartSelection } from './tradingView.types'

const PRICE_CHART_STATE_STORAGE_KEY = 'priceChartState:v0'
const PRICE_CHART_SELECTION_STORAGE_KEY = 'priceChartSelection:v0'
const LEGACY_PRICE_CHART_FORMAT_STORAGE_KEY = 'priceChartFormat:v0'

export function loadSavedPriceChartSelection(): PriceChartSelection | undefined {
  if (typeof window === 'undefined') return undefined

  const savedSelection = readSavedPriceChartSelection()

  if (savedSelection) return savedSelection

  return migrateSavedPriceChartFormat()
}

export function loadSavedPriceChartState(): object | undefined {
  if (typeof window === 'undefined') return undefined

  const rawValue = window.localStorage.getItem(PRICE_CHART_STATE_STORAGE_KEY)

  if (!rawValue) return undefined

  try {
    const parsedValue = JSON.parse(rawValue)

    if (!parsedValue || typeof parsedValue !== 'object') {
      window.localStorage.removeItem(PRICE_CHART_STATE_STORAGE_KEY)
      return undefined
    }

    return parsedValue
  } catch {
    window.localStorage.removeItem(PRICE_CHART_STATE_STORAGE_KEY)
    return undefined
  }
}

export function savePriceChartSelection(selection: PriceChartSelection): void {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(PRICE_CHART_SELECTION_STORAGE_KEY, JSON.stringify(selection))
}

export function savePriceChartState(state: object): void {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(PRICE_CHART_STATE_STORAGE_KEY, JSON.stringify(state))
}

function isPriceChartSelection(value: unknown): value is PriceChartSelection {
  return value === 'sell' || value === 'buy'
}

function migrateSavedPriceChartFormat(): PriceChartSelection | undefined {
  const rawValue = window.localStorage.getItem(LEGACY_PRICE_CHART_FORMAT_STORAGE_KEY)

  if (!rawValue) return undefined

  window.localStorage.removeItem(LEGACY_PRICE_CHART_FORMAT_STORAGE_KEY)

  try {
    const value: unknown = JSON.parse(rawValue)
    const selection = value === 1 ? 'sell' : value === 2 ? 'buy' : undefined

    if (selection) {
      savePriceChartSelection(selection)
    }

    return selection
  } catch {
    return undefined
  }
}

function readSavedPriceChartSelection(): PriceChartSelection | undefined {
  const rawValue = window.localStorage.getItem(PRICE_CHART_SELECTION_STORAGE_KEY)

  if (!rawValue) return undefined

  try {
    const value: unknown = JSON.parse(rawValue)

    if (!isPriceChartSelection(value)) {
      window.localStorage.removeItem(PRICE_CHART_SELECTION_STORAGE_KEY)
      return undefined
    }

    return value
  } catch {
    window.localStorage.removeItem(PRICE_CHART_SELECTION_STORAGE_KEY)
    return undefined
  }
}
