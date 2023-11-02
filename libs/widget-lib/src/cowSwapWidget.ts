import { JsonRpcManager } from './JsonRpcManager'
import { CowSwapWidgetMetaData, CowSwapWidgetParams, CowSwapWidgetSettings } from './types'
import { buildTradeAmountsQuery, buildWidgetPath, buildWidgetUrl } from './urlUtils'

/**
 * Key for identifying the event associated with the CoW Swap Widget.
 */
const COW_SWAP_WIDGET_EVENT_KEY = 'cowSwapWidget'

/**
 * Callback function signature for updating the CoW Swap Widget.
 */
export type UpdateWidgetCallback = (params: CowSwapWidgetSettings) => void

/**
 * Generates and injects a CoW Swap Widget into the provided container.
 * @param params - Parameters for configuring the widget.
 * @param settings - Settings for the CoW Swap Widget.
 * @returns A callback function to update the widget with new settings.
 */
export function cowSwapWidget(params: CowSwapWidgetParams, settings: CowSwapWidgetSettings): UpdateWidgetCallback {
  const { container, provider } = params
  const iframe = createIframe(params, settings)

  container.innerHTML = ''
  container.appendChild(iframe)

  const { contentWindow } = iframe

  if (!contentWindow) throw new Error('Iframe does not contain a window!')

  sendMetaData(contentWindow, params.metaData)

  applyDynamicHeight(iframe, params.height)

  if (provider) {
    const jsonRpcManager = new JsonRpcManager(contentWindow)

    jsonRpcManager.onConnect(provider)
  }

  iframe.addEventListener('load', () => {
    updateWidget(settings, contentWindow, iframe)
  })

  return (newSettings: CowSwapWidgetSettings) => updateWidget(newSettings, contentWindow, iframe)
}

/**
 * Creates an iframe element for the CoW Swap Widget based on provided parameters and settings.
 * @param params - Parameters for the widget.
 * @param settings - Settings for the widget.
 * @returns The generated HTMLIFrameElement.
 */
function createIframe(params: CowSwapWidgetParams, settings: CowSwapWidgetSettings): HTMLIFrameElement {
  const { width, height } = params

  const iframe = document.createElement('iframe')

  iframe.src = buildWidgetUrl(settings)
  iframe.width = `${width}px`
  iframe.height = `${height}px`
  iframe.style.border = '0'

  return iframe
}

/**
 * Updates the CoW Swap Widget based on the new settings provided.
 * @param settings - New settings for the widget.
 * @param contentWindow - Window object of the widget's iframe.
 * @param iframe - The HTMLIFrameElement of the widget.
 */
function updateWidget(settings: CowSwapWidgetSettings, contentWindow: Window, iframe: HTMLIFrameElement) {
  const pathname = buildWidgetPath(settings)
  const search = buildTradeAmountsQuery(settings).toString()

  // Reset iframe height to default
  if (!settings.dynamicHeightEnabled) {
    iframe.style.height = ''
  }

  contentWindow.postMessage(
    {
      key: COW_SWAP_WIDGET_EVENT_KEY,
      method: 'update',
      urlParams: {
        pathname,
        search,
      },
      appParams: settings,
    },
    '*'
  )
}

/**
 * Sends metadata to the contentWindow of the widget.
 * @param contentWindow - Window object of the widget's iframe.
 * @param metaData - Metadata for the widget.
 */
function sendMetaData(contentWindow: Window, metaData: CowSwapWidgetMetaData | undefined) {
  window.addEventListener('message', (event) => {
    if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== 'activate') {
      return
    }

    contentWindow.postMessage(
      {
        key: COW_SWAP_WIDGET_EVENT_KEY,
        method: 'metaData',
        metaData,
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
function applyDynamicHeight(iframe: HTMLIFrameElement, defaultHeight: number) {
  window.addEventListener('message', (event) => {
    if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== 'iframeHeight') {
      return
    }

    const height = event.data.height || defaultHeight

    iframe.style.height = `${height}px`
  })
}
