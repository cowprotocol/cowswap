import type { PriceChartFormat } from './tradingView.types'

const PRICE_CHART_STATE_STORAGE_KEY = 'priceChartState:v0'
const PRICE_CHART_FORMAT_STORAGE_KEY = 'priceChartFormat:v0'

function isValidPriceChartFormat(value: unknown): value is PriceChartFormat {
  return value === 1 || value === 2 || value === 3 || value === 4
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

export function savePriceChartState(state: object): void {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(PRICE_CHART_STATE_STORAGE_KEY, JSON.stringify(state))
}

export function loadSavedPriceChartFormat(): PriceChartFormat | undefined {
  if (typeof window === 'undefined') return undefined

  const rawValue = window.localStorage.getItem(PRICE_CHART_FORMAT_STORAGE_KEY)

  if (!rawValue) return undefined

  try {
    const parsedValue: unknown = JSON.parse(rawValue)

    if (!isValidPriceChartFormat(parsedValue)) {
      window.localStorage.removeItem(PRICE_CHART_FORMAT_STORAGE_KEY)
      return undefined
    }

    return parsedValue
  } catch {
    window.localStorage.removeItem(PRICE_CHART_FORMAT_STORAGE_KEY)
    return undefined
  }
}

export function savePriceChartFormat(format: PriceChartFormat): void {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(PRICE_CHART_FORMAT_STORAGE_KEY, JSON.stringify(format))
}
