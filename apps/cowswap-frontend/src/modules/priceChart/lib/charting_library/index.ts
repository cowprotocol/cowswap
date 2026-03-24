import type { ChartingLibraryWidgetConstructor } from './charting_library'

const TRADING_VIEW_SCRIPT_ID = 'cow-swap-trading-view-script'
const TRADING_VIEW_SCRIPT_SRC = '/charting_library/charting_library.js'

type TradingViewWindow = Window & {
  TradingView?: {
    widget?: ChartingLibraryWidgetConstructor
  }
}

let chartingLibraryPromise: Promise<ChartingLibraryWidgetConstructor> | null = null

function getTradingViewWidget(): ChartingLibraryWidgetConstructor | undefined {
  return (window as TradingViewWindow).TradingView?.widget
}

export function loadChartingLibraryWidget(): Promise<ChartingLibraryWidgetConstructor> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('TradingView is only available in the browser'))
  }

  const existingWidget = getTradingViewWidget()

  if (existingWidget) {
    return Promise.resolve(existingWidget)
  }

  if (chartingLibraryPromise) {
    return chartingLibraryPromise
  }

  chartingLibraryPromise = new Promise((resolve, reject) => {
    const handleLoad = (): void => {
      const widget = getTradingViewWidget()

      if (widget) {
        resolve(widget)
        return
      }

      chartingLibraryPromise = null
      reject(new Error('TradingView widget was not found on window after script load'))
    }

    const handleError = (): void => {
      chartingLibraryPromise = null
      reject(new Error('Failed to load TradingView charting library'))
    }

    const existingScript = document.getElementById(TRADING_VIEW_SCRIPT_ID) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true })
      existingScript.addEventListener('error', handleError, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = TRADING_VIEW_SCRIPT_ID
    script.src = TRADING_VIEW_SCRIPT_SRC
    script.async = true
    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })
    document.head.appendChild(script)
  })

  return chartingLibraryPromise
}

export type {
  Bar,
  ChartPropertiesOverrides,
  IBasicDataFeed,
  IChartingLibraryWidget,
  LibrarySymbolInfo,
  OnReadyCallback,
  ResolutionString,
  SearchSymbolResultItem,
  SearchSymbolsCallback,
} from './charting_library'
