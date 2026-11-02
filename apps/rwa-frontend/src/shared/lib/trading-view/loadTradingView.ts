import type { ChartingLibraryWidgetConstructor } from 'charting_library'

export const TRADING_VIEW_LIBRARY_PATH = 'https://files.cow.fi/charting-library/32.1.0/'

type TradingViewWindow = Window & { TradingView?: { widget?: ChartingLibraryWidgetConstructor } }

let widgetLoadPromise: Promise<ChartingLibraryWidgetConstructor> | null = null

/** Loads the TradingView Charting Library script once, browser only */
export function loadTradingView(): Promise<ChartingLibraryWidgetConstructor> {
  const loadedWidget = (window as TradingViewWindow).TradingView?.widget

  if (loadedWidget) return Promise.resolve(loadedWidget)
  if (widgetLoadPromise) return widgetLoadPromise

  widgetLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const fail = (message: string): void => {
      script.remove()
      widgetLoadPromise = null
      reject(new Error(message))
    }

    script.src = `${TRADING_VIEW_LIBRARY_PATH}charting_library.standalone.js`
    script.async = true
    script.addEventListener(
      'load',
      () => {
        const widget = (window as TradingViewWindow).TradingView?.widget

        if (widget) resolve(widget)
        else fail('TradingView widget was not found after the script loaded')
      },
      { once: true },
    )
    script.addEventListener('error', () => fail('Failed to load the TradingView Charting Library'), { once: true })
    document.head.appendChild(script)
  })

  return widgetLoadPromise
}
