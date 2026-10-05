import type { ChartingLibraryWidgetConstructor } from './charting_library/chartingLibrary.types'

const TRADING_VIEW_SCRIPT_ID = 'cow-swap-trading-view-script'
export const TRADING_VIEW_LIBRARY_PATH = 'https://files.cow.fi/charting-library/32.1.0/'
type TradingViewWindow = Window & { TradingView?: { widget?: ChartingLibraryWidgetConstructor } }
let chartingLibraryPromise: Promise<ChartingLibraryWidgetConstructor> | null = null

export function loadChartingLibraryWidget(): Promise<ChartingLibraryWidgetConstructor> {
  if (typeof window === 'undefined') return Promise.reject(new Error('TradingView is only available in the browser'))
  const existingWidget = (window as TradingViewWindow).TradingView?.widget
  if (existingWidget) return Promise.resolve(existingWidget)
  if (chartingLibraryPromise) return chartingLibraryPromise

  chartingLibraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = TRADING_VIEW_SCRIPT_ID
    script.src = `${TRADING_VIEW_LIBRARY_PATH}charting_library.standalone.js`
    script.async = true
    script.addEventListener(
      'load',
      () => {
        const widget = (window as TradingViewWindow).TradingView?.widget
        if (widget) resolve(widget)
        else {
          script.remove()
          chartingLibraryPromise = null
          reject(new Error('TradingView widget was not found on window after script load'))
        }
      },
      { once: true },
    )
    script.addEventListener(
      'error',
      () => {
        script.remove()
        chartingLibraryPromise = null
        reject(new Error('Failed to load TradingView charting library'))
      },
      { once: true },
    )
    document.head.appendChild(script)
  })
  return chartingLibraryPromise
}
export type {
  Bar,
  ChartPropertiesOverrides,
  CustomFormatters,
  IBasicDataFeed,
  IChartingLibraryWidget,
  LibrarySymbolInfo,
  OnReadyCallback,
  ResolutionString,
  SearchSymbolResultItem,
  SearchSymbolsCallback,
} from './charting_library/chartingLibrary.types'
