import { CowWidgetEventListeners } from '@cowprotocol/events'
import { IframeRpcProviderBridge } from '@cowprotocol/iframe-transport'

import { isAllowedWindowOpenUrl } from './allowedWindowOpenUrl'
import { assignElementStyles } from './applyElementStyles'
import {
  DEFAULT_WIDGET_PARAMS,
  WIDGET_IFRAME_ALLOW,
  WIDGET_IFRAME_ID,
  WIDGET_IFRAME_REFERRER_POLICY,
  WIDGET_IFRAME_SANDBOX,
} from './cowSwapWidget.constants'
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
import { widgetIframeLoading } from './widgetIframeLoading'
import { widgetIframeTransport } from './widgetIframeTransport'

const noopHandler: CowSwapWidgetHandler = {
  iframe: null as never,
  updateParams: () => void 0,
  updateListeners: () => void 0,
  updateProvider: () => void 0,
  destroy: () => void 0,
}

/**
 * Callback function signature for updating the CoW Swap Widget.
 */
export interface CowSwapWidgetHandler {
  iframe: HTMLIFrameElement
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

// eslint-disable-next-line max-lines-per-function
export function createCowSwapWidget(container: HTMLElement, props: CowSwapWidgetProps): CowSwapWidgetHandler {
  const { params, provider: providerAux, listeners, onReady, enableSafeSdkBridge = true } = props

  let provider = providerAux
  let currentParams: CowSwapWidgetParams = { ...DEFAULT_WIDGET_PARAMS, ...params }
  let lastDynamicHeight: string = ''

  if (typeof window === 'undefined') return noopHandler

  // 1. Create a brand new iframe
  const iframe = createIframe(currentParams)
  const iframeOrigin = getIframeOrigin(iframe)
  logWidget('Resolved trusted iframe origin', { iframeOrigin })
  const windowListeners: WindowListener[] = []

  // 2. Clear the content (delete any previous iFrame if it exists)
  container.innerHTML = ''
  container.appendChild(iframe)

  const { cancelWidgetLoading, onWidgetReady } = widgetIframeLoading(
    iframe,
    props.onLoadingError,
    props.loadingErrorStyles,
  )

  const { contentWindow: iframeWindow } = iframe
  if (!iframeWindow) {
    console.error('Iframe does not contain a window', iframe)
    throw new Error('Iframe does not contain a window!')
  }

  windowListeners.push(
    listenToReady(iframeWindow, iframeOrigin, () => {
      onReady?.()
      onWidgetReady()
    }),
  )

  // 3. Send appCode (once the widget posts the ACTIVATE message)
  windowListeners.push(sendAppCodeOnActivation(iframeWindow, iframeOrigin, currentParams.appCode))

  // 4. Handle widget height changes (re-registered when params change so defaults/maxHeight stay in sync)
  const heightChangeListeners: WindowListener[] = listenToHeightChanges(iframe, iframeOrigin, (nextHeight) => {
    lastDynamicHeight = nextHeight
  })

  // 5. Intercept deeplinks navigation in the iframe
  let interceptDeepLinksListener: WindowListener | null = null

  function updateInterceptDeepLinks(): void {
    if (!iframeWindow) return

    if (interceptDeepLinksListener) {
      window.removeEventListener('message', interceptDeepLinksListener)
    }

    // If `window.open` is disabled, do not intercept deep links.
    if (currentParams.disableWindowOpen) return

    interceptDeepLinksListener = interceptDeepLinks(iframeOrigin, iframeWindow)
    windowListeners.push(interceptDeepLinksListener)
  }
  // 6. Handle two-way communication of widget hooks
  let widgetHooksListener: WindowListener | null = null

  function updateWidgetHooks(): void {
    if (!iframeWindow) return

    if (widgetHooksListener) {
      window.removeEventListener('message', widgetHooksListener)
    }

    widgetHooksListener = processWidgetHooks(iframeWindow, iframeOrigin, currentParams.hooks)
  }

  updateInterceptDeepLinks()
  updateWidgetHooks()

  // 7. Handle and forward widget events to the listeners
  const iFrameCowEventEmitter = new IframeCowEventEmitter(window, iframeOrigin, iframeWindow, listeners)

  // 8. Wire up the iframeRpcProviderBridge with the provider (so RPC calls flow back and forth)
  let iframeRpcProviderBridge = updateProvider(iframeWindow, iframeOrigin, null, provider)

  // 9. Schedule the uploading of the params, once the iframe is loaded
  iframe.addEventListener('load', () => {
    updateParams(iframeWindow, iframeOrigin, currentParams, provider)
  })

  // 10. Listen for Safe SDK messages from the iframe only when explicitly enabled by the host.
  const iframeSafeSdkBridge = enableSafeSdkBridge ? new IframeSafeSdkBridge(window, iframeWindow) : null

  // 11. Return the handler, so the widget, listeners, and provider can be updated
  return {
    iframe,
    updateParams: (newParams: CowSwapWidgetParams) => {
      currentParams = { ...DEFAULT_WIDGET_PARAMS, ...newParams }

      updateIframeElement(iframe, currentParams, lastDynamicHeight)
      updateParams(iframeWindow, iframeOrigin, currentParams, provider)
      updateInterceptDeepLinks()
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
      heightChangeListeners.forEach((listener) => window.removeEventListener('message', listener))
      windowListeners.forEach((listener) => window.removeEventListener('message', listener))
      if (widgetHooksListener) {
        window.removeEventListener('message', widgetHooksListener)
      }

      // Stop listening for SDK messages
      iframeSafeSdkBridge?.stopListening()

      // Destroy the iframe
      if (iframe && iframe.parentNode === container) container.removeChild(iframe)

      cancelWidgetLoading()
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

  iframe.id = WIDGET_IFRAME_ID
  iframe.src = buildWidgetUrl(params)
  iframe.setAttribute('sandbox', WIDGET_IFRAME_SANDBOX)
  iframe.referrerPolicy = WIDGET_IFRAME_REFERRER_POLICY
  iframe.allow = WIDGET_IFRAME_ALLOW

  updateIframeElement(iframe, params)

  return iframe
}

// eslint-disable-next-line complexity
function updateIframeElement(iframe: HTMLIFrameElement, params: CowSwapWidgetParams, lastDynamicHeight?: string): void {
  assignElementStyles(iframe, params.iframeStyle)

  // Deprecated but left here for backwards compatibility:
  if (params.width || params.height || params.maxHeight) {
    console.warn(
      '`width`, `height` and `maxHeight` params are deprecated. Use `iframeStyle.width`, `iframeStyle.height` and `iframeStyle.maxHeight` instead.',
    )

    const ignoredParams = []

    if (params.iframeStyle?.width) ignoredParams.push('width')
    if (params.iframeStyle?.height) ignoredParams.push('height')
    if (params.iframeStyle?.maxHeight) ignoredParams.push('maxHeight')

    ignoredParams.forEach((param) => {
      console.warn(`Both iframeStyle.${param} and ${param} params have been set. ${param} will be ignored`)
    })

    if (params.width && params.iframeStyle?.width === undefined) iframe.width = params.width
    if (params.height && params.iframeStyle?.height === undefined) iframe.height = params.height
    if (params.maxHeight && params.iframeStyle?.maxHeight === undefined)
      iframe.style.maxHeight = `${params.maxHeight}px`
  }

  if (lastDynamicHeight) iframe.style.setProperty(DYNAMIC_HEIGHT_CSS_VAR, lastDynamicHeight)
}

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
    contentWindow,
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
    contentWindow,
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
function interceptDeepLinks(iframeOrigin: string, iframeWindow: Window): WindowListener {
  return widgetIframeTransport.listenToMessageFromWindow(
    window,
    iframeWindow,
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

const DYNAMIC_HEIGHT_CSS_VAR = '--dynamicHeight'

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
  setLastDynamicHeight: (nextHeight: string) => void,
): WindowListener[] {
  if (!iframe.contentWindow) return []

  return [
    widgetIframeTransport.listenToMessageFromWindow(
      window,
      iframe.contentWindow,
      WidgetMethodsEmit.UPDATE_HEIGHT,
      (data) => {
        const nextHeight = `${(data?.height ?? 0) + HEIGHT_THRESHOLD}px`
        iframe.style.setProperty(DYNAMIC_HEIGHT_CSS_VAR, nextHeight)
        setLastDynamicHeight(nextHeight)
      },
      iframeOrigin,
    ),
    widgetIframeTransport.listenToMessageFromWindow(
      window,
      iframe.contentWindow,
      WidgetMethodsEmit.SET_FULL_HEIGHT,
      () => {
        iframe.style.setProperty(DYNAMIC_HEIGHT_CSS_VAR, '100dvh')
        setLastDynamicHeight('100dvh')
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
    contentWindow,
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
