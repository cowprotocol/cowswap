import { JsonRpcManager } from './JsonRpcManager'
import { CowSwapWidgetParams } from './types'
import { buildTradeAmountsQuery, buildWidgetPath, buildWidgetUrl } from './urlUtils'

/**
 * Key for identifying the event associated with the CoW Swap Widget.
 */
const COW_SWAP_WIDGET_EVENT_KEY = 'cowSwapWidget'

const DEFAULT_HEIGHT = '600px'
const DEFAULT_WIDTH = '400px'

/**
 * Callback function signature for updating the CoW Swap Widget.
 */
export type UpdateWidgetCallback = (params: CowSwapWidgetParams) => void

/**
 * Generates and injects a CoW Swap Widget into the provided container.
 * @param container - The HTML element to inject the widget into.
 * @param params - Parameters for configuring the widget.
 * @returns A callback function to update the widget with new settings.
 */
export function cowSwapWidget(container: HTMLElement, params: CowSwapWidgetParams = {}): UpdateWidgetCallback {
  const { provider } = params
  const iframe = createIframe(params)

  container.innerHTML = ''
  container.appendChild(iframe)

  const { contentWindow } = iframe

  if (!contentWindow) throw new Error('Iframe does not contain a window!')

  sendAppKey(contentWindow, params.appKey)

  applyDynamicHeight(iframe, params.height)

  if (provider) {
    const jsonRpcManager = new JsonRpcManager(contentWindow)

    jsonRpcManager.onConnect(provider)
  }

  iframe.addEventListener('load', () => {
    updateWidget(params, contentWindow)
  })

  return (newParams: CowSwapWidgetParams) => updateWidget(newParams, contentWindow)
}

/**
 * Creates an iframe element for the CoW Swap Widget based on provided parameters and settings.
 * @param params - Parameters for the widget.
 * @returns The generated HTMLIFrameElement.
 */
function createIframe(params: CowSwapWidgetParams): HTMLIFrameElement {
  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = params

  const iframe = document.createElement('iframe')

  iframe.src = buildWidgetUrl(params)
  iframe.width = width
  iframe.height = height
  iframe.style.border = '0'

  return iframe
}

/**
 * Updates the CoW Swap Widget based on the new settings provided.
 * @param params - New params for the widget.
 * @param contentWindow - Window object of the widget's iframe.
 */
function updateWidget(params: CowSwapWidgetParams, contentWindow: Window) {
  const pathname = buildWidgetPath(params)
  const search = buildTradeAmountsQuery(params).toString()

  contentWindow.postMessage(
    {
      key: COW_SWAP_WIDGET_EVENT_KEY,
      method: 'update',
      urlParams: {
        pathname,
        search,
      },
      appParams: {
        ...params,
        provider: undefined,
      },
    },
    '*'
  )
}

/**
 * Sends appKey to the contentWindow of the widget.
 * @param contentWindow - Window object of the widget's iframe.
 * @param appKey - A unique identifier for the app.
 */
function sendAppKey(contentWindow: Window, appKey: string | undefined) {
  window.addEventListener('message', (event) => {
    if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== 'activate') {
      return
    }

    contentWindow.postMessage(
      {
        key: COW_SWAP_WIDGET_EVENT_KEY,
        method: 'metaData',
        metaData: appKey ? { appKey } : undefined,
      },
      '*'
    )
  })
}

/**
 * Applies dynamic height adjustments to the widget's iframe.
 * @param iframe - The HTMLIFrameElement of the widget.
 * @param defaultHeight - Default height for the widget.
 */
function applyDynamicHeight(iframe: HTMLIFrameElement, defaultHeight = DEFAULT_HEIGHT) {
  window.addEventListener('message', (event) => {
    if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== 'iframeHeight') {
      return
    }

    iframe.style.height = event.data.height ? `${event.data.height}px` : defaultHeight
  })
}
