import { CowEventListeners } from '@cowprotocol/events'
import { IframeRpcManager } from './IframeRpcManager'
import { CowSwapWidgetParams, EthereumProvider } from './types'
import { buildTradeAmountsQuery, buildWidgetPath, buildWidgetUrl } from './urlUtils'
import { IframeCowEventEmitter } from './IframeCowEventEmitter'

/**
 * Key for identifying the event associated with the CoW Swap Widget.
 */
const COW_SWAP_WIDGET_EVENT_KEY = 'cowSwapWidget'

const DEFAULT_HEIGHT = '640px'
const DEFAULT_WIDTH = '450px'

/**
 * Reference: IframeResizer (apps/cowswap-frontend/src/modules/injectedWidget/updaters/IframeResizer.ts)
 * Sometimes MutationObserver doesn't trigger when the height of the widget changes and the widget displays with a scrollbar.
 * To avoid this we add a threshold to the height.
 * 20px
 */
const HEIGHT_THRESHOLD = 20

/**
 * Callback function signature for updating the CoW Swap Widget.
 */
export interface CowSwapWidgetHandler {
  updateWidget: (params: CowSwapWidgetParams, listeners?: CowEventListeners) => void
  updateListeners: (newListeners?: CowEventListeners) => void
  updateProvider: (newProvider?: EthereumProvider) => void
}

/**
 * Generates and injects a CoW Swap Widget into the provided container.
 * @param container - The HTML element to inject the widget into.
 * @param params - Parameters for configuring the widget.
 * @returns A callback function to update the widget with new settings.
 */
export function createCowSwapWidget(
  container: HTMLElement,
  params: CowSwapWidgetParams = {},
  listeners?: CowEventListeners
): CowSwapWidgetHandler {
  const { provider } = params

  // 1. Create a brand new iframe
  const iframe = createIframe(params)

  // 2. Clear the content (delete any previous iFrame if it exists)
  container.innerHTML = ''
  container.appendChild(iframe)

  const { contentWindow: iframeWindow } = iframe
  if (!iframeWindow) {
    console.error('Iframe does not contain a window', iframe)
    throw new Error('Iframe does not contain a window!')
  }

  // 3. Post some initial messages to the iframe
  //    - Send appCode
  //    - Apply dynamic height adjustments
  sendAppCode(iframeWindow, params.appCode)
  applyDynamicHeight(iframe, params.height)

  // 4. Wire up the iframeRpcManager with the provider (so RPC calls flow back and forth)
  let iframeRpcManager = updateProvider(iframeWindow, null, provider)

  // 5. Schedule the uploading of the params, once the iframe is loaded
  iframe.addEventListener('load', () => updateWidgetParams(iframeWindow, params))
  const iFrameCowEventEmitter = new IframeCowEventEmitter(listeners)

  // 6. Return the handler, so the widget, listeners, and provider can be updated
  return {
    updateWidget: (newParams: CowSwapWidgetParams) => updateWidgetParams(iframeWindow, newParams),
    updateListeners: (newListeners?: CowEventListeners) => iFrameCowEventEmitter.updateListeners(newListeners),
    updateProvider: (newProvider) => {
      iframeRpcManager = updateProvider(iframeWindow, iframeRpcManager, newProvider)
    },
  }
}

/**
 * Update the provider for the iframeRpcManager.
 *
 * It will disconnect from the previous provider and connect to the new one.
 *
 * @param iframe iframe window
 * @param iframeRpcManager iframe RPC manager
 * @param newProvider new provider
 *
 * @returns the iframeRpcManager
 */
function updateProvider(
  iframe: Window,
  iframeRpcManager: IframeRpcManager | null,
  newProvider?: EthereumProvider
): IframeRpcManager {
  if (iframeRpcManager) {
    // Disconnect and connect
    iframeRpcManager.disconnect()
  } else {
    iframeRpcManager = new IframeRpcManager(iframe)
  }

  // Connect new provider
  if (newProvider) {
    iframeRpcManager.onConnect(newProvider)
  }

  return iframeRpcManager
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
function updateWidgetParams(contentWindow: Window, params: CowSwapWidgetParams) {
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
 * Sends appCode to the contentWindow of the widget.
 *
 * @param contentWindow - Window object of the widget's iframe.
 * @param appCode - A unique identifier for the app.
 */
function sendAppCode(contentWindow: Window, appCode: string | undefined) {
  window.addEventListener('message', (event) => {
    if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== 'activate') {
      return
    }

    contentWindow.postMessage(
      {
        key: COW_SWAP_WIDGET_EVENT_KEY,
        method: 'metaData',
        metaData: appCode ? { appCode } : undefined,
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

    iframe.style.height = event.data.height ? `${event.data.height + HEIGHT_THRESHOLD}px` : defaultHeight
  })
}
