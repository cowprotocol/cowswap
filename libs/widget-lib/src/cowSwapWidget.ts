import { CowWidgetEventListeners } from '@cowprotocol/events'
import { getParentOrigin, IframeRpcProviderBridge } from '@cowprotocol/iframe-transport'

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
import { isCowSwapWidgetPalette } from './themeUtils'
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
  let currentParams: CowSwapWidgetParams = resolveWidgetParams(params)
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

  // Style the container (the root box). The iframe fills it.
  applyContainerStyles(container, currentParams)

  let iframeWindow: Window | null = null
  let updateInterceptDeepLinks: () => void = () => void 0
  let updateWidgetHooks: () => void = () => void 0
  let cancelWidgetLoading: () => void = () => void 0

  let iFrameCowEventEmitter: IframeCowEventEmitter | null = null
  let iframeRpcProviderBridge: IframeRpcProviderBridge | null = null
  let iframeSafeSdkBridge: IframeSafeSdkBridge | null = null

  let heightChangeListeners: WindowListener[] = []
  let widgetHooksListener: WindowListener | null = null

  function setup(): void {
    iframeWindow = iframe.contentWindow
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
    heightChangeListeners = listenToHeightChanges(container, iframe, iframeOrigin, (nextHeight) => {
      lastDynamicHeight = nextHeight
    })

    // 5. Intercept deeplinks navigation in the iframe
    let interceptDeepLinksListener: WindowListener | null = null

    updateInterceptDeepLinks = () => {
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

    updateWidgetHooks = () => {
      if (!iframeWindow) return

      if (widgetHooksListener) {
        window.removeEventListener('message', widgetHooksListener)
      }

      widgetHooksListener = processWidgetHooks(iframeWindow, iframeOrigin, currentParams.hooks)
    }

    updateInterceptDeepLinks()
    updateWidgetHooks()

    // 7. Handle and forward widget events to the listeners
    iFrameCowEventEmitter = new IframeCowEventEmitter(window, iframeOrigin, iframeWindow, listeners)

    // 8. Wire up the iframeRpcProviderBridge with the provider (so RPC calls flow back and forth)
    iframeRpcProviderBridge = updateProvider(iframeWindow, iframeOrigin, null, provider)

    // 9. Schedule the uploading of the params, once the iframe is loaded
    iframe.addEventListener('load', () => {
      if (!iframeWindow) return
      updateParams(iframeWindow, iframeOrigin, currentParams, provider)
    })

    // 10. Listen for Safe SDK messages from the iframe only when explicitly enabled by the host.
    iframeSafeSdkBridge = createIframeSafeSdkBridge(enableSafeSdkBridge, window, iframeWindow, iframeOrigin)

    const loadingContext = widgetIframeLoading(container, iframe, setup, destroy, props.onLoadingError)

    cancelWidgetLoading = loadingContext.cancelWidgetLoading
    const onWidgetReady = loadingContext.onWidgetReady
  }

  function destroy(skipIframeDestroy = false): void {
    // Disconnect rpc provider and unsubscribe to events
    iframeRpcProviderBridge?.disconnect()
    // Stop listening for cow events
    iFrameCowEventEmitter?.stopListeningIframe()

    // Disconnect all listeners
    heightChangeListeners.forEach((listener) => window.removeEventListener('message', listener))
    windowListeners.forEach((listener) => window.removeEventListener('message', listener))
    if (widgetHooksListener) {
      window.removeEventListener('message', widgetHooksListener)
    }

    // Stop listening for SDK messages
    iframeSafeSdkBridge?.stopListening()

    // Destroy the iframe
    if (!skipIframeDestroy && iframe && iframe.parentNode === container) container.removeChild(iframe)

    cancelWidgetLoading?.()
  }

  setup()

  // 11. Return the handler, so the widget, listeners, and provider can be updated
  return {
    iframe,
    updateParams: (newParams: CowSwapWidgetParams) => {
      if (!iframeWindow) return
      currentParams = resolveWidgetParams(newParams)

      applyContainerStyles(container, currentParams, lastDynamicHeight)
      updateParams(iframeWindow, iframeOrigin, currentParams, provider)
      updateInterceptDeepLinks()
      updateWidgetHooks()
    },
    updateListeners: (newListeners?: CowWidgetEventListeners) => iFrameCowEventEmitter?.updateListeners(newListeners),
    updateProvider: (newProvider) => {
      if (!iframeWindow) return

      provider = newProvider
      iframeRpcProviderBridge = updateProvider(iframeWindow, iframeOrigin, iframeRpcProviderBridge, newProvider)
    },

    destroy,
  }
}

function createIframeSafeSdkBridge(
  enabled: boolean,
  appWindow: Window,
  iframeWindow: Window,
  iframeOrigin: string,
): IframeSafeSdkBridge | null {
  if (!enabled) {
    return null
  }

  return new IframeSafeSdkBridge(appWindow, iframeWindow, iframeOrigin, getParentOrigin() || null)
}

function resolveWidgetParams(params: CowSwapWidgetParams): CowSwapWidgetParams {
  const currentParams = { ...DEFAULT_WIDGET_PARAMS, ...params }

  if (typeof currentParams.appCode !== 'string' || currentParams.appCode.trim().length === 0) {
    throw new Error('Required param `appCode` is missing')
  }

  return currentParams
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

  // The container carries the user's rootStyle; the iframe simply fills it.
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = '0'
  iframe.style.display = 'block'

  return iframe
}

function applyContainerStyles(container: HTMLElement, params: CowSwapWidgetParams, lastDynamicHeight?: string): void {
  assignElementStyles(container, params.rootStyle)

  const deprecatedParams = [
    {
      name: 'params.width',
      value: params.width,
      replacementName: 'rootStyle.width',
      replacementValue: params.rootStyle?.width,
      applyDeprecated: () => (params.width ? (container.style.width = params.width) : void 0),
    },
    {
      name: 'params.height',
      value: params.height,
      replacementName: 'rootStyle.height',
      replacementValue: params.rootStyle?.height,
      applyDeprecated: () => (params.height ? (container.style.height = params.height) : void 0),
    },
    {
      name: 'params.maxHeight',
      value: params.maxHeight,
      replacementName: 'rootStyle.maxHeight',
      replacementValue: params.rootStyle?.maxHeight,
      applyDeprecated: () => (params.maxHeight ? (container.style.maxHeight = `${params.maxHeight}px`) : void 0),
    },
    {
      name: 'params.theme.boxShadow',
      value: isCowSwapWidgetPalette(params.theme) ? params.theme.boxShadow : undefined,
      replacementName: 'cardStyle.boxShadow',
      replacementValue: params.cardStyle?.boxShadow,
      applyDeprecated: () => void 0,
    },
  ].filter((paramConfig) => !!paramConfig.value)

  deprecatedParams.forEach((param) => {
    if (param.replacementValue) {
      console.warn(`Both ${param.name} and ${param.replacementName} have been set. ${param.name} will be ignored.`)
    } else {
      console.warn(`${param.name} is deprecated. Use ${param.replacementName} instead.`)
      param.applyDeprecated()
    }
  })

  if (lastDynamicHeight) container.style.setProperty(DYNAMIC_HEIGHT_CSS_VAR, lastDynamicHeight)
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

  // Omit theme, hooks, and host-only container styles from appParams
  const { theme: _theme, hooks: _hooks, rootStyle: _rootStyle, ...appParams } = params

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

function listenToHeightChanges(
  container: HTMLElement,
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
        container.style.setProperty(DYNAMIC_HEIGHT_CSS_VAR, nextHeight)
        setLastDynamicHeight(nextHeight)
      },
      iframeOrigin,
    ),
    widgetIframeTransport.listenToMessageFromWindow(
      window,
      iframe.contentWindow,
      WidgetMethodsEmit.SET_FULL_HEIGHT,
      () => {
        container.style.setProperty(DYNAMIC_HEIGHT_CSS_VAR, '100dvh')
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
