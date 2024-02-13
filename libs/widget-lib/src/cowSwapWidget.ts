import { CowEventEmitterImpl, CowEventListener, CowEventListeners, CowEvents } from '@cowprotocol/events'
import { JsonRpcManager } from './JsonRpcManager'
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
  const iframe = createIframe(params)

  container.innerHTML = ''
  container.appendChild(iframe)

  const { contentWindow } = iframe

  if (!contentWindow) throw new Error('Iframe does not contain a window!')

  sendAppCode(contentWindow, params.appCode)

  applyDynamicHeight(iframe, params.height)

  let jsonRpcManager = updateProvider(contentWindow, null, provider)

  iframe.addEventListener('load', () => {
    updateWidget(contentWindow, params)
  })
  const iFrameCowEventEmitter = new IframeCowEventEmitter(listeners)

  return {
    updateWidget: (newParams: CowSwapWidgetParams) => updateWidget(contentWindow, newParams),
    updateListeners: (newListeners?: CowEventListeners) => iFrameCowEventEmitter.updateListeners(newListeners),
    updateProvider: (newProvider) => {
      jsonRpcManager = updateProvider(contentWindow, jsonRpcManager, newProvider)
    },
  }
}

function updateProvider(contentWindow: Window, jsonRpcManager: JsonRpcManager | null, newProvider?: EthereumProvider) {
  if (jsonRpcManager) {
    // Disconnect and connect
    jsonRpcManager.disconnect()
  } else {
    jsonRpcManager = new JsonRpcManager(contentWindow)
  }

  // Connect new provider
  if (newProvider) {
    jsonRpcManager.onConnect(newProvider)
  }

  return jsonRpcManager
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
function updateWidget(contentWindow: Window, params: CowSwapWidgetParams) {
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

// /**
//  * Subscribes to the cow events
//  *
//  * @param listeners - subscription to different events
//  */
// function subscribeToCoWEvents(listeners?: CowEventListeners): void {
//   console.log('[TODO:remove] Subscribing to events', listeners?.length)
//   if (!listeners) {
//     return
//   }

//   // Create event emitter
//   const eventEmitter = new CowEventEmitterImpl()

//   // Subscribe to events
//   for (const listener of listeners) {
//     eventEmitter.on(listener as CowEventListener<CowEvents>)
//   }

//   window.addEventListener('message', (event) => {
//     if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== 'event') {
//       return
//     }
//     console.debug(
//       `[TODO:remove] Received message client side - Forward to eventEmitter ${event.data.eventName}`,
//       event.data.payload
//     )
//     eventEmitter.emit(event.data.eventName, event.data.payload)
//   })
// }
