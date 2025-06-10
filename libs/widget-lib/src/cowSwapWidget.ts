import { CowWidgetEventListeners } from '@cowprotocol/events'
import { IframeRpcProviderBridge } from '@cowprotocol/iframe-transport'

import { IframeCowEventEmitter } from './IframeCowEventEmitter'
import { IframeSafeSdkBridge } from './IframeSafeSdkBridge'
import {
  CowSwapWidgetParams,
  CowSwapWidgetProps,
  EthereumProvider,
  WidgetMethodsEmit,
  WidgetMethodsListen,
  WindowListener,
} from './types'
import { buildWidgetPath, buildWidgetUrl, buildWidgetUrlQuery } from './urlUtils'
import { widgetIframeTransport } from './widgetIframeTransport'

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
  updateParams: (params: CowSwapWidgetParams) => void
  updateListeners: (newListeners?: CowWidgetEventListeners) => void
  updateProvider: (newProvider?: EthereumProvider) => void
  destroy: () => void
}

/**
 * Generates and injects a CoW Swap Widget into the provided container.
 * @param container - The HTML element to inject the widget into.
 * @param params - Parameters for configuring the widget.
 * @returns A callback function to update the widget with new settings.
 */
export function createCowSwapWidget(container: HTMLElement, props: CowSwapWidgetProps): CowSwapWidgetHandler {
  const { params, provider: providerAux, listeners } = props
  let provider = providerAux
  let currentParams = params

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

  // 3. Send appCode (once the widget posts the ACTIVATE message)
  const windowListeners: WindowListener[] = []
  windowListeners.push(sendAppCodeOnActivation(iframeWindow, params.appCode))

  // 4. Handle widget height changes
  windowListeners.push(...listenToHeightChanges(iframe, params.height, params.maxHeight))

  // 5. Intercept deeplinks navigation in the iframe
  windowListeners.push(interceptDeepLinks())

  // 6. Handle and forward widget events to the listeners
  const iFrameCowEventEmitter = new IframeCowEventEmitter(window, listeners)

  // 7. Wire up the iframeRpcProviderBridge with the provider (so RPC calls flow back and forth)
  let iframeRpcProviderBridge = updateProvider(iframeWindow, null, provider)

  // 8. Schedule the uploading of the params, once the iframe is loaded
  iframe.addEventListener('load', () => updateParams(iframeWindow, currentParams, provider))

  // 9. Listen for messages from the iframe
  const iframeSafeSdkBridge = new IframeSafeSdkBridge(window, iframeWindow)

  // 10. Return the handler, so the widget, listeners, and provider can be updated
  return {
    updateParams: (newParams: CowSwapWidgetParams) => {
      currentParams = newParams
      updateParams(iframeWindow, currentParams, provider)
    },
    updateListeners: (newListeners?: CowWidgetEventListeners) => iFrameCowEventEmitter.updateListeners(newListeners),
    updateProvider: (newProvider) => {
      provider = newProvider
      iframeRpcProviderBridge = updateProvider(iframeWindow, iframeRpcProviderBridge, newProvider)
    },

    destroy: () => {
      // Disconnet rpc provider and unsubscribe to events
      iframeRpcProviderBridge.disconnect()
      // Stop listening for cow events
      iFrameCowEventEmitter.stopListeningIframe()

      // Disconnect all listeners
      windowListeners.forEach((listener) => window.removeEventListener('message', listener))

      // Stop listening for SDK messages
      iframeSafeSdkBridge.stopListening()

      // Destroy the iframe
      container.removeChild(iframe)
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
  newProvider?: EthereumProvider,
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
  iframe.allow = 'clipboard-read; clipboard-write'

  return iframe
}

/**
 * Updates the CoW Swap Widget based on the new settings provided.
 * @param params - New params for the widget.
 * @param contentWindow - Window object of the widget's iframe.
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function updateParams(contentWindow: Window, params: CowSwapWidgetParams, provider: EthereumProvider | undefined) {
  const hasProvider = !!provider

  const pathname = buildWidgetPath(params)
  const search = buildWidgetUrlQuery(params).toString()

  // Omit theme from appParams
  const { theme: _theme, ...appParams } = params

  widgetIframeTransport.postMessageToWindow(contentWindow, WidgetMethodsListen.UPDATE_PARAMS, {
    urlParams: {
      pathname,
      search,
    },
    appParams,
    hasProvider,
  })
}

/**
 * Sends appCode to the contentWindow of the widget once the widget is activated.
 *
 * @param contentWindow - Window object of the widget's iframe.
 * @param appCode - A unique identifier for the app.
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function sendAppCodeOnActivation(contentWindow: Window, appCode: string | undefined) {
  return widgetIframeTransport.listenToMessageFromWindow(window, WidgetMethodsEmit.ACTIVATE, () => {
    // Update the appData
    widgetIframeTransport.postMessageToWindow(contentWindow, WidgetMethodsListen.UPDATE_APP_DATA, {
      metaData: appCode ? { appCode } : undefined,
    })
  })
}

/**
 * Since deeplinks are not supported in iframes, this function intercepts the window.open calls from the widget and opens
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function interceptDeepLinks() {
  return widgetIframeTransport.listenToMessageFromWindow(
    window,
    WidgetMethodsEmit.INTERCEPT_WINDOW_OPEN,
    ({ href, rel, target }) => {
      const url = href.toString()

      if (!url.startsWith('http') && url.match(/^[a-zA-Z0-9]+:\/\//)) {
        window.open(url, target, rel)
        return
      }
    },
  )
}

/**
 * Listens for iframeHeight emitted by the widget, and applies dynamic height adjustments to the widget's iframe.
 *
 * @param iframe - The HTMLIFrameElement of the widget.
 * @param defaultHeight - Default height for the widget.
 * @param maxHeight - Maximum height for the widget.
 */
function listenToHeightChanges(
  iframe: HTMLIFrameElement,
  defaultHeight = DEFAULT_HEIGHT,
  maxHeight?: number,
): WindowListener[] {
  return [
    widgetIframeTransport.listenToMessageFromWindow(window, WidgetMethodsEmit.UPDATE_HEIGHT, (data) => {
      const newHeight = data.height ? data.height + HEIGHT_THRESHOLD : undefined

      iframe.style.height = newHeight ? `${maxHeight ? Math.min(newHeight, maxHeight) : newHeight}px` : defaultHeight
    }),
    widgetIframeTransport.listenToMessageFromWindow(window, WidgetMethodsEmit.SET_FULL_HEIGHT, ({ isUpToSmall }) => {
      iframe.style.height = isUpToSmall ? defaultHeight : `${maxHeight || document.body.offsetHeight}px`
    }),
  ]
}
