import { CowEventListeners } from '@cowprotocol/events'
import { IframeRpcProviderBridge } from './IframeRpcProviderBridge'
import {
  CowSwapWidgetParams,
  EthereumProvider,
  WidgetMethodsEmit,
  WidgetMethodsEmitPayloadMap,
  WidgetMethodsListen,
} from './types'
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
  sendAppCodeOnActivation(iframeWindow, params.appCode)
  applyDynamicHeight(iframe, params.height)

  // 4. Wire up the iframeRpcProviderBridge with the provider (so RPC calls flow back and forth)
  let iframeRpcProviderBridge = updateProvider(iframeWindow, null, provider)

  // 5. Schedule the uploading of the params, once the iframe is loaded
  iframe.addEventListener('load', () => updateWidgetParams(iframeWindow, params))
  const iFrameCowEventEmitter = new IframeCowEventEmitter(listeners)

  // 6. Return the handler, so the widget, listeners, and provider can be updated
  return {
    updateWidget: (newParams: CowSwapWidgetParams) => updateWidgetParams(iframeWindow, newParams),
    updateListeners: (newListeners?: CowEventListeners) => iFrameCowEventEmitter.updateListeners(newListeners),
    updateProvider: (newProvider) => {
      iframeRpcProviderBridge = updateProvider(iframeWindow, iframeRpcProviderBridge, newProvider)
    },
  }
}

/**
 * Update the provider for the iframeRpcProviderBridge.
 *
 * It will disconnect from the previous provider and connect to the new one.
 *
 * @param iframe iframe window
 * @param iframeRpcProviderBridge iframe RPC manager
 * @param newProvider new provider
 *
 * @returns the iframeRpcProviderBridge
 */
function updateProvider(
  iframe: Window,
  iframeRpcProviderBridge: IframeRpcProviderBridge | null,
  newProvider?: EthereumProvider
): IframeRpcProviderBridge {
  // Disconnect from the previous provider bridge
  if (iframeRpcProviderBridge) {
    iframeRpcProviderBridge.disconnect()
  }

  const providerBridge = iframeRpcProviderBridge || new IframeRpcProviderBridge(iframe)

  // Connect to the new provider
  if (newProvider) {
    providerBridge.onConnect(newProvider)
  }

  return providerBridge
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

  postMessageToIframe(contentWindow, WidgetMethodsListen.UPDATE_PARAMS, {
    urlParams: {
      pathname,
      search,
    },
    appParams: {
      ...params,
      provider: undefined,
    },
  })
}

/**
 * Sends appCode to the contentWindow of the widget once the widget is activated.
 *
 * @param contentWindow - Window object of the widget's iframe.
 * @param appCode - A unique identifier for the app.
 */
function sendAppCodeOnActivation(contentWindow: Window, appCode: string | undefined) {
  listenToMessageFromIframe(WidgetMethodsEmit.ACTIVATE, () => {
    postMessageToIframe(contentWindow, WidgetMethodsListen.UPDATE_APP_DATA, {
      metaData: appCode ? { appCode } : undefined,
    })
  })
}

/**
 * Listens for iframeHeight emitted by the widget, and applies dynamic height adjustments to the widget's iframe.
 *
 * @param iframe - The HTMLIFrameElement of the widget.
 * @param defaultHeight - Default height for the widget.
 */
function applyDynamicHeight(iframe: HTMLIFrameElement, defaultHeight = DEFAULT_HEIGHT) {
  listenToMessageFromIframe(WidgetMethodsEmit.UPDATE_HEIGHT, (data) => {
    iframe.style.height = data.height ? `${data.height + HEIGHT_THRESHOLD}px` : defaultHeight
  })
}

function postMessageToIframe(contentWindow: Window, method: WidgetMethodsListen, payload?: unknown) {
  const data = typeof payload === 'object' ? payload : {}
  contentWindow.postMessage(
    {
      key: COW_SWAP_WIDGET_EVENT_KEY,
      method,
      ...data,
    },
    '*'
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function listenToMessageFromIframe<T extends WidgetMethodsEmit>(
  method: T,
  callback: (payload: WidgetMethodsEmitPayloadMap[T]) => void
) {
  window.addEventListener('message', (event) => {
    if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== method) {
      return
    }

    callback(event.data)
  })
}
