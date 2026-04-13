import { CowWidgetEventListeners } from '@cowprotocol/events'
import { IframeRpcProviderBridge } from '@cowprotocol/iframe-transport'

import { assignElementStyles } from './applyElementStyles'
import { DEFAULT_WIDGET_PARAMS } from './cowSwapWidget.constants'
import { deepMerge } from './deepMerge'
import { IframeCowEventEmitter } from './IframeCowEventEmitter'
import { IframeSafeSdkBridge } from './IframeSafeSdkBridge'
import { logWidget } from './logger'
import {
  CowSwapWidgetParams,
  CowSwapWidgetProps,
  EthereumProvider,
  WidgetHookEvents,
  WidgetHookPayload,
  WidgetHookPayloadMap,
  WidgetHookResult,
  WidgetMethodsEmit,
  WidgetMethodsListen,
  WindowListener,
} from './types'
import { buildWidgetPath, buildWidgetUrl, buildWidgetUrlQuery } from './urlUtils'
import { widgetIframeTransport } from './widgetIframeTransport'

const noopHandler: CowSwapWidgetHandler = {
  updateParams: () => void 0,
  updateListeners: () => void 0,
  updateProvider: () => void 0,
  destroy: () => void 0,
}

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
 * @param props - Parameters for configuring the widget.
 * @returns A callback function to update the widget with new settings.
 */
export function createCowSwapWidget(container: HTMLElement, props: CowSwapWidgetProps): CowSwapWidgetHandler {
  const { params, provider: providerAux, listeners, onReady } = props
  let provider = providerAux
  let currentParams = deepMerge(params, DEFAULT_WIDGET_PARAMS)
  let prevHeight = currentParams.iframeStyle?.height

  if (typeof window === 'undefined') return noopHandler

  // 1. Create a brand new iframe
  const iframe = createIframe(params)
  const iframeOrigin = getIframeOrigin(iframe)
  logWidget('Resolved trusted iframe origin', { iframeOrigin })
  const windowListeners: WindowListener[] = []

  if (onReady) {
    windowListeners.push(listenToReady(iframe.contentWindow || window, iframeOrigin, onReady))
  }

  // 2. Clear the content (delete any previous iFrame if it exists)
  container.innerHTML = ''
  container.appendChild(iframe)

  const { contentWindow: iframeWindow } = iframe
  if (!iframeWindow) {
    console.error('Iframe does not contain a window', iframe)
    throw new Error('Iframe does not contain a window!')
  }

  // 3. Send appCode (once the widget posts the ACTIVATE message)
  windowListeners.push(sendAppCodeOnActivation(iframeWindow, iframeOrigin, params.appCode))

  // 4. Handle widget height changes
  windowListeners.push(...listenToHeightChanges(iframe, iframeOrigin, params.height, params.maxHeight))

  // 5. Intercept deeplinks navigation in the iframe
  windowListeners.push(interceptDeepLinks(iframeOrigin))

  // 6. Handle two-way communication of widget hooks
  let widgetHooksListener: WindowListener | null = null

  function updateWidgetHooks(): void {
    if (!iframeWindow) return

    if (widgetHooksListener) {
      window.removeEventListener('message', widgetHooksListener)
    }

    widgetHooksListener = processWidgetHooks(iframeWindow, iframeOrigin, currentParams.hooks)
  }

  updateWidgetHooks()

  // 7. Handle and forward widget events to the listeners
  const iFrameCowEventEmitter = new IframeCowEventEmitter(window, iframeOrigin, listeners)

  // 8. Wire up the iframeRpcProviderBridge with the provider (so RPC calls flow back and forth)
  let iframeRpcProviderBridge = updateProvider(iframeWindow, iframeOrigin, null, provider)

  // 9. Schedule the uploading of the params, once the iframe is loaded
  iframe.addEventListener('load', () => {
    updateParams(iframeWindow, iframeOrigin, currentParams, provider)
  })

  // 10. Listen for messages from the iframe
  const iframeSafeSdkBridge = new IframeSafeSdkBridge(window, iframeWindow)

  // 11. Return the handler, so the widget, listeners, and provider can be updated
  return {
    updateParams: (newParams: CowSwapWidgetParams) => {
      const nextHeight = newParams.iframeStyle?.height ?? prevHeight
      currentParams = deepMerge(
        { ...newParams, iframeStyle: { ...newParams.iframeStyle, height: nextHeight } },
        DEFAULT_WIDGET_PARAMS,
      )
      prevHeight = currentParams.iframeStyle?.height

      updateIframeElement(iframe, currentParams)
      updateParams(iframeWindow, iframeOrigin, currentParams, provider)
      updateWidgetHooks()
    },
    updateListeners: (newListeners?: CowWidgetEventListeners) => iFrameCowEventEmitter.updateListeners(newListeners),
    updateProvider: (newProvider) => {
      provider = newProvider
      iframeRpcProviderBridge = updateProvider(iframeWindow, iframeOrigin, iframeRpcProviderBridge, newProvider)
    },

    destroy: () => {
      // Disconnect rpc provider and unsubscribe to events
      iframeRpcProviderBridge.disconnect()
      // Stop listening for cow events
      iFrameCowEventEmitter.stopListeningIframe()

      // Disconnect all listeners
      windowListeners.forEach((listener) => window.removeEventListener('message', listener))
      if (widgetHooksListener) {
        window.removeEventListener('message', widgetHooksListener)
      }

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
  iframeOrigin: string,
  iframeRpcProviderBridge: IframeRpcProviderBridge | null,
  newProvider?: EthereumProvider,
): IframeRpcProviderBridge {
  // Disconnect from the previous provider bridge
  if (iframeRpcProviderBridge) {
    iframeRpcProviderBridge.disconnect()
  }

  const providerBridge = iframeRpcProviderBridge || new IframeRpcProviderBridge(iframe, iframeOrigin)

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
  const iframe = document.createElement('iframe')

  // TODO: Create constant for this and the other ID and export them.
  iframe.id = 'cowswap-iframe'
  iframe.src = buildWidgetUrl(params)
  iframe.allow = 'clipboard-read; clipboard-write'

  updateIframeElement(iframe, params)

  return iframe
}

function updateIframeElement(iframe: HTMLIFrameElement, params: CowSwapWidgetParams): void {
  assignElementStyles(iframe, params.iframeStyle)
}

/*
function getIframeSizingConfig(params: CowSwapWidgetParams): IframeSizingConfig {
  return {
    defaultHeight: params.iframeStyle?.height || DEFAULT_WIDGET_PARAMS.iframeStyle.height,
    maxHeight: params.maxHeight,
  }
}
*/

function getIframeOrigin(iframe: HTMLIFrameElement): string {
  return new URL(iframe.src).origin
}

/**
 * Updates the CoW Swap Widget based on the new settings provided.
 * @param contentWindow - Window object of the widget's iframe.
 * @param iframeOrigin - The trusted origin of the widget's iframe.
 * @param params - New params for the widget.
 * @param provider - EIP-1193 provider
 */
function updateParams(
  contentWindow: Window,
  iframeOrigin: string,
  params: CowSwapWidgetParams,
  provider: EthereumProvider | undefined,
): void {
  const hasProvider = !!provider

  const pathname = buildWidgetPath(params)
  const search = buildWidgetUrlQuery(params).toString()

  // Omit theme, hooks, and host-only iframe styles from appParams
  const { theme: _theme, hooks: _hooks, iframeStyle: _iframeStyle, ...appParams } = params

  widgetIframeTransport.postMessageToWindow(
    contentWindow,
    WidgetMethodsListen.UPDATE_PARAMS,
    { urlParams: { pathname, search }, appParams, hasProvider },
    iframeOrigin,
  )
}

/**
 * Sends appCode to the contentWindow of the widget once the widget is activated.
 *
 * @param contentWindow - Window object of the widget's iframe.
 * @param iframeOrigin - The trusted origin of the widget's iframe.
 * @param appCode - A unique identifier for the app.
 */
function sendAppCodeOnActivation(
  contentWindow: Window,
  iframeOrigin: string,
  appCode: string | undefined,
): (payload: MessageEvent<unknown>) => void {
  return widgetIframeTransport.listenToMessageFromWindow(
    window,
    WidgetMethodsEmit.ACTIVATE,
    () => {
      // Update the appData
      widgetIframeTransport.postMessageToWindow(
        contentWindow,
        WidgetMethodsListen.UPDATE_APP_DATA,
        { metaData: appCode ? { appCode } : undefined },
        iframeOrigin,
      )
    },
    iframeOrigin,
  )
}

function listenToReady(contentWindow: Window, iframeOrigin: string, onReady: () => void): WindowListener {
  let isReady = false

  return widgetIframeTransport.listenToMessageFromWindow(
    window,
    WidgetMethodsEmit.READY,
    () => {
      if (isReady) return

      isReady = true
      onReady()
    },
    iframeOrigin,
  )
}

/**
 * Since deeplinks are not supported in iframes, this function intercepts the window.open calls from the widget and opens
 */
function interceptDeepLinks(iframeOrigin: string): (payload: MessageEvent<unknown>) => void {
  return widgetIframeTransport.listenToMessageFromWindow(
    window,
    WidgetMethodsEmit.INTERCEPT_WINDOW_OPEN,
    ({ href, rel, target }) => {
      const resolvedUrl = resolveWindowOpenUrl(href.toString(), iframeOrigin)

      if (resolvedUrl && isAllowedWindowOpenUrl(resolvedUrl)) {
        window.open(resolvedUrl, target, rel)
      }
    },
    iframeOrigin,
  )
}

function resolveWindowOpenUrl(url: string, iframeOrigin: string): string | null {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return null
  }

  try {
    return new URL(trimmedUrl, iframeOrigin).toString()
  } catch {
    return null
  }
}

function isAllowedWindowOpenUrl(url: string): boolean {
  try {
    const protocol = new URL(url).protocol

    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

const DEFAULT_HEIGHT = '100%'

const HEIGHT_THRESHOLD = 0

/**
 * Listens for iframeHeight emitted by the widget, and applies dynamic height adjustments to the widget's iframe.
 *
 * @param iframe - The HTMLIFrameElement of the widget.
 * @param defaultHeight - Default height for the widget.
 * @param maxHeight - Maximum height for the widget.
 */
function listenToHeightChanges(
  iframe: HTMLIFrameElement,
  iframeOrigin: string,
  defaultHeight = DEFAULT_HEIGHT,
  maxHeight?: number,
): WindowListener[] {
  return [
    widgetIframeTransport.listenToMessageFromWindow(
      window,
      WidgetMethodsEmit.UPDATE_HEIGHT,
      (data) => {
        const newHeight = data.height ? data.height + HEIGHT_THRESHOLD : undefined

        iframe.style.height = newHeight ? `${maxHeight ? Math.min(newHeight, maxHeight) : newHeight}px` : defaultHeight
      },
      iframeOrigin,
    ),
    widgetIframeTransport.listenToMessageFromWindow(
      window,
      WidgetMethodsEmit.SET_FULL_HEIGHT,
      ({ isUpToSmall }) => {
        iframe.style.height = isUpToSmall ? defaultHeight : `${maxHeight || document.body.offsetHeight}px`
      },
      iframeOrigin,
    ),
  ]
}

type WidgetHookHandlerMap = {
  [K in WidgetHookEvents]: (payload: WidgetHookPayloadMap[K], hooks: CowSwapWidgetParams['hooks']) => WidgetHookResult
}

const widgetHookHandlers: WidgetHookHandlerMap = {
  [WidgetHookEvents.ON_BEFORE_APPROVAL]: (payload, hooks) =>
    hooks?.onBeforeApproval ? hooks.onBeforeApproval(payload) : true,
  [WidgetHookEvents.ON_BEFORE_TRADE]: (payload, hooks) => (hooks?.onBeforeTrade ? hooks.onBeforeTrade(payload) : true),
  [WidgetHookEvents.ON_BEFORE_WRAP_UNWRAP]: (payload, hooks) =>
    hooks?.onBeforeWrapOrUnwrap ? hooks.onBeforeWrapOrUnwrap(payload) : true,
  [WidgetHookEvents.ON_BEFORE_ORDER_CANCEL]: (payload, hooks) =>
    hooks?.onBeforeOrderCancel ? hooks.onBeforeOrderCancel(payload) : true,
  [WidgetHookEvents.ON_BEFORE_ORDERS_CANCEL]: (payload, hooks) =>
    hooks?.onBeforeOrdersCancel ? hooks.onBeforeOrdersCancel(payload) : true,
}

function executeWidgetHook<T extends WidgetHookEvents>(
  data: WidgetHookPayload<T>,
  hooks: CowSwapWidgetParams['hooks'],
): WidgetHookResult {
  return widgetHookHandlers[data.event](data.payload, hooks)
}

function processWidgetHooks(
  contentWindow: Window,
  iframeOrigin: string,
  hooks: CowSwapWidgetParams['hooks'],
): WindowListener {
  return widgetIframeTransport.listenToMessageFromWindow(
    window,
    WidgetMethodsEmit.PROCESS_HOOK,
    async (data) => {
      let isHookPassed = false

      try {
        isHookPassed = await executeWidgetHook(data, hooks)
      } catch {}

      widgetIframeTransport.postMessageToWindow(
        contentWindow,
        WidgetMethodsListen.HOOK_RESULT,
        { id: data.id, result: isHookPassed },
        iframeOrigin,
      )
    },
    iframeOrigin,
  )
}
