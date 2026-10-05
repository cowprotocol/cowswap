const PRICE_CHART_STATE_STORAGE_KEY = 'priceChartState:v0'

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
